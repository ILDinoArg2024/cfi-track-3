package com.track3.alkywall.controllers.models;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record UpdateAliasRequest(
        @NotBlank(message = "El alias no puede estar vacío")
        @Size(min = 4, max = 50, message = "El alias debe tener entre 4 y 50 caracteres")
        @Pattern(regexp = "^[a-zA-Z0-9._-]+$", message = "El alias solo puede contener letras, números, puntos y guiones")
        String alias
) {}