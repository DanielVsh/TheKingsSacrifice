package com.danielvishnievskyi.backendapplication.controllers.websocket;

import com.danielvishnievskyi.backendapplication.model.dto.game.GameResponseDTO;
import com.danielvishnievskyi.backendapplication.model.dto.game.GameTimeResponseDTO;
import com.danielvishnievskyi.backendapplication.model.entities.GameEntity;
import com.danielvishnievskyi.backendapplication.model.entities.GameTimeEntity;
import com.danielvishnievskyi.backendapplication.model.entities.PlayerEntity;
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
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.stereotype.Controller;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.RequestMapping;

import java.util.List;
import java.util.UUID;

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

    messagingTemplate.convertAndSend(STR."/topic/game/\{gameId}",
      gameResponseDTO.getHistory().getLast()
    );
  }

  @Transactional
  @Scheduled(fixedRate = 1000)
  public void sendTimeUpdates() {
    gameRepository.getAllUnlimitedOngoingGames().parallelStream()
      .forEach(gameEntity -> {
        GameTimeEntity gameTime = gameEntity.getGameTime();
        List<String> gameFenHistory = gameEntity.getHistory();
        if (gameFenHistory.isEmpty() || FenUtils.getActiveColor(gameFenHistory.getLast()) == Color.WHITE) {
          if (!gameTime.updateWhitePlayerTime()) {
            gameEntity.setWinner(gameEntity.getBlackPlayer());
            gameEntity.setGameResult(GameState.TIMEOUT);
          }
        } else {
          if (!gameTime.updateBlackPlayerTime()) {
            gameEntity.setWinner(gameEntity.getWhitePlayer());
            gameEntity.setGameResult(GameState.TIMEOUT);
          }
        }
        messagingTemplate.convertAndSend(STR."/topic/game/\{gameEntity.getUuid()}/time",
          new GameTimeResponseDTO(gameTime.getWhitePlayerTime(), gameTime.getBlackPlayerTime())
        );
      });
  }

  @MessageMapping("/game/{gameId}/start")
  public void startGame(
      @DestinationVariable String gameId,
      @AuthenticationPrincipal PlayerEntity playerEntity
      ) {
    GameEntity gameEntity = gameRepository.findById(UUID.fromString(gameId))
        .orElseThrow(() -> new RuntimeException("Game[%s] not found".formatted(gameId)));

    if (gameEntity.getWhitePlayer() == null) {
      gameEntity.setWhitePlayer(playerEntity);
    } else if (gameEntity.getBlackPlayer() == null) {
      gameEntity.setBlackPlayer(playerEntity);
    }
    gameEntity.setGameResult(GameState.ONGOING);
    gameRepository.save(gameEntity);
  }
}