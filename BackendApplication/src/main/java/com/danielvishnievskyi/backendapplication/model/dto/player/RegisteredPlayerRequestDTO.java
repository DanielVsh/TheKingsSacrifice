package com.danielvishnievskyi.backendapplication.model.dto.player;

public record RegisteredPlayerRequestDTO(
  String nickname,
  String email,
  String rating,
  String password
) {
}
