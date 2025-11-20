package com.project.EventManagement.service;


import com.project.EventManagement.entity.Event;
import com.project.EventManagement.entity.Registration;
import com.project.EventManagement.entity.User;
import com.project.EventManagement.repository.EventRepository;
import com.project.EventManagement.repository.RegistrationRepository;
import com.project.EventManagement.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class RegistrationService {
    @Autowired private RegistrationRepository regRepo;
    @Autowired private UserRepository userRepo;
    @Autowired private EventRepository eventRepo;

    public Registration registerUserToEvent(String username, Long eventId) {
        User user = userRepo.findByUsername(username).orElseThrow(() -> new RuntimeException("User not found"));
        Event event = eventRepo.findById(eventId).orElseThrow(() -> new RuntimeException("Event not found"));

        if(regRepo.findByUserAndEvent(user, event).isPresent())
            throw new RuntimeException("Already registered");

        Registration r = new Registration();
        r.setUser(user);
        r.setEvent(event);
        return regRepo.save(r);
    }

    public List<Registration> getUserRegistrations(String username){
        User user = userRepo.findByUsername(username).orElseThrow(() -> new RuntimeException("User not found"));
        return regRepo.findByUser(user);
    }
}

