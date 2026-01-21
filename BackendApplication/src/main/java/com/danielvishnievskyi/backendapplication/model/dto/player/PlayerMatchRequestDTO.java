package com.danielvishnievskyi.backendapplication.model.dto.player;

import com.danielvishnievskyi.backendapplication.model.enums.GameMode;

import java.util.UUID;

public record PlayerMatchRequestDTO(
  UUID playerUUID,
  int rating,
  String timeFormat,
  GameMode gameMode
) {
}
