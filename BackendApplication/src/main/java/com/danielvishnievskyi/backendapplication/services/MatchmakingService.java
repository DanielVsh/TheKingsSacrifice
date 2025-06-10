package com.danielvishnievskyi.backendapplication.services;

import com.danielvishnievskyi.backendapplication.model.dto.game.GamePairDTO;
import com.danielvishnievskyi.backendapplication.model.dto.player.PlayerMatchRequestDTO;

import java.util.Optional;
import java.util.UUID;

public interface MatchmakingService {
  Optional<GamePairDTO> tryMatch(PlayerMatchRequestDTO request);
  void removeFromQueue(UUID playerUUID);
  void addToQueue(PlayerMatchRequestDTO request);
  long getPlayersCount();
  long getPlayersCountByTimeMode(String timeMode);
}
