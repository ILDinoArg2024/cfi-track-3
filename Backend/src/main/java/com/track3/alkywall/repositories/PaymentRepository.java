package com.track3.alkywall.repositories;

import com.track3.alkywall.models.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {

    // Busca los pagos del usuario a partir de una fecha
    @Query("SELECT p FROM Payment p WHERE p.transaction.sourceAccount.id = :accountId AND p.transaction.createdAt >= :startDate")
    List<Payment> findByAccountIdAndCreatedAtAfter(@Param("accountId") Long accountId, @Param("startDate") LocalDateTime startDate);
}
