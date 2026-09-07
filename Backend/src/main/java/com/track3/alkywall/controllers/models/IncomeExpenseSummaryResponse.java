package com.track3.alkywall.controllers.models;

import com.track3.alkywall.services.models.TransactionTypeAmountSummary;

import java.math.BigDecimal;
import java.util.List;

public record IncomeExpenseSummaryResponse(
        BigDecimal totalCreditAmount,
        BigDecimal totalDebitAmount
) {
    public static IncomeExpenseSummaryResponse from(List<TransactionTypeAmountSummary> transactionTypeAmountSummary) {
        BigDecimal totalCreditAmount = new BigDecimal(0);
        BigDecimal totalDebitAmount = new BigDecimal(0);

        for(TransactionTypeAmountSummary m: transactionTypeAmountSummary){
            if(m.getType().equals("CREDIT")){
                totalCreditAmount = m.getTotalAmount();
            }else{
                totalDebitAmount = m.getTotalAmount();
            }
        }

        return new IncomeExpenseSummaryResponse(
                totalCreditAmount,
                totalDebitAmount
        );
    }
}
