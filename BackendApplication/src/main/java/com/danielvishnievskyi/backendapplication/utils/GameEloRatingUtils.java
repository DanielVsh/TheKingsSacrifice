package com.danielvishnievskyi.backendapplication.utils;


import com.danielvishnievskyi.backendapplication.model.entities.GameEntity;
import com.danielvishnievskyi.backendapplication.model.enums.GameMode;
import lombok.experimental.UtilityClass;

import java.util.UUID;

@UtilityClass
public class GameEloRatingUtils {
  private static final int DEFAULT_K = 32;
  private static final int MIN_RATING = 100;
  private static final int MAX_RATING = 3200;

  public ResultRating calculate(GameEntity game) {
    int whiteRating = game.getWhitePlayer()
      .getRatingDueToMode(game.getGameMode());

    int blackRating = game.getBlackPlayer()
      .getRatingDueToMode(game.getGameMode());

    double expectedWhite = expectedScore(whiteRating, blackRating);
    double expectedBlack = expectedScore(blackRating, whiteRating);

    double whiteScore = resolveScore(game, game.getWhitePlayer().getUuid());
    double blackScore = resolveScore(game, game.getBlackPlayer().getUuid());

    int kFactor = resolveKFactor(game.getGameMode());

    int newWhite = normalizeRating(
      whiteRating + kFactor * (whiteScore - expectedWhite)
    );

    int newBlack = normalizeRating(
      blackRating + kFactor * (blackScore - expectedBlack)
    );

    return new ResultRating(
      newWhite,
      newWhite - whiteRating,
      newBlack,
      newBlack - blackRating
    );
  }

  private double expectedScore(int ratingA, int ratingB) {
    return 1.0 / (1.0 + Math.pow(10, (ratingB - ratingA) / 400.0));
  }

  private double resolveScore(GameEntity game, UUID playerId) {
    if (game.getWinner() == null) {
      return 0.5;
    }
    return game.getWinner().getUuid().equals(playerId) ? 1.0 : 0.0;
  }

  private int resolveKFactor(GameMode mode) {
    return switch (mode) {
      case BLITZ -> 40;
      case RAPID -> 32;
      case CLASSICAL -> 24;
      default -> DEFAULT_K;
    };
  }

  private int normalizeRating(double rating) {
    int rounded = (int) Math.round(rating);
    return Math.max(MIN_RATING, Math.min(MAX_RATING, rounded));
  }

  public record ResultRating(
    int newWhiteRating,
    int whiteRatingDelta,
    int newBlackRating,
    int blackRatingDelta
  ) {
  }
}

