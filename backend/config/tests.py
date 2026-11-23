from django.conf import settings
from django.test import Client, SimpleTestCase, override_settings


class ProductionSecuritySettingsTests(SimpleTestCase):
    def test_security_response_headers_are_enabled(self):
        self.assertTrue(settings.SECURE_CONTENT_TYPE_NOSNIFF)
        self.assertEqual(settings.SECURE_REFERRER_POLICY, 'strict-origin-when-cross-origin')
        self.assertEqual(settings.SECURE_CROSS_ORIGIN_OPENER_POLICY, 'same-origin')
        self.assertEqual(settings.X_FRAME_OPTIONS, 'DENY')
        self.assertTrue(settings.SESSION_COOKIE_HTTPONLY)
        self.assertTrue(settings.CSRF_COOKIE_HTTPONLY)

    def test_api_responses_include_security_headers(self):
        response = Client().get('/api/health/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response['X-Content-Type-Options'], 'nosniff')
        self.assertEqual(response['X-Frame-Options'], 'DENY')
        self.assertEqual(response['Referrer-Policy'], 'strict-origin-when-cross-origin')

    @override_settings(SECURE_SSL_REDIRECT=True)
    def test_http_is_redirected_when_production_redirect_is_enabled(self):
        response = Client().get('/api/health/')
        self.assertEqual(response.status_code, 301)
        self.assertEqual(response['Location'], 'https://testserver/api/health/')

    @override_settings(SECURE_HSTS_SECONDS=31536000)
    def test_https_responses_include_hsts(self):
        response = Client().get('/api/health/', secure=True)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response['Strict-Transport-Security'], 'max-age=31536000')
