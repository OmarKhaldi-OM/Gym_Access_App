package com.example.gym_app.user.entity;

public enum Role {
    MEMBER,
    ADMIN,
    RECEPTIONIST,
    TRAINER;

    public String authority() {
        return "ROLE_" + name();
    }
}