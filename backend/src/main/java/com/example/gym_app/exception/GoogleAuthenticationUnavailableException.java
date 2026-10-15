package com.example.gym_app.exception;

public class GoogleAuthenticationUnavailableException extends RuntimeException {
    public GoogleAuthenticationUnavailableException(String message) {
        super(message);
    }

    public GoogleAuthenticationUnavailableException(String message, Throwable cause) {
        super(message, cause);
    }
}
