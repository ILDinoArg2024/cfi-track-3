package com.track3.alkywall.controllers.models;

import com.track3.alkywall.models.Account;
import com.track3.alkywall.models.Transfer;

public record TransferResponse(
        String relatedAccountFirstName,
        String relatedAccountLastName,
        String relatedAccountNumber,
        String description
) {
    public static TransferResponse from(Transfer sourceTransfer) {
        if (sourceTransfer == null) return null;
        Account relatedAccount = sourceTransfer.getRelatedAccount();

        String firstName = (relatedAccount != null && relatedAccount.getUser() != null) ? relatedAccount.getUser().getFirstName() : "";
        String lastName = (relatedAccount != null && relatedAccount.getUser() != null) ? relatedAccount.getUser().getLastName() : "";
        String accountNumber = (relatedAccount != null) ? relatedAccount.getAccountNumber() : "";

        return new TransferResponse(
                firstName,
                lastName,
                accountNumber,
                sourceTransfer.getDescription()
        );
    }
}
