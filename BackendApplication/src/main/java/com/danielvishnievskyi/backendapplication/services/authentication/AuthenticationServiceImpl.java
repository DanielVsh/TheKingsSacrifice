package com.danielvishnievskyi.backendapplication.services.authentication;

import com.danielvishnievskyi.backendapplication.model.dto.authentication.AuthenticationRequestDTO;
import com.danielvishnievskyi.backendapplication.model.dto.authentication.AuthenticationResponseDTO;
import com.danielvishnievskyi.backendapplication.model.dto.authentication.RegisterRequestDTO;
import com.danielvishnievskyi.backendapplication.model.entities.RegisteredPlayerEntity;
import com.danielvishnievskyi.backendapplication.repositories.RegisteredPlayerRepository;
import com.danielvishnievskyi.backendapplication.utils.JwtUtils;
import com.danielvishnievskyi.backendapplication.utils.authentication.AuthenticationUtils;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

import static com.danielvishnievskyi.backendapplication.model.enums.Role.PLAYER;
import static org.springframework.http.HttpHeaders.AUTHORIZATION;

@Service
@RequiredArgsConstructor
public class AuthenticationServiceImpl implements AuthenticationService {

  private final RegisteredPlayerRepository registeredPlayerRepository;
  private final JwtUtils jwtUtils;
  private final AuthenticationManager authenticationManager;
  private final AuthenticationUtils authenticationUtils;
  private final PasswordEncoder passwordEncoder;

  @Override
  @Transactional
  public AuthenticationResponseDTO register(RegisterRequestDTO requestDto) {
    registeredPlayerRepository.findByEmail(requestDto.getEmail())
      .ifPresent(registeredPlayer -> {
        throw new RuntimeException("User with provided username already exists: %s"
          .formatted(requestDto.getEmail()));
      });

    RegisteredPlayerEntity registeredPlayer = new RegisteredPlayerEntity(
      requestDto.getNickname(),
      requestDto.getEmail(),
      passwordEncoder.encode(requestDto.getPassword()),
      requestDto.getRating(),
      List.of(PLAYER)
    );
    RegisteredPlayerEntity saved = registeredPlayerRepository.save(registeredPlayer);
    String jwtToken = jwtUtils.generateToken(saved);
    String refreshToken = jwtUtils.generateRefreshToken(saved);
    authenticationUtils.saveToken(saved, jwtToken);
    return new AuthenticationResponseDTO(jwtToken, refreshToken);
  }

  @Override
  @Transactional
  public AuthenticationResponseDTO authenticate(AuthenticationRequestDTO requestDto) {
    authenticationManager.authenticate(
      new UsernamePasswordAuthenticationToken(requestDto.getEmail(), requestDto.getPassword())
    );
    RegisteredPlayerEntity registeredPlayer = registeredPlayerRepository.findByEmail(requestDto.getEmail()).orElseThrow();//TODO: custom exception
    String jwtToken = jwtUtils.generateToken(registeredPlayer);
    String refreshToken = jwtUtils.generateRefreshToken(registeredPlayer);
    authenticationUtils.deleteAllTokens(registeredPlayer);
    authenticationUtils.saveToken(registeredPlayer, jwtToken);
    return new AuthenticationResponseDTO(jwtToken, refreshToken);
  }

  @Override
  @Transactional
  public void refreshToken(HttpServletRequest request, HttpServletResponse response) throws IOException {
    final String authHeader = request.getHeader(AUTHORIZATION);
    final String refreshToken;
    final String username;
    if (authHeader == null || !authHeader.startsWith("Bearer ")) {
      return;
    }
    refreshToken = authHeader.substring(7);
    username = jwtUtils.extractUsername(refreshToken);
    if (username != null) {
      RegisteredPlayerEntity registeredPlayer = registeredPlayerRepository.findByEmail(username).orElseThrow(); //TODO: custom exception
      if (jwtUtils.isTokenValid(refreshToken, registeredPlayer)) {
        String accessToken = jwtUtils.generateToken(registeredPlayer);
        authenticationUtils.deleteAllTokens(registeredPlayer);
        authenticationUtils.saveToken(registeredPlayer, accessToken);
        var authResponse = new AuthenticationResponseDTO(accessToken, refreshToken);
        new ObjectMapper().writeValue(response.getOutputStream(), authResponse);
      }
    }
  }
}
