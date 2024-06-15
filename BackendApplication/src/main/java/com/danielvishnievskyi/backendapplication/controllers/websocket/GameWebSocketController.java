package com.danielvishnievskyi.backendapplication.controllers.websocket;

import com.danielvishnievskyi.backendapplication.model.entities.GameEntity;
import com.danielvishnievskyi.backendapplication.model.entities.PlayerEntity;
import com.danielvishnievskyi.backendapplication.model.enums.GameState;
import com.danielvishnievskyi.backendapplication.repositories.GameRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

import java.util.UUID;

@Controller
@Slf4j
@RequestMapping("/ws")
@RequiredArgsConstructor
public class GameWebSocketController {

  private final SimpMessagingTemplate messagingTemplate;
  private final GameRepository gameRepository;

  @MessageMapping("/game/{gameId}/move")
  public void makeMove(
      @DestinationVariable String gameId,
      @Payload String fen
  ) {
    GameEntity gameEntity = gameRepository.findById(UUID.fromString(gameId))
        .orElseThrow(() -> new RuntimeException("Game[%s] not found".formatted(gameId)));

    gameEntity.getHistory().add(fen);
    gameRepository.save(gameEntity);
    messagingTemplate.convertAndSend("/topic/game/" + gameId, fen);
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
//    gameRepository.save(game);
  }
}