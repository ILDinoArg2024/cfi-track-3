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
        if (payment == null) return null;
        Account relatedAccount = payment.getRelatedAccount();

        String categoryKey = (payment.getPaymentCategory() != null) ? payment.getPaymentCategory().name() : "OTROS";
        String categoryName = (payment.getPaymentCategory() != null) ? payment.getPaymentCategory().getDisplayName() : "Otros";
        String method = (payment.getPaymentMethod() != null) ? payment.getPaymentMethod().getName() : "QR";

        String firstName = (relatedAccount != null && relatedAccount.getUser() != null) ? relatedAccount.getUser().getFirstName() : "";
        String lastName = (relatedAccount != null && relatedAccount.getUser() != null) ? relatedAccount.getUser().getLastName() : "";
        String accountNumber = (relatedAccount != null) ? relatedAccount.getAccountNumber() : "";

        return new PaymentResponse(
                categoryKey,
                categoryName,
                payment.getName(),
                method,
                firstName,
                lastName,
                accountNumber
        );
    }
}