package com.danielvishnievskyi.backendapplication.model.dto.authentication;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;
import lombok.ToString;

@Data
@Getter
@ToString
@AllArgsConstructor
public class RegisterRequestDTO {
  private String email;
  private String password;
  private String nickname;
  private int rating;
}
