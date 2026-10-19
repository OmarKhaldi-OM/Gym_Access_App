package com.example.gym_app.security;

import com.example.gym_app.user.entity.User;
import com.example.gym_app.user.repository.UserRepository;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    public CustomUserDetailsService(
            UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("Utilisateur introuvable: " + email));

        return new AccountUserDetails(user);
    }

    static final class AccountUserDetails extends org.springframework.security.core.userdetails.User {
        private final LocalDateTime passwordChangedAt;

        AccountUserDetails(User user) {
            super(user.getEmail(), user.getMotDePasse(),
                    List.of(new SimpleGrantedAuthority(user.getRole().authority())));
            this.passwordChangedAt = user.getPasswordChangedAt();
        }

        LocalDateTime getPasswordChangedAt() {
            return passwordChangedAt;
        }
    }
}