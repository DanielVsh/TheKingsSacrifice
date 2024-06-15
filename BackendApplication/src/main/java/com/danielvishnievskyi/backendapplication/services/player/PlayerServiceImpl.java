package com.danielvishnievskyi.backendapplication.services.player;

import com.danielvishnievskyi.backendapplication.model.dto.player.AnonymousPlayerResponseDTO;
import com.danielvishnievskyi.backendapplication.model.dto.player.RegisterPlayerRequestDTO;
import com.danielvishnievskyi.backendapplication.model.dto.player.RegisteredPlayerResponseDTO;
import com.danielvishnievskyi.backendapplication.model.entities.AnonymousPlayerEntity;
import com.danielvishnievskyi.backendapplication.repositories.PlayerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PlayerServiceImpl implements PlayerService {

  private final PlayerRepository playerRepository;

  @Override
  public RegisteredPlayerResponseDTO createPlayer(RegisterPlayerRequestDTO registerPlayerRequestDto) {
    throw new UnsupportedOperationException("Not yet implemented");
  }

  @Override
  public AnonymousPlayerResponseDTO createAnonymousPlayer() {
    AnonymousPlayerEntity player = playerRepository.save(new AnonymousPlayerEntity());

    return new AnonymousPlayerResponseDTO(player.getUuid());
  }

  @Override
  public void removePlayer(UUID uuid) {
    playerRepository.deleteById(uuid);
  }

  @Override
  public void removePlayers(List<UUID> uuidList) {
    playerRepository.deleteAllById(uuidList);
  }
}
