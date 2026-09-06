package com.track3.alkywall.controllers;

import com.track3.alkywall.config.DataApiResponse;
import com.track3.alkywall.controllers.models.NewTransferRequest;
import com.track3.alkywall.controllers.models.TransactionResponse;
import com.track3.alkywall.models.Transfer;
import com.track3.alkywall.services.TransferService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/transaction/transfer")
public class TransferController {
    private final TransferService transferService;

    public TransferController(TransferService transferService) {
        this.transferService = transferService;
    }

    @PostMapping
    public ResponseEntity<DataApiResponse<TransactionResponse>> createTransfer(
            Authentication authentication,
            @RequestBody @Valid NewTransferRequest newTransfer
    ) {
        Transfer transfer = transferService.createTransfer(
                authentication.getName(),
                newTransfer.destinationAccount(),
                newTransfer.amount(),
                newTransfer.description()
        );

        return ResponseEntity.status(HttpStatus.CREATED).body(new DataApiResponse<>(
                true,
                "Transferencia realizada con éxito",
                TransactionResponse.from(transfer)
        ));
    }
}
