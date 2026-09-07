package com.track3.alkywall.repositories;

import com.track3.alkywall.models.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    // Lista las notificaciones de un usuario ordenadas por fecha
    List<Notification> findAllByUserEmailOrderByCreatedAtDesc(String email);

    // Cuenta cuantas notificaciones sin leer tiene el usuario
    long countByUserEmailAndIsReadFalse(String email);

    // Marca todas las notificaciones del usuario como leidas
    @Modifying
    @Query("UPDATE Notification n SET n.isRead = true WHERE n.user.email = :email")
    void markAllAsReadByUserEmail(@Param("email") String email);

    // Marca una notificacion especifica como leida si pertenece al usuario
    @Modifying
    @Query("UPDATE Notification n SET n.isRead = true WHERE n.id = :id AND n.user.email = :email")
    int markAsReadByIdAndUserEmail(@Param("id") Long id, @Param("email") String email);
}
