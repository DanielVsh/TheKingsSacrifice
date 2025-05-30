package com.danielvishnievskyi.backendapplication.model.entities;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Entity
@Getter
@Setter
@ToString
@NoArgsConstructor
public class GameTimeEntity {

  public static final int PREPARATION_TIME = 60000; // 60 sec

  public GameTimeEntity(GameEntity game) {
    this.game = game;
    int gameTime = game.getBasicGameTime() * 1000;
    this.whitePlayerTime = gameTime + PREPARATION_TIME;
    this.blackPlayerTime = gameTime + PREPARATION_TIME;
  }

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "id", nullable = false)
  private Long id;

  @ToString.Exclude
  @OneToOne(fetch = FetchType.LAZY)
  GameEntity game;

  /** in milliseconds */
  @Column(name = "white_player_timer", nullable = false)
  long whitePlayerTime;

  /** in milliseconds */
  @Column(name = "black_player_timer", nullable = false)
  long blackPlayerTime;

  public void updateWhitePlayerTime(int timeShift) {
    whitePlayerTime += timeShift;
  }

  public void updateBlackPlayerTime(int timeShift) {
    blackPlayerTime += timeShift;
  }

  public boolean hasWhitePlayerTime(){
    return whitePlayerTime > 0;
  }

  public boolean hasBlackPlayerTime(){
    return blackPlayerTime > 0;
  }
}
