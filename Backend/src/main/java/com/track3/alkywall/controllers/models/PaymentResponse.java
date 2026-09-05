package com.track3.alkywall.controllers.models;

import com.track3.alkywall.models.Account;
import com.track3.alkywall.models.Payment;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record PaymentResponse(
        Long id,
        BigDecimal amount,
        String category,
        String name,
        String paymentMethod,
        String payerName,
        String payerAccountNumber,
        String receiverName,
        String receiverAccountNumber,
        LocalDateTime createdAt
) {
    public static PaymentResponse from(Payment payment, Account receiverAccount) {
        Account payerAccount = payment.getTransaction().getSourceAccount();
        String payerFullName = payerAccount.getUser().getFirstName() + " " + payerAccount.getUser().getLastName();
        String receiverFullName = receiverAccount.getUser().getFirstName() + " " + receiverAccount.getUser().getLastName();

        return new PaymentResponse(
                payment.getId(),
                payment.getTransaction().getAmount(),
                payment.getName(),
                payment.getName(),
                payment.getPaymentMethod().getName(),
                payerFullName.trim(),
                payerAccount.getAccountNumber(),
                receiverFullName.trim(),
                receiverAccount.getAccountNumber(),
                payment.getTransaction().getCreatedAt()
        );
    }
}