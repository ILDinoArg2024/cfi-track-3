package com.track3.alkywall.services;

import com.track3.alkywall.config.exceptions.AccountNotOwnedByUserException;
import com.track3.alkywall.config.exceptions.InvalidTransferException;
import com.track3.alkywall.controllers.models.CategoryExpenseDTO;
import com.track3.alkywall.controllers.models.PaymentResponse;
import com.track3.alkywall.models.*;
import com.track3.alkywall.repositories.PaymentMethodRepository;
import com.track3.alkywall.repositories.PaymentRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@Slf4j
public class PaymentService {
    private final PaymentRepository paymentRepository;
    private final PaymentMethodRepository paymentMethodRepository;
    private final TransactionService transactionService;
    private final AccountService accountService;

    public PaymentService(
            PaymentRepository paymentRepository,
            PaymentMethodRepository paymentMethodRepository,
            TransactionService transactionService,
            AccountService accountService
    ) {
        this.paymentRepository = paymentRepository;
        this.paymentMethodRepository = paymentMethodRepository;
        this.transactionService = transactionService;
        this.accountService = accountService;
    }

    // Procesa y guarda un nuevo pago
    @Transactional
    public PaymentResponse createPayment(
            String emailUserAuthenticated,
            String sourceAccountNumber,
            String destinationAccountIdentifier,
            BigDecimal amount,
            PaymentCategory category,
            String customName
    ) {
        log.info("Iniciando pago de cuentaOrigen={} a cuentaDestino={}, categoria={}",
                sourceAccountNumber, destinationAccountIdentifier, category);

        // Valida la cuenta de origen
        Account sourceAccount = accountService.getAccountByAccountNumberOrAlias(sourceAccountNumber);
        if (!sourceAccount.getUser().getEmail().equals(emailUserAuthenticated)) {
            log.error("Número de cuenta={} no pertenece al usuario={}", sourceAccountNumber, emailUserAuthenticated);
            throw new AccountNotOwnedByUserException("El número de cuenta no está asociado con el usuario");
        }

        // Valida la cuenta destino
        Account destinationAccount = accountService.getAccountByAccountNumberOrAlias(destinationAccountIdentifier);
        if (sourceAccount.getId().equals(destinationAccount.getId())) {
            log.error("Intento de pago a la misma cuenta");
            throw new InvalidTransferException("No se puede realizar un pago a la misma cuenta");
        }

        // Obtiene el método de pago QR
        PaymentMethod paymentMethod = paymentMethodRepository.findByName("QR")
                .orElseGet(() -> paymentMethodRepository.save(new PaymentMethod("QR")));

        // Determina el concepto del pago
        PaymentCategory categoriaSegura = (category != null) ? category : PaymentCategory.OTROS;
        String paymentConcept = (customName != null && !customName.isBlank())
                ? customName.trim()
                : categoriaSegura.getDisplayName();

        // Registra los movimientos contables
        Transaction sourceTransaction = transactionService.createTransaction(
                sourceAccount, amount, "DEBIT", paymentConcept, "PAYMENT"
        );
        transactionService.createTransaction(
                destinationAccount, amount, "CREDIT", paymentConcept, "PAYMENT"
        );

        // Guarda el pago en la base de datos
        Payment payment = paymentRepository.save(new Payment(categoriaSegura, paymentConcept, sourceTransaction, paymentMethod));

        return PaymentResponse.from(payment, destinationAccount);
    }

    // Obtiene los gastos del mes agrupados por categoría
    @Transactional(readOnly = true)
    public List<CategoryExpenseDTO> getMonthlyExpenses(String emailUserAuthenticated) {
        Account account = accountService.getAccountByUserEmail(emailUserAuthenticated);
        LocalDateTime startOfMonth = LocalDate.now().withDayOfMonth(1).atStartOfDay();

        List<Payment> payments = paymentRepository.findByAccountIdAndCreatedAtAfter(account.getId(), startOfMonth);

        if (payments.isEmpty()) {
            return List.of();
        }

        BigDecimal total = payments.stream()
                .map(p -> p.getTransaction().getAmount())
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Agrupa por categoría de forma segura
        Map<PaymentCategory, BigDecimal> sumByCategory = payments.stream()
                .collect(Collectors.groupingBy(
                        p -> p.getCategory() != null ? p.getCategory() : PaymentCategory.OTROS,
                        Collectors.reducing(BigDecimal.ZERO, p -> p.getTransaction().getAmount(), BigDecimal::add)
                ));

        return sumByCategory.entrySet().stream()
                .map(entry -> {
                    BigDecimal amount = entry.getValue();
                    int percentage = (total.compareTo(BigDecimal.ZERO) > 0)
                            ? amount.multiply(BigDecimal.valueOf(100)).divide(total, 0, RoundingMode.HALF_UP).intValue()
                            : 0;
                    return new CategoryExpenseDTO(
                            entry.getKey().name(),
                            entry.getKey().getDisplayName(),
                            amount,
                            percentage
                    );
                })
                .sorted((a, b) -> b.amount().compareTo(a.amount()))
                .toList();
    }
}