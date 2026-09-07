package com.suraksha.safety.repo;

import com.suraksha.safety.domain.SosAlert;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SosAlertRepository extends JpaRepository<SosAlert, Long> {
  Optional<SosAlert> findFirstByOrderByCreatedAtDesc();

  Optional<SosAlert> findByReference(String reference);
}
