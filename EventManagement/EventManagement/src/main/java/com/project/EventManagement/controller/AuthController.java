package com.project.EventManagement.controller;



import com.project.EventManagement.dto.AuthRequest;
import com.project.EventManagement.dto.AuthResponse;
import com.project.EventManagement.entity.User;
import com.project.EventManagement.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    @Autowired private UserService userService;

    // Register - default role USER; admin can be created through data.sql or admin API
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody AuthRequest req) {
        try {
            User u = userService.register(req.getUsername(), req.getPassword(), "USER");
            return ResponseEntity.ok("User created: " + u.getUsername());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Login - returns JWT
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthRequest req) {
        try {
            String token = userService.login(req.getUsername(), req.getPassword());
            return ResponseEntity.ok(new AuthResponse(token));
        } catch (Exception e) {
            return ResponseEntity.status(401).body(e.getMessage());
        }
    }
}
