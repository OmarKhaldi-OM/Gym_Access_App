import unittest
from unittest.mock import patch

from main import app


class FaceServiceTest(unittest.TestCase):
    def setUp(self):
        self.client = app.test_client()
        self.key_environment = patch.dict("os.environ", {"FACE_SERVICE_KEY": "test-shared-key"})
        self.key_environment.start()
        self.addCleanup(self.key_environment.stop)

    def test_health_endpoint_is_available(self):
        response = self.client.get("/health")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.get_json(), {"status": "ok"})

    def test_embed_endpoint_allows_local_request_without_shared_key(self):
        with patch.dict("os.environ", {}, clear=True):
            response = self.client.post("/api/face/embed", json={"imageBase64": "unused"})

        self.assertEqual(response.status_code, 400)
        self.assertNotEqual(response.get_json()["message"], "Unauthorized.")

    def test_embed_endpoint_requires_key_for_non_local_request(self):
        with patch.dict("os.environ", {}, clear=True):
            response = self.client.post(
                "/api/face/embed",
                json={"imageBase64": "unused"},
                environ_base={"REMOTE_ADDR": "192.0.2.1"},
            )

        self.assertEqual(response.status_code, 503)

    def test_embed_endpoint_rejects_invalid_key_for_non_local_request(self):
        response = self.client.post(
            "/api/face/embed",
            json={"imageBase64": "unused"},
            headers={"X-Internal-Key": "wrong-key"},
            environ_base={"REMOTE_ADDR": "192.0.2.1"},
        )

        self.assertEqual(response.status_code, 401)


if __name__ == "__main__":
    unittest.main()
