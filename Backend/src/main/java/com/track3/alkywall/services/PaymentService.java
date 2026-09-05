package com.track3.alkywall.services;

import com.track3.alkywall.config.exceptions.InvalidTransferException;
import com.track3.alkywall.config.exceptions.NotFoundException;
import com.track3.alkywall.models.*;
import com.track3.alkywall.repositories.CategoryRepository;
import com.track3.alkywall.repositories.PaymentMethodRepository;
import com.track3.alkywall.repositories.PaymentRepository;
import com.track3.alkywall.services.models.PaymentCategoryExpenses;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
@Slf4j
public class PaymentService {
    private final PaymentRepository paymentRepository;
    private final PaymentMethodRepository paymentMethodRepository;
    private final TransactionService transactionService;
    private final AccountService accountService;
    private final CategoryRepository categoryRepository;

    public PaymentService(
            PaymentRepository paymentRepository,
            PaymentMethodRepository paymentMethodRepository,
            TransactionService transactionService,
            AccountService accountService,
            CategoryRepository categoryRepository
    ) {
        this.paymentRepository = paymentRepository;
        this.paymentMethodRepository = paymentMethodRepository;
        this.transactionService = transactionService;
        this.accountService = accountService;
        this.categoryRepository = categoryRepository;
    }

    // Procesa y guarda un nuevo pago
    @Transactional
    public Payment createPayment(
            String emailUserAuthenticated,
            String destinationAccountIdentifier,
            BigDecimal amount,
            PaymentCategory paymentCategory,
            String customName
    ) {
        Account sourceAccount = accountService.getAccountByUserEmail(emailUserAuthenticated);

        log.info("Iniciando pago de cuentaOrigen={} a cuentaDestino={}, categoria={}",
                sourceAccount.getAccountNumber(), destinationAccountIdentifier, paymentCategory);

        // Valida la cuenta destino
        Account destinationAccount = accountService.getAccountByAccountNumberOrAlias(destinationAccountIdentifier);
        if (sourceAccount.getId().equals(destinationAccount.getId())) {
            log.error("Intento de pago a la misma cuenta");
            throw new InvalidTransferException("No se puede realizar un pago a la misma cuenta");
        }

        Category category = categoryRepository.findByName("PAYMENT").orElseThrow(() -> new NotFoundException("Categoría no encontrada"));

        // Obtiene el método de pago QR
        PaymentMethod paymentMethod = paymentMethodRepository.findByName("QR").orElseThrow(() -> new NotFoundException("El método de pago no existe"));

        // Determina el concepto del pago
        if(paymentCategory == null) paymentCategory = PaymentCategory.OTROS;
        String paymentConcept = (customName != null && !customName.isBlank())
                ? customName.trim()
                : paymentCategory.getDisplayName();

        transactionService.modifyAccountBalance(sourceAccount, "DEBIT", amount);
        transactionService.modifyAccountBalance(destinationAccount, "CREDIT", amount);

        // Registra los movimientos contables
        List<Payment> payments = new ArrayList<>(2);
        payments.add(new Payment(
                amount, "DEBIT", "COMPLETED", sourceAccount, category, paymentCategory, paymentConcept, paymentMethod, destinationAccount)
        );

        payments.add(new Payment(
                amount, "CREDIT", "COMPLETED", destinationAccount, category, paymentCategory, paymentConcept, paymentMethod, sourceAccount
        ));

        // Guarda el pago en la base de datos
        return paymentRepository.saveAll(payments).getFirst();
    }

    // Obtiene los gastos del mes agrupados por categoría
    @Transactional(readOnly = true)
    public List<PaymentCategoryExpenses> getMonthlyExpenses(String emailUserAuthenticated) {
        return paymentRepository.getMonthlyPaymentExpensesSummary(
                accountService.getAccountByUserEmail(emailUserAuthenticated).getId()
        );
    }
}