package com.track3.alkywall.models;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Table(name = "transfers")
@Entity
@Getter
@Setter
@NoArgsConstructor
public class Transfer extends Transaction {
    @ManyToOne(optional = false)
    @JoinColumn(name = "related_account_id")
    private Account relatedAccount; // Cuenta relacionada, puede ser el emisor o receptor

    @Column(nullable = false)
    private String description;

    public Transfer(BigDecimal amount, String type, String status, String description, Account account, Category category, Account relatedAccount) {
        super(amount, type, status, account, category);
        this.relatedAccount = relatedAccount;
        this.description = description;
    }
}
