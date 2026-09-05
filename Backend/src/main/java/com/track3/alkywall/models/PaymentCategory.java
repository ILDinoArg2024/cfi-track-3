package com.track3.alkywall.models;

import lombok.Getter;

@Getter
public enum PaymentCategory {
    SERVICIOS("Servicios e Impuestos"),
    COMIDA("Comida y Restaurantes"),
    SUPERMERCADO("Supermercados y Almacén"),
    TRANSPORTE("Transporte y Combustible"),
    ENTRETENIMIENTO("Entretenimiento y Salidas"),
    FARMACIA_SALUD("Farmacia y Salud"),
    INDUMENTARIA("Ropa y Calzado"),
    OTROS("Otros gastos");

    private final String displayName;

    PaymentCategory(String displayName) {
        this.displayName = displayName;
    }
}