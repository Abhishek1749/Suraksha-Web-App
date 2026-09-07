package com.suraksha.safety.repo;

import com.suraksha.safety.domain.SafetyReport;
import java.time.Instant;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SafetyReportRepository extends JpaRepository<SafetyReport, Long> {
  List<SafetyReport> findTop50ByOrderByCreatedAtDesc();

  long countByCreatedAtAfter(Instant since);
}
