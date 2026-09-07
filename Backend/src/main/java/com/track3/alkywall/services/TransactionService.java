package com.track3.alkywall.services;

import com.track3.alkywall.config.exceptions.InsufficientFundsException;
import com.track3.alkywall.config.exceptions.NotFoundException;
import com.track3.alkywall.models.Account;
import com.track3.alkywall.models.Category;
import com.track3.alkywall.models.Transaction;
import com.track3.alkywall.repositories.CategoryRepository;
import com.track3.alkywall.repositories.TransactionRepository;
import com.track3.alkywall.services.models.TransactionTypeAmountSummary;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@Slf4j
public class TransactionService {
    private final TransactionRepository transactionRepository;
    private final AccountService accountService;
    private final CategoryRepository categoryRepository;

    public TransactionService(TransactionRepository transactionRepository, AccountService accountService, CategoryRepository categoryRepository) {
        this.transactionRepository = transactionRepository;
        this.accountService = accountService;
        this.categoryRepository = categoryRepository;
    }

    @Transactional
    public Transaction createDeposit(String authenticatedUserEmail, BigDecimal amount){
        Account account = accountService.getAccountByUserEmail(authenticatedUserEmail);

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

    public void modifyAccountBalance(Account account, String type, BigDecimal amount){
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
                    accountService.getAccountByUserEmail(authenticatedUserEmail).getId()
            );
        }else{
            return transactionRepository.findAllByAccountIdAndTypeOrderByCreatedAtDesc(
                    accountService.getAccountByUserEmail(authenticatedUserEmail).getId(),
                    type
            );
        }
    }

    public List<TransactionTypeAmountSummary> getMonthIncomeExpense(String authenticatedUserEmail){
        return transactionRepository.getMonthIncomeExpenseByAccountId(
                accountService.getAccountByUserEmail(authenticatedUserEmail).getId()
        );
    }
}
