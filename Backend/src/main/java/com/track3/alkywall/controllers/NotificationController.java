package com.track3.alkywall.controllers;

import com.track3.alkywall.config.ApiResponse;
import com.track3.alkywall.config.DataApiResponse;
import com.track3.alkywall.controllers.models.NotificationResponse;
import com.track3.alkywall.services.NotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    // Lista las notificaciones del usuario autenticado
    @GetMapping
    public ResponseEntity<DataApiResponse<List<NotificationResponse>>> getNotifications(Authentication authentication) {
        List<NotificationResponse> list = notificationService.getUserNotifications(authentication.getName());
        return ResponseEntity.ok(new DataApiResponse<>(true, "Notificaciones obtenidas", list));
    }

    // Devuelve el contador de notificaciones no leidas para la campana
    @GetMapping("/unread-count")
    public ResponseEntity<DataApiResponse<Map<String, Long>>> getUnreadCount(Authentication authentication) {
        long count = notificationService.getUnreadCount(authentication.getName());
        return ResponseEntity.ok(new DataApiResponse<>(true, "Cantidad obtenida", Map.of("unreadCount", count)));
    }

    // Marca una notificacion individual como leida
    @PatchMapping("/{id}/read")
    public ResponseEntity<ApiResponse> markAsRead(@PathVariable Long id, Authentication authentication) {
        boolean ok = notificationService.markAsRead(id, authentication.getName());
        if (ok) {
            return ResponseEntity.ok(new ApiResponse(true, "Notificación marcada como leída"));
        }
        return ResponseEntity.badRequest().body(new ApiResponse(false, "No se encontró la notificación"));
    }

    // Marca todas las notificaciones como leidas
    @PatchMapping("/read-all")
    public ResponseEntity<ApiResponse> markAllAsRead(Authentication authentication) {
        notificationService.markAllAsRead(authentication.getName());
        return ResponseEntity.ok(new ApiResponse(true, "Todas las notificaciones marcadas como leídas"));
    }
}
