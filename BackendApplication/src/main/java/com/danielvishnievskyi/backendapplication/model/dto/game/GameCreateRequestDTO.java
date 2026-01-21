package com.danielvishnievskyi.backendapplication.model.dto.game;

import com.danielvishnievskyi.backendapplication.model.enums.GameMode;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.ToString;

import java.util.UUID;

@Data
@ToString
@AllArgsConstructor
public class GameCreateRequestDTO {
  private UUID whitePlayer;
  private UUID blackPlayer;
  @NotBlank
  @Pattern(regexp = "\\d+\\+\\d+|unlimited", message = "Invalid time format")
  private String timeFormat;
  private GameMode gameMode;
}
