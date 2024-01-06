package com.danielvishnievskyi.backendapplication.model.dto.authentication;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.ToString;

@Data
@ToString
@AllArgsConstructor
public class AuthenticationRequestDTO {
  @NotBlank(message = "Username is required")
  private String email;
  @NotBlank(message = "Password is required")
  @Size(min = 8, max = 32, message = "Password is required and should contain 8 to 32 characters")
  private String password;
}
