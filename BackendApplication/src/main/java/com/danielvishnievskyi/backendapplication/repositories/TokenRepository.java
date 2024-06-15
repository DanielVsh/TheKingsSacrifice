package com.danielvishnievskyi.backendapplication.repositories;

import com.danielvishnievskyi.backendapplication.model.entities.TokenEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TokenRepository extends JpaRepository<TokenEntity, Long> {
  @Query(value = """
    select t from TokenEntity t inner join RegisteredPlayerEntity u\s
    on t.registeredPlayer.uuid = u.uuid\s
    where u.uuid = :uuid and (t.expired = false or t.revoked = false)\s
    """)
  List<TokenEntity> findAllValidTokenByRegisteredPlayer(UUID uuid);

  Optional<TokenEntity> findByToken(String token);
}