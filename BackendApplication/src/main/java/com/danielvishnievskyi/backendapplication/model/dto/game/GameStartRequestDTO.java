package com.danielvishnievskyi.backendapplication.model.dto.game;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.ToString;

import java.util.UUID;

@Data
@ToString
@AllArgsConstructor
public class GameStartRequestDTO {
  private UUID uuid;
  private UUID whitePlayer;
  private UUID blackPlayer;
}
