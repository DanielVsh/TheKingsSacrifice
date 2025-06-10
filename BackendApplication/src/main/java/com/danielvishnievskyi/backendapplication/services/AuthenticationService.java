package com.danielvishnievskyi.backendapplication.services;

import com.danielvishnievskyi.backendapplication.model.dto.authentication.AuthenticationRequestDTO;
import com.danielvishnievskyi.backendapplication.model.dto.authentication.AuthenticationResponseDTO;
import com.danielvishnievskyi.backendapplication.model.dto.authentication.RegisterRequestDTO;
import io.jsonwebtoken.io.IOException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

public interface AuthenticationService {
  AuthenticationResponseDTO register(RegisterRequestDTO requestDto);

  AuthenticationResponseDTO authenticate(AuthenticationRequestDTO requestDto);

  void refreshToken(HttpServletRequest request, HttpServletResponse response) throws IOException, java.io.IOException;

}