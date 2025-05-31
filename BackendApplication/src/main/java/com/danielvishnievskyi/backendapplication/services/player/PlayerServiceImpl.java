package com.danielvishnievskyi.backendapplication.services.player;

import com.danielvishnievskyi.backendapplication.model.dto.player.RegisteredPlayerRequestDTO;
import com.danielvishnievskyi.backendapplication.model.dto.player.RegisteredPlayerResponseDTO;
import com.danielvishnievskyi.backendapplication.model.entities.RegisteredPlayerEntity;
import com.danielvishnievskyi.backendapplication.model.mappers.PlayerMapper;
import com.danielvishnievskyi.backendapplication.repositories.RegisteredPlayerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PlayerServiceImpl implements PlayerService {
private final RegisteredPlayerRepository playerRepository;
private final PlayerMapper playerMapper;

  @Override
  public RegisteredPlayerResponseDTO updatePlayer(
    UUID playerUUID,
    RegisteredPlayerRequestDTO requestDTO
  ) {
    RegisteredPlayerEntity registeredPlayerEntity = playerRepository.findById(playerUUID).orElseThrow();

    playerMapper.updateEntityFromDto(requestDTO, registeredPlayerEntity);

    RegisteredPlayerEntity saved = playerRepository.save(registeredPlayerEntity);

    return playerMapper.playerToResponseDTO(saved);
  }

  @Override
  public RegisteredPlayerResponseDTO getRegisteredPlayer(String email) {
    return playerRepository.findByEmail(email)
      .map(playerMapper::playerToResponseDTO)
      .orElseThrow();
  }
}
