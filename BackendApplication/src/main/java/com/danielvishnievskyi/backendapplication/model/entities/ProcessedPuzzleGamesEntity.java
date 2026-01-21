package com.danielvishnievskyi.backendapplication.model.entities;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "processed_game_puzzle")
@NoArgsConstructor
public class ProcessedPuzzleGamesEntity {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @OneToOne
  private GameEntity game;

  public ProcessedPuzzleGamesEntity(GameEntity game) {
    this.game = game;
  }
}
