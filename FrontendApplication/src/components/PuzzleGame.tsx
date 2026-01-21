import React, { useState, useEffect } from "react";
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

  useEffect(() => {
    const chess = new Chess();
    chess.load(puzzle.fen);
    setGame(chess);
    setLastFen(puzzle.fen);
    setStatus("playing");
    setCurrentMoveIndex(0);
  }, [puzzle]);

  // Wrapper that validates moves without modifying the chessboard directly
  const handleUserMove = (fen: string) => {
    if (status !== "playing") return;

    const chess = new Chess(lastFen); // previous position
    const moves = chess.moves({ verbose: true });

    // Find which move results in the new FEN
    const userMove = moves.find((m) => {
      const temp = new Chess(lastFen);
      temp.move(m);
      return temp.fen() === fen;
    });

    if (!userMove) {
      setStatus("lost"); // illegal move
      return;
    }

    // Convert to LAN/UCI format
    const userMoveUci = userMove.from + userMove.to + (userMove.promotion ?? "");
    const correctMove = puzzle.solutionMoves[currentMoveIndex];

    if (userMoveUci !== correctMove) {
      setStatus("lost"); // wrong move
      return;
    }

    // Apply user move
    chess.move(userMove);
    let nextMoveIndex = currentMoveIndex + 1;

    // Check if user finished the puzzle
    if (nextMoveIndex >= puzzle.solutionMoves.length) {
      setGame(chess);
      setLastFen(chess.fen());
      setStatus("won");
      return;
    }

    // Automatically play opponent move (solutionMoves alternates: user-opponent)
    const opponentMoveUci = puzzle.solutionMoves[nextMoveIndex];
    const from = opponentMoveUci.slice(0, 2);
    const to = opponentMoveUci.slice(2, 4);
    const promotion = opponentMoveUci.length === 5 ? opponentMoveUci[4] : undefined;

    chess.move({ from, to, promotion });
    nextMoveIndex += 1;

    setGame(chess);
    setLastFen(chess.fen());
    setCurrentMoveIndex(nextMoveIndex);

    // If after opponent move we reached the end
    if (nextMoveIndex >= puzzle.solutionMoves.length) {
      setStatus("won");
    }
  };



  const resetPuzzle = () => {
    const chess = new Chess();
    chess.load(puzzle.fen);
    setGame(chess);
    setLastFen(puzzle.fen);
    setStatus("playing");
    setCurrentMoveIndex(0);
  };

  return (
    <div className="flex flex-col items-center ">
      <ChessGameBoard
        key={puzzle.id}
        game={game}
        fen={game.fen()}
        onUserMove={handleUserMove}
        boardOrientation={puzzle.sideToMove}
        canPlayerMove={status === "playing"}
      />

      <div className="mt-4 text-center">
        {status === "playing" && <p>Find the best move!</p>}
        {status === "won" && <p className="text-green-600 font-bold">✅ Correct! Puzzle solved!</p>}
        {status === "lost" && (
          <>
            <p className="text-red-600 font-bold">❌ Wrong move!</p>
            <button
              className="mt-2 px-4 py-2 bg-blue-600 text-white rounded"
              onClick={resetPuzzle}
            >
              Try Again
            </button>
          </>
        )}
      </div>
    </div>
  );
};
