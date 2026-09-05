package com.track3.alkywall.services.models;

import com.track3.alkywall.models.PaymentCategory;

import java.math.BigDecimal;

public interface PaymentCategoryExpenses {
        PaymentCategory getCategory();
        BigDecimal getTotalAmount();
}
