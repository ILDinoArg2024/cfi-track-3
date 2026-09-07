package com.track3.alkywall.controllers;

import com.track3.alkywall.config.DataApiResponse;
import com.track3.alkywall.controllers.models.AccountDTO;
import com.track3.alkywall.controllers.models.UpdateAliasRequest;
import com.track3.alkywall.services.AccountService;
import com.track3.alkywall.services.JwtService;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/account")
public class AccountController {
    private final AccountService accountService;
    private final JwtService jwtService;

    public AccountController(AccountService accountService, JwtService jwtService){
        this.accountService = accountService;
        this.jwtService = jwtService;
    }

    @GetMapping()
    public ResponseEntity<?> getSaldo(Authentication authentication){
        if(authentication!=null) {
            AccountDTO accountDTO = accountService.getAccountDTOByUserEmail(authentication.getName());
            return ResponseEntity.ok().body(accountDTO);
        } else{
            log.info("Authentication was null");
            return ResponseEntity.badRequest().body("Credenciales inválidas");
        }
    }

    // Endpoint para que el usuario pueda cambiar su alias
    @PutMapping("/alias")
    public ResponseEntity<DataApiResponse<String>> updateAlias(
            Authentication authentication,
            @Valid @RequestBody UpdateAliasRequest request
    ) {
        if (authentication == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new DataApiResponse<>(false, "Credenciales inválidas", null));
        }
        String updatedAlias = accountService.updateAlias(authentication.getName(), request.alias());
        return ResponseEntity.ok(new DataApiResponse<>(true, "Alias actualizado con éxito", updatedAlias));
    }
}
