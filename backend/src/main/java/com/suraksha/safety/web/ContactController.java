package com.suraksha.safety.web;

import com.suraksha.safety.domain.EmergencyContact;
import com.suraksha.safety.repo.EmergencyContactRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/contacts")
public class ContactController {

  private final EmergencyContactRepository contacts;

  public ContactController(EmergencyContactRepository contacts) {
    this.contacts = contacts;
  }

  public record ContactView(
      Long id, String name, String number, String tone, String category, int priority) {}

  public record CreateContact(
      @NotBlank @Size(max = 120) String name,
      @NotBlank @Size(max = 40) String number,
      @Size(max = 24) String tone,
      @Size(max = 24) String category,
      Integer priority) {}

  @GetMapping
  public List<ContactView> list() {
    return contacts.findAllByOrderByPriorityAscIdAsc().stream()
        .map(c -> new ContactView(c.getId(), c.getName(), c.getNumber(), c.getTone(), c.getCategory(), c.getPriority()))
        .toList();
  }

  @PostMapping
  @ResponseStatus(HttpStatus.CREATED)
  public ContactView create(@Valid @RequestBody CreateContact body) {
    EmergencyContact contact = contacts.findByNumber(body.number()).orElseGet(EmergencyContact::new);
    contact.setName(body.name());
    contact.setNumber(body.number());
    contact.setTone(body.tone() == null ? "muted" : body.tone());
    contact.setCategory(body.category() == null ? "trusted" : body.category());
    contact.setPriority(body.priority() == null ? 100 : body.priority());
    EmergencyContact saved = contacts.save(contact);
    return new ContactView(
        saved.getId(), saved.getName(), saved.getNumber(), saved.getTone(), saved.getCategory(), saved.getPriority());
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<Void> delete(@PathVariable Long id) {
    if (!contacts.existsById(id)) return ResponseEntity.notFound().build();
    contacts.deleteById(id);
    return ResponseEntity.noContent().build();
  }
}
