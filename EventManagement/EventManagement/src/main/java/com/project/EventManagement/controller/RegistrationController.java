package com.project.EventManagement.controller;


import com.project.EventManagement.entity.Registration;
import com.project.EventManagement.service.RegistrationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/registrations")
public class RegistrationController {
    @Autowired private RegistrationService service;

    @PostMapping("/event/{eventId}")
    public ResponseEntity<?> registerForEvent(@PathVariable Long eventId, Authentication auth) {
        if(auth == null) return ResponseEntity.status(401).body("Unauthorized");
        String username = auth.getName();
        try {
            Registration r = service.registerUserToEvent(username, eventId);
            return ResponseEntity.ok(r);
        } catch(Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/me")
    public ResponseEntity<?> myEvents(Authentication auth) {
        if(auth == null) return ResponseEntity.status(401).body("Unauthorized");
        String username = auth.getName();
        List<?> list = service.getUserRegistrations(username);
        return ResponseEntity.ok(list);
    }
}

