package com.track3.alkywall.controllers.models;

import com.track3.alkywall.models.Account;
import com.track3.alkywall.models.Payment;

public record PaymentResponse(
        String categoryKey,
        String category,
        String name,
        String method,
        String relatedFirstName,
        String relatedLastName,
        String relatedAccountNumber
) {
    public static PaymentResponse from(Payment payment) {
        Account relatedAccount = payment.getRelatedAccount();

        return new PaymentResponse(
                payment.getPaymentCategory().name(),
                payment.getPaymentCategory().getDisplayName(),
                payment.getName(),
                payment.getPaymentMethod().getName(),
                relatedAccount.getUser().getFirstName(),
                relatedAccount.getUser().getLastName(),
                relatedAccount.getAccountNumber()
        );
    }
}