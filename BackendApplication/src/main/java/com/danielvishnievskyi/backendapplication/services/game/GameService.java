package com.danielvishnievskyi.backendapplication.services.game;


import com.danielvishnievskyi.backendapplication.model.dto.game.GameCreateRequestDTO;
import com.danielvishnievskyi.backendapplication.model.dto.game.GameStartRequestDTO;
import com.danielvishnievskyi.backendapplication.model.dto.game.GameResponseDTO;
import com.danielvishnievskyi.backendapplication.model.dto.game.GameSaveRequestDTO;

import java.util.UUID;

public interface GameService {
  GameResponseDTO getGame(UUID uuid);
  GameResponseDTO createGame(GameCreateRequestDTO gameCreateRequestDTO);
  GameResponseDTO startGame(GameStartRequestDTO gameStartRequestDTO);
  GameResponseDTO saveGame(GameSaveRequestDTO gameSaveRequestDTO);
}
