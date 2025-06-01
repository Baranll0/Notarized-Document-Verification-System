package com.noter.belge.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import java.util.List;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import com.noter.belge.security.JwtAuthenticationFilter;
import com.noter.belge.security.JwtTokenProvider;
import com.noter.belge.security.CustomAuthenticationEntryPoint;
import org.springframework.beans.factory.annotation.Autowired;
import com.noter.belge.security.CustomUserDetailsService;

@Configuration
@EnableWebSecurity
public class SecurityConfig {
    @Autowired
    private JwtAuthenticationFilter jwtAuthenticationFilter;
    @Autowired
    private JwtTokenProvider jwtTokenProvider;
    @Autowired
    private CustomAuthenticationEntryPoint customAuthenticationEntryPoint;
    @Autowired
    private CustomUserDetailsService customUserDetailsService;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/api/categories/**").permitAll()
                .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/documents").hasAuthority("user")
                .requestMatchers(org.springframework.http.HttpMethod.POST, "/api/documents").hasAuthority("user")
                .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/noter/documents/**").hasAuthority("noter")
                .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/noter/documents*").hasAuthority("noter")
                .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/noter/**").hasAuthority("noter")
                .requestMatchers(org.springframework.http.HttpMethod.POST, "/api/noter/documents/approve").hasAuthority("noter")
                .requestMatchers(org.springframework.http.HttpMethod.POST, "/api/documents/approve").hasAuthority("noter")
                .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/admin/**").hasAuthority("admin")
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
            .exceptionHandling(ex -> ex.authenticationEntryPoint(customAuthenticationEntryPoint))
            ;
        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(List.of("http://localhost:3000"));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE"));
        configuration.setAllowedHeaders(List.of("*") );
        configuration.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public org.springframework.security.core.userdetails.UserDetailsService userDetailsService() {
        return customUserDetailsService;
    }
} 