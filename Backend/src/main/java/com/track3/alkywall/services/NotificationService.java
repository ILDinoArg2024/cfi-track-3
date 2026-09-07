package com.track3.alkywall.services;

import com.track3.alkywall.controllers.models.NotificationResponse;
import com.track3.alkywall.models.Notification;
import com.track3.alkywall.models.User;
import com.track3.alkywall.repositories.NotificationRepository;
import com.track3.alkywall.repositories.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Slf4j
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    public NotificationService(NotificationRepository notificationRepository, UserRepository userRepository) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
    }

    // Guarda una nueva notificacion para un usuario
    @Transactional
    public void createNotification(User user, String title, String message, String type) {
        if (user == null) return;
        try {
            Notification notification = new Notification(user, title, message, type);
            notificationRepository.save(notification);
            log.info("Notificacion guardada para usuario={}: {}", user.getEmail(), title);
        } catch (Exception e) {
            log.error("Error al guardar notificacion para usuario={}: {}", user.getEmail(), e.getMessage());
        }
    }

    // Guarda notificacion buscando el usuario por su email
    @Transactional
    public void createNotificationForEmail(String email, String title, String message, String type) {
        userRepository.findByEmail(email).ifPresent(user -> createNotification(user, title, message, type));
    }

    // Obtiene todas las notificaciones del usuario ordenadas por fecha
    @Transactional(readOnly = true)
    public List<NotificationResponse> getUserNotifications(String email) {
        return notificationRepository.findAllByUserEmailOrderByCreatedAtDesc(email)
                .stream()
                .map(NotificationResponse::from)
                .toList();
    }

    // Cantidad de notificaciones sin leer
    @Transactional(readOnly = true)
    public long getUnreadCount(String email) {
        return notificationRepository.countByUserEmailAndIsReadFalse(email);
    }

    // Marca una notificacion puntual como leida
    @Transactional
    public boolean markAsRead(Long id, String email) {
        int updatedRows = notificationRepository.markAsReadByIdAndUserEmail(id, email);
        return updatedRows > 0;
    }

    // Marca todas las notificaciones del usuario como leidas
    @Transactional
    public void markAllAsRead(String email) {
        notificationRepository.markAllAsReadByUserEmail(email);
    }
}
