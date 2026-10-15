package com.example.gym_app.exception;

public class FaceRecognitionUnavailableException extends RuntimeException {
    public FaceRecognitionUnavailableException(String message) {
        super(message);
    }
}
