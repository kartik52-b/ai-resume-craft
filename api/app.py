"""
AI Resume Craft — server-side AI proxy.

The browser client (src/lib/aiClient.ts) posts to /api/ai/*; this Flask app
forwards the request to Google's Gemini API. The GOOGLE_API_KEY lives only in
the server environment — it is never sent to or stored in the browser, and
request bodies are not persisted.

Error responses are JSON { "error": <code> } where <code> matches the
AiErrorCode union in src/lib/aiClient.ts:
  not_configured | rate_limited | network | provider_error | empty_response |
  input_too_large | invalid_input | unavailable

Without GOOGLE_API_KEY configured, every endpoint still responds (503
not_configured) so the UI can show a clear configuration message instead of
crashing. The rest of the app is fully local and does not need this server.
"""

import json
import os
import re

import requests
from flask import Flask, jsonify, request

app = Flask(__name__)

GEMINI_URL = (
    "https://generativelanguage.googleapis.com/v1beta/models/"
    "gemini-2.0-flash:generateContent"
)
MAX_INPUT_CHARS = 6000
TIMEOUT_SECONDS = 30

# Requests per IP per minute (best-effort DoS/cost guard).
RATE_LIMIT_PER_MINUTE = 20
_rate_bucket = {}


def _error(code, status):
    return jsonify({"error": code}), status


def _client_ip():
    return request.headers.get("X-Forwarded-For", request.remote_addr or "?").split(",")[0].strip()


def _rate_limited():
    import time

    now = int(time.time())
    minute = now // 60
    key = (_client_ip(), minute)
    _rate_bucket[key] = _rate_bucket.get(key, 0) + 1
    # Drop old buckets occasionally to keep memory bounded.
    if len(_rate_bucket) > 1000:
        for k in [k for k in _rate_bucket if k[1] < minute]:
            _rate_bucket.pop(k, None)
    return _rate_bucket[key] > RATE_LIMIT_PER_MINUTE


def _json_body():
    data = request.get_json(silent=True)
    return data if isinstance(data, dict) else None


def _require_text(data, field):
    """Returns (value, None) or (None, error_response)."""
    if data is None:
        return None, _error("invalid_input", 400)
    value = data.get(field)
    if not isinstance(value, str) or not value.strip():
        return None, _error("invalid_input", 400)
    if len(value) > MAX_INPUT_CHARS:
        return None, _error("input_too_large", 413)
    return value.strip(), None


def _gemini_generate(prompt):
    """Calls Gemini and returns (text, None) or (None, error_response)."""
    api_key = os.environ.get("GOOGLE_API_KEY")
    if not api_key:
        return None, _error("not_configured", 503)

    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {"temperature": 0.4, "maxOutputTokens": 1024},
    }
    try:
        resp = requests.post(
            f"{GEMINI_URL}?key={api_key}",
            headers={"Content-Type": "application/json"},
            data=json.dumps(payload),
            timeout=TIMEOUT_SECONDS,
        )
    except requests.RequestException:
        return None, _error("network", 502)

    if resp.status_code == 429:
        return None, _error("rate_limited", 429)
    if resp.status_code in (401, 403):
        return None, _error("not_configured", 503)
    if resp.status_code != 200:
        return None, _error("provider_error", 502)

    try:
        body = resp.json()
        text = body["candidates"][0]["content"]["parts"][0]["text"].strip()
    except (ValueError, KeyError, IndexError, TypeError):
        return None, _error("provider_error", 502)

    if not text:
        return None, _error("empty_response", 502)
    return text, None


def _split_lines(text, prefix_chars="•-*"):
    """Extracts clean lines/bullets from a model response."""
    lines = []
    for raw in text.splitlines():
        line = raw.strip().lstrip(prefix_chars).strip()
        if line:
            lines.append(line[:300])
    return lines


# --- Endpoints -------------------------------------------------------------


@app.post("/api/ai/rewrite")
def rewrite():
    if _rate_limited():
        return _error("rate_limited", 429)
    data = _json_body()
    text, err = _require_text(data, "text")
    if err:
        return err
    mode = (data.get("mode") or "professional").strip()
    mode_instructions = {
        "professional": "Rewrite it in a polished, professional tone.",
        "concise": "Rewrite it to be more concise without losing meaning.",
        "achievement": "Rewrite it to emphasize concrete achievements and results.",
        "grammar": "Fix grammar, spelling and clarity only; keep the wording close to the original.",
        "ats": "Rewrite it to be clear, factual and ATS-friendly (standard wording, no symbols).",
    }
    instruction = mode_instructions.get(mode)
    if not instruction:
        return _error("invalid_input", 400)
    prompt = (
        "You are a professional resume writer. Rewrite the following resume text. "
        f"{instruction} Return ONLY the rewritten text, no commentary, no quotes, "
        "no markdown. Keep it under 120 words.\n\nTEXT:\n" + text
    )
    result, err = _gemini_generate(prompt)
    if err:
        return err
    return jsonify({"text": result})


@app.post("/api/ai/bullets")
def bullets():
    if _rate_limited():
        return _error("rate_limited", 429)
    data = _json_body()
    if data is None:
        return _error("invalid_input", 400)
    role, err = _require_text(data, "role")
    if err:
        return err
    company = str(data.get("company") or "").strip()[:120]
    context = str(data.get("context") or "").strip()[:MAX_INPUT_CHARS]
    skills = data.get("skills")
    skills = ", ".join(s.strip() for s in skills if isinstance(s, str))[:300] if isinstance(skills, list) else ""

    prompt = (
        "You are a professional resume writer. Generate 4-6 strong resume bullet "
        "points for the role described below. Each bullet starts with a strong action "
        "verb, is one line, and includes a plausible measurable outcome where the "
        "context supports one (never invent specific numbers beyond realistic ranges). "
        f"Return ONLY the bullets, one per line, no numbering, no commentary.\n\n"
        f"ROLE: {role}\n"
        + (f"COMPANY: {company}\n" if company else "")
        + (f"SKILLS: {skills}\n" if skills else "")
        + (f"CONTEXT (user's own notes): {context}\n" if context else "")
    )
    result, err = _gemini_generate(prompt)
    if err:
        return err
    return jsonify({"bullets": _split_lines(result)[:6]})


@app.post("/api/ai/summary")
def summary():
    if _rate_limited():
        return _error("rate_limited", 429)
    data = _json_body()
    resume_text, err = _require_text(data, "resumeText")
    if err:
        return err
    prompt = (
        "You are a professional resume writer. Based on the resume content below, "
        "write a professional summary of 2-3 sentences (80-400 characters) written "
        "in first person implied style (no 'I'). Return ONLY the summary text, no "
        "commentary, no quotes.\n\nRESUME:\n" + resume_text
    )
    result, err = _gemini_generate(prompt)
    if err:
        return err
    return jsonify({"text": result})


@app.post("/api/ai/skills")
def skills():
    if _rate_limited():
        return _error("rate_limited", 429)
    data = _json_body()
    if data is None:
        return _error("invalid_input", 400)
    role, err = _require_text(data, "role")
    if err:
        return err
    context = str(data.get("context") or "").strip()[:MAX_INPUT_CHARS]
    prompt = (
        "You are a professional resume writer. Suggest 8-12 concrete, relevant "
        "professional skills (1-3 words each) for the role below. Return ONLY the "
        "skills, one per line, no numbering, no commentary.\n\n"
        f"ROLE: {role}\n" + (f"CONTEXT: {context}\n" if context else "")
    )
    result, err = _gemini_generate(prompt)
    if err:
        return err
    skills = []
    for skill in _split_lines(result)[:12]:
        if re.fullmatch(r"[A-Za-z0-9+#./ -]{2,40}", skill):
            skills.append(skill)
    return jsonify({"skills": skills})


@app.post("/api/ai/match")
def match():
    if _rate_limited():
        return _error("rate_limited", 429)
    data = _json_body()
    if data is None:
        return _error("invalid_input", 400)
    resume_text, err = _require_text(data, "resumeText")
    if err:
        return err
    jd, err = _require_text(data, "jobDescription")
    if err:
        return err
    prompt = (
        "You are a career coach. Compare the resume to the job description and "
        "write 4-6 short, actionable observations: strongest matches, the most "
        "important gaps, and one concrete suggestion. Be honest and specific; do "
        "not fabricate experience. Return ONLY the commentary as plain text lines.\n\n"
        "RESUME:\n" + resume_text + "\n\nJOB DESCRIPTION:\n" + jd
    )
    result, err = _gemini_generate(prompt)
    if err:
        return err
    return jsonify({"text": result})


@app.errorhandler(404)
def not_found(_e):
    return _error("unavailable", 404)


@app.errorhandler(405)
def method_not_allowed(_e):
    return _error("unavailable", 405)


if __name__ == "__main__":
    port = int(os.environ.get("FLASK_PORT", 5001))
    app.run(host="0.0.0.0", port=port)
