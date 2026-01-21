package com.danielvishnievskyi.backendapplication.utils;


import com.danielvishnievskyi.backendapplication.model.entities.GameEntity;
import lombok.experimental.UtilityClass;

@UtilityClass
public class GameEloRatingUtils {

  public ResultRating calculateNewRatings(GameEntity gameEntity) {
    int whiteRating = gameEntity.getWhitePlayer().getRatingDueToMode(gameEntity.getGameMode());
    int blackRating = gameEntity.getBlackPlayer().getRatingDueToMode(gameEntity.getGameMode());

    double expectedWhite = expectedScore(whiteRating, blackRating);
    double expectedBlack = expectedScore(blackRating, whiteRating);

    int k = 32; // typical for casual play
    double whiteScore;
    double blackScore;

    if (gameEntity.getWinner() == null) {
      whiteScore = 0.5;
      blackScore = 0.5;
    } else if (gameEntity.getWinner().getUuid().equals(gameEntity.getWhitePlayer().getUuid())) {
      whiteScore = 1;
      blackScore = 0;
    } else {
      whiteScore = 0;
      blackScore = 1;
    }

    int newWhite = (int) Math.round(whiteRating + k * (whiteScore - expectedWhite));
    int newBlack = (int) Math.round(blackRating + k * (blackScore - expectedBlack));

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

  public record ResultRating(
    int newWhiteRating,
    int whiteRatingDelta,
    int newBlackRating,
    int blackRatingDelta
  ) {}
}
