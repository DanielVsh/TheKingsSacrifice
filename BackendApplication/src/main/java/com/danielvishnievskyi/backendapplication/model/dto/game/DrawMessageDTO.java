package com.danielvishnievskyi.backendapplication.model.dto.game;

import com.danielvishnievskyi.backendapplication.model.dto.player.RegisteredPlayerResponseDTO;

public record DrawMessageDTO(
  RegisteredPlayerResponseDTO fromPlayer,
  RegisteredPlayerResponseDTO toPlayer,
  Status status
) {

  public enum Status {
    REQUESTED, ACCEPTED, REJECTED
  }
}
