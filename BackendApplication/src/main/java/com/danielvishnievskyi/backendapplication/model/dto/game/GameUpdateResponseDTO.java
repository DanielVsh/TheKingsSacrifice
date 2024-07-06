package com.danielvishnievskyi.backendapplication.model.dto.game;

public record GameUpdateResponseDTO(
  String fen,
  GameTimeResponseDTO playersTime
) {

}
