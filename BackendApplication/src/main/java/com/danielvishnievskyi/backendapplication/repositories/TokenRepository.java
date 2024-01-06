package com.danielvishnievskyi.backendapplication.repositories;

import com.danielvishnievskyi.backendapplication.model.entities.Token;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TokenRepository extends JpaRepository<Token, Long> {
  @Query(value = """
    select t from Token t inner join RegisteredPlayer u\s
    on t.registeredPlayer.uuid = u.uuid\s
    where u.uuid = :uuid and (t.expired = false or t.revoked = false)\s
    """)
  List<Token> findAllValidTokenByRegisteredPlayer(UUID uuid);

  Optional<Token> findByToken(String token);
}