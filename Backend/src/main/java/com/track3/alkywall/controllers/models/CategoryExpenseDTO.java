package com.track3.alkywall.controllers.models;

import com.track3.alkywall.services.models.PaymentCategoryExpenses;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

public record CategoryExpenseDTO(
        String category,
        String displayName,
        BigDecimal amount,
        Integer percentage
) {
    public static List<CategoryExpenseDTO> from(List<PaymentCategoryExpenses> paymentExpenses) {
        // Sumar el monto total de todas las categorías
        BigDecimal total = paymentExpenses.stream()
                .map(PaymentCategoryExpenses::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return paymentExpenses.stream().map(p ->
           new CategoryExpenseDTO(
                p.getCategory().name(),
                p.getCategory().getDisplayName(),
                p.getTotalAmount(),
                p.getTotalAmount().multiply(BigDecimal.valueOf(100)).divide(total, 0, RoundingMode.HALF_UP).intValue()
           )
        ).toList();
    }
}
