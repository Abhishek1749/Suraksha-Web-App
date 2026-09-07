package com.suraksha.safety.service;

import com.suraksha.safety.domain.EmergencyContact;
import com.suraksha.safety.domain.RiskZone;
import com.suraksha.safety.repo.EmergencyContactRepository;
import com.suraksha.safety.repo.RiskZoneRepository;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/** Seeds the helplines, trusted contacts and risk zones the app expects on first run. */
@Configuration
public class SeedData {

  @Bean
  ApplicationRunner seed(EmergencyContactRepository contacts, RiskZoneRepository zones) {
    return args -> {
      if (contacts.count() == 0) {
        contacts.save(contact("Police", "100", "crimson", "helpline", 10));
        contacts.save(contact("Emergency", "112", "crimson", "helpline", 20));
        contacts.save(contact("Women helpline", "1091", "emerald", "helpline", 30));
        contacts.save(contact("Ambulance", "108", "emerald", "helpline", 40));
        contacts.save(contact("Trusted: Amma", "+91 98490 00000", "muted", "trusted", 50));
        contacts.save(contact("Trusted: Priya", "+91 98660 11111", "muted", "trusted", 60));
      }

      if (zones.count() == 0) {
        zones.save(zone("Sector 22 Safe Zone", "safe", 17.4421, 78.3915, 3, "Well-lit, 24x7 patrol, 41 CCTV nodes"));
        zones.save(zone("Civic Plaza", "safe", 17.4380, 78.4010, 5, "Crowded till 23:00, help desk on site"));
        zones.save(zone("Transit Corridor", "moderate", 17.4455, 78.3960, 18, "Moderate footfall after 21:00"));
        zones.save(zone("Riverside Lane", "moderate", 17.4340, 78.3880, 22, "Patchy lighting near underpass"));
        zones.save(zone("Old Market Backlane", "high", 17.4290, 78.3835, 46, "Repeated harassment reports after 22:00"));
      }
    };
  }

  private static EmergencyContact contact(
      String name, String number, String tone, String category, int priority) {
    EmergencyContact c = new EmergencyContact();
    c.setName(name);
    c.setNumber(number);
    c.setTone(tone);
    c.setCategory(category);
    c.setPriority(priority);
    return c;
  }

  private static RiskZone zone(
      String name, String level, double lat, double lng, int reports, String advisory) {
    RiskZone z = new RiskZone();
    z.setName(name);
    z.setLevel(level);
    z.setLatitude(lat);
    z.setLongitude(lng);
    z.setReportCount(reports);
    z.setAdvisory(advisory);
    return z;
  }
}
