package com.suraksha.safety.web;

import com.suraksha.safety.domain.IncidentEvent;
import com.suraksha.safety.domain.SosAlert;
import com.suraksha.safety.repo.EmergencyContactRepository;
import com.suraksha.safety.repo.IncidentEventRepository;
import com.suraksha.safety.repo.SosAlertRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Size;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api")
public class SosController {

  private final SosAlertRepository alerts;
  private final IncidentEventRepository events;
  private final EmergencyContactRepository contacts;

  public SosController(
      SosAlertRepository alerts, IncidentEventRepository events, EmergencyContactRepository contacts) {
    this.alerts = alerts;
    this.events = events;
    this.contacts = contacts;
  }

  public record TriggerSos(
      @Size(max = 64) String deviceId,
      @Size(max = 255) String location,
      Double latitude,
      Double longitude,
      Double accuracyMeters) {}

  public record EventView(Long id, String icon, String title, String detail, String tone, Instant occurredAt) {}

  public record IncidentView(String reference, String status, String location, Instant createdAt, List<EventView> events) {}

  @PostMapping("/sos")
  @ResponseStatus(HttpStatus.CREATED)
  public IncidentView trigger(@Valid @RequestBody TriggerSos body) {
    SosAlert alert = new SosAlert();
    alert.setReference(nextReference());
    alert.setDeviceId(body.deviceId() == null ? "SRK-2210" : body.deviceId());
    alert.setLocation(body.location());
    alert.setLatitude(body.latitude());
    alert.setLongitude(body.longitude());
    alert.setAccuracyMeters(body.accuracyMeters());
    SosAlert saved = alerts.save(alert);

    log(saved, "siren", "SOS trigger dispatched", "Hold-to-send · device " + saved.getDeviceId(), "crimson");
    if (body.latitude() != null && body.longitude() != null) {
      log(
          saved,
          "pin",
          "GPS snapshot captured",
          String.format(
              "%.4f, %.4f%s",
              body.latitude(),
              body.longitude(),
              body.accuracyMeters() == null ? "" : " · accuracy " + body.accuracyMeters() + " m"),
          "emerald");
    } else if (body.location() != null && !body.location().isBlank()) {
      log(saved, "pin", "Location tagged", body.location(), "emerald");
    }

    String names =
        contacts.findAllByOrderByPriorityAscIdAsc().stream()
            .filter(c -> "trusted".equalsIgnoreCase(c.getCategory()))
            .map(c -> c.getName())
            .collect(Collectors.joining(" ✓ · "));
    if (!names.isBlank()) {
      log(saved, "message", "Contact SMS delivered", names + " ✓", "emerald");
    }

    return view(saved);
  }

  @GetMapping("/incidents/latest")
  public IncidentView latest() {
    return alerts
        .findFirstByOrderByCreatedAtDesc()
        .map(this::view)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "No incident yet"));
  }

  @GetMapping("/incidents/{reference}")
  public IncidentView byReference(@PathVariable String reference) {
    return alerts
        .findByReference(reference)
        .map(this::view)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Incident not found"));
  }

  private IncidentView view(SosAlert alert) {
    List<EventView> timeline =
        events.findByIncidentReferenceOrderByOccurredAtAsc(alert.getReference()).stream()
            .map(e -> new EventView(e.getId(), e.getIcon(), e.getTitle(), e.getDetail(), e.getTone(), e.getOccurredAt()))
            .toList();
    return new IncidentView(alert.getReference(), alert.getStatus(), alert.getLocation(), alert.getCreatedAt(), timeline);
  }

  private void log(SosAlert alert, String icon, String title, String detail, String tone) {
    IncidentEvent event = new IncidentEvent();
    event.setIncidentReference(alert.getReference());
    event.setIcon(icon);
    event.setTitle(title);
    event.setDetail(detail);
    event.setTone(tone);
    events.save(event);
  }

  private String nextReference() {
    LocalDate today = LocalDate.now();
    long count = alerts.count() + 1;
    return String.format("SRK-%d-%04d", today.getYear(), count);
  }
}
