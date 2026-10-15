import json
import os
import unittest
from unittest.mock import Mock, patch

from api.app import app


class AiApiTests(unittest.TestCase):
    def setUp(self):
        self.client = app.test_client()

    def test_missing_provider_key_returns_setup_error(self):
        with patch.dict(os.environ, {}, clear=True):
            response = self.client.post('/api/ai/rewrite', json={'text': 'Original wording'})
        self.assertEqual(response.status_code, 503)
        self.assertEqual(response.get_json(), {'error': 'not_configured'})

    def test_bullets_require_first_hand_work_context(self):
        with patch.dict(os.environ, {'GOOGLE_API_KEY': 'test-key'}):
            with patch('api.app.requests.post') as provider:
                response = self.client.post('/api/ai/bullets', json={'role': 'Engineer'})
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.get_json(), {'error': 'invalid_input'})
        provider.assert_not_called()

    def test_rewrite_preserves_provider_errors_as_json(self):
        provider_response = Mock(status_code=429)
        with patch.dict(os.environ, {'GOOGLE_API_KEY': 'test-key'}):
            with patch('api.app.requests.post', return_value=provider_response):
                response = self.client.post('/api/ai/rewrite', json={'text': 'Original wording'})
        self.assertEqual(response.status_code, 429)
        self.assertEqual(response.get_json(), {'error': 'rate_limited'})

    def test_bullet_prompt_forbids_invented_facts(self):
        provider_response = Mock(status_code=200)
        provider_response.json.return_value = {
            'candidates': [{'content': {'parts': [{'text': 'Coordinated weekly releases using the supplied project notes'}]}}]
        }
        with patch.dict(os.environ, {'GOOGLE_API_KEY': 'test-key'}):
            with patch('api.app.requests.post', return_value=provider_response) as provider:
                response = self.client.post('/api/ai/bullets', json={
                    'role': 'Engineer',
                    'context': 'Coordinated weekly releases with the design team.',
                    'skills': ['Release planning'],
                })
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.get_json()['bullets']), 1)
        payload = json.loads(provider.call_args.kwargs['data'])
        prompt = payload['contents'][0]['parts'][0]['text']
        self.assertIn('Never invent metrics, numbers', prompt)
        self.assertIn("the user's own factual notes", prompt)

    def test_vercel_route_modules_export_the_shared_flask_app(self):
        from api.ai import bullets, rewrite, skills, summary

        for route in (bullets, rewrite, skills, summary):
            self.assertIs(route.app, app)


if __name__ == '__main__':
    unittest.main()
