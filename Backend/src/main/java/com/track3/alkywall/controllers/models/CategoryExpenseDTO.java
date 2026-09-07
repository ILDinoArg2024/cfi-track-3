package com.track3.alkywall.controllers.models;

import com.track3.alkywall.models.PaymentCategory;
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
        if (paymentExpenses == null || paymentExpenses.isEmpty()) {
            return List.of();
        }

        // Sumar el monto total de todas las categorías
        BigDecimal total = paymentExpenses.stream()
                .map(p -> p.getTotalAmount() != null ? p.getTotalAmount() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return paymentExpenses.stream().map(p -> {
            PaymentCategory cat = p.getCategory() != null ? p.getCategory() : PaymentCategory.OTROS;
            BigDecimal amount = p.getTotalAmount() != null ? p.getTotalAmount() : BigDecimal.ZERO;
            int percentage = (total.compareTo(BigDecimal.ZERO) > 0)
                    ? amount.multiply(BigDecimal.valueOf(100)).divide(total, 0, RoundingMode.HALF_UP).intValue()
                    : 0;

            return new CategoryExpenseDTO(
                    cat.name(),
                    cat.getDisplayName(),
                    amount,
                    percentage
            );
        }).toList();
    }
}
