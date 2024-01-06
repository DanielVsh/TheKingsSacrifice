package com.danielvishnievskyi.backendapplication.model.entities;

import com.danielvishnievskyi.backendapplication.model.enums.GameState;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.Fetch;
import org.hibernate.annotations.FetchMode;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Entity
@Getter
@Setter
@Builder
@ToString
@NoArgsConstructor
@AllArgsConstructor
public class Game {
  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  @Column(name = "uuid", nullable = false)
  private UUID uuid;

  @ManyToOne
  @JoinColumn(name = "white_player_id")
  private Player whitePlayer;

  @ManyToOne
  @JoinColumn(name = "black_player_id")
  private Player blackPlayer;

  @ManyToOne
  @JoinColumn(name = "winner_player_id")
  private Player winner;

  @Column(name = "gameResult")
  private GameState gameResult;

  @Column(name = "date")
  private LocalDateTime date;

  @ElementCollection(fetch = FetchType.EAGER)
  private List<String> history;
}
