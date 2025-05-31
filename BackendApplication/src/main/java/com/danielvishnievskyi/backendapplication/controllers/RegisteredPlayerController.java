package com.danielvishnievskyi.backendapplication.controllers;

import com.danielvishnievskyi.backendapplication.model.dto.player.RegisteredPlayerRequestDTO;
import com.danielvishnievskyi.backendapplication.model.dto.player.RegisteredPlayerResponseDTO;
import com.danielvishnievskyi.backendapplication.model.entities.RegisteredPlayerEntity;
import com.danielvishnievskyi.backendapplication.model.mappers.PlayerMapper;
import com.danielvishnievskyi.backendapplication.services.player.PlayerService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/rest/player")
@RequiredArgsConstructor
public class RegisteredPlayerController {
  private final PlayerService playerService;
  private final PlayerMapper playerMapper;

  @GetMapping("/me")
  public ResponseEntity<RegisteredPlayerResponseDTO> getRegisteredPlayer(
    @AuthenticationPrincipal RegisteredPlayerEntity registeredPlayerEntity
  ) {
    return ResponseEntity.ok(playerMapper.playerToResponseDTO(registeredPlayerEntity));
  }

  @PatchMapping("/{uuid}/update")
  public ResponseEntity<RegisteredPlayerResponseDTO> update(
    @PathVariable UUID uuid,
    @RequestBody RegisteredPlayerRequestDTO requestDTO
  ) {
    RegisteredPlayerResponseDTO registeredPlayerResponseDTO =
      playerService.updatePlayer(uuid, requestDTO);
    return ResponseEntity.ok(registeredPlayerResponseDTO);
  }
}
