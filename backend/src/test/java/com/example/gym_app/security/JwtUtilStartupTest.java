package com.example.gym_app.security;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.runner.ApplicationContextRunner;
import org.springframework.boot.test.context.ConfigDataApplicationContextInitializer;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Import;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

class JwtUtilStartupTest {

    private final ApplicationContextRunner contextRunner = new ApplicationContextRunner()
            .withInitializer(new ConfigDataApplicationContextInitializer())
            .withUserConfiguration(JwtUtilConfiguration.class);

    @Test
    void refusesToStartWithoutJwtSecretOutsideDevProfile() {
        contextRunner
                .withPropertyValues("spring.profiles.active=prod", "JWT_SECRET=")
                .run(context -> {
                    Throwable startupFailure = context.getStartupFailure();
                    assertNotNull(startupFailure);
                    assertTrue(hasMessage(startupFailure, "JWT_SECRET must contain at least 32 characters"));
                });
    }

    @Test
    void refusesToStartWithJwtSecretShorterThan32Characters() {
        contextRunner
                .withPropertyValues(
                        "spring.profiles.active=prod",
                        "JWT_SECRET=too-short")
                .run(context -> {
                    Throwable startupFailure = context.getStartupFailure();
                    assertNotNull(startupFailure);
                    assertTrue(hasMessage(startupFailure, "JWT_SECRET must contain at least 32 characters"));
                });
    }

    private boolean hasMessage(Throwable throwable, String expectedMessage) {
        for (Throwable current = throwable; current != null; current = current.getCause()) {
            if (expectedMessage.equals(current.getMessage())) {
                return true;
            }
        }
        return false;
    }

    @Configuration(proxyBeanMethods = false)
    @Import(JwtUtil.class)
    static class JwtUtilConfiguration {
    }
}
