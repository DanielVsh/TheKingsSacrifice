package com.danielvishnievskyi.backendapplication.controllers.websocket;

import com.danielvishnievskyi.backendapplication.model.entities.Game;
import com.danielvishnievskyi.backendapplication.repositories.GameRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.util.Optional;
import java.util.UUID;

@Controller
@RequiredArgsConstructor
public class GameWebSocketController {

  private final SimpMessagingTemplate messagingTemplate;
  private final GameRepository gameRepository;

  @MessageMapping("/game/{gameId}/move")
  public void makeMove(
    @DestinationVariable String gameId,
    @Payload String fen
  ) {
    System.out.println(gameId);
    Optional<Game> optionalGame = gameRepository.findById(UUID.fromString(gameId));
    if (optionalGame.isPresent()) {
      Game game = optionalGame.get();
      game.getHistory().add(fen);
      gameRepository.save(game);
      messagingTemplate.convertAndSend("/topic/game/" + gameId, fen);
    } else {
      throw new RuntimeException("Game[%s] not found".formatted(gameId)); //TODO: Custom exception
    }
  }
}
