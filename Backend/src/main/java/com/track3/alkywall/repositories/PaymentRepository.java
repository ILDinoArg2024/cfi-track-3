package com.track3.alkywall.repositories;

import com.track3.alkywall.models.Payment;
import com.track3.alkywall.services.models.PaymentCategoryExpenses;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {

    // Busca los pagos del usuario a partir de una fecha
    @Query("SELECT p FROM Payment p WHERE p.account.id = :accountId AND p.createdAt >= :startDate")
    List<Payment> findByAccountIdAndCreatedAtAfter(@Param("accountId") Long accountId, @Param("startDate") LocalDateTime startDate);

    @Query("""
    select
        p.paymentCategory as category,
        sum(p.amount) as totalAmount
    from Payment p
    where
        p.createdAt between truncate(local_datetime, month) and local_datetime
        and p.account.id = ?1
    group by p.paymentCategory
    order by totalAmount DESC
    """)
    List<PaymentCategoryExpenses> getMonthlyPaymentExpensesSummary(Long accountId);
}
