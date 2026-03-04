package com.danielvishnievskyi.backendapplication.services;

import com.danielvishnievskyi.backendapplication.model.dto.game.GamePairDTO;
import com.danielvishnievskyi.backendapplication.model.dto.player.PlayerMatchRequestDTO;
import lombok.Synchronized;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;

@Slf4j
@Service
public class MatchmakingServiceImpl implements MatchmakingService {
  private final Map<UUID, QueuedPlayer> queue = Collections.synchronizedMap(new LinkedHashMap<>());

  public record QueuedPlayer(PlayerMatchRequestDTO request, LocalDateTime queuedAt) {
    @Override
    public boolean equals(Object obj) {
      if (!(obj instanceof QueuedPlayer queuedPlayer)) return false;
      return this == queuedPlayer || this.request.playerUUID().equals(queuedPlayer.request.playerUUID());
    }
  }

  @Override
  @Synchronized
  public Optional<GamePairDTO> tryMatch(PlayerMatchRequestDTO request) {
    LocalDateTime now = LocalDateTime.now();
    QueuedPlayer current = new QueuedPlayer(request, now);
    queue.putIfAbsent(request.playerUUID(), current);

    var candidateList = queue.values().stream()
      .filter(queuedPlayer ->
        !queuedPlayer.equals(current) &&
          queuedPlayer.request.timeFormat().equals(request.timeFormat())
      )
      .sorted(Comparator.comparingInt(candidate ->
        Math.abs(candidate.request.rating() - current.request.rating())
      ))
      .toList();

    for (QueuedPlayer candidate : candidateList) {
      long currentWaitSeconds = ChronoUnit.SECONDS.between(current.queuedAt, now);
      long candidateWaitSeconds = ChronoUnit.SECONDS.between(candidate.queuedAt, now);
      long maxWaitSeconds = Math.max(currentWaitSeconds, candidateWaitSeconds);

      int tolerance = calculateTolerance(maxWaitSeconds);
      int ratingDiff = Math.abs(candidate.request.rating() - current.request.rating());

      if (ratingDiff <= tolerance) {
        queue.remove(current.request.playerUUID());
        queue.remove(candidate.request.playerUUID());
        List<PlayerMatchRequestDTO> players = Arrays.asList(current.request, candidate.request);
        Collections.shuffle(players);

        log.info("Match: {} ({}) vs {} ({}), diff={}, tolerance={}",
          current.request.playerUUID(), current.request.rating(),
          candidate.request.playerUUID(), candidate.request.rating(),
          ratingDiff, tolerance);

        return Optional.of(new GamePairDTO(players.getFirst(), players.getLast()));
      }
    }
    return Optional.empty();
  }

  private int calculateTolerance(long maxWaitSeconds) {
    if (maxWaitSeconds >= 120) {
      return 1000;  // Force match after 2 minutes
    }
    if (maxWaitSeconds >= 60) {
      return 400;
    }
    if (maxWaitSeconds >= 30) {
      return 200;
    }
    return 100;
  }


  public void removeFromQueue(UUID playerId) {
    queue.remove(playerId);
  }

  @Override
  public void addToQueue(PlayerMatchRequestDTO request) {
    QueuedPlayer current = new QueuedPlayer(request, LocalDateTime.now());
    queue.putIfAbsent(request.playerUUID(), current);
  }

  @Override
  public long getPlayersCount() {
    return queue.size();
  }

  @Override
  public long getPlayersCountByTimeMode(String timeMode) {
    return queue.values().stream()
      .filter(queuedPlayer -> queuedPlayer.request.timeFormat().equals(timeMode))
      .count();
  }

  @Override
  public Map<UUID, QueuedPlayer> getQueue() {
    return queue;
  }

}