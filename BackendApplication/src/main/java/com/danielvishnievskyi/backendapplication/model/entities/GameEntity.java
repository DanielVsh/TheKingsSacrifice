package com.danielvishnievskyi.backendapplication.model.entities;

import com.danielvishnievskyi.backendapplication.model.enums.GameMode;
import com.danielvishnievskyi.backendapplication.model.enums.GameState;
import com.danielvishnievskyi.backendapplication.utils.GameEloRatingUtils;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.Accessors;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Entity
@Getter
@Setter
@Builder
@ToString
@Accessors(chain = true)
@NoArgsConstructor
@AllArgsConstructor
public class GameEntity {
  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  @Column(name = "uuid", nullable = false)
  private UUID uuid;

  @ManyToOne
  @JoinColumn(name = "white_player_id")
  private RegisteredPlayerEntity whitePlayer;

  @ManyToOne
  @JoinColumn(name = "black_player_id")
  private RegisteredPlayerEntity blackPlayer;

  @ManyToOne
  @JoinColumn(name = "winner_player_id")
  private RegisteredPlayerEntity winner;

  @Enumerated(EnumType.STRING)
  @Column(name = "game_result")
  private GameState gameResult;

  /** Time format i.e int+int => time in sec + time in sec per move ('unlimited' if no time is specified) */
  @Column(name = "time_format", nullable = false)
  private String timeFormat;

  @OneToOne(cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
  private GameTimeEntity gameTime;

  @Column(name = "created_date")
  private LocalDateTime createdAt;

  @Column(name = "finished_date")
  private LocalDateTime finishedAt;

  @ElementCollection(fetch = FetchType.EAGER)
  private List<String> history;

  private String pgn;

  @Column(name = "white_rating_delta")
  private Integer whiteRatingDelta;

  @Column(name = "black_rating_delta")
  private Integer blackRatingDelta;

  @Enumerated(EnumType.STRING)
  @Column(name = "game_mode", nullable = false)
  private GameMode gameMode;

  @PrePersist
  public void prePersist() {
    this.createdAt = LocalDateTime.now();
  }

  public int getBasicGameTime() {
    return Integer.parseInt(getTimeFormat().split("\\+")[0]);
  }

  public int getIncreaseTimePerMove() {
    return Integer.parseInt(getTimeFormat().split("\\+")[1]);
  }

  public GameEntity setWinner(RegisteredPlayerEntity winner) {
    if (this.winner == null) {
      this.winner = winner;
    }
    return this;
  }

  public GameEntity setGameResult(GameState gameResult) {
    if (this.gameResult == null) {
      this.gameResult = GameState.CREATED;
    } else if (this.gameResult == GameState.CREATED && gameResult == GameState.ONGOING) {
      this.gameResult = GameState.ONGOING;
    } else if (this.gameResult == GameState.ONGOING) {
      this.finishedAt = LocalDateTime.now();
      this.gameResult = gameResult;

      if (gameMode != GameMode.NON_RATING) {
        updatePlayersRating();
      }
    }
    return this;
  }

  private void updatePlayersRating() {
    GameEloRatingUtils.ResultRating resultRating = GameEloRatingUtils.calculateNewRatings(this);
    this.whiteRatingDelta = resultRating.whiteRatingDelta();
    this.blackRatingDelta = resultRating.blackRatingDelta();
    this.getWhitePlayer().setRatingDueToMode(resultRating.newWhiteRating(), gameMode);
    this.getBlackPlayer().setRatingDueToMode(resultRating.newBlackRating(), gameMode);
  }

}
