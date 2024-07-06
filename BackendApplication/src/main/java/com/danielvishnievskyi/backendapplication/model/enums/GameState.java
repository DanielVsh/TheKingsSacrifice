package com.danielvishnievskyi.backendapplication.model.enums;

public enum GameState {
  CREATED,
  ONGOING,
  CHECKMATE,
  STALEMATE,
  DRAW_BY_INSUFFICIENT_MATERIAL,
  DRAW_BY_FIFTY_MOVES_RULE,
  DRAW_BY_THREEFOLD_REPETITION,
  RESIGNATION,
  TIMEOUT,
  ABANDONED,
  DRAW_AGREEMENT,
  ERROR;
}
