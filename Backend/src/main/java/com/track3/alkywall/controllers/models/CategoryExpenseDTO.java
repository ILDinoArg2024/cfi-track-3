package com.track3.alkywall.controllers.models;

import java.math.BigDecimal;

public record CategoryExpenseDTO(
        String category,
        String displayName,
        BigDecimal amount,
        Integer percentage
) {
}
