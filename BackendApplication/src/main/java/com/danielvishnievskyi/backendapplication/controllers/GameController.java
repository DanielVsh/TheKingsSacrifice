package com.danielvishnievskyi.backendapplication.controllers;

import com.danielvishnievskyi.backendapplication.model.dto.game.GameCreateRequestDTO;
import com.danielvishnievskyi.backendapplication.model.dto.game.GameStartRequestDTO;
import com.danielvishnievskyi.backendapplication.model.dto.game.GameResponseDTO;
import com.danielvishnievskyi.backendapplication.model.dto.game.GameSaveRequestDTO;
import com.danielvishnievskyi.backendapplication.services.game.GameService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/rest/game")
@RequiredArgsConstructor
public class GameController {
  private final GameService gameService;

  @PreAuthorize("isAnonymous()")
  @GetMapping("/{uuid}")
  public ResponseEntity<GameResponseDTO> get(@PathVariable UUID uuid) {
    return ResponseEntity.ok(gameService.getGame(uuid));
  }

  @PatchMapping("/create")
  public ResponseEntity<GameResponseDTO> create(@RequestBody GameCreateRequestDTO gameCreateRequestDTO) {
    return ResponseEntity.ok(gameService.createGame(gameCreateRequestDTO));
  }

  @PostMapping("/start")
  public ResponseEntity<GameResponseDTO> start(@RequestBody GameStartRequestDTO gameStartRequestDTO) {
    return ResponseEntity.ok(gameService.startGame(gameStartRequestDTO));
  }

  @PostMapping("/save")
  public ResponseEntity<GameResponseDTO> save(@RequestBody GameSaveRequestDTO gameCreateRequestDTO) {
    return ResponseEntity.ok(gameService.saveGame(gameCreateRequestDTO));
  }
}
