package com.track3.alkywall.repositories;

import com.track3.alkywall.models.Transaction;
import com.track3.alkywall.services.models.TransactionMonthSummary;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    List<Transaction> findAllByAccountIdOrderByCreatedAtDesc(Long accountId);

    List<Transaction> findAllByAccountIdAndTypeOrderByCreatedAtDesc(Long accountId, String type);

    // truncate(local_datetime, month) devuelve la fecha actual pero con el día 1
    @Query("""
    select
        t.type,
        sum(t.amount)
    from Transaction t
    where
        t.createdAt between truncate(local_datetime, month) and local_datetime
        and t.account.id = ?1
    group by t.type
    """)
    List<TransactionMonthSummary> getMonthSummaryByAccountId(Long accountId);
}
