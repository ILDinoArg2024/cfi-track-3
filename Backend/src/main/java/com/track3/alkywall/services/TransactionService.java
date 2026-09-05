package com.track3.alkywall.services;

import com.track3.alkywall.config.exceptions.InsufficientFundsException;
import com.track3.alkywall.config.exceptions.InvalidTransferException;
import com.track3.alkywall.config.exceptions.NotFoundException;
import com.track3.alkywall.models.Account;
import com.track3.alkywall.models.Category;
import com.track3.alkywall.models.Transaction;
import com.track3.alkywall.models.Transfer;
import com.track3.alkywall.repositories.CategoryRepository;
import com.track3.alkywall.repositories.TransactionRepository;
import com.track3.alkywall.services.models.TransactionMonthSummary;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
@Slf4j
public class TransactionService {
    private final TransactionRepository transactionRepository;
    private final AccountService accountService;
    private final CategoryRepository categoryRepository;
    private final UserService userService;

    public TransactionService(TransactionRepository transactionRepository, AccountService accountService, CategoryRepository categoryRepository, UserService userService) {
        this.transactionRepository = transactionRepository;
        this.accountService = accountService;
        this.categoryRepository = categoryRepository;
        this.userService = userService;
    }

    @Transactional
    public Transaction createDeposit(String authenticatedUserEmail, BigDecimal amount){
        Account account = userService.getUserByEmail(authenticatedUserEmail).account();

        modifyAccountBalance(account, "CREDIT", amount);

        Category category = categoryRepository.findByName("DEPOSIT").orElseThrow(() -> new NotFoundException("Categoría no encontrada"));

        accountService.updateAccountBalance(account.getId(), account.getBalance());
        return transactionRepository.save(new Transaction(
                amount,
                "CREDIT",
                "COMPLETED",
                account,
                category
        ));
    }

    @Transactional
    public Transfer createTransfer(String authenticatedUserEmail, String destinationAccountIdentifier, BigDecimal amount, String description) {
        Account sourceAccount = userService.getUserByEmail(authenticatedUserEmail).account();

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

        modifyAccountBalance(sourceAccount, "DEBIT", amount);
        modifyAccountBalance(destinationAccount, "CREDIT", amount);

        List<Transfer> transfers = new ArrayList<>(2);

        transfers.add(new Transfer(amount, "DEBIT", "COMPLETED", description, sourceAccount, category, destinationAccount));

        transfers.add(new Transfer(amount, "CREDIT", "COMPLETED", description, destinationAccount, category, sourceAccount));

        transfers = transactionRepository.saveAll(transfers);

        return transfers.getFirst();
    }

    private void modifyAccountBalance(Account account, String type, BigDecimal amount){
        if(type.equals("CREDIT")) {
            account.setBalance(account.getBalance().add(amount));
            return;
        }

        if(account.getBalance().compareTo(amount) < 0){
            log.error("Saldo insuficiente. Saldo={}, monto={}", account.getBalance(), amount);
            throw new InsufficientFundsException("Saldo insuficiente");
        }

        account.setBalance(account.getBalance().subtract(amount));
    }

    public List<Transaction> getAccountTransactions(String authenticatedUserEmail, String type) {
        if(type == null){
            return transactionRepository.findAllByAccountIdOrderByCreatedAtDesc(
                    userService.getUserByEmail(authenticatedUserEmail).account().getId()
            );
        }else{
            return transactionRepository.findAllByAccountIdAndTypeOrderByCreatedAtDesc(
                    userService.getUserByEmail(authenticatedUserEmail).account().getId(),
                    type
            );
        }
    }

    public List<TransactionMonthSummary> getMonthSummary(String authenticatedUserEmail){
        return transactionRepository.getMonthSummaryByAccountId(
                userService.getUserByEmail(authenticatedUserEmail).account().getId()
        );
    }
}
