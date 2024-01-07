package com.danielvishnievskyi.backendapplication.utils.authentication;

import com.danielvishnievskyi.backendapplication.model.entities.RegisteredPlayer;
import com.danielvishnievskyi.backendapplication.model.entities.Token;
import com.danielvishnievskyi.backendapplication.model.enums.TokenType;
import com.danielvishnievskyi.backendapplication.repositories.TokenRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class AuthenticationUtilsImpl implements AuthenticationUtils {
  private final TokenRepository tokenRepository;

  @Override
  public void saveToken(RegisteredPlayer registeredPlayer, String jwtToken) {
    var token = Token.builder()
      .registeredPlayer(registeredPlayer)
      .token(jwtToken)
      .tokenType(TokenType.BEARER)
      .expired(false)
      .revoked(false)
      .build();
    tokenRepository.save(token);
  }

  @Override
  public void deleteAllTokens(RegisteredPlayer registeredPlayer) {
    var validSoulTokens = tokenRepository.findAllValidTokenByRegisteredPlayer(registeredPlayer.getUuid());
    tokenRepository.deleteAll(validSoulTokens);
  }

}
