package com.project.EventManagement.config;

import org.springframework.context.annotation.*;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
public class SecurityConfig {

    @Bean
    public JwtFilter jwtFilter() {
        return new JwtFilter();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http.csrf().disable()
                .authorizeRequests()

                // --- ✅ Public Routes ---
                .antMatchers(
                        "/api/auth/**",
                        "/",
                        "/index.html",
                        "/events.html",
                        "/login.html",
                        "/myevents.html",
                        "/admin.html",
                        "/register.html",
                        "/css/style.css",
                        "/js/app.js"
                ).permitAll()

                // --- ✅ Event Routes ---
                .antMatchers(HttpMethod.GET, "/api/events/**").permitAll()   // everyone can view events
                .antMatchers(HttpMethod.POST, "/api/events/**").hasRole("ADMIN")
                .antMatchers(HttpMethod.PUT, "/api/events/**").hasRole("ADMIN")
                .antMatchers(HttpMethod.DELETE, "/api/events/**").hasRole("ADMIN")

                // --- ✅ Admin Routes ---
                .antMatchers("/api/admin/**").hasRole("ADMIN")

                // --- ✅ User Routes (Authenticated only) ---
                .antMatchers("/api/registrations/**").hasAnyRole("USER", "ADMIN")

                // --- ❌ Anything Else: Block ---
                .anyRequest().denyAll()

                .and()
                .headers().frameOptions().disable()
                .and()
                .addFilterBefore(jwtFilter(), UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
