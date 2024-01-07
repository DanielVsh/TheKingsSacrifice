package com.danielvishnievskyi.backendapplication.model.dto.game;

import com.danielvishnievskyi.backendapplication.model.entities.Player;
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
  private Player winner;
  private GameState gameResult;
}
