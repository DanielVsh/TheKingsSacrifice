package com.danielvishnievskyi.backendapplication.services.player;

import com.danielvishnievskyi.backendapplication.model.dto.player.RegisteredPlayerResponseDTO;

public interface PlayerService {
  RegisteredPlayerResponseDTO getRegisteredPlayer(String email);
}
