package com.danielvishnievskyi.backendapplication.controllers.websocket;

import com.danielvishnievskyi.backendapplication.model.dto.game.GameResponseDTO;
import com.danielvishnievskyi.backendapplication.model.dto.game.GameStartRequestDTO;
import com.danielvishnievskyi.backendapplication.model.dto.game.GameTimeResponseDTO;
import com.danielvishnievskyi.backendapplication.model.entities.GameEntity;
import com.danielvishnievskyi.backendapplication.model.entities.GameTimeEntity;
import com.danielvishnievskyi.backendapplication.model.entities.RegisteredPlayerEntity;
import com.danielvishnievskyi.backendapplication.model.enums.Color;
import com.danielvishnievskyi.backendapplication.model.enums.GameState;
import com.danielvishnievskyi.backendapplication.repositories.GameRepository;
import com.danielvishnievskyi.backendapplication.services.game.GameService;
import com.danielvishnievskyi.backendapplication.utils.FenUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Controller;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.RequestMapping;

import java.util.List;

@Controller
@Slf4j
@RequestMapping("/ws")
@RequiredArgsConstructor
public class GameWebSocketController {
  private final SimpMessagingTemplate messagingTemplate;
  private final GameRepository gameRepository;
  private final GameService gameService;

  @MessageMapping("/game/{gameId}/move")
  public void makeMove(
    @DestinationVariable String gameId,
    @Payload String fen
    ) {
    GameResponseDTO gameResponseDTO = gameService.updateGameMove(gameId, fen);

    messagingTemplate.convertAndSend("/topic/game/" + gameId,
      gameResponseDTO.getHistory().getLast()
    );
  }

  @Transactional
  @Scheduled(fixedRate = 100)
  public void sendTimeUpdates() {
    gameRepository.getAllNotUnlimitedOngoingGames().parallelStream()
      .forEach(gameEntity -> {
        final GameTimeEntity gameTime = gameEntity.getGameTime();
        final List<String> gameFenHistory = gameEntity.getHistory();

        final boolean isWhiteFirstMove = gameFenHistory.isEmpty();
        final boolean isBlackTurnToMove = !isWhiteFirstMove && FenUtils.getActiveColor(gameFenHistory.getLast()) == Color.BLACK;
        final boolean isBlackFirstMove = gameEntity.getHistory().size() == 1;

        if (isBlackTurnToMove) {
          gameTime.updateBlackPlayerTime(-100);
          if (isBlackFirstMove) {
            setGameAbandonedIfPreparationTimeExpired(gameTime.getBlackPlayerTime(), gameEntity);
          }
          checkAndSetTimeout(!gameTime.hasBlackPlayerTime(), gameEntity, gameEntity.getWhitePlayer());
        } else {
          gameTime.updateWhitePlayerTime(-100);
          if (isWhiteFirstMove) {
            setGameAbandonedIfPreparationTimeExpired(gameTime.getWhitePlayerTime(), gameEntity);
          }
          checkAndSetTimeout(!gameTime.hasWhitePlayerTime(), gameEntity, gameEntity.getBlackPlayer());
        }
        messagingTemplate.convertAndSend("/topic/game/" + gameEntity.getUuid() + "/time",
          new GameTimeResponseDTO(gameTime.getWhitePlayerTime(), gameTime.getBlackPlayerTime())
        );
      });
  }

  private static void checkAndSetTimeout(boolean isTimeout, GameEntity gameEntity, RegisteredPlayerEntity winner) {
    if (isTimeout) {
      gameEntity
        .setWinner(winner)
        .setGameResult(GameState.TIMEOUT);
    }
  }
  private static void setGameAbandonedIfPreparationTimeExpired(long gameTime, GameEntity gameEntity) {
    if (gameTime <= gameEntity.getBasicGameTime() * 1000L) {
      gameEntity.setGameResult(GameState.ABANDONED);
    }
  }

  @MessageMapping("/game/{gameId}/start")
  public void startGame(
      @DestinationVariable String gameId,
      @Payload GameStartRequestDTO gameStartRequestDTO
      ) {
    GameResponseDTO gameResponseDTO = gameService.startGame(gameStartRequestDTO);

    log.info("game[{}] started with white[{}] and black[{}] players",
      gameResponseDTO.getUuid(), gameResponseDTO.getWhitePlayer(), gameResponseDTO.getBlackPlayer());
    messagingTemplate.convertAndSend("/topic/game/" + gameId + "/started", "true");
  }
}