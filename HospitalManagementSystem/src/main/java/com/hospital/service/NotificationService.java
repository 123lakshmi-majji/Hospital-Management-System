package com.hospital.service;

import com.hospital.entity.Notification;
import com.hospital.entity.Role;
import com.hospital.entity.User;
import com.hospital.repository.NotificationRepository;
import com.hospital.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class NotificationService {

    private final NotificationRepository notifRepo;
    private final UserRepository userRepo;

    public NotificationService(NotificationRepository notifRepo, UserRepository userRepo) {
        this.notifRepo = notifRepo;
        this.userRepo = userRepo;
    }

    @Transactional
    public void sendToUser(User user, String message, String type) {
        if (user == null) {
            System.out.println("[NOTIF] sendToUser: user is NULL");
            return;
        }
        try {
            Notification n = new Notification();
            n.setRecipient(user);
            n.setMessage(message);
            n.setType(type);
            notifRepo.save(n);
            System.out.println("[NOTIF] ✅ Saved notification for " + user.getUsername() + ": " + message);
        } catch (Exception e) {
            System.out.println("[NOTIF] ❌ FAILED for " + user.getUsername());
            e.printStackTrace();
        }
    }

    @Transactional
    public void sendToRole(Role role, String message, String type) {
        try {
            List<User> all = userRepo.findAll();
            int count = 0;
            for (User u : all) {
                if (u.getRole() == role) {
                    Notification n = new Notification();
                    n.setRecipient(u);
                    n.setMessage(message);
                    n.setType(type);
                    notifRepo.save(n);
                    count++;
                }
            }
            System.out.println("[NOTIF] ✅ Sent to " + count + " " + role + " users");
        } catch (Exception e) {
            System.out.println("[NOTIF] ❌ sendToRole failed");
            e.printStackTrace();
        }
    }

    @Transactional(readOnly = true)
    public List<Notification> getForUser(Long userId) {
        return notifRepo.findByRecipientIdOrderByCreatedAtDesc(userId);
    }

    @Transactional
    public void markAllRead(Long userId) {
        List<Notification> list = notifRepo.findByRecipientIdOrderByCreatedAtDesc(userId);
        for (Notification n : list) n.setRead(true);
        notifRepo.saveAll(list);
    }

    @Transactional
    public void clearForUser(Long userId) {
        notifRepo.deleteByRecipientId(userId);
    }
}