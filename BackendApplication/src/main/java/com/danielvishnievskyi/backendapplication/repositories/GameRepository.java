package com.danielvishnievskyi.backendapplication.repositories;

import com.danielvishnievskyi.backendapplication.model.entities.GameEntity;
import com.danielvishnievskyi.backendapplication.model.entities.PlayerEntity;
import com.danielvishnievskyi.backendapplication.model.enums.GameState;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface GameRepository extends JpaRepository<GameEntity, UUID>, JpaSpecificationExecutor<GameEntity> {

  @Query(value = """
        SELECT g FROM GameEntity g
        WHERE (g.blackPlayer IN :players OR g.whitePlayer IN :players)
        AND g.gameResult IN :gameStates
    """)
  List<GameEntity> getGamesByPlayersAndGameResult(@Param("players") List<PlayerEntity> players,
                                                  @Param("gameStates") List<GameState> gameStates);

  @Query(value = """
    select g from GameEntity g
    where g.gameResult = 'ONGOING' and g.timeFormat != 'unlimited'
  """)
  List<GameEntity> getAllNotUnlimitedOngoingGames();
}