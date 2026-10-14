package com.example.gym_app;

import org.junit.jupiter.api.Test;
import org.springframework.context.annotation.AnnotationConfigApplicationContext;
import org.springframework.context.annotation.AnnotatedBeanDefinitionReader;

import static org.junit.jupiter.api.Assertions.assertFalse;

class DataSeederProfileTest {

    @Test
    void dataSeederIsNotRegisteredOutsideDevProfile() {
        try (AnnotationConfigApplicationContext context = new AnnotationConfigApplicationContext()) {
            context.getEnvironment().setActiveProfiles("prod");
            new AnnotatedBeanDefinitionReader(context).register(DataSeeder.class);
            context.refresh();

            assertFalse(context.containsBeanDefinition("dataSeeder"));
        }
    }
}
