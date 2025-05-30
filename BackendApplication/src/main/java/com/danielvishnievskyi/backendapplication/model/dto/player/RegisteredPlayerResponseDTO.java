package com.danielvishnievskyi.backendapplication.model.dto.player;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.util.UUID;

@Data
@ToString
@AllArgsConstructor
@NoArgsConstructor
public class RegisteredPlayerResponseDTO {
  private UUID uuid;
  private String nickname;
  private String email;
  private int rating;
}
