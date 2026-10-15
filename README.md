# AI Resume Craft

An elegant, local-first **resume design studio**. Pick one of 50 structurally
different layouts, write your resume in a two-pane editor with a live A4
preview, and export a clean A4 PDF. No account is required; resumes live in this
browser. Optional AI requests send only the selected resume text to Google Gemini.

## Product

| Route | What it does |
| --- | --- |
| `/` | Landing page. The resume itself is the hero: a real A4 sheet on a desk, with a continuously moving design rail. |
| `/create` | Guided setup — personal details → summary → background → design → build. Education is optional, each added entry is validated, and the draft is cached locally so a refresh never loses your typing. |
| `/editor` | Section editors on the left, live A4 preview on the right. Drag-reorder and hide sections, undo/redo, autosave (800 ms), inline validation, import (.txt / .md / .docx) and PDF export. |
| `/templates` | 50 designs by collection, category, career stage and search, each previewed as a full A4 page. |
| `/resumes` | Rename, duplicate, delete and export; several resumes side by side. |
| `/settings` | Appearance, resume details, data export/import, AI configuration, environment notes. |

## Design language

Warm paper and antique bronze, defined once in `src/index.css` and
`tailwind.config.ts`:

- Light: ivory `#F4F1EA`, paper `#FFFDF8`, secondary `#F0ECE4`, ink `#181817`,
  borders `#DED8CD` / `#CFC6B8`, bronze `#A8754F` (hover `#865A3A`, soft
  `#EEE3D5`).
- Dark: a matching "black paper" theme (`#11100E`, `#181715`, `#201E1A`,
  `#F1EDE4`, `#35312B`, bronze `#B08A5C`).
- Teal `#2F7772` and coral `#E07F6F` appear only as signals (assistance ready,
  validation).

Colour is used as an accent, never decoration: bronze marks selection and
important states, surfaces stay neutral. Radii stay between 6 and 12 px and
elevation is warm and paper-forward. The A4 document is real paper — square
corners, its own shadow, unchanged in dark mode. Inter for UI, Source Serif 4
for editorial headings, JetBrains Mono for metadata.

Motion is short and purposeful: sections rise once on scroll, cards lift a
little, the carousel loops on a 4.5 s dwell, and the template rail drifts at
40 px/s through a duplicated set so the loop has no seam. Everything respects
`prefers-reduced-motion`, and any continuous motion can be paused.

## Writing assistance (optional)

AI tools include field rewriting (professional, concise, impact, grammar and
plain-language modes), summary drafting, skill suggestions and bullet ideas.
Every action is **review-before-apply**. Summary input excludes name/contact
details; bullet ideas require your own factual work notes. Requests go through
the server-side Gemini proxy (`api/app.py`); the key never reaches the browser.

```sh
python -m pip install -r requirements.txt
# PowerShell: $env:GOOGLE_API_KEY = "your-key"; python api/app.py
# Bash: GOOGLE_API_KEY=your-key python api/app.py
```

For Vercel, add `GOOGLE_API_KEY` as a server-side project environment variable.
Do not prefix it with `VITE_`. The Python functions under `api/ai/` reuse the
same Flask routes for deployed `/api/ai/*` requests. The existing `/api/ai/match`
route has no user-facing control and is intentionally not exposed as a product feature.

Without it the product is fully functional: editing, templates, import, saving
and PDF export are unaffected, and writing actions simply report that
assistance isn't configured yet.

## Development

```sh
bun install
bun run dev              # Vite dev server
bun x tsc -b --noEmit    # type check
bun run test             # unit + integration tests (vitest)
bun run build            # production bundle in dist/
bun run e2e              # Playwright journey tests (server must be running)
bun run lint
```

The Flask proxy checks can be run with:

```sh
python -m unittest discover -s tests -p test_ai_api.py -v
```

## Deploying

Vite builds the frontend to `dist`; `api/ai/*.py` are Python serverless functions
with dependencies declared in the root `requirements.txt`. The deployment needs
both the frontend build and server-side `GOOGLE_API_KEY`
configuration for AI assistance. Without that variable, AI responds with an
explicit setup message while local resume editing and PDF export remain available.

## Stack

Vite 5 · React 18 · TypeScript (strict) · Tailwind CSS 3 · shadcn/ui (Radix) ·
react-router-dom 6 · next-themes · jsPDF (multi-page, selectable text) ·
vitest + Testing Library · Playwright · Bun.
