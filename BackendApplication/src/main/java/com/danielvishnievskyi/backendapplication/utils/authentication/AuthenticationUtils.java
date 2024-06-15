package com.danielvishnievskyi.backendapplication.utils.authentication;

import com.danielvishnievskyi.backendapplication.model.entities.RegisteredPlayerEntity;

public interface AuthenticationUtils {
  void saveToken(RegisteredPlayerEntity registeredPlayer, String jwtToken);

  void deleteAllTokens(RegisteredPlayerEntity registeredPlayer);
}
