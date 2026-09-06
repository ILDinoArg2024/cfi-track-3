package com.track3.alkywall.controllers;

import com.track3.alkywall.config.DataApiResponse;
import com.track3.alkywall.controllers.models.TopDestinationContactResponse;
import com.track3.alkywall.services.TransactionService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {
    private final TransactionService transactionService;

    public DashboardController(TransactionService transactionService) {
        this.transactionService = transactionService;
    }

    @GetMapping("/frecuentes")
    public ResponseEntity<DataApiResponse<List<TopDestinationContactResponse>>> getContactosFrecuentes(
            Authentication authentication
    ) {
        List<TopDestinationContactResponse> response = transactionService.getTopDestinationContacts(authentication.getName());

        return ResponseEntity.ok(new DataApiResponse<>(
                true,
                "Contactos frecuentes obtenidos exitosamente",
                response
        ));
    }
}
