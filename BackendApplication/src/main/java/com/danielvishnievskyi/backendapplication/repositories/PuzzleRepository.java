package com.danielvishnievskyi.backendapplication.repositories;

import com.danielvishnievskyi.backendapplication.model.entities.PuzzleEntity;
import com.danielvishnievskyi.backendapplication.model.enums.PuzzleTheme;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PuzzleRepository extends JpaRepository<PuzzleEntity, Long> {
  List<PuzzleEntity> findByTheme(PuzzleTheme theme);
  List<PuzzleEntity> findByDifficulty(Integer difficulty);

  boolean existsByFen(String fen);
}
