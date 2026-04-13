package com.danielvishnievskyi.backendapplication.model.enums;

public enum PuzzleTheme {
  // ── Mate patterns ──────────────────────────────────────────────────────────
  MATE_IN_ONE,
  MATE_IN_TWO,
  MATE_IN_THREE,

  // ── Material-gain tactics ──────────────────────────────────────────────────
  HANGING_PIECE,       // win a piece that is undefended
  WIN_MATERIAL,        // winning exchange / capture sequence
  ADVANTAGE,           // general positional/material advantage

  // ── Classic tactical motifs ────────────────────────────────────────────────
  FORK,                // one piece attacks two or more enemies simultaneously
  PIN,                 // piece is pinned against a more valuable piece behind it
  SKEWER,              // high-value piece is attacked; weaker piece hides behind it
  DISCOVERED_ATTACK,   // moving one piece unveils an attack by another
  DISCOVERED_CHECK,    // moving one piece unveils a check by another
  DOUBLE_CHECK,        // two pieces deliver check simultaneously

  // ── Forcing / deceptive moves ──────────────────────────────────────────────
  DEFLECTION,          // force a defender away from a key square or piece
  DECOY,               // sacrifice to attract a piece to a bad square
  ZWISCHENZUG,         // in-between move before the "expected" response
  SACRIFICE,           // give up material for a long-term/positional gain
  QUIET_MOVE,          // non-capture, non-check move that is the only solution

  // ── Pawn / piece-specific ──────────────────────────────────────────────────
  PROMOTION,           // pawn promotion (often under-promotion)
  EN_PASSANT,          // en-passant capture as the key move
  TRAPPED_PIECE,       // opponent's piece has no safe square to move to

  // ── King-safety / back-rank ────────────────────────────────────────────────
  BACK_RANK,           // back-rank mate or weakness exploitation

  // ── Endgame concepts ──────────────────────────────────────────────────────
  ZUGZWANG,            // any move worsens the moving side's position
  STALEMATE,           // stalemate as a defensive resource or tactical goal
  ENDGAME,
}
