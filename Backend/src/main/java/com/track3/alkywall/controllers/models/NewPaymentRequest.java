package com.track3.alkywall.controllers.models;

import com.track3.alkywall.models.PaymentCategory;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record NewPaymentRequest(
        @NotNull
        String sourceAccountNumber,

        @NotNull
        @Positive
        BigDecimal amount,

        @NotNull
        String destinationAccount, // CVU o Alias del comercio/cobrador

        @NotNull
        PaymentCategory category, // Categoría del gasto (SERVICIOS, COMIDA, etc.)

        @Size(max = 150)
        String name // Nombre o detalle del comercio/pago (opcional)
) {
}