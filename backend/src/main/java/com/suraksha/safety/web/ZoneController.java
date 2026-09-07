package com.suraksha.safety.web;

import com.suraksha.safety.domain.RiskZone;
import com.suraksha.safety.repo.RiskZoneRepository;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/zones")
public class ZoneController {

  private final RiskZoneRepository zones;

  public ZoneController(RiskZoneRepository zones) {
    this.zones = zones;
  }

  public record ZoneView(
      Long id, String name, String level, double latitude, double longitude, int reportCount, String advisory) {}

  @GetMapping
  public List<ZoneView> list() {
    return zones.findAllByOrderByReportCountDesc().stream()
        .map(
            z ->
                new ZoneView(
                    z.getId(),
                    z.getName(),
                    z.getLevel(),
                    z.getLatitude(),
                    z.getLongitude(),
                    z.getReportCount(),
                    z.getAdvisory()))
        .toList();
  }

  @GetMapping("/{id}")
  public ZoneView one(@org.springframework.web.bind.annotation.PathVariable Long id) {
    RiskZone z =
        zones
            .findById(id)
            .orElseThrow(
                () ->
                    new org.springframework.web.server.ResponseStatusException(
                        org.springframework.http.HttpStatus.NOT_FOUND, "Zone not found"));
    return new ZoneView(
        z.getId(), z.getName(), z.getLevel(), z.getLatitude(), z.getLongitude(), z.getReportCount(), z.getAdvisory());
  }
}
