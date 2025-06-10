package com.danielvishnievskyi.backendapplication.utils;


import com.danielvishnievskyi.backendapplication.model.entities.GameEntity;
import lombok.experimental.UtilityClass;

@UtilityClass
public class GameEloRatingUtils {

  public void calculateNewRatings(GameEntity gameEntity) {
    int whiteRating = gameEntity.getWhitePlayer().getRating();
    int blackRating = gameEntity.getBlackPlayer().getRating();

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

    gameEntity.getWhitePlayer().setRating(newWhite);
    gameEntity.getBlackPlayer().setRating(newBlack);
  }

  private double expectedScore(int ratingA, int ratingB) {
    return 1.0 / (1.0 + Math.pow(10, (ratingB - ratingA) / 400.0));
  }
}
