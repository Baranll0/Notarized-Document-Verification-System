package com.noter.belge.controller;

import com.noter.belge.model.User;
import com.noter.belge.service.UserService;
import com.noter.belge.security.JwtTokenProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin
public class AuthController {
    @Autowired
    private UserService userService;
    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, Object> payload) {
        String email = (String) payload.get("email");
        String role = (String) payload.get("role");
        if ("admin".equals(role)) {
            return ResponseEntity.badRequest().body("Admin kaydı yapılamaz.");
        }
        if (userService.findByEmail(email).isPresent()) {
            return ResponseEntity.badRequest().body("Bu e-posta ile kayıtlı kullanıcı var.");
        }
        User user = new User();
        user.setName((String) payload.get("name"));
        user.setEmail(email);
        user.setPassword((String) payload.get("password"));
        user.setRole(role);
        User saved = userService.registerUser(user);
        return ResponseEntity.ok(saved);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody User loginUser) {
        // Admin login özel kontrol
        if ("admin@gmail.com".equals(loginUser.getEmail()) && "admin".equals(loginUser.getPassword())) {
            org.springframework.security.core.userdetails.User springUser =
                new org.springframework.security.core.userdetails.User(
                    "admin@gmail.com", "admin",
                    java.util.List.of(new org.springframework.security.core.authority.SimpleGrantedAuthority("admin"))
                );
            String token = jwtTokenProvider.generateToken(
                new org.springframework.security.authentication.UsernamePasswordAuthenticationToken(
                    springUser, null, springUser.getAuthorities()
                )
            );
            java.util.Map<String, Object> response = new java.util.HashMap<>();
            response.put("token", token);
            response.put("user", java.util.Map.of("email", "admin@gmail.com", "role", "admin", "name", "Admin"));
            return ResponseEntity.ok(response);
        }
        Optional<User> userOpt = userService.findByEmail(loginUser.getEmail());
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(401).body("Kullanıcı bulunamadı.");
        }
        User user = userOpt.get();
        if (!userService.checkPassword(loginUser.getPassword(), user.getPassword())) {
            return ResponseEntity.status(401).body("Şifre hatalı.");
        }
        org.springframework.security.core.userdetails.User springUser =
            new org.springframework.security.core.userdetails.User(
                user.getEmail(), user.getPassword(),
                java.util.List.of(new org.springframework.security.core.authority.SimpleGrantedAuthority(user.getRole()))
            );
        String token = jwtTokenProvider.generateToken(
            new org.springframework.security.authentication.UsernamePasswordAuthenticationToken(
                springUser, null, springUser.getAuthorities()
            )
        );
        Map<String, Object> response = new HashMap<>();
        response.put("token", token);
        response.put("user", user);
        return ResponseEntity.ok(response);
    }
} 