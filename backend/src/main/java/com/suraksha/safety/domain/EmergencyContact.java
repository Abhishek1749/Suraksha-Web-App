package com.suraksha.safety.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;

@Entity
@Table(name = "emergency_contacts")
public class EmergencyContact {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false, length = 120)
  private String name;

  @Column(nullable = false, length = 40)
  private String number;

  /** crimson | emerald | muted — drives the badge colour in the app. */
  @Column(nullable = false, length = 24)
  private String tone = "muted";

  /** helpline | trusted */
  @Column(nullable = false, length = 24)
  private String category = "trusted";

  @Column(nullable = false)
  private int priority = 100;

  @Column(nullable = false)
  private Instant createdAt = Instant.now();

  public Long getId() {
    return id;
  }

  public String getName() {
    return name;
  }

  public void setName(String name) {
    this.name = name;
  }

  public String getNumber() {
    return number;
  }

  public void setNumber(String number) {
    this.number = number;
  }

  public String getTone() {
    return tone;
  }

  public void setTone(String tone) {
    this.tone = tone;
  }

  public String getCategory() {
    return category;
  }

  public void setCategory(String category) {
    this.category = category;
  }

  public int getPriority() {
    return priority;
  }

  public void setPriority(int priority) {
    this.priority = priority;
  }

  public Instant getCreatedAt() {
    return createdAt;
  }
}
