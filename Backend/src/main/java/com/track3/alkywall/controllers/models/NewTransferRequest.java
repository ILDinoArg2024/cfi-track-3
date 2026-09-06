package com.track3.alkywall.controllers.models;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record NewTransferRequest(
        @NotNull
        @Positive
        BigDecimal amount,

        @NotNull
        String destinationAccount, // número de cuenta o alias

        @NotNull
        @Size(max = 255)
        String description
) {
}
