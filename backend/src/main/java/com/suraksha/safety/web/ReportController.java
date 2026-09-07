package com.suraksha.safety.web;

import com.suraksha.safety.domain.SafetyReport;
import com.suraksha.safety.repo.SafetyReportRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

  private final SafetyReportRepository reports;

  public ReportController(SafetyReportRepository reports) {
    this.reports = reports;
  }

  public record CreateReport(
      @NotBlank @Size(max = 64) String kind,
      @NotBlank @Size(max = 32) String risk,
      @Size(max = 255) String location,
      @Size(max = 5000) String notes,
      List<@Size(max = 200) String> attachments) {}

  public record ReportView(
      Long id, String kind, String risk, String location, String notes, List<String> attachments, Instant createdAt) {}

  @GetMapping
  public List<ReportView> list() {
    return reports.findTop50ByOrderByCreatedAtDesc().stream().map(ReportController::toView).toList();
  }

  @GetMapping("/stats")
  public Map<String, Object> stats() {
    long month = reports.countByCreatedAtAfter(Instant.now().minus(30, ChronoUnit.DAYS));
    return Map.of("reportsThisMonth", month, "total", reports.count());
  }

  @PostMapping
  @ResponseStatus(HttpStatus.CREATED)
  public ReportView create(@Valid @RequestBody CreateReport body) {
    SafetyReport report = new SafetyReport();
    report.setKind(body.kind());
    report.setRisk(body.risk());
    report.setLocation(body.location());
    report.setNotes(body.notes());
    if (body.attachments() != null && !body.attachments().isEmpty()) {
      report.setAttachments(String.join(",", body.attachments()));
    }
    return toView(reports.save(report));
  }

  private static ReportView toView(SafetyReport r) {
    List<String> files =
        r.getAttachments() == null || r.getAttachments().isBlank()
            ? List.of()
            : List.of(r.getAttachments().split(","));
    return new ReportView(
        r.getId(), r.getKind(), r.getRisk(), r.getLocation(), r.getNotes(), files, r.getCreatedAt());
  }
}
