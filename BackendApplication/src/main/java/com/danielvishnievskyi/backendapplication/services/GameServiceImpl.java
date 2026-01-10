package com.danielvishnievskyi.backendapplication.services;

import com.danielvishnievskyi.backendapplication.model.TimeFormat;
import com.danielvishnievskyi.backendapplication.model.dto.game.GameCreateRequestDTO;
import com.danielvishnievskyi.backendapplication.model.dto.game.GameResponseDTO;
import com.danielvishnievskyi.backendapplication.model.dto.game.GameSaveRequestDTO;
import com.danielvishnievskyi.backendapplication.model.dto.game.GameStartRequestDTO;
import com.danielvishnievskyi.backendapplication.model.entities.GameEntity;
import com.danielvishnievskyi.backendapplication.model.entities.GameTimeEntity;
import com.danielvishnievskyi.backendapplication.model.entities.PlayerEntity;
import com.danielvishnievskyi.backendapplication.model.entities.RegisteredPlayerEntity;
import com.danielvishnievskyi.backendapplication.model.enums.Color;
import com.danielvishnievskyi.backendapplication.model.enums.GameState;
import com.danielvishnievskyi.backendapplication.model.mappers.GameMapper;
import com.danielvishnievskyi.backendapplication.repositories.GameRepository;
import com.danielvishnievskyi.backendapplication.repositories.RegisteredPlayerRepository;
import com.danielvishnievskyi.backendapplication.utils.FenUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.CollectionUtils;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@Transactional
@RequiredArgsConstructor
public class GameServiceImpl implements GameService {
  private final GameRepository gameRepository;
  private final RegisteredPlayerRepository playerRepository;
  private final GameMapper gameMapper;
  private final SimpMessagingTemplate messagingTemplate;

  @Override
  public Page<GameResponseDTO> getGames(RegisteredPlayerEntity player, Pageable pageable) {
    UUID playerUuid = player.getUuid();
    return gameRepository.findByWhitePlayer_UuidOrBlackPlayer_Uuid(playerUuid, playerUuid, pageable)
      .map(gameMapper::mapToResponseDTO);
  }

  @Override
  public GameResponseDTO getGame(UUID uuid) {
    return gameMapper.mapToResponseDTO(gameRepository.findById(uuid).orElseThrow());
  }

  @Override
  public GameResponseDTO saveGame(UUID uuid, GameSaveRequestDTO gameSaveRequestDTO) {
    GameEntity gameEntity = gameRepository.findById(uuid).orElseThrow();
    if (gameSaveRequestDTO.getWinner() == null) {
      gameEntity.setWinner(null);
    } else {
      gameEntity.setWinner(playerRepository.findById(gameSaveRequestDTO.getWinner()).orElseThrow());
    }
    gameEntity.setGameResult(gameSaveRequestDTO.getGameResult());

    GameResponseDTO gameResponseDTO = gameMapper.mapToResponseDTO(gameEntity);
    messagingTemplate.convertAndSend("/topic/game/" + gameEntity.getUuid() + "/finished", gameResponseDTO);

    return gameResponseDTO;
  }

  @Override
  public GameResponseDTO createGame(GameCreateRequestDTO gameCreateRequestDTO) {
    Optional<RegisteredPlayerEntity> whitePlayer = Optional.empty();
    Optional<RegisteredPlayerEntity> blackPlayer = Optional.empty();
    if (gameCreateRequestDTO.getWhitePlayer() != null) { //TODO: custom exception
      whitePlayer = playerRepository.findById(gameCreateRequestDTO.getWhitePlayer());
    } else if (gameCreateRequestDTO.getBlackPlayer() != null) {
      blackPlayer = playerRepository.findById(gameCreateRequestDTO.getBlackPlayer());
    }
    if (whitePlayer.isEmpty() && blackPlayer.isEmpty()) {
      throw new RuntimeException("Game can't be created without players");
    }

    ArrayList<PlayerEntity> playerEntities = new ArrayList<>();
    if (whitePlayer.isPresent()) {
      playerEntities.add(whitePlayer.get());
    } else {
      playerEntities.add(blackPlayer.get());
    }
    Optional<GameEntity> playersUnfinishedGame = getPlayersUnfinishedGame(playerEntities);
    if (playersUnfinishedGame.isPresent()) {
      return gameMapper.mapToResponseDTO(playersUnfinishedGame.get());
    }

    GameEntity gameEntity = GameEntity.builder()
      .whitePlayer(whitePlayer.orElse(null))
      .blackPlayer(blackPlayer.orElse(null))
      .gameResult(GameState.CREATED)
      .timeFormat(gameCreateRequestDTO.getTimeFormat())
      .build();

    if (!gameCreateRequestDTO.getTimeFormat().equals(TimeFormat.UNLIMITED_TIME_FORMAT)) {
      gameEntity.setGameTime(new GameTimeEntity(gameEntity));
    }

    return gameMapper.mapToResponseDTO(gameRepository.save(gameEntity));
  }

  private Optional<GameEntity> getPlayersUnfinishedGame(List<PlayerEntity> playerEntities) {
    List<GameEntity> unfinishedGames = gameRepository.getGamesByPlayersAndGameResult(
      playerEntities, List.of(GameState.ONGOING, GameState.CREATED)
    );

    if (CollectionUtils.isEmpty(unfinishedGames)) {
      return Optional.empty();
    }

    if (unfinishedGames.size() > 2) {
      throw new RuntimeException("Players have more then 1 ongoing game");
    }

    if (unfinishedGames.size() == 2 &&
      !unfinishedGames.getFirst().getUuid().equals(unfinishedGames.getLast().getUuid())
    ) {
      throw new RuntimeException("Players have different ongoing games");
    }

    return Optional.of(unfinishedGames.getFirst());
  }

  @Override
  public GameResponseDTO startGame(UUID uuid, GameStartRequestDTO gameStartRequestDTO) {
    GameEntity gameEntity = gameRepository.findById(uuid).orElseThrow();
    RegisteredPlayerEntity whitePlayer = playerRepository.findById(gameStartRequestDTO.getWhitePlayer()).orElseThrow();
    RegisteredPlayerEntity blackPlayer = playerRepository.findById(gameStartRequestDTO.getBlackPlayer()).orElseThrow();

    if (gameEntity.getWhitePlayer() == null) {
      getPlayersUnfinishedGame(List.of(whitePlayer));
    } else if (gameEntity.getBlackPlayer() == null) {
      getPlayersUnfinishedGame(List.of(blackPlayer));
    }

    gameEntity.setWhitePlayer(whitePlayer);
    gameEntity.setBlackPlayer(blackPlayer);
    gameEntity.setGameResult(GameState.ONGOING);

    return gameMapper.mapToResponseDTO(gameEntity);
  }

  @Override
  public GameResponseDTO updateGameMove(String gameId, String fen) {
    GameEntity gameEntity = gameRepository.findById(UUID.fromString(gameId))
      .orElseThrow(() -> new RuntimeException("Game[%s] not found".formatted(gameId)));

    if (gameEntity.getGameResult() != GameState.ONGOING && gameEntity.getGameResult() != GameState.CREATED) {
      throw new RuntimeException("Game[%s] is not in ONGOING state".formatted(gameId));
    }

    gameEntity.getHistory().add(fen);

    GameTimeEntity gameTime = gameEntity.getGameTime();
    if (gameTime != null) {
      if (FenUtils.getActiveColor(fen) == Color.WHITE) {
        if (gameEntity.getHistory().size() == 2) {
          gameTime.setBlackPlayerTime(gameEntity.getBasicGameTime() * 1000L);
        }
        gameTime.updateBlackPlayerTime(gameEntity.getIncreaseTimePerMove() * 1000);
      } else {
        if (gameEntity.getHistory().size() == 1) {
          gameTime.setWhitePlayerTime(gameEntity.getBasicGameTime() * 1000L);
        }
        gameTime.updateWhitePlayerTime(gameEntity.getIncreaseTimePerMove() * 1000);
      }
    }

    return gameMapper.mapToResponseDTO(gameEntity);
  }

}
