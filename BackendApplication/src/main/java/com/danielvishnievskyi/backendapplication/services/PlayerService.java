package com.danielvishnievskyi.backendapplication.services;

import com.danielvishnievskyi.backendapplication.model.dto.player.RegisteredPlayerRequestDTO;
import com.danielvishnievskyi.backendapplication.model.dto.player.RegisteredPlayerResponseDTO;

import java.util.UUID;

public interface PlayerService {
  RegisteredPlayerResponseDTO getRegisteredPlayer(String email);
  RegisteredPlayerResponseDTO updatePlayer(UUID playerUUID, RegisteredPlayerRequestDTO requestDTO);
}
