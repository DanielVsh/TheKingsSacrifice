package com.danielvishnievskyi.backendapplication.controllers;

import com.danielvishnievskyi.backendapplication.model.dto.player.AnonymousPlayerResponseDTO;
import com.danielvishnievskyi.backendapplication.services.player.PlayerService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.annotation.Secured;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/rest/player")
@RequiredArgsConstructor
public class PlayerController {

  private final PlayerService playerService;

  @PostMapping("/anonymous")
  public ResponseEntity<AnonymousPlayerResponseDTO> createAnonymousPlayer() {
    return ResponseEntity.ok(playerService.createAnonymousPlayer());
  }
}
