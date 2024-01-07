package com.danielvishnievskyi.backendapplication.model.entities;

import com.danielvishnievskyi.backendapplication.model.enums.TokenType;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@Builder
@ToString
@NoArgsConstructor
@AllArgsConstructor
public class Token {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "id", nullable = false)
  private Long id;

  @Column(unique = true)
  private String token;

  @Builder.Default
  @Enumerated(EnumType.STRING)
  private TokenType tokenType = TokenType.BEARER;

  private boolean revoked;

  private boolean expired;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "registeredPlayer")
  @ToString.Exclude
  private RegisteredPlayer registeredPlayer;
}
