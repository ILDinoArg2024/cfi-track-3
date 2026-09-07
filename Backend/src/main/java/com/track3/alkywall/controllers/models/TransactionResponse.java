package com.track3.alkywall.controllers.models;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.track3.alkywall.models.Payment;
import com.track3.alkywall.models.Transaction;
import com.track3.alkywall.models.Transfer;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record TransactionResponse(
     Long id,
     BigDecimal amount,
     String type,
     String categoryName,
     LocalDateTime createdAt,

     @JsonInclude(JsonInclude.Include.NON_NULL) // lo incluye en los jsons si no es null
     TransferResponse transfer,

     @JsonInclude(JsonInclude.Include.NON_NULL)
     PaymentResponse payment
){
    public static TransactionResponse from(Transaction transaction) {
        if (transaction == null) return null;

        TransferResponse transfer = null;
        PaymentResponse paymentResponse = null;

        if(transaction instanceof Transfer){
            transfer = TransferResponse.from((Transfer) transaction);
        }else if(transaction instanceof Payment){
            paymentResponse = PaymentResponse.from((Payment) transaction);
        }

        String categoryName = (transaction.getCategory() != null) ? transaction.getCategory().getName() : "GENERAL";

        return new TransactionResponse(
                transaction.getId(),
                transaction.getAmount(),
                transaction.getType(),
                categoryName,
                transaction.getCreatedAt(),
                transfer,
                paymentResponse
        );
    }
}