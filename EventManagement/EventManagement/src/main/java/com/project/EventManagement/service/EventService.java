package com.project.EventManagement.service;


import com.project.EventManagement.entity.Event;
import com.project.EventManagement.repository.EventRepository;
import com.project.EventManagement.repository.RegistrationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class EventService {
    @Autowired private EventRepository repo;

    public Event create(Event e){ return repo.save(e); }
    public List<Event> list(){ return repo.findAll(); }
    public Optional<Event> get(Long id){ return repo.findById(id); }
    public Event update(Long id, Event e){
        e.setId(id);
        return repo.save(e);
    }
    @Autowired private RegistrationRepository regRepo;


    public void delete(Long id) {
        repo.deleteById(id);
    }}

