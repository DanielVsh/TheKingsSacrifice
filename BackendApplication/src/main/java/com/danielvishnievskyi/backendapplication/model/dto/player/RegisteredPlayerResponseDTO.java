package com.danielvishnievskyi.backendapplication.model.dto.player;

import lombok.*;

import java.util.UUID;

@Data
@ToString
@AllArgsConstructor
@NoArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class RegisteredPlayerResponseDTO extends PlayerResponseDTO {
  private String nickname;
  private String email;
  private int rating;
}
