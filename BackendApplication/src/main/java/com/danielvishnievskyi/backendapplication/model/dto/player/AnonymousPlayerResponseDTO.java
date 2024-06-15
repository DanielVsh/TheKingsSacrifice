package com.danielvishnievskyi.backendapplication.model.dto.player;

import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class AnonymousPlayerResponseDTO extends PlayerResponseDTO {
  public AnonymousPlayerResponseDTO(UUID uuid) {
    super(uuid);
  }
}
