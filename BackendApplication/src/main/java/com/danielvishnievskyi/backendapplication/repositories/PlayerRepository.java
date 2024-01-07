package com.danielvishnievskyi.backendapplication.repositories;

import com.danielvishnievskyi.backendapplication.model.entities.Player;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface PlayerRepository extends JpaRepository<Player, UUID>, JpaSpecificationExecutor<Player> {
}