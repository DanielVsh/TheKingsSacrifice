package com.danielvishnievskyi.backendapplication.services.game;


import com.danielvishnievskyi.backendapplication.model.dto.game.GameCreateRequestDTO;
import com.danielvishnievskyi.backendapplication.model.dto.game.GameResponseDTO;
import com.danielvishnievskyi.backendapplication.model.dto.game.GameSaveRequestDTO;
import com.danielvishnievskyi.backendapplication.model.dto.game.GameStartRequestDTO;

import java.util.UUID;

public interface GameService {
  GameResponseDTO getGame(UUID uuid);
  GameResponseDTO createGame(GameCreateRequestDTO gameCreateRequestDTO);
  GameResponseDTO startGame(UUID uuid, GameStartRequestDTO gameStartRequestDTO);
  GameResponseDTO saveGame(UUID uuid, GameSaveRequestDTO gameSaveRequestDTO);
  GameResponseDTO updateGameMove(String gameId, String fen);
}
