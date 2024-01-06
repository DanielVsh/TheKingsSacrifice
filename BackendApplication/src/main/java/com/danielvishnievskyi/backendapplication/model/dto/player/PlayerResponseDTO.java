package com.danielvishnievskyi.backendapplication.model.dto.player;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.util.UUID;

@Data
@ToString
@NoArgsConstructor
@AllArgsConstructor
public class PlayerResponseDTO {
  private UUID uuid;
}
