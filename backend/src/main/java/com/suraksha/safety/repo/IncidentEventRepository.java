package com.suraksha.safety.repo;

import com.suraksha.safety.domain.IncidentEvent;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface IncidentEventRepository extends JpaRepository<IncidentEvent, Long> {
  List<IncidentEvent> findByIncidentReferenceOrderByOccurredAtAsc(String incidentReference);
}
