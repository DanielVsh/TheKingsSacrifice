package com.danielvishnievskyi.backendapplication.services.game;

import com.danielvishnievskyi.backendapplication.model.TimeFormat;
import com.danielvishnievskyi.backendapplication.model.dto.game.*;
import com.danielvishnievskyi.backendapplication.model.entities.GameEntity;
import com.danielvishnievskyi.backendapplication.model.entities.GameTimeEntity;
import com.danielvishnievskyi.backendapplication.model.entities.PlayerEntity;
import com.danielvishnievskyi.backendapplication.model.enums.Color;
import com.danielvishnievskyi.backendapplication.model.enums.GameState;
import com.danielvishnievskyi.backendapplication.model.mappers.GameMapper;
import com.danielvishnievskyi.backendapplication.repositories.GameRepository;
import com.danielvishnievskyi.backendapplication.repositories.PlayerRepository;
import com.danielvishnievskyi.backendapplication.utils.FenUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.CollectionUtils;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@Transactional
@RequiredArgsConstructor
public class GameServiceImpl implements GameService {
  private final GameRepository gameRepository;
  private final PlayerRepository playerRepository;
  private final GameMapper gameMapper;

  @Override
  public GameResponseDTO getGame(UUID uuid) {
    return gameMapper.mapToResponseDTO(gameRepository.findById(uuid).orElseThrow());
  }

  @Override
  public GameResponseDTO saveGame(GameSaveRequestDTO gameSaveRequestDTO) {
    GameEntity gameEntity = gameRepository.findById(gameSaveRequestDTO.getUuid()).orElseThrow();
    gameEntity.setWinner(gameSaveRequestDTO.getWinner());
    gameEntity.setGameResult(gameSaveRequestDTO.getGameResult());
    return gameMapper.mapToResponseDTO(gameEntity);
  }

  @Override
  public GameResponseDTO createGame(GameCreateRequestDTO gameCreateRequestDTO) {
    Optional<PlayerEntity> whitePlayer = Optional.empty();
    Optional<PlayerEntity> blackPlayer = Optional.empty();
    if (gameCreateRequestDTO.getWhitePlayer() != null) { //TODO: custom exception
      whitePlayer = playerRepository.findById(gameCreateRequestDTO.getWhitePlayer());
    } else if (gameCreateRequestDTO.getBlackPlayer() != null) {
      blackPlayer = playerRepository.findById(gameCreateRequestDTO.getBlackPlayer());
    }
    if (whitePlayer.isEmpty() && blackPlayer.isEmpty()) {
      throw new RuntimeException("Game can't be created without players");
    }

    List<GameEntity> alreadyCreatedGamesByPlayer = null;
    if (whitePlayer.isPresent()) {
      alreadyCreatedGamesByPlayer = gameRepository.getGameEntitiesByPlayer(whitePlayer.get(), GameState.CREATED);
    } else {
      alreadyCreatedGamesByPlayer = gameRepository.getGameEntitiesByPlayer(blackPlayer.get(), GameState.CREATED);
    }
    if (!CollectionUtils.isEmpty(alreadyCreatedGamesByPlayer)) {
      throw new RuntimeException("Players already have created game");
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

  @Override
  public GameResponseDTO startGame(GameStartRequestDTO gameStartRequestDTO) {
    GameEntity gameEntity = gameRepository.findById(gameStartRequestDTO.getUuid()).orElseThrow();
    gameEntity.setWhitePlayer(playerRepository.findById(gameStartRequestDTO.getWhitePlayer()).orElseThrow());
    gameEntity.setBlackPlayer(playerRepository.findById(gameStartRequestDTO.getBlackPlayer()).orElseThrow());
    gameEntity.setGameResult(GameState.ONGOING);

    return gameMapper.mapToResponseDTO(gameRepository.save(gameEntity));
  }

  @Override
  public GameResponseDTO updateGameMove(String gameId, String fen) {
    GameEntity gameEntity = gameRepository.findById(UUID.fromString(gameId))
      .orElseThrow(() -> new RuntimeException("Game[%s] not found".formatted(gameId)));

    gameEntity.getHistory().add(fen);

    GameTimeEntity gameTime = gameEntity.getGameTime();
    if (gameTime != null) {
      if (FenUtils.getActiveColor(fen) == Color.WHITE) {
        if (gameEntity.getHistory().size() == 2) {
          gameTime.setBlackPlayerTime(gameEntity.getBasicGameTimeInSec());
        }
        gameTime.updateBlackPlayerTimeByMove();
      } else {
        if (gameEntity.getHistory().size() == 1) {
          gameTime.setWhitePlayerTime(gameEntity.getBasicGameTimeInSec());
        }
        gameTime.updateWhitePlayerTimeByMove();
      }
    }

    return gameMapper.mapToResponseDTO(gameRepository.save(gameEntity));
  }
}
