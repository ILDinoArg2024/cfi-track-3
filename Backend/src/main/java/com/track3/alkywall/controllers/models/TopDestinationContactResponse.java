package com.track3.alkywall.controllers.models;

import com.track3.alkywall.models.Transaction;
import com.track3.alkywall.models.Transfer;
import com.track3.alkywall.services.models.DestinationContact;

import java.math.BigDecimal;
import java.util.Comparator;
import java.util.List;

public record TopDestinationContactResponse(
        String firstName,
        String lastName,
        String accountNumber,
        String alias,
        Long transferCount,
        BigDecimal lastTransferAmount
) {
    public static TopDestinationContactResponse from(DestinationContact contact, List<Transfer> transfers) {
        BigDecimal lastTransferAmount = transfers.stream()
                .max(Comparator.comparing(Transaction::getCreatedAt))
                .map(Transaction::getAmount)
                .orElse(null);

        return new TopDestinationContactResponse(
                contact.firstName(),
                contact.lastName(),
                contact.accountNumber(),
                contact.alias(),
                (long) transfers.size(),
                lastTransferAmount
        );
    }
}
