package com.danielvishnievskyi.backendapplication.services;

import com.danielvishnievskyi.backendapplication.model.dto.game.GamePairDTO;
import com.danielvishnievskyi.backendapplication.model.dto.player.PlayerMatchRequestDTO;
import lombok.Synchronized;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class MatchmakingServiceImpl implements MatchmakingService {
  private final Map<UUID, QueuedPlayer> queue = new ConcurrentHashMap<>();

  @Synchronized
  public Optional<GamePairDTO> tryMatch(PlayerMatchRequestDTO request) {
    LocalDateTime now = LocalDateTime.now();
    QueuedPlayer current = new QueuedPlayer(request, now);
    queue.putIfAbsent(request.playerUUID(), current);

    var candidateList = queue.values().stream()
      .filter(queuedPlayer ->
        !queuedPlayer.equals(current) &&
        queuedPlayer.request.timeFormat().equals(request.timeFormat())
      ).toList();

    for (QueuedPlayer candidate : candidateList) {
      int tolerance = calculateTolerance(now, candidate.queuedAt, current.queuedAt);
      int ratingDiff = Math.abs(candidate.request.rating() - current.request.rating());

      if (ratingDiff <= tolerance) {
        queue.remove(current.request.playerUUID());
        queue.remove(candidate.request.playerUUID());
        List<PlayerMatchRequestDTO> players = Arrays.asList(current.request, candidate.request);
        Collections.shuffle(players);
        return Optional.of(new GamePairDTO(players.getFirst(), players.getLast()));
      }
    }
    return Optional.empty();
  }

  public synchronized void removeFromQueue(UUID playerUUID) {
    queue.remove(playerUUID);
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
  public void addToQueue(PlayerMatchRequestDTO request) {
    QueuedPlayer current = new QueuedPlayer(request, LocalDateTime.now());
    queue.putIfAbsent(request.playerUUID(), current);
  }

  private int calculateTolerance(LocalDateTime now, LocalDateTime... queuedAts) {
    LocalDateTime minQueuedAt = Arrays.stream(queuedAts)
      .min(LocalDateTime::compareTo)
      .orElse(now);

    long secondsQueued = Duration.between(minQueuedAt, now).getSeconds();

    return 100 + (int) (secondsQueued / 10) * 25;
  }

  private record QueuedPlayer(
    PlayerMatchRequestDTO request,
    LocalDateTime queuedAt
  ) {
    @Override
    public boolean equals(Object obj) {
      if (this == obj) return true;
      if (!(obj instanceof QueuedPlayer other)) return false;
      return request.playerUUID().equals(other.request.playerUUID());
    }

    @Override
    public int hashCode() {
      return request.playerUUID().hashCode();
    }
  }

}
