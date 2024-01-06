package com.danielvishnievskyi.backendapplication.repositories;

import com.danielvishnievskyi.backendapplication.model.entities.RegisteredPlayer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface RegisteredPlayerRepository extends JpaRepository<RegisteredPlayer, UUID> {
  Optional<RegisteredPlayer> findByEmail(String email);
}