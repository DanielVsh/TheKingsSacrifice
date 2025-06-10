package com.danielvishnievskyi.backendapplication.websockets;

import com.danielvishnievskyi.backendapplication.model.dto.game.DrawMessageDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.RequestMapping;

import java.util.UUID;

@Controller
@Slf4j
@RequestMapping("/ws")
@Transactional
@RequiredArgsConstructor
public class GameStateWebSocket {
  private final SimpMessagingTemplate messagingTemplate;

  @MessageMapping("/game/{gameuuid}/draw/request")
  public void sendDrawRequest(
    @DestinationVariable UUID gameuuid,
    DrawMessageDTO drawMessageDTO
  ) {
    messagingTemplate.convertAndSend(
      "/topic/game/" + gameuuid + "/draw",
      drawMessageDTO
    );
  }
}
