package com.danielvishnievskyi.backendapplication.model.entities;

import com.danielvishnievskyi.backendapplication.model.enums.GameMode;
import com.danielvishnievskyi.backendapplication.model.enums.Role;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

@Entity
@Builder
@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
@DiscriminatorValue("registered")
public class RegisteredPlayerEntity extends PlayerEntity implements UserDetails {

  @Column(unique = true, nullable = false)
  private String nickname;

  @Column(unique = true, nullable = false)
  private String email;

  @JsonIgnore
  @Column(nullable = false)
  private String password;

  @Setter(AccessLevel.NONE)
  private int bulletRating;
  @Setter(AccessLevel.NONE)
  private int blitzRating;
  @Setter(AccessLevel.NONE)
  private int rapidRating;
  @Setter(AccessLevel.NONE)
  private int classicalRating;

  @Enumerated(EnumType.STRING)
  @Column(name = "roles", nullable = false)
  private List<Role> roles;

  public int getRatingDueToMode(GameMode mode) {
    return switch (mode) {
      case BULLET -> this.bulletRating;
      case BLITZ -> this.blitzRating;
      case RAPID -> this.rapidRating;
      case CLASSICAL -> this.classicalRating;
      default -> throw new IllegalArgumentException();
    };
  }

  public void setRatingDueToMode(int rating, GameMode mode) {
    switch (mode) {
      case BULLET -> this.bulletRating = rating;
      case BLITZ -> this.blitzRating = rating;
      case RAPID -> this.rapidRating = rating;
      case CLASSICAL -> this.classicalRating = rating;
    };
  }

  @Override
  public Collection<? extends GrantedAuthority> getAuthorities() {
    return roles.stream().map(role -> new SimpleGrantedAuthority(role.toString())).toList();
  }

  @Override
  public String getPassword() {
    return password;
  }

  @Override
  public String getUsername() {
    return email;
  }

  @Override
  public boolean isAccountNonExpired() {
    return true;
  }

  @Override
  public boolean isAccountNonLocked() {
    return true;
  }

  @Override
  public boolean isCredentialsNonExpired() {
    return true;
  }

  @Override
  public boolean isEnabled() {
    return true;
  }
}
