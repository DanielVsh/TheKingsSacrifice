package com.danielvishnievskyi.backendapplication.model.dto.player;

import java.util.UUID;

public record PlayerMatchRequestDTO(
  UUID playerUUID,
  int rating,
  String timeFormat
) {
}
