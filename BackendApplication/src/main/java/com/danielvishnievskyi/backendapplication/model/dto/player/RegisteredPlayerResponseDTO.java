package com.danielvishnievskyi.backendapplication.model.dto.player;

import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.util.UUID;

@Data
@ToString
@NoArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class RegisteredPlayerResponseDTO extends PlayerResponseDTO {
  public RegisteredPlayerResponseDTO(UUID uuid, String nickname, String email, int rating) {
    super(uuid);
    this.email = email;
    this.rating = rating;
    this.nickname = nickname;
  }

  private String nickname;
  private String email;
  private int rating;
}
