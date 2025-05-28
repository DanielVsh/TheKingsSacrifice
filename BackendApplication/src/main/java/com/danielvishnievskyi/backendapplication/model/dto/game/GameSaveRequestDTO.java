package com.danielvishnievskyi.backendapplication.model.dto.game;

import com.danielvishnievskyi.backendapplication.model.entities.PlayerEntity;
import com.danielvishnievskyi.backendapplication.model.entities.RegisteredPlayerEntity;
import com.danielvishnievskyi.backendapplication.model.enums.GameState;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.ToString;

import java.util.UUID;

@Data
@ToString
@AllArgsConstructor
public class GameSaveRequestDTO {
  private UUID uuid;
  private RegisteredPlayerEntity winner;
  private GameState gameResult;
  private String pgn;
}
