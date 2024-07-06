package com.danielvishnievskyi.backendapplication.services.game;


import com.danielvishnievskyi.backendapplication.model.dto.game.*;

import java.util.UUID;

public interface GameService {
  GameResponseDTO getGame(UUID uuid);
  GameResponseDTO createGame(GameCreateRequestDTO gameCreateRequestDTO);
  GameResponseDTO startGame(GameStartRequestDTO gameStartRequestDTO);
  GameResponseDTO saveGame(GameSaveRequestDTO gameSaveRequestDTO);
  GameResponseDTO updateGameMove(String gameId, String fen);
}
