package com.track3.alkywall.config;

import com.track3.alkywall.config.exceptions.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(AlreadyExistsException.class)
    public ResponseEntity<ApiResponse> alreadyExistsException(AlreadyExistsException exception){
        return ResponseEntity.status(HttpStatus.CONFLICT).body(new ApiResponse(
                false,
                exception.getMessage()
        ));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<DataApiResponse<Map<String, String>>> methodArgumentNotValidException(MethodArgumentNotValidException exception){
        Map<String, String> errors = new HashMap<>();

        exception.getFieldErrors().forEach(err -> errors.put(
                err.getField(), err.getDefaultMessage()
        ));

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new DataApiResponse<>(
                false,
                "Datos inválidos",
                errors
        ));
    }

    @ExceptionHandler(LoginFailedException.class)
    public ResponseEntity<ApiResponse> loginFailedException(LoginFailedException exception){
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new ApiResponse(
           false,
           exception.getMessage()
        ));
    }

    @ExceptionHandler(InvalidTransferException.class)
    public ResponseEntity<ApiResponse> invalidTransferException(InvalidTransferException exception){
        return ResponseEntity.status(HttpStatus.CONFLICT).body(new ApiResponse(false, exception.getMessage()));
    }

    @ExceptionHandler(NotFoundException.class)
    public ResponseEntity<ApiResponse> notFoundException(NotFoundException exception){
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ApiResponse(
                false,
                exception.getMessage()
        ));
    }

    @ExceptionHandler(InsufficientFundsException.class)
    public ResponseEntity<ApiResponse> insufficientFundsException(InsufficientFundsException exception){
        return ResponseEntity.status(HttpStatus.CONFLICT).body(new ApiResponse(false, exception.getMessage()));
    }

    @ExceptionHandler(AccountNotOwnedByUserException.class)
    public ResponseEntity<ApiResponse> accountNotOwnedByUserException(AccountNotOwnedByUserException exception){
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(new ApiResponse(false, exception.getMessage()));
    }

    // Redirige a la pagina 404 si la ruta no existe
    @ExceptionHandler(org.springframework.web.servlet.resource.NoResourceFoundException.class)
    public Object handleNoResourceFound(
            org.springframework.web.servlet.resource.NoResourceFoundException ex,
            jakarta.servlet.http.HttpServletRequest request,
            jakarta.servlet.http.HttpServletResponse response
    ) throws java.io.IOException {
        String uri = request.getRequestURI();
        if (uri != null && uri.startsWith("/api/")) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ApiResponse(false, "Ruta no encontrada"));
        }
        response.sendRedirect("/Frontend/404/index404.html");
        return null;
    }
}
