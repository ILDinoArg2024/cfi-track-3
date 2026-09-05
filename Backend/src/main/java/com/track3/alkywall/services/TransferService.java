package com.track3.alkywall.services;

import com.track3.alkywall.config.exceptions.InvalidTransferException;
import com.track3.alkywall.config.exceptions.NotFoundException;
import com.track3.alkywall.models.Account;
import com.track3.alkywall.models.Category;
import com.track3.alkywall.models.Transfer;
import com.track3.alkywall.repositories.CategoryRepository;
import com.track3.alkywall.repositories.TransferRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
@Slf4j
public class TransferService {
    private final AccountService accountService;
    private final CategoryRepository categoryRepository;
    private final TransactionService transactionService;
    private final TransferRepository transferRepository;

    public TransferService(AccountService accountService, CategoryRepository categoryRepository, TransactionService transactionService, TransferRepository transferRepository) {
        this.accountService = accountService;
        this.categoryRepository = categoryRepository;
        this.transactionService = transactionService;
        this.transferRepository = transferRepository;
    }

    @Transactional
    public Transfer createTransfer(String authenticatedUserEmail, String destinationAccountIdentifier, BigDecimal amount, String description) {
        Account sourceAccount = accountService.getAccountByUserEmail(authenticatedUserEmail);

        log.info("Creando transferencia de cuentaOrigen={} a cuentaDestino={}", sourceAccount.getAccountNumber(), destinationAccountIdentifier);

        Account destinationAccount  = accountService.getAccountByAccountNumberOrAlias(destinationAccountIdentifier);

        if(sourceAccount.getId().equals(destinationAccount.getId())) {
            log.error("Transferencia a misma cuenta");
            throw new InvalidTransferException("No se puede transferir a la misma cuenta");
        }

        Category category = categoryRepository.findByName("TRANSFER").orElseThrow(
                () -> {
                    log.error("Categoría=TRANSFER no encontrada");
                    return new NotFoundException("La categoría no existe");
                }
        );

        transactionService.modifyAccountBalance(sourceAccount, "DEBIT", amount);
        transactionService.modifyAccountBalance(destinationAccount, "CREDIT", amount);

        List<Transfer> transfers = new ArrayList<>(2);

        transfers.add(new Transfer(amount, "DEBIT", "COMPLETED", description, sourceAccount, category, destinationAccount));

        transfers.add(new Transfer(amount, "CREDIT", "COMPLETED", description, destinationAccount, category, sourceAccount));

        transfers = transferRepository.saveAll(transfers);

        return transfers.getFirst();
    }
}
