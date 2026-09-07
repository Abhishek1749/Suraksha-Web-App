package com.suraksha.safety.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;

@Entity
@Table(name = "incident_events")
public class IncidentEvent {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  /** Reference of the SOS alert / incident this entry belongs to. */
  @Column(nullable = false, length = 40)
  private String incidentReference;

  /** siren | pin | upload | message | check — chooses the icon in the app. */
  @Column(nullable = false, length = 24)
  private String icon = "check";

  @Column(nullable = false, length = 160)
  private String title;

  @Column(length = 500)
  private String detail;

  /** crimson | emerald | amber */
  @Column(nullable = false, length = 24)
  private String tone = "emerald";

  @Column(nullable = false)
  private Instant occurredAt = Instant.now();

  public Long getId() {
    return id;
  }

  public String getIncidentReference() {
    return incidentReference;
  }

  public void setIncidentReference(String incidentReference) {
    this.incidentReference = incidentReference;
  }

  public String getIcon() {
    return icon;
  }

  public void setIcon(String icon) {
    this.icon = icon;
  }

  public String getTitle() {
    return title;
  }

  public void setTitle(String title) {
    this.title = title;
  }

  public String getDetail() {
    return detail;
  }

  public void setDetail(String detail) {
    this.detail = detail;
  }

  public String getTone() {
    return tone;
  }

  public void setTone(String tone) {
    this.tone = tone;
  }

  public Instant getOccurredAt() {
    return occurredAt;
  }

  public void setOccurredAt(Instant occurredAt) {
    this.occurredAt = occurredAt;
  }
}
