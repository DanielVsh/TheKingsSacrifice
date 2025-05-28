package com.danielvishnievskyi.backendapplication.services.player;

import com.danielvishnievskyi.backendapplication.model.dto.player.RegisteredPlayerResponseDTO;
import com.danielvishnievskyi.backendapplication.model.mappers.PlayerMapper;
import com.danielvishnievskyi.backendapplication.repositories.RegisteredPlayerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class PlayerServiceImpl implements PlayerService {
private final RegisteredPlayerRepository registeredPlayerRepository;
private final PlayerMapper playerMapper;

  @Override
  public RegisteredPlayerResponseDTO getRegisteredPlayer(String email) {
    return registeredPlayerRepository.findByEmail(email)
      .map(playerMapper::playerToResponseDTO)
      .orElseThrow();
  }
}
