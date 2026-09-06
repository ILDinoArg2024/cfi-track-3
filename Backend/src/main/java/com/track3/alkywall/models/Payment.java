package com.track3.alkywall.models;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Table(name = "payments")
@Entity
@Getter
@Setter
@NoArgsConstructor
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Categoría del gasto
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private PaymentCategory category;

    // Nombre del comercio o concepto del pago
    @Column(nullable = false, length = 150)
    private String name;

    // Transacción contable asociada
    @OneToOne(optional = false)
    @JoinColumn(name = "transaction_id", nullable = false)
    private Transaction transaction;

    // Método de pago utilizado
    @ManyToOne(optional = false)
    @JoinColumn(name = "payment_method_id", nullable = false)
    private PaymentMethod paymentMethod;

    public Payment(PaymentCategory category, String name, Transaction transaction, PaymentMethod paymentMethod) {
        this.category = category;
        this.name = name;
        this.transaction = transaction;
        this.paymentMethod = paymentMethod;
    }
}