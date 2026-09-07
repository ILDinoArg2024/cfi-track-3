package com.track3.alkywall.controllers;

import com.track3.alkywall.config.DataApiResponse;
import com.track3.alkywall.controllers.models.LoginUserRequest;
import com.track3.alkywall.controllers.models.NewUserRequest;
import com.track3.alkywall.services.AuthService;
import com.track3.alkywall.services.JwtService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final JwtService jwtService;
    private final AuthService authService;

    public AuthController(JwtService jwtService, AuthService authService){
        this.jwtService = jwtService;
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<DataApiResponse<Map<String, String>>> register(@RequestBody @Valid NewUserRequest newUser){
        authService.registerUser(
                newUser.firstName(),
                newUser.lastName(),
                newUser.email(),
                newUser.password(),
                newUser.dni()
        );

        return ResponseEntity.status(HttpStatus.CREATED).body(
                createTokenResponse("Usuario creado", newUser.email())
        );
    }

    @PostMapping("/login")
    public ResponseEntity<DataApiResponse<Map<String, String>>> login(@RequestBody @Valid LoginUserRequest loginUser){
        var user = authService.loginUser(loginUser.email(), loginUser.password());
        String roleName = user.getRole() != null ? user.getRole().getName() : "USER";

        return ResponseEntity.status(HttpStatus.OK).body(
                createTokenResponse("Inicio de sesión exitoso", loginUser.email(), roleName)
        );
    }

    private DataApiResponse<Map<String, String>> createTokenResponse(String msg, String email){
        return createTokenResponse(msg, email, "USER");
    }

    private DataApiResponse<Map<String, String>> createTokenResponse(String msg, String email, String role){
        return new DataApiResponse<>(
                true,
                msg,
                Map.of(
                        "token", jwtService.createToken(email, role),
                        "role", role
                )
        );
    }
}