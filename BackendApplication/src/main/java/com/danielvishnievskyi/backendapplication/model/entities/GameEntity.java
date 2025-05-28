package com.danielvishnievskyi.backendapplication.model.entities;

import com.danielvishnievskyi.backendapplication.model.enums.GameState;
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

  @Column(name = "date")
  private LocalDateTime date;

  @ElementCollection(fetch = FetchType.EAGER)
  private List<String> history;

  private String pgn;

  @PrePersist
  public void prePersist() {
    this.date = LocalDateTime.now();
  }

  public int getBasicGameTime() {
    return Integer.parseInt(getTimeFormat().split("\\+")[0]);
  }

  public int getIncreaseTimePerMove() {
    return Integer.parseInt(getTimeFormat().split("\\+")[1]);
  }
}
