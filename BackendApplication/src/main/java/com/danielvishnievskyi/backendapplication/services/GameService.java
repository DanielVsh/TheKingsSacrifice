package com.danielvishnievskyi.backendapplication.services;


import com.danielvishnievskyi.backendapplication.model.dto.game.GameCreateRequestDTO;
import com.danielvishnievskyi.backendapplication.model.dto.game.GameResponseDTO;
import com.danielvishnievskyi.backendapplication.model.dto.game.GameSaveRequestDTO;
import com.danielvishnievskyi.backendapplication.model.dto.game.GameStartRequestDTO;
import com.danielvishnievskyi.backendapplication.model.entities.RegisteredPlayerEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface GameService {
  Page<GameResponseDTO> getGames(RegisteredPlayerEntity player, Pageable pageable);
  GameResponseDTO getGame(UUID uuid);
  GameResponseDTO createGame(GameCreateRequestDTO gameCreateRequestDTO);
  GameResponseDTO startGame(UUID uuid, GameStartRequestDTO gameStartRequestDTO);
  GameResponseDTO saveGame(UUID uuid, GameSaveRequestDTO gameSaveRequestDTO);
  GameResponseDTO updateGameMove(String gameId, String fen);
}
