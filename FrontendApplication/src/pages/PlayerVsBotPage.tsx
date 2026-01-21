import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Chess } from 'chess.js';
import { ChessGameBoard } from "../components/ChessGameBoard.tsx";
import { Bot } from "../components/BotSelector.tsx";
import {createStockfish} from "../engine/stockfish.ts";

interface PlayerVsBotProps {
  bot: Bot;
  playerColor: 'white' | 'black';
}

export const PlayerVsBotPage: React.FC<PlayerVsBotProps> = (props) => {
  const [game, setGame] = useState(() => new Chess());
  const stockfishRef = useRef<Worker | null>(null);

  const playerTurn =
    (props.playerColor === 'white' && game.turn() === 'w') ||
    (props.playerColor === 'black' && game.turn() === 'b');

  const updateGame = useCallback((updater: (g: Chess) => void) => {
    setGame((prev) => {
      const copy = new Chess(prev.fen());
      updater(copy);
      return copy;
    });
  }, []);

  useEffect(() => {
    const worker = createStockfish();
    stockfishRef.current = worker;

    worker.onmessage = (event) => {
      const line = typeof event.data === 'object' ? event.data?.text : event.data;
      console.log('[SF]', line);

      if (line?.startsWith('bestmove')) {
        const bestMove = line.split(' ')[1];
        if (bestMove && bestMove !== '(none)') {
          updateGame((g) =>
            g.move({
              from: bestMove.slice(0, 2),
              to: bestMove.slice(2, 4),
              promotion: 'q',
            })
          );
        }
      }
    };

    worker.postMessage('uci');
    worker.postMessage(`setoption name UCI_LimitStrength value true`);
    worker.postMessage(`setoption name UCI_Elo value ${props.bot.elo}`);
    worker.postMessage('isready');
    worker.postMessage('ucinewgame');

    return () => worker.terminate();
  }, [props.bot.elo, updateGame]);

  const makeStockfishMove = useCallback(() => {
    if (stockfishRef.current && !game.isGameOver()) {
      stockfishRef.current.postMessage(`position fen ${game.fen()}`);
      stockfishRef.current.postMessage('go movetime 200');
    }
  }, [game]);

  const handleUserMove = useCallback(() => {
    if (!game.isGameOver()) {
      makeStockfishMove();
    }
  }, [game, makeStockfishMove]);

  return (
    <div className="w-full flex flex-col items-center justify-center text-white">
      <div className="mb-4 w-full max-w-md">
        <label className="block mb-2">
          {props.bot.name} ELO: {props.bot.elo}
        </label>
      </div>

      <ChessGameBoard
        game={game}
        onUserMove={handleUserMove}
        boardOrientation={props.playerColor}
        canPlayerMove={playerTurn}
      />
    </div>
  );
};
