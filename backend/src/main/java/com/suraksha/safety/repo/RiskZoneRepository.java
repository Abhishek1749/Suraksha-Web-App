package com.suraksha.safety.repo;

import com.suraksha.safety.domain.RiskZone;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RiskZoneRepository extends JpaRepository<RiskZone, Long> {
  List<RiskZone> findAllByOrderByReportCountDesc();
}
