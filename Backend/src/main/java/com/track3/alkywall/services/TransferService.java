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
    private final NotificationService notificationService;

    public TransferService(
            AccountService accountService,
            CategoryRepository categoryRepository,
            TransactionService transactionService,
            TransferRepository transferRepository,
            NotificationService notificationService
    ) {
        this.accountService = accountService;
        this.categoryRepository = categoryRepository;
        this.transactionService = transactionService;
        this.transferRepository = transferRepository;
        this.notificationService = notificationService;
    }

    @Transactional
    public Transfer createTransfer(String authenticatedUserEmail, String destinationAccountIdentifier, BigDecimal amount, String description) {
        Account sourceAccount = accountService.getAccountByUserEmail(authenticatedUserEmail);

        // Si la cuenta emisora está bloqueada, no puede enviar dinero
        if (sourceAccount.getUser() != null && Boolean.FALSE.equals(sourceAccount.getUser().getIsActive())) {
            log.error("Usuario emisor={} está suspendido", authenticatedUserEmail);
            throw new InvalidTransferException("Tu cuenta se encuentra suspendida. No podés transferir dinero.");
        }

        log.info("Creando transferencia de cuentaOrigen={} a cuentaDestino={}", sourceAccount.getAccountNumber(), destinationAccountIdentifier);

        Account destinationAccount  = accountService.getAccountByAccountNumberOrAlias(destinationAccountIdentifier);

        // Si la cuenta destino está bloqueada, no puede recibir dinero
        if (destinationAccount.getUser() != null && Boolean.FALSE.equals(destinationAccount.getUser().getIsActive())) {
            log.error("Cuenta destino={} pertenece a un usuario suspendido", destinationAccountIdentifier);
            throw new InvalidTransferException("La cuenta de destino se encuentra suspendida y no puede recibir transferencias.");
        }

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

        // Genera las notificaciones para ambos usuarios
        String nombreEmisor = (sourceAccount.getUser().getFirstName() + " " + sourceAccount.getUser().getLastName()).trim();
        String nombreReceptor = (destinationAccount.getUser().getFirstName() + " " + destinationAccount.getUser().getLastName()).trim();

        notificationService.createNotification(
                sourceAccount.getUser(),
                "Transferencia enviada",
                "Enviaste $" + amount + " a " + (nombreReceptor.isEmpty() ? destinationAccountIdentifier : nombreReceptor) + ".",
                "TRANSFER_SENT"
        );

        notificationService.createNotification(
                destinationAccount.getUser(),
                "Transferencia recibida",
                (nombreEmisor.isEmpty() ? "Un usuario" : nombreEmisor) + " te envió $" + amount + ".",
                "TRANSFER_RECEIVED"
        );

        return transfers.getFirst();
    }
}
