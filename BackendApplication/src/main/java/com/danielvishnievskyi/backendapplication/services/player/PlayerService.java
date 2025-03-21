package com.danielvishnievskyi.backendapplication.services.player;


import com.danielvishnievskyi.backendapplication.model.dto.player.AnonymousPlayerResponseDTO;
import com.danielvishnievskyi.backendapplication.model.dto.player.RegisterPlayerRequestDTO;
import com.danielvishnievskyi.backendapplication.model.dto.player.RegisteredPlayerResponseDTO;

import java.util.List;
import java.util.UUID;

public interface PlayerService {
  RegisteredPlayerResponseDTO createPlayer(RegisterPlayerRequestDTO registerPlayerRequestDto);
  void removePlayer(UUID uuid);
  void removePlayers(List<UUID> uuidList);
}
