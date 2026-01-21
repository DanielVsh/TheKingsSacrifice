package com.danielvishnievskyi.backendapplication.websockets;

import com.danielvishnievskyi.backendapplication.model.dto.game.GameCreateRequestDTO;
import com.danielvishnievskyi.backendapplication.model.dto.game.GamePairDTO;
import com.danielvishnievskyi.backendapplication.model.dto.game.GameStartRequestDTO;
import com.danielvishnievskyi.backendapplication.model.dto.player.PlayerMatchRequestDTO;
import com.danielvishnievskyi.backendapplication.services.GameService;
import com.danielvishnievskyi.backendapplication.services.MatchmakingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.RequestMapping;

import java.util.Optional;
import java.util.UUID;

@Controller
@Slf4j
@RequestMapping("/ws")
@Transactional
@RequiredArgsConstructor
public class GameMatchmakingWebsocket {
  private final SimpMessagingTemplate messagingTemplate;
  private final GameService gameService;
  private final MatchmakingService matchmakingService;

  @MessageMapping("/find-rated")
  public void findMatch(PlayerMatchRequestDTO request) {

    Optional<GamePairDTO> matchOpt = matchmakingService.tryMatch(request);

    if (matchOpt.isPresent()) {
      GamePairDTO match = matchOpt.get();

      UUID whitePlayerUUID = match.white().playerUUID();
      UUID blackPlayerUUID = match.black().playerUUID();
      var createdGame = gameService.createGame(new GameCreateRequestDTO(
        whitePlayerUUID, blackPlayerUUID, request.timeFormat(), request.gameMode()
      ));

      var startedGame = gameService.startGame(
        createdGame.getUuid(),
        new GameStartRequestDTO(whitePlayerUUID, blackPlayerUUID)
      );

      matchmakingService.removeFromQueue(whitePlayerUUID);
      matchmakingService.removeFromQueue(blackPlayerUUID);

      messagingTemplate.convertAndSend(
        "/topic/user/%s/queue/match".formatted(whitePlayerUUID),
        startedGame
      );
      messagingTemplate.convertAndSend(
        "/topic/user/%s/queue/match".formatted(blackPlayerUUID),
        startedGame
      );
    } else {
      messagingTemplate.convertAndSend(
        "/topic/user/%s/queue/match/size".formatted(request.playerUUID()),
        new MatchmakingQueueSize(
          matchmakingService.getPlayersCount(),
          matchmakingService.getPlayersCountByTimeMode(request.timeFormat())
        )
      );
    }
  }

  @MessageMapping("/cancel-rated")
  public void cancelMatch(PlayerMatchRequestDTO request) {
    matchmakingService.removeFromQueue(request.playerUUID());
  }

  public record MatchmakingQueueSize(
    long total,
    long byTimeMode
  ) {
  }
}
