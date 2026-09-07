package com.track3.alkywall.models;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Table(name = "payments")
@Entity
@Getter
@Setter
@NoArgsConstructor
public class Payment extends Transaction{
    // Categoría del gasto
    @Enumerated(EnumType.STRING)
    @Column(name = "payment_category", length = 50)
    private PaymentCategory paymentCategory;

    // Nombre del comercio o concepto del pago
    @Column(length = 150)
    private String name;

    // Método de pago utilizado
    @ManyToOne
    @JoinColumn(name = "payment_method_id")
    private PaymentMethod paymentMethod;

    @ManyToOne
    @JoinColumn(name = "related_account_id")
    private Account relatedAccount;

    public Payment(BigDecimal amount, String type, String status, Account account, Category category, PaymentCategory paymentCategory, String name, PaymentMethod paymentMethod, Account relatedAccount) {
        super(amount, type, status, account, category);
        this.paymentCategory = paymentCategory;
        this.name = name;
        this.paymentMethod = paymentMethod;
        this.relatedAccount = relatedAccount;
    }
}