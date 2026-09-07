package com.suraksha.safety.repo;

import com.suraksha.safety.domain.EmergencyContact;
import com.suraksha.safety.domain.IncidentEvent;
import com.suraksha.safety.domain.RiskZone;
import com.suraksha.safety.domain.SafetyReport;
import com.suraksha.safety.domain.SosAlert;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public final class Repositories {
  private Repositories() {}

  public interface SafetyReportRepository extends JpaRepository<SafetyReport, Long> {
    List<SafetyReport> findTop50ByOrderByCreatedAtDesc();

    long countByCreatedAtAfter(Instant since);
  }

  public interface EmergencyContactRepository extends JpaRepository<EmergencyContact, Long> {
    List<EmergencyContact> findAllByOrderByPriorityAscIdAsc();

    Optional<EmergencyContact> findByNumber(String number);
  }

  public interface SosAlertRepository extends JpaRepository<SosAlert, Long> {
    Optional<SosAlert> findFirstByOrderByCreatedAtDesc();

    Optional<SosAlert> findByReference(String reference);
  }

  public interface IncidentEventRepository extends JpaRepository<IncidentEvent, Long> {
    List<IncidentEvent> findByIncidentReferenceOrderByOccurredAtAsc(String incidentReference);
  }

  public interface RiskZoneRepository extends JpaRepository<RiskZone, Long> {
    List<RiskZone> findAllByOrderByReportCountDesc();
  }
}
