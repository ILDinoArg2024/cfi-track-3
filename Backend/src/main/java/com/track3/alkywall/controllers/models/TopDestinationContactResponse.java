package com.track3.alkywall.controllers.models;

import java.math.BigDecimal;

public record TopDestinationContactResponse(
        String firstName,
        String lastName,
        String accountNumber,
        String alias,
        Long transferCount,
        BigDecimal lastTransferAmount
) {
}
