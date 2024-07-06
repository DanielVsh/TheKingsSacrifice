package com.danielvishnievskyi.backendapplication.model.dto.game;

public record GameTimeResponseDTO (
  int whitePlayerTime,
  int blackPlayerTime
) {
}
