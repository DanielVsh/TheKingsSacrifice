package com.danielvishnievskyi.backendapplication.repositories;

import com.danielvishnievskyi.backendapplication.model.entities.GameEntity;
import com.danielvishnievskyi.backendapplication.model.entities.PlayerEntity;
import com.danielvishnievskyi.backendapplication.model.enums.GameState;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface GameRepository extends JpaRepository<GameEntity, UUID>, JpaSpecificationExecutor<GameEntity> {

  @Query(value = """
      select g from GameEntity g
      where (g.blackPlayer.uuid = :#{#player.uuid} or g.whitePlayer.uuid = :#{#player.uuid})
      and g.gameResult = :gameState
    """)
  List<GameEntity> getGameEntitiesByPlayer(PlayerEntity player, GameState gameState);
}