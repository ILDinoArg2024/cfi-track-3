package com.track3.alkywall.services;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Service
public class JwtService {
    private final long jwtExpiration;
    private final SecretKey key;

    public JwtService(){
        // Clave de firma fija para mantener sesiones válidas
        String secret = "AlkyWallSecretKey2026SecureJwtAuthenticationKeyForTesting!";
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.jwtExpiration = 24 * 60 * 60 * 1000; // 24 horas
    }

    public String createToken(String email){
        return Jwts.builder()
                .subject(email)
                .issuedAt(new Date())
                .expiration(new Date((new Date()).getTime() + jwtExpiration))
                .signWith(key)
                .compact();
    }

    public String getEmailFromToken(String token){
        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload()
                .getSubject();
    }
}
