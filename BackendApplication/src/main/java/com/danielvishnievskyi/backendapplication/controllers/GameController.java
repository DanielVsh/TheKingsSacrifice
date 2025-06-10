package com.danielvishnievskyi.backendapplication.controllers;

import com.danielvishnievskyi.backendapplication.model.dto.game.GameCreateRequestDTO;
import com.danielvishnievskyi.backendapplication.model.dto.game.GameResponseDTO;
import com.danielvishnievskyi.backendapplication.model.dto.game.GameSaveRequestDTO;
import com.danielvishnievskyi.backendapplication.model.dto.game.GameStartRequestDTO;
import com.danielvishnievskyi.backendapplication.services.GameService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/rest/game")
@RequiredArgsConstructor
public class GameController {
  private final GameService gameService;

  @GetMapping("/{uuid}")
  public ResponseEntity<GameResponseDTO> get(@PathVariable UUID uuid) {
    return ResponseEntity.ok(gameService.getGame(uuid));
  }

  @PatchMapping("/create")
  public ResponseEntity<GameResponseDTO> create(@RequestBody GameCreateRequestDTO gameCreateRequestDTO) {
    return ResponseEntity.ok(gameService.createGame(gameCreateRequestDTO));
  }

  @PostMapping("/{uuid}/start")
  public ResponseEntity<GameResponseDTO> start(
    @PathVariable UUID uuid,
    @RequestBody GameStartRequestDTO gameStartRequestDTO
  ) {
    return ResponseEntity.ok(gameService.startGame(uuid, gameStartRequestDTO));
  }

  @PostMapping("/{uuid}/save")
  public ResponseEntity<GameResponseDTO> save(
    @PathVariable UUID uuid,
    @RequestBody GameSaveRequestDTO gameCreateRequestDTO
  ) {
    return ResponseEntity.ok(gameService.saveGame(uuid, gameCreateRequestDTO));
  }
}
