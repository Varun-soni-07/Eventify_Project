package com.project.EventManagement.repository;


import com.project.EventManagement.entity.Event;
import com.project.EventManagement.entity.Registration;
import com.project.EventManagement.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface RegistrationRepository extends JpaRepository<Registration, Long> {
    List<Registration> findByUser(User user);
    Optional<Registration> findByUserAndEvent(User user, Event event);

    void deleteAllByEvent(Event event);



}
