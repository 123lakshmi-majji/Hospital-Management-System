package com.hospital.controller;

import com.hospital.entity.Notification;
import com.hospital.entity.User;
import com.hospital.repository.UserRepository;
import com.hospital.service.NotificationService;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService service;
    private final UserRepository userRepo;

    public NotificationController(NotificationService service, UserRepository userRepo) {
        this.service = service;
        this.userRepo = userRepo;
    }

    @GetMapping("/my")
    public List<Notification> getMy(Authentication auth) {
        if (auth == null || auth.getName() == null) {
            System.out.println("[NOTIF] getMy: no auth");
            return Collections.emptyList();
        }
        System.out.println("[NOTIF] getMy for user: " + auth.getName());
        User user = userRepo.findByUsername(auth.getName()).orElse(null);
        if (user == null) {
            System.out.println("[NOTIF] getMy: user not found for " + auth.getName());
            return Collections.emptyList();
        }
        List<Notification> list = service.getForUser(user.getId());
        System.out.println("[NOTIF] getMy: found " + list.size() + " notifications for user id " + user.getId());
        return list;
    }

    @PostMapping("/my/mark-read")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void markRead(Authentication auth) {
        if (auth == null) return;
        User user = userRepo.findByUsername(auth.getName()).orElse(null);
        if (user != null) service.markAllRead(user.getId());
    }

    @DeleteMapping("/my")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void clearMy(Authentication auth) {
        if (auth == null) return;
        User user = userRepo.findByUsername(auth.getName()).orElse(null);
        if (user != null) service.clearForUser(user.getId());
    }
}