package com.track3.alkywall.controllers.models;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.track3.alkywall.models.Transaction;
import com.track3.alkywall.models.Transfer;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record TransactionResponse (
        Long id,
        BigDecimal amount,
        String type,
        String categoryName,
        LocalDateTime createdAt,

        @JsonInclude(JsonInclude.Include.NON_NULL) // lo incluye en los jsons si no es null
        TransferResponse transfer
){
    public static TransactionResponse from(Transaction transaction){
        if(transaction instanceof Transfer){
            return TransactionResponse.from((Transfer)transaction);
        }else{
            return new TransactionResponse(
                    transaction.getId(),
                    transaction.getAmount(),
                    transaction.getType(),
                    transaction.getCategory().getName(),
                    transaction.getCreatedAt(),
                    null
            );
        }
    }

    private static TransactionResponse from(Transfer transfer){
        return new TransactionResponse(
                transfer.getId(),
                transfer.getAmount(),
                transfer.getType(),
                transfer.getCategory().getName(),
                transfer.getCreatedAt(),
                TransferResponse.from(transfer)
        );
    }
}
