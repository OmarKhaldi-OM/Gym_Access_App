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

    def test_embed_endpoint_rejects_request_without_shared_key(self):
        response = self.client.post("/api/face/embed", json={"imageBase64": "unused"})

        self.assertEqual(response.status_code, 401)


if __name__ == "__main__":
    unittest.main()
