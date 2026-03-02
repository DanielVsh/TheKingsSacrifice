import React, { useState, useEffect, useRef } from "react";
import { Chess } from "chess.js";
import { ChessGameBoard } from "./ChessGameBoard";
import { PuzzleResponse } from "../app/interfaces/IPuzzle";

interface Props {
  puzzle: PuzzleResponse;
  onSkip?: () => void;
}

export const PuzzleGame: React.FC<Props> = ({ puzzle, onSkip }) => {
  const [game, setGame] = useState(new Chess());
  const [status, setStatus] = useState<"playing" | "won" | "lost">("playing");
  const [currentMoveIndex, setCurrentMoveIndex] = useState(0);
  const [highlightSquares, setHighlightSquares] = useState<Record<string, any>>(
    {}
  );

  const chessRef = useRef(new Chess());

  useEffect(() => {
    const chess = new Chess();
    chess.load(puzzle.fen);

    chessRef.current = chess;
    setGame(chess);
    setStatus("playing");
    setCurrentMoveIndex(0);
    setHighlightSquares({});
  }, [puzzle]);

  const applyMoveHighlight = (from: string, to: string) => {
    setHighlightSquares({
      [from]: { backgroundColor: "rgba(180,180,180,0.25)" },
      [to]: { backgroundColor: "rgba(120,120,120,0.35)" },
    });
  };

  const handleUserMove = ({
                            from,
                            to,
                            promotion,
                          }: {
    from: string;
    to: string;
    promotion?: string;
  }) => {
    if (status !== "playing") return;

    const chess = chessRef.current;
    const expected = puzzle.solutionMoves[currentMoveIndex];
    const played = from + to + (promotion ?? "");

    if (played !== expected) {
      applyMoveHighlight(from, to);
      setStatus("lost");
      return;
    }

    const move = chess.move({ from, to, promotion });
    if (!move) {
      setStatus("lost");
      return;
    }

    applyMoveHighlight(from, to);

    let next = currentMoveIndex + 1;

    if (next < puzzle.solutionMoves.length) {
      const opp = puzzle.solutionMoves[next];
      const oFrom = opp.slice(0, 2);
      const oTo = opp.slice(2, 4);
      const oPromotion = opp.length === 5 ? opp[4] : undefined;

      setTimeout(() => {
        chess.move({ from: oFrom, to: oTo, promotion: oPromotion });
        applyMoveHighlight(oFrom, oTo);
        setGame(new Chess(chess.fen()));
      }, 350);

      next++;
    }

    setGame(new Chess(chess.fen()));
    setCurrentMoveIndex(next);

    if (next >= puzzle.solutionMoves.length) {
      setStatus("won");
    }
  };

  const resetPuzzle = () => {
    const chess = new Chess();
    chess.load(puzzle.fen);

    chessRef.current = chess;
    setGame(chess);
    setStatus("playing");
    setCurrentMoveIndex(0);
    setHighlightSquares({});
  };

  const showHint = () => {
    if (status !== "playing") return;
    const move = puzzle.solutionMoves[currentMoveIndex];
    applyMoveHighlight(move.slice(0, 2), move.slice(2, 4));
  };

  const progress = currentMoveIndex / puzzle.solutionMoves.length;

  return (
    <div className="flex flex-col lg:flex-row gap-12 items-start justify-center py-10 px-6">

      {/* Board */}
      <ChessGameBoard
        key={puzzle.id}
        game={game}
        fen={game.fen()}
        onUserMove={handleUserMove}
        boardOrientation={puzzle.sideToMove}
        canPlayerMove={status === "playing"}
        customSquareStyles={highlightSquares}
      />

      {/* Minimal Side Panel */}
      <div className="w-80 space-y-6">

        <div className="space-y-2">
          <h2 className="text-lg font-semibold tracking-wide">
            Puzzle
          </h2>

          <div className="h-1 bg-neutral-700 rounded">
            <div
              className="h-1 bg-neutral-300 rounded transition-all"
              style={{ width: `${progress * 100}%` }}
            />
          </div>

          <p className="text-sm text-neutral-400">
            Move {Math.floor(currentMoveIndex / 2)} /{" "}
            {Math.ceil(puzzle.solutionMoves.length / 2)}
          </p>
        </div>

        {status === "playing" && (
          <p className="text-neutral-300">
            Find the best move.
          </p>
        )}

        {status === "won" && (
          <p className="text-neutral-100 font-medium">
            Puzzle solved.
          </p>
        )}

        {status === "lost" && (
          <p className="text-neutral-400">
            Incorrect. Try again.
          </p>
        )}

        <div className="flex flex-col gap-3 pt-4">

          <button
            onClick={resetPuzzle}
            className="border border-neutral-600 hover:border-neutral-400 transition py-2 text-sm tracking-wide"
          >
            Reset
          </button>

          {status === "playing" && (
            <button
              onClick={showHint}
              className="border border-neutral-700 hover:border-neutral-500 transition py-2 text-sm tracking-wide"
            >
              Hint
            </button>
          )}

          <button
            onClick={onSkip}
            className="border border-neutral-700 hover:border-neutral-500 transition py-2 text-sm tracking-wide"
          >
            Skip →
          </button>

        </div>
      </div>
    </div>
  );
};