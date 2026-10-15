import base64
import hmac
import os
from io import BytesIO

from flask import Flask, jsonify, request

app = Flask(__name__)


@app.get("/health")
def health():
    return jsonify({"status": "ok"})


@app.post("/api/face/embed")
def embed_face():
    configured_key = os.environ.get("FACE_SERVICE_KEY")
    supplied_key = request.headers.get("X-Internal-Key", "")
    if request.remote_addr not in {"127.0.0.1", "::1"}:
        if not configured_key:
            return jsonify({"status": "error", "message": "A face service key is required for non-local requests."}), 503
        if not hmac.compare_digest(
            configured_key.encode("utf-8"),
            supplied_key.encode("utf-8"),
        ):
            return jsonify({"status": "error", "message": "Unauthorized."}), 401

    import face_recognition
    import numpy as np
    from PIL import Image

    payload = request.get_json(silent=True) or {}
    image_base64 = payload.get("imageBase64") or payload.get("image")

    if not image_base64:
        return jsonify({"status": "error", "message": "No image was received."}), 400

    if "," in image_base64:
        image_base64 = image_base64.split(",", 1)[1]

    try:
        image_bytes = base64.b64decode(image_base64)
        image = Image.open(BytesIO(image_bytes)).convert("RGB")
        image_array = np.array(image)
    except Exception as exc:  # pragma: no cover
        return jsonify({"status": "error", "message": f"Image payload could not be decoded: {exc}"}), 400

    face_locations = face_recognition.face_locations(image_array)
    if len(face_locations) == 0:
        return jsonify({"status": "error", "message": "No face detected."}), 400
    if len(face_locations) > 1:
        return jsonify({"status": "error", "message": "Multiple faces detected."}), 400

    face_encoding = face_recognition.face_encodings(image_array, known_face_locations=[face_locations[0]])
    if not face_encoding:
        return jsonify({"status": "error", "message": "Face could not be encoded."}), 400

    return jsonify({
        "status": "ok",
        "faceDetected": True,
        "faceCount": 1,
        "embedding": [float(value) for value in face_encoding[0].tolist()],
    })


if __name__ == "__main__":
    port = int(os.getenv("PORT", "8001"))
    host = os.getenv("HOST", "127.0.0.1")
    app.run(host=host, port=port, debug=False)
