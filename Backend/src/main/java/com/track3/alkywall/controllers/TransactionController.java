package com.track3.alkywall.controllers;

import com.track3.alkywall.config.DataApiResponse;
import com.track3.alkywall.controllers.models.AccountMonthSummary;
import com.track3.alkywall.controllers.models.NewTransferRequest;
import com.track3.alkywall.controllers.models.TransactionResponse;
import com.track3.alkywall.models.Transaction;
import com.track3.alkywall.models.Transfer;
import com.track3.alkywall.services.TransactionService;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/transaction")
public class TransactionController {
    private final TransactionService transactionService;

    public TransactionController(TransactionService transactionService){
        this.transactionService = transactionService;
    }

    @PostMapping("/deposit")
    public ResponseEntity<?> createDeposit(Authentication authentication, @RequestParam BigDecimal amount){
        TransactionResponse transactionDTO = TransactionResponse.from(transactionService.createDeposit(authentication.getName(), amount));
        return ResponseEntity.ok().body(transactionDTO);
    }

    @PostMapping("/transfer")
    public ResponseEntity<DataApiResponse<TransactionResponse>> createTransfer(
            Authentication authentication,
            @RequestBody @Valid NewTransferRequest newTransfer
    ) {
        Transfer transfer = transactionService.createTransfer(
                authentication.getName(),
                newTransfer.destinationAccount(),
                newTransfer.amount(),
                newTransfer.description()
        );

        return ResponseEntity.status(HttpStatus.CREATED).body(new DataApiResponse<>(
                true,
                "Transferencia enviada",
                TransactionResponse.from(transfer)
        ));
    }

    @GetMapping
    public ResponseEntity<DataApiResponse<List<TransactionResponse>>> getAccountTransactions(
            Authentication authentication,
            @RequestParam(required = false) String type
    ){
        List<Transaction> transactions = transactionService.getAccountTransactions(
                authentication.getName(),
                type
        );

        List<TransactionResponse> transactionResponses = transactions.stream().map(TransactionResponse::from).toList();

        return ResponseEntity.ok().body(new DataApiResponse<>(
                true,
                "",
                transactionResponses
        ));
    }

    @GetMapping("/month-summary")
    public ResponseEntity<DataApiResponse<AccountMonthSummary>> getMonthSummary(
            Authentication authentication
    ){
        AccountMonthSummary summary = AccountMonthSummary.from(transactionService.getMonthSummary(authentication.getName()));

        return ResponseEntity.ok().body(new DataApiResponse<>(
                true,
                "",
                summary
        ));
    }
}
