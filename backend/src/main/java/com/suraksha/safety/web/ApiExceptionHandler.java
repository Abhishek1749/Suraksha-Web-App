package com.suraksha.safety.web;

import java.util.HashMap;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;

@RestControllerAdvice
public class ApiExceptionHandler {

  @ExceptionHandler(MethodArgumentNotValidException.class)
  public ResponseEntity<Map<String, Object>> onValidation(MethodArgumentNotValidException ex) {
    Map<String, String> fields = new HashMap<>();
    ex.getBindingResult()
        .getFieldErrors()
        .forEach(e -> fields.put(e.getField(), e.getDefaultMessage()));
    Map<String, Object> body = new HashMap<>();
    body.put("message", "Some details are missing or invalid.");
    body.put("fields", fields);
    return ResponseEntity.badRequest().body(body);
  }

  @ExceptionHandler(ResponseStatusException.class)
  public ResponseEntity<Map<String, Object>> onStatus(ResponseStatusException ex) {
    Map<String, Object> body = new HashMap<>();
    body.put("message", ex.getReason() == null ? "Request failed." : ex.getReason());
    return ResponseEntity.status(ex.getStatusCode()).body(body);
  }

  @ExceptionHandler(Exception.class)
  public ResponseEntity<Map<String, Object>> onOther(Exception ex) {
    Map<String, Object> body = new HashMap<>();
    body.put("message", "Unexpected server error.");
    body.put("detail", ex.getMessage());
    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(body);
  }
}
