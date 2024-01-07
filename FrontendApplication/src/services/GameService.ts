import {Chess} from "chess.js";

export const determineGameState = (game: Chess) => {
  if (game.isThreefoldRepetition()) {
    return GameState.DRAW_BY_THREEFOLD_REPETITION;
  } else if (game.isStalemate()) {
    return GameState.STALEMATE;
  } else if (game.isInsufficientMaterial()) {
    return GameState.DRAW_BY_INSUFFICIENT_MATERIAL;
  } else if (game.isCheckmate()) {
    return GameState.CHECKMATE;
  }

  return GameState.ERROR;
};

export const determineWinner = (game: Chess, props: GameResponse) => {
  if (props.blackPlayer && props.whitePlayer) {
    return game.turn() === "w" ? props.blackPlayer : props.whitePlayer;
  }

  return null;
};