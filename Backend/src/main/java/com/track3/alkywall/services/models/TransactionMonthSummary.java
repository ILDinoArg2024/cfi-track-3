package com.track3.alkywall.services.models;

import java.math.BigDecimal;

public record TransactionMonthSummary(
        String type,
        BigDecimal totalAmount
) {
}
