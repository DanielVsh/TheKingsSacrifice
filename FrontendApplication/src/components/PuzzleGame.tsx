import React, { useState, useEffect, useRef } from "react";
import { Chess } from "chess.js";
import { ChessGameBoard } from "./ChessGameBoard";
import { PuzzleResponse } from "../app/interfaces/IPuzzle";

interface Props {
  puzzle: PuzzleResponse;
}

export const PuzzleGame: React.FC<Props> = ({ puzzle }) => {
  const [game, setGame] = useState(new Chess());
  const [status, setStatus] = useState<"playing" | "won" | "lost">("playing");
  const [currentMoveIndex, setCurrentMoveIndex] = useState(0);
  const [lastFen, setLastFen] = useState(puzzle.fen);
  const [highlightSquares, setHighlightSquares] = useState<Record<string, any>>({});

  const chessRef = useRef(new Chess());

  useEffect(() => {
    const chess = new Chess();
    chess.load(puzzle.fen);
    chessRef.current = chess;
    setGame(chess);
    setLastFen(puzzle.fen);
    setStatus("playing");
    setCurrentMoveIndex(0);
    setHighlightSquares({});
  }, [puzzle]);

  const applyMoveHighlight = (move: { from: string; to: string }) => {
    setHighlightSquares({
      [move.from]: { backgroundColor: "rgba(246,220,162,0.8)" },
      [move.to]: { backgroundColor: "rgba(255,165,0,0.8)" },
    });
  };

  const handleUserMove = (fen: string) => {
    if (status !== "playing") return;

    const chess = new Chess(lastFen);
    const moves = chess.moves({ verbose: true });

    const userMove = moves.find((m) => {
      const temp = new Chess(lastFen);
      temp.move(m);
      return temp.fen() === fen;
    });

    if (!userMove) {
      setStatus("lost"); // illegal move
      return;
    }

    const userMoveUci = userMove.from + userMove.to + (userMove.promotion ?? "");
    const correctMove = puzzle.solutionMoves[currentMoveIndex];

    if (userMoveUci !== correctMove) {
      setStatus("lost"); // wrong move
      applyMoveHighlight({ from: userMove.from, to: userMove.to });
      return;
    }

    // Apply user move
    chess.move(userMove);
    applyMoveHighlight({ from: userMove.from, to: userMove.to });

    let nextMoveIndex = currentMoveIndex + 1;

    // Auto-play opponent move
    if (nextMoveIndex < puzzle.solutionMoves.length) {
      const opponentMoveUci = puzzle.solutionMoves[nextMoveIndex];
      const from = opponentMoveUci.slice(0, 2);
      const to = opponentMoveUci.slice(2, 4);
      const promotion = opponentMoveUci.length === 5 ? opponentMoveUci[4] : undefined;
      chess.move({ from, to, promotion });
      applyMoveHighlight({ from, to });
      nextMoveIndex += 1;
    }

    setGame(chess);
    chessRef.current = chess;
    setLastFen(chess.fen());
    setCurrentMoveIndex(nextMoveIndex);

    if (nextMoveIndex >= puzzle.solutionMoves.length) {
      setStatus("won");
    }
  };

  const resetPuzzle = () => {
    const chess = new Chess();
    chess.load(puzzle.fen);
    chessRef.current = chess;
    setGame(chess);
    setLastFen(puzzle.fen);
    setStatus("playing");
    setCurrentMoveIndex(0);
    setHighlightSquares({});
  };

  // Optional: hint feature
  const showHint = () => {
    if (status !== "playing") return;
    const nextMoveUci = puzzle.solutionMoves[currentMoveIndex];
    const from = nextMoveUci.slice(0, 2);
    const to = nextMoveUci.slice(2, 4);
    applyMoveHighlight({ from, to });
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <ChessGameBoard
        key={puzzle.id}
        game={game}
        fen={game.fen()}
        onUserMove={handleUserMove}
        boardOrientation={puzzle.sideToMove}
        canPlayerMove={status === "playing"}
        customSquareStyles={highlightSquares}
      />

      <div className="flex flex-col items-center gap-2 text-center">
        {status === "playing" && <p className="text-yellow-600 font-semibold">Find the best move!</p>}
        {status === "won" && <p className="text-green-600 font-bold">✅ Correct! Puzzle solved!</p>}
        {status === "lost" && (
          <>
            <p className="text-red-600 font-bold">❌ Wrong move!</p>
          </>
        )}

        <div className="flex gap-2 mt-2">
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            onClick={resetPuzzle}
          >
            Reset
          </button>
          {status === "playing" && (
            <button
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
              onClick={showHint}
            >
              Hint
            </button>
          )}
        </div>

        <div className="mt-2 text-sm text-gray-500">
          Move {Math.round((currentMoveIndex) / 2)} of {Math.round(puzzle.solutionMoves.length / 2)}
        </div>
      </div>
    </div>
  );
};
