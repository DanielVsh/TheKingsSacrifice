package com.danielvishnievskyi.backendapplication.model.dto.player;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@AllArgsConstructor
public class RegisterPlayerRequestDTO {
  private String email;
  private String password;
  private String nickname;
}
