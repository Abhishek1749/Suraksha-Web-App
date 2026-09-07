package com.suraksha.safety.repo;

import com.suraksha.safety.domain.EmergencyContact;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EmergencyContactRepository extends JpaRepository<EmergencyContact, Long> {
  List<EmergencyContact> findAllByOrderByPriorityAscIdAsc();

  Optional<EmergencyContact> findByNumber(String number);
}
