package com.danielvishnievskyi.backendapplication.controllers;

import com.danielvishnievskyi.backendapplication.model.dto.player.RegisteredPlayerResponseDTO;
import com.danielvishnievskyi.backendapplication.model.entities.RegisteredPlayerEntity;
import com.danielvishnievskyi.backendapplication.model.mappers.PlayerMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/rest/player")
@RequiredArgsConstructor
public class RegisteredPlayerController {

  private final PlayerMapper playerMapper;

  @GetMapping("/me")
  public ResponseEntity<RegisteredPlayerResponseDTO> getRegisteredPlayer(
    @AuthenticationPrincipal RegisteredPlayerEntity registeredPlayerEntity
  ) {
    return ResponseEntity.ok(playerMapper.playerToResponseDTO(registeredPlayerEntity));
  }
}
