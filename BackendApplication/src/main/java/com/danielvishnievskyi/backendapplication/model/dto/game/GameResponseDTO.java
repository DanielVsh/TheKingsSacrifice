package com.danielvishnievskyi.backendapplication.model.dto.game;

import com.danielvishnievskyi.backendapplication.model.TimeFormat;
import com.danielvishnievskyi.backendapplication.model.dto.player.RegisteredPlayerResponseDTO;
import com.danielvishnievskyi.backendapplication.model.entities.RegisteredPlayerEntity;
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
  private RegisteredPlayerResponseDTO whitePlayer;
  private RegisteredPlayerEntity blackPlayer;
  private List<String> history;
  private RegisteredPlayerResponseDTO winner;
  private GameState gameResult;
  private LocalDateTime createdAt;
  private LocalDateTime finishedAt;
  private TimeFormat timeFormat;
  private GameTimeResponseDTO playersTime;
}
