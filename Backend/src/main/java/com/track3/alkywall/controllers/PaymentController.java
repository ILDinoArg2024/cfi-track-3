package com.track3.alkywall.controllers;

import com.track3.alkywall.config.DataApiResponse;
import com.track3.alkywall.controllers.models.CategoryExpenseDTO;
import com.track3.alkywall.controllers.models.NewPaymentRequest;
import com.track3.alkywall.controllers.models.PaymentResponse;
import com.track3.alkywall.models.PaymentCategory;
import com.track3.alkywall.services.PaymentService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/transaction/payment")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    // Procesa el pago con QR
    @PostMapping
    public ResponseEntity<DataApiResponse<PaymentResponse>> createPayment(
            Authentication authentication,
            @RequestBody @Valid NewPaymentRequest newPayment
    ) {
        PaymentResponse response = paymentService.createPayment(
                authentication.getName(),
                newPayment.sourceAccountNumber(),
                newPayment.destinationAccount(),
                newPayment.amount(),
                newPayment.category(),
                newPayment.name()
        );

        return ResponseEntity.status(HttpStatus.CREATED).body(new DataApiResponse<>(
                true,
                "Pago realizado con éxito",
                response
        ));
    }

    // Lista las categorías disponibles para el selector
    @GetMapping("/categories")
    public ResponseEntity<DataApiResponse<List<Map<String, String>>>> getCategories() {
        List<Map<String, String>> categories = Arrays.stream(PaymentCategory.values())
                .map(cat -> Map.of(
                        "key", cat.name(),
                        "displayName", cat.getDisplayName()
                ))
                .toList();

        return ResponseEntity.ok(new DataApiResponse<>(
                true,
                "Categorías de pago obtenidas",
                categories
        ));
    }

    // Obtiene los gastos del mes del usuario agrupados por categoría
    @GetMapping("/expenses/month")
    public ResponseEntity<DataApiResponse<List<CategoryExpenseDTO>>> getMonthlyExpenses(Authentication authentication) {
        List<CategoryExpenseDTO> expenses = paymentService.getMonthlyExpenses(authentication.getName());
        return ResponseEntity.ok(new DataApiResponse<>(
                true,
                "Gastos del mes obtenidos",
                expenses
        ));
    }
}