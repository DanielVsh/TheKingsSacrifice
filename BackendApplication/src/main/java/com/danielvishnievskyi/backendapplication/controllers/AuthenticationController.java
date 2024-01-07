package com.danielvishnievskyi.backendapplication.controllers;

import com.danielvishnievskyi.backendapplication.model.dto.authentication.AuthenticationRequestDTO;
import com.danielvishnievskyi.backendapplication.model.dto.authentication.AuthenticationResponseDTO;
import com.danielvishnievskyi.backendapplication.model.dto.authentication.RegisterRequestDTO;
import com.danielvishnievskyi.backendapplication.services.authentication.AuthenticationService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;


@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthenticationController {

  private final AuthenticationService authenticationService;

  @PostMapping("/register")
  public ResponseEntity<AuthenticationResponseDTO> register(
    @RequestBody RegisterRequestDTO requestDto) {
    return ResponseEntity.ok(authenticationService.register(requestDto));
  }

  @PostMapping("/authenticate")
  public ResponseEntity<AuthenticationResponseDTO> authenticate(
    @RequestBody AuthenticationRequestDTO requestDto) {
    return ResponseEntity.ok(authenticationService.authenticate(requestDto));
  }

  @PostMapping("/refresh-token")
  public void refreshToken(
    HttpServletRequest request,
    HttpServletResponse response
  ) throws IOException {
    authenticationService.refreshToken(request, response);
  }
}