package com.suraksha.safety.web;

import com.suraksha.safety.service.AssistantService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import java.util.List;
import java.util.Map;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/assistant")
public class AssistantController {

  private final AssistantService assistant;

  public AssistantController(AssistantService assistant) {
    this.assistant = assistant;
  }

  public record ChatMessage(@NotBlank String role, @NotBlank @Size(max = 4000) String content) {}

  public record ChatRequest(@NotEmpty @Size(max = 30) List<@Valid ChatMessage> messages) {}

  @PostMapping("/chat")
  public Map<String, String> chat(@Valid @RequestBody ChatRequest body) {
    return Map.of("reply", assistant.ask(body.messages()));
  }
}
