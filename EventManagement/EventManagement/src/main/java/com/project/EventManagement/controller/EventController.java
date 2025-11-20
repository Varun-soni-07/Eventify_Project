package com.project.EventManagement.controller;


import com.project.EventManagement.entity.Event;
import com.project.EventManagement.service.EventService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;


@RestController
@RequestMapping("/api/events")
public class EventController {
    @Autowired private EventService service;

    // Public list
    @GetMapping
    public List<Event> list() { return service.list(); }

    // Get single
    @GetMapping("/{id}")
    public ResponseEntity<?> get(@PathVariable Long id) {
        return service.get(id)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(404).body("Event not found"));
    }

    // Create (Admin)
    @PostMapping
    public Event create(@RequestBody Event e) { return service.create(e); }

    // Update (Admin)
    @PutMapping("/{id}")
    public Event update(@PathVariable Long id, @RequestBody Event e) { return service.update(id,e); }

    // Delete (Admin)
    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.ok("Deleted");
    }
}
