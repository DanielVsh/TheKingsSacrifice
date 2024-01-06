package com.danielvishnievskyi.backendapplication.services.game;

import com.danielvishnievskyi.backendapplication.model.dto.game.GameCreateRequestDTO;
import com.danielvishnievskyi.backendapplication.model.dto.game.GameStartRequestDTO;
import com.danielvishnievskyi.backendapplication.model.dto.game.GameResponseDTO;
import com.danielvishnievskyi.backendapplication.model.dto.game.GameSaveRequestDTO;
import com.danielvishnievskyi.backendapplication.model.entities.Game;
import com.danielvishnievskyi.backendapplication.model.entities.Player;
import com.danielvishnievskyi.backendapplication.model.enums.GameState;
import com.danielvishnievskyi.backendapplication.model.mappers.game.GameMapper;
import com.danielvishnievskyi.backendapplication.repositories.GameRepository;
import com.danielvishnievskyi.backendapplication.repositories.PlayerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class GameServiceImpl implements GameService {
  private final GameRepository gameRepository;
  private final PlayerRepository playerRepository;
  private final GameMapper gameMapper;

  @Override
  public GameResponseDTO getGame(UUID uuid) {
    return gameMapper.gameToResponseDTO(gameRepository.findById(uuid).orElseThrow());
  }

  @Override
  public GameResponseDTO saveGame(GameSaveRequestDTO gameSaveRequestDTO) {
    Game game = gameRepository.findById(gameSaveRequestDTO.getUuid()).orElseThrow();
    game.setWinner(gameSaveRequestDTO.getWinner());
    game.setGameResult(gameSaveRequestDTO.getGameResult());
    return gameMapper.gameToResponseDTO(game);
  }

  @Override
  public GameResponseDTO createGame(GameCreateRequestDTO gameCreateRequestDTO) {
    Optional<Player> whitePlayer = Optional.empty();
    Optional<Player> blackPlayer = Optional.empty();
    if (gameCreateRequestDTO.getWhitePlayer() != null) { //TODO: custom exception
      whitePlayer = playerRepository.findById(gameCreateRequestDTO.getWhitePlayer());
    } else if (gameCreateRequestDTO.getBlackPlayer() != null) {
      blackPlayer = playerRepository.findById(gameCreateRequestDTO.getBlackPlayer());
    }
    if (whitePlayer.isEmpty() && blackPlayer.isEmpty()) {
      throw new RuntimeException("Game can't be created without players");
    }

    Game game = Game.builder()
      .whitePlayer(whitePlayer.orElse(null))
      .blackPlayer(blackPlayer.orElse(null))
      .gameResult(GameState.CREATED)
      .date(LocalDateTime.now())
      .build();
    return gameMapper.gameToResponseDTO(gameRepository.save(game));
  }

  @Transactional
  @Override
  public GameResponseDTO startGame(GameStartRequestDTO gameStartRequestDTO) {
    Game game = gameRepository.findById(gameStartRequestDTO.getUuid()).orElseThrow();
    game.setWhitePlayer(playerRepository.findById(gameStartRequestDTO.getWhitePlayer()).orElseThrow());
    game.setBlackPlayer(playerRepository.findById(gameStartRequestDTO.getBlackPlayer()).orElseThrow());
    game.setDate(LocalDateTime.now());
    game.setGameResult(GameState.ONGOING);

    return gameMapper.gameToResponseDTO(gameRepository.save(game));
  }

}
