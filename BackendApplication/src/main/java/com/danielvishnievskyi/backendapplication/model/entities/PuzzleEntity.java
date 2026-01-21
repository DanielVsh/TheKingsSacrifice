package com.danielvishnievskyi.backendapplication.model.entities;

import com.danielvishnievskyi.backendapplication.model.enums.PuzzleTheme;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@Entity
@Table(name = "puzzles")
public class PuzzleEntity {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false)
  private String fen;

  @ElementCollection
  @CollectionTable(name = "puzzle_solution_moves")
  @OrderColumn
  private List<String> solutionMoves = new ArrayList<>(); // UCI: e2e4, g8f6

  @Enumerated(EnumType.STRING)
  private PuzzleTheme theme;

  private Integer difficulty; // 1-5
  private Double evaluation;
  private String sideToMove;
  private Integer movesToSolve;

  private LocalDateTime createdAt;

}
