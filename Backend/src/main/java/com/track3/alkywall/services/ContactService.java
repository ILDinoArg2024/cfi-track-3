package com.track3.alkywall.services;

import com.track3.alkywall.config.exceptions.AlreadyExistsException;
import com.track3.alkywall.config.exceptions.InvalidTransferException;
import com.track3.alkywall.config.exceptions.NotFoundException;
import com.track3.alkywall.controllers.models.TopDestinationContactResponse;
import com.track3.alkywall.models.*;
import com.track3.alkywall.repositories.ContactRepository;
import com.track3.alkywall.repositories.TransactionRepository;
import com.track3.alkywall.repositories.UserRepository;
import com.track3.alkywall.services.models.DestinationContact;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@Slf4j
public class ContactService {

    private final ContactRepository contactRepository;
    private final UserRepository userRepository;
    private final AccountService accountService;
    private final UserService userService;
    private final TransactionRepository transactionRepository;

    public ContactService(ContactRepository contactRepository, UserRepository userRepository, AccountService accountService, UserService userService, TransactionRepository transactionRepository) {
        this.contactRepository = contactRepository;
        this.userRepository = userRepository;
        this.accountService = accountService;
        this.userService = userService;
        this.transactionRepository = transactionRepository;
    }

    @Transactional
    public Contact addContact(String currentUserEmail, String accountIdentifier, String name) {
        log.info("Usuario {} intentando agregar como contacto mediante cuenta/alias {}", currentUserEmail, accountIdentifier);

        User currentUser = userRepository.findByEmail(currentUserEmail)
                .orElseThrow(() -> new NotFoundException("Usuario autenticado no encontrado"));

        Account destinationAccount = accountService.getAccountByAccountNumberOrAlias(accountIdentifier);
        User contactUser = destinationAccount.getUser();

        if (currentUser.getEmail().equalsIgnoreCase(contactUser.getEmail())) {
            log.error("El usuario {} intentó agregarse a sí mismo como contacto", currentUserEmail);
            throw new InvalidTransferException("No puedes agregarte a ti mismo como contacto");
        }

        if (contactRepository.existsByUserEmailAndContactUserId(currentUserEmail, contactUser.getId())) {
            log.error("El contacto {} ya existe en la lista de {}", contactUser.getEmail(), currentUserEmail);
            throw new AlreadyExistsException("Este usuario ya se encuentra en tu lista de contactos");
        }

        Contact contact = new Contact(currentUser, contactUser, name);
        return contactRepository.save(contact);
    }

    @Transactional
    public void deleteContact(String currentUserEmail, Long contactId) {
        log.info("Usuario {} eliminando contacto con ID {}", currentUserEmail, contactId);

        Contact contact = contactRepository.findByIdAndUserEmail(contactId, currentUserEmail)
                .orElseThrow(() -> new NotFoundException("Contacto no encontrado o no tienes permiso para eliminarlo"));

        contactRepository.delete(contact);
    }

    @Transactional(readOnly = true)
    public List<Contact> getContactsByUser(String currentUserEmail) {
        return contactRepository.findByUserEmail(currentUserEmail);
    }

    public List<Map.Entry<DestinationContact, List<Transfer>>> getTopDestinationContacts(String currentUserEmail) {
        Long accountId = userService.getUserByEmail(currentUserEmail).account().getId();
        List<Transfer> transfers = transactionRepository.findSentTransfersByAccountId(accountId);

        Map<DestinationContact, List<Transfer>> transfersByContact = transfers.stream()
                .collect(Collectors.groupingBy(DestinationContact::from));

        return transfersByContact.entrySet().stream()
                .sorted(Map.Entry.<DestinationContact, List<Transfer>>comparingByValue(Comparator.comparingInt(List::size)).reversed())
                .limit(3)
                .toList();
    }
}