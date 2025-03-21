package com.danielvishnievskyi.backendapplication.repositories;

import com.danielvishnievskyi.backendapplication.model.entities.RegisteredPlayerEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface RegisteredPlayerRepository extends JpaRepository<RegisteredPlayerEntity, UUID> {
  Optional<RegisteredPlayerEntity> findByEmail(String email);
  Optional<RegisteredPlayerEntity> findByNickname(String nickname);
}