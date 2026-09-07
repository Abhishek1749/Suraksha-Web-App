package com.suraksha.safety.service;

import com.suraksha.safety.config.AiProperties;
import com.suraksha.safety.web.AssistantController.ChatMessage;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AssistantService {

  private static final String SYSTEM =
      """
      You are SURAKSHA Assist, a calm, practical women-safety assistant for users in India.
      Scope: personal safety guidance, Indian legal rights (IPC/BNS basics, Zero-FIR, POSH Act, section 498A, cyber-crime reporting), emergency helplines (112, 100, 1091, 181, 108, 1930), first-aid steps, and risk assessment of a described situation.
      Rules:
      - If the user seems in immediate danger, start with a one-line urgent action and the right helpline number.
      - Answer in short markdown: max 6 bullet points or numbered steps, bold the key action.
      - Be specific and factual. Say clearly when something needs a lawyer, doctor or police officer.
      - Never claim to have dispatched help; the app's SOS button does that.
      """;

  private final AiProperties props;
  private final RestClient client;

  public AssistantService(AiProperties props) {
    this.props = props;
    this.client = RestClient.builder().baseUrl(props.getBaseUrl()).build();
  }

  @SuppressWarnings("unchecked")
  public String ask(List<ChatMessage> history) {
    if (props.getApiKey() == null || props.getApiKey().isBlank()) {
      throw new ResponseStatusException(
          HttpStatus.SERVICE_UNAVAILABLE, "AI is not configured on the server (set LOVABLE_API_KEY).");
    }

    List<Map<String, String>> messages = new ArrayList<>();
    messages.add(Map.of("role", "system", "content", SYSTEM));
    for (ChatMessage m : history) {
      String role = "assistant".equalsIgnoreCase(m.role()) ? "assistant" : "user";
      messages.add(Map.of("role", role, "content", m.content()));
    }

    Map<String, Object> response;
    try {
      response =
          client
              .post()
              .uri("/chat/completions")
              .header("Authorization", "Bearer " + props.getApiKey())
              .contentType(MediaType.APPLICATION_JSON)
              .body(Map.of("model", props.getModel(), "messages", messages))
              .retrieve()
              .onStatus(
                  status -> status.value() == 429,
                  (req, res) -> {
                    throw new ResponseStatusException(
                        HttpStatus.TOO_MANY_REQUESTS, "Too many requests right now — try again in a moment.");
                  })
              .onStatus(
                  status -> status.value() == 402,
                  (req, res) -> {
                    throw new ResponseStatusException(
                        HttpStatus.PAYMENT_REQUIRED, "AI credits are exhausted. Add credits to continue.");
                  })
              .onStatus(
                  status -> status.value() == 401 || status.value() == 403,
                  (req, res) -> {
                    throw new ResponseStatusException(
                        HttpStatus.SERVICE_UNAVAILABLE, "The AI key is invalid or blocked for this workspace.");
                  })
              .onStatus(
                  org.springframework.http.HttpStatusCode::isError,
                  (req, res) -> {
                    throw new ResponseStatusException(
                        HttpStatus.BAD_GATEWAY, "Assistant unavailable (" + res.getStatusCode().value() + ").");
                  })
              .body(Map.class);
    } catch (ResponseStatusException e) {
      throw e;
    } catch (Exception e) {
      throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Assistant unreachable: " + e.getMessage());
    }

    Object choices = response == null ? null : response.get("choices");
    if (choices instanceof List<?> list && !list.isEmpty() && list.get(0) instanceof Map<?, ?> first) {
      Object message = first.get("message");
      if (message instanceof Map<?, ?> msg && msg.get("content") instanceof String content && !content.isBlank()) {
        return content.trim();
      }
    }
    throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "The assistant returned an empty reply.");
  }
}
