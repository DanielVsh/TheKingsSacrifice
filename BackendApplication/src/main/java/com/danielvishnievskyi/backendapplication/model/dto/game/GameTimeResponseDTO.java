package com.danielvishnievskyi.backendapplication.model.dto.game;

public record GameTimeResponseDTO (
  long whitePlayerTime,
  long blackPlayerTime
) {
}
