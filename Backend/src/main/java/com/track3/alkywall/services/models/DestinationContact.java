package com.track3.alkywall.services.models;

import com.track3.alkywall.models.Account;
import com.track3.alkywall.models.Transfer;
import com.track3.alkywall.models.User;

public record DestinationContact(String firstName, String lastName, String accountNumber, String alias) {

    public static DestinationContact from(Transfer transfer) {
        Account destinationAccount = transfer.getRelatedAccount();
        User destinationUser = destinationAccount.getUser();

        return new DestinationContact(
                destinationUser.getFirstName(),
                destinationUser.getLastName(),
                destinationAccount.getAccountNumber(),
                destinationAccount.getAlias()
        );
    }
}