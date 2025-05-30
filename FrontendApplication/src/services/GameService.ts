import {Chess} from "chess.js";
import {GameState} from "../app/enums/GameState.ts";
import {GameResponse} from "../app/interfaces/IGame.ts";
import {GameResult} from "../app/enums/GameResult.ts";

export const determineGameState = (game: Chess) => {
  if (game.isThreefoldRepetition()) {
    return GameState.DRAW_BY_THREEFOLD_REPETITION;
  } else if (game.isStalemate()) {
    return GameState.STALEMATE;
  } else if (game.isInsufficientMaterial()) {
    return GameState.DRAW_BY_INSUFFICIENT_MATERIAL;
  } else if (game.isCheckmate()) {
    return GameState.CHECKMATE;
  } else if (game.isDraw()) {
    return GameState.DRAW_AGREEMENT;
  } else if (game.isDrawByFiftyMoves()) {
    return GameState.DRAW_BY_FIFTY_MOVES_RULE;
  }

  return GameState.ERROR;
};

export const determineGameResult = (game: GameResponse, player: RegisteredPlayerResponse) => {
  const gameResult = game.gameResult;
  if (!gameResult) return GameResult.ONGOING;

  switch (gameResult) {
    case GameState.CHECKMATE:
    case GameState.RESIGNATION:
    case GameState.TIMEOUT:
      if (game?.winner?.uuid === player.uuid) {
        return GameResult.WIN;
      } else {
        return GameResult.LOSS
      }
    case GameState.STALEMATE:
    case GameState.DRAW_BY_INSUFFICIENT_MATERIAL:
    case GameState.DRAW_BY_FIFTY_MOVES_RULE:
    case GameState.DRAW_BY_THREEFOLD_REPETITION:
    case GameState.DRAW_AGREEMENT:
      return GameResult.DRAW;
    default:
      return GameResult.ONGOING;
  }
}

export const determineWinner = (game: Chess, props: GameResponse) => {
  if (props.blackPlayer && props.whitePlayer) {
    return game.turn() === "w" ? props.blackPlayer : props.whitePlayer;
  }

  return null;
};