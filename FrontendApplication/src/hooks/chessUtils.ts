import { Chess } from "chess.js";

export function sanFromFens(prevFen: string, nextFen: string): string {
  const chess = new Chess(prevFen);

  for (const move of chess.moves({ verbose: true })) {
    chess.move(move);
    if (chess.fen() === nextFen) return move.san;
    chess.undo();
  }

  return "?";
}

export function buildMoveHistory(fens: string[]) {
  if (!fens.length) return [];

  return [
    { san: "Start", fen: fens[0] },
    ...fens.slice(1).map((fen, i) => ({
      san: sanFromFens(fens[i], fen),
      fen,
    })),
  ];
}
