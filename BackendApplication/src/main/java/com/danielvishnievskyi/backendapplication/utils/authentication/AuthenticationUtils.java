package com.danielvishnievskyi.backendapplication.utils.authentication;

import com.danielvishnievskyi.backendapplication.model.entities.RegisteredPlayer;

public interface AuthenticationUtils {
  void saveToken(RegisteredPlayer registeredPlayer, String jwtToken);

  void deleteAllTokens(RegisteredPlayer registeredPlayer);
}
