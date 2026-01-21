package com.danielvishnievskyi.backendapplication.model.dto.player;

import lombok.*;

import java.util.UUID;

@Data
@ToString
@AllArgsConstructor
@NoArgsConstructor
public class RegisteredPlayerResponseDTO {
  private UUID uuid;
  private String nickname;
  private String email;
  private int bulletRating;
  private int blitzRating;
  private int rapidRating;
  private int classicalRating;
}
