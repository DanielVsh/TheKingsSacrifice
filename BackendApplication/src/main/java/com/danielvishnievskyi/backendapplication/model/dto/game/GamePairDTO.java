package com.danielvishnievskyi.backendapplication.model.dto.game;

import com.danielvishnievskyi.backendapplication.model.dto.player.PlayerMatchRequestDTO;

public record GamePairDTO(
  PlayerMatchRequestDTO white,
  PlayerMatchRequestDTO black
) {
}
