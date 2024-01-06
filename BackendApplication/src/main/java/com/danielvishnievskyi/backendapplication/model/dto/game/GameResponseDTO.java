package com.danielvishnievskyi.backendapplication.model.dto.game;

import com.danielvishnievskyi.backendapplication.model.dto.player.PlayerResponseDTO;
import com.danielvishnievskyi.backendapplication.model.entities.Player;
import com.danielvishnievskyi.backendapplication.model.enums.GameState;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.ToString;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@ToString
@AllArgsConstructor
public class GameResponseDTO {
  private UUID uuid;
  private PlayerResponseDTO whitePlayer;
  private PlayerResponseDTO blackPlayer;
  private List<String> history;
  private Player winner;
  private GameState gameResult;
  private LocalDateTime date;
}
