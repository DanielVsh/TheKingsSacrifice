package com.danielvishnievskyi.backendapplication.repositories;

import com.danielvishnievskyi.backendapplication.model.entities.GameEntity;
import com.danielvishnievskyi.backendapplication.model.entities.ProcessedPuzzleGamesEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProcessedGamePuzzleRepository extends JpaRepository<ProcessedPuzzleGamesEntity, Long> {
  boolean existsByGame(GameEntity game);
}
