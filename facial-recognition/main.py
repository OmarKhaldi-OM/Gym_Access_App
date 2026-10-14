import base64
import os
from io import BytesIO

import face_recognition
import numpy as np
from flask import Flask, jsonify, request
from PIL import Image

app = Flask(__name__)


@app.get("/health")
def health():
    return jsonify({"status": "ok"})


@app.post("/api/face/embed")
def embed_face():
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
    app.run(host="0.0.0.0", port=port, debug=False)
