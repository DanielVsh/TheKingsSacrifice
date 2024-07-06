package com.danielvishnievskyi.backendapplication.model.entities;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@ToString
@NoArgsConstructor
public class GameTimeEntity {

  public GameTimeEntity(GameEntity game) {
    this.game = game;
    int gameTime = game.getBasicGameTimeInSec();
    this.whitePlayerTime = gameTime + 60;
    this.blackPlayerTime = gameTime + 60;
  }

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "id", nullable = false)
  private Long id;

  @ToString.Exclude
  @OneToOne(fetch = FetchType.LAZY)
  GameEntity game;

  @Column(name = "white_player_timer", nullable = false)
  int whitePlayerTime;

  @Column(name = "black_player_timer", nullable = false)
  int blackPlayerTime;

  public boolean updateWhitePlayerTime() {
    whitePlayerTime -= 1;
    return whitePlayerTime > 0;
  }

  public boolean updateBlackPlayerTime() {
    blackPlayerTime -= 1;
    return blackPlayerTime > 0;
  }

  public void updateWhitePlayerTimeByMove() {
    whitePlayerTime = updatePlayerTime(whitePlayerTime);
  }

  public void updateBlackPlayerTimeByMove() {
    blackPlayerTime = updatePlayerTime(blackPlayerTime);
  }

  private int updatePlayerTime(int playerTime) {
    playerTime += Integer.parseInt(game.getTimeFormat().split("\\+")[1]);
    return playerTime;
  }
}
