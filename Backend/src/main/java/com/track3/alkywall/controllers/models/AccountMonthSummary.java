package com.track3.alkywall.controllers.models;

import com.track3.alkywall.services.models.TransactionMonthSummary;

import java.math.BigDecimal;
import java.util.List;

public record AccountMonthSummary(
        BigDecimal totalCreditAmount,
        BigDecimal totalDebitAmount
) {
    public static AccountMonthSummary from(List<TransactionMonthSummary> transactionMonthSummary) {
        BigDecimal totalCreditAmount = new BigDecimal(0);
        BigDecimal totalDebitAmount = new BigDecimal(0);

        for(TransactionMonthSummary m: transactionMonthSummary){
            if(m.type().equals("CREDIT")){
                totalCreditAmount = m.totalAmount();
            }else{
                totalDebitAmount = m.totalAmount();
            }
        }

        return new AccountMonthSummary(
                totalCreditAmount,
                totalDebitAmount
        );
    }
}
