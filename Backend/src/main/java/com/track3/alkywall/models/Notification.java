package com.track3.alkywall.models;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
@Getter
@Setter
@NoArgsConstructor
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Usuario que recibe la notificacion
    @ManyToOne(optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // Titulo de la notificacion
    @Column(nullable = false, length = 100)
    private String title;

    // Mensaje descriptivo
    @Column(nullable = false, length = 255)
    private String message;

    // Tipo de notificacion (TRANSFER_RECEIVED, TRANSFER_SENT, PAYMENT, DEPOSIT, etc)
    @Column(nullable = false, length = 50)
    private String type;

    // Estado de lectura
    @Column(nullable = false)
    private Boolean isRead;

    // Fecha de creacion
    @Column(nullable = false)
    private LocalDateTime createdAt;

    public Notification(User user, String title, String message, String type) {
        this.user = user;
        this.title = title;
        this.message = message;
        this.type = type;
        this.isRead = false;
        this.createdAt = LocalDateTime.now();
    }
}
