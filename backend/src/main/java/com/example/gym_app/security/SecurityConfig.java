package com.example.gym_app.security;

import com.example.gym_app.user.entity.Role;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final CustomUserDetailsService userDetailsService;

    private final JwtAuthFilter jwtAuthFilter;

    public SecurityConfig(
            CustomUserDetailsService userDetailsService,
            JwtAuthFilter jwtAuthFilter) {
        this.userDetailsService = userDetailsService;
        this.jwtAuthFilter = jwtAuthFilter;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder());
        return provider;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/auth/login", "/api/auth/register", "/api/auth/face-login", "/api/auth/google").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/classes/**", "/api/schedules/**", "/api/plans/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/bookings/counts").permitAll()
                        .requestMatchers("/api/staff/**").hasRole(Role.ADMIN.name())
                        .requestMatchers(HttpMethod.GET, "/api/trainers/**").hasAnyRole(Role.ADMIN.name(), Role.RECEPTIONIST.name(), Role.TRAINER.name(), Role.MEMBER.name())
                        .requestMatchers("/api/trainers/**").hasRole(Role.ADMIN.name())
                        .requestMatchers(HttpMethod.GET, "/api/members").hasAnyRole(Role.ADMIN.name(), Role.RECEPTIONIST.name())
                        .requestMatchers(HttpMethod.POST, "/api/members/**").hasAnyRole(Role.ADMIN.name(), Role.RECEPTIONIST.name())
                        .requestMatchers(HttpMethod.PUT, "/api/members/**").hasAnyRole(Role.ADMIN.name(), Role.RECEPTIONIST.name())
                        .requestMatchers(HttpMethod.DELETE, "/api/members/**").hasAnyRole(Role.ADMIN.name(), Role.RECEPTIONIST.name())
                        .requestMatchers("/api/members/**").hasAnyRole(Role.ADMIN.name(), Role.RECEPTIONIST.name(), Role.MEMBER.name())
                        .requestMatchers(HttpMethod.GET, "/api/access-logs/member/**").hasAnyRole(Role.ADMIN.name(), Role.RECEPTIONIST.name(), Role.MEMBER.name())
                        .requestMatchers("/api/face-recognition/enroll-account").hasAnyRole(Role.ADMIN.name(), Role.RECEPTIONIST.name(), Role.MEMBER.name())
                        .requestMatchers("/api/access-logs/**", "/api/face-embeddings/**", "/api/face-recognition/**").hasAnyRole(Role.ADMIN.name(), Role.RECEPTIONIST.name())
                        .requestMatchers(HttpMethod.GET, "/api/bookings/member/**").hasAnyRole(Role.ADMIN.name(), Role.RECEPTIONIST.name(), Role.MEMBER.name())
                        .requestMatchers(HttpMethod.POST, "/api/bookings").hasAnyRole(Role.ADMIN.name(), Role.RECEPTIONIST.name(), Role.MEMBER.name())
                        .requestMatchers(HttpMethod.PATCH, "/api/bookings/*/cancel").hasAnyRole(Role.ADMIN.name(), Role.RECEPTIONIST.name(), Role.MEMBER.name())
                        .requestMatchers("/api/bookings/**").hasAnyRole(Role.ADMIN.name(), Role.RECEPTIONIST.name())
                        .requestMatchers(HttpMethod.GET, "/api/subscriptions/member/**").hasAnyRole(Role.ADMIN.name(), Role.RECEPTIONIST.name(), Role.MEMBER.name())
                        .requestMatchers(HttpMethod.POST, "/api/subscriptions").hasAnyRole(Role.ADMIN.name(), Role.RECEPTIONIST.name(), Role.MEMBER.name())
                        .requestMatchers("/api/subscriptions/**").hasAnyRole(Role.ADMIN.name(), Role.RECEPTIONIST.name())
                        .requestMatchers("/api/progress-logs/**").hasAnyRole(Role.ADMIN.name(), Role.MEMBER.name())
                        .requestMatchers(HttpMethod.GET, "/api/trainer-bookings/member/**").hasAnyRole(Role.ADMIN.name(), Role.RECEPTIONIST.name(), Role.MEMBER.name())
                        .requestMatchers(HttpMethod.GET, "/api/trainer-bookings/trainer/**").hasAnyRole(Role.ADMIN.name(), Role.RECEPTIONIST.name(), Role.TRAINER.name())
                        .requestMatchers(HttpMethod.POST, "/api/trainer-bookings").hasAnyRole(Role.ADMIN.name(), Role.RECEPTIONIST.name(), Role.MEMBER.name())
                        .requestMatchers(HttpMethod.PATCH, "/api/trainer-bookings/*/cancel").hasAnyRole(Role.ADMIN.name(), Role.RECEPTIONIST.name(), Role.MEMBER.name())
                        .requestMatchers("/api/trainer-bookings/**").hasAnyRole(Role.ADMIN.name(), Role.RECEPTIONIST.name())
                        .requestMatchers("/api/coaching-requests/**").hasAnyRole(Role.ADMIN.name(), Role.RECEPTIONIST.name(), Role.TRAINER.name(), Role.MEMBER.name())
                        .requestMatchers("/api/member-goals/**").hasRole(Role.MEMBER.name())
                        .requestMatchers(HttpMethod.POST, "/api/plans", "/api/classes", "/api/schedules")
                            .hasAnyRole(Role.ADMIN.name(), Role.RECEPTIONIST.name())
                        .requestMatchers(HttpMethod.PUT, "/api/plans/**", "/api/classes/**", "/api/schedules/**")
                            .hasAnyRole(Role.ADMIN.name(), Role.RECEPTIONIST.name())
                        .requestMatchers(HttpMethod.DELETE, "/api/plans/**", "/api/classes/**", "/api/schedules/**")
                            .hasAnyRole(Role.ADMIN.name(), Role.RECEPTIONIST.name())
                        .anyRequest().authenticated()
                )
                .exceptionHandling(exceptions -> exceptions
                        .authenticationEntryPoint((request, response, exception) -> {
                            response.setStatus(401);
                            response.setContentType("application/json");
                            response.getWriter().write("{\"status\":401,\"message\":\"Authentification requise\"}");
                        })
                        .accessDeniedHandler((request, response, exception) -> {
                            response.setStatus(403);
                            response.setContentType("application/json");
                            response.getWriter().write("{\"status\":403,\"message\":\"Acces refuse\"}");
                        }))
                .authenticationProvider(authenticationProvider())
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of("http://localhost:5173", "http://127.0.0.1:5173"));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("Authorization", "Content-Type", "Accept"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}