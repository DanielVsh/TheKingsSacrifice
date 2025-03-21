package com.danielvishnievskyi.backendapplication.model.entities;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
@Inheritance(strategy = InheritanceType.TABLE_PER_CLASS)
@DiscriminatorColumn(name = "player_type", discriminatorType = DiscriminatorType.STRING)
public abstract class PlayerEntity {
  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  @Column(name = "uuid", nullable = false)
  private UUID uuid;

  @Column(name = "creation_time", nullable = false)
  private LocalDateTime creationTime;

  @PrePersist
  public void prePersist() {
    this.creationTime = LocalDateTime.now();
  }
}
