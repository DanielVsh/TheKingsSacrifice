import React, { useMemo, useState } from "react";
import { Chess } from "chess.js";
import { ChessGameBoard } from "./ChessGameBoard.tsx";
import { useSaveGameMutation } from "../app/state/api/GameApi.ts";
import { determineGameResult, determineGameState, determineWinner } from "../services/GameService.ts";
import { useSelector } from "react-redux";
import { RootState } from "../app/state/store.ts";
import { useWebSocket } from "../hooks/useWebSocket.ts";
import { createDrawService } from "../services/GameDrawService.ts";
import { GameDrawRequest, GameResponse, GameSaveRequest } from "../app/interfaces/IGame.ts";
import { GameState } from "../app/enums/GameState.ts";
import { motion, AnimatePresence } from "framer-motion";
import { GameResult } from "../app/enums/GameResult.ts";
import { SoundService } from "../services/SoundService.ts";
import { getDurationString } from "../services/DateTimeService.ts";
import { useNavigate } from "react-router-dom";

interface PlayerTime {
  whitePlayerTime: number;
  blackPlayerTime: number;
}

interface PlayComponentProps extends GameResponse {}

let isBeginGameSoundPlayed = false;

export const PlayComponent: React.FC<PlayComponentProps> = (props) => {
  if (props.gameResult === GameState.ONGOING && !isBeginGameSoundPlayed) {
    SoundService.play("game_begin");
    isBeginGameSoundPlayed = true;
  }

  const navigate = useNavigate();
  const [saveGame] = useSaveGameMutation<GameSaveRequest>();
  const [playersTime, setPlayersTime] = useState<PlayerTime>();
  const [showPanel, setShowPanel] = useState(false); // mobile panel toggle

  const player = useSelector((state: RootState) => state.playerReducer.player!!);
  const opponent = props.whitePlayer!.uuid === player!.uuid ? props.blackPlayer!! : props.whitePlayer!!;
  const gameResult = determineGameResult(props, player);

  const [game, setGame] = useState(() => {
    const newGame = new Chess();
    if (props.history && props.history.length > 0) {
      props.history.forEach((uci) => {
        newGame.move({ from: uci.slice(0, 2), to: uci.slice(2, 4), promotion: uci[4] || undefined });
      });
      processGameUpdate(newGame);
    }
    return newGame;
  });

  const { sendMessage } = useWebSocket([
    {
      topic: `/topic/game/${props.uuid}/draw`,
      handler: (message) => {
        const parsed = JSON.parse(message) as GameDrawRequest;
        drawService.handleDrawRequest(parsed);
      },
    },
    {
      topic: `/topic/game/${props.uuid}`,
      handler: (message: string) => {
        setGame((prev) => {
          const newGame = new Chess();
          newGame.loadPgn(prev.pgn());
          const from = message.slice(0, 2);
          const to = message.slice(2, 4);
          const promotion = message[4] || undefined;
          const isValid = newGame.moves({ verbose: true }).some((m) => m.from === from && m.to === to);
          if (!isValid) return prev;
          newGame.move({ from, to, promotion });
          return newGame;
        });
      },
    },
    {
      topic: `/topic/game/${props.uuid}/time`,
      handler: (message) => setPlayersTime(JSON.parse(message) as PlayerTime),
    },
    {
      topic: `/topic/game/${props.uuid}/saved`,
      handler: (message) => setPlayersTime(JSON.parse(message) as GameResponse),
    },
  ]);

  const [pendingDrawRequest, setPendingDrawRequest] = useState<GameDrawRequest | null>(null);
  const drawService = useMemo(
    () =>
      createDrawService({
        player,
        gameId: props.uuid,
        sendMessage,
        onDrawRequested: setPendingDrawRequest,
        onDrawAccepted: () => {
          setPendingDrawRequest(null);
          game.setHeader("Result", "1/2-1/2");
          saveGame({ uuid: props.uuid, winner: null, gameResult: GameState.DRAW_AGREEMENT, pgn: game.pgn() });
        },
        onDrawRejected: () => setPendingDrawRequest(null),
      }),
    [player, props.uuid, sendMessage]
  );

  function sendResignRequest() {
    game.setHeader("Result", getBoardOrientation() === "white" ? "0-1" : "1-0");
    saveGame({ uuid: props.uuid, winner: opponent.uuid, gameResult: GameState.RESIGNATION, pgn: game.pgn() });
  }

  const getBoardOrientation = (): "white" | "black" => {
    if (player && props.whitePlayer?.uuid === player.uuid) return "white";
    if (player && props.blackPlayer?.uuid === player.uuid) return "black";
    return "white";
  };

  const canPlayerMove = (): boolean => {
    if (gameResult !== GameResult.ONGOING) return false;
    if (player && props.whitePlayer && game.turn() === "w" && player.uuid !== props.whitePlayer.uuid) return false;
    if (player && props.blackPlayer && game.turn() === "b" && player.uuid !== props.blackPlayer.uuid) return false;
    return true;
  };

  function processGameUpdate(game: Chess) {
    if (game.isGameOver() || game.isCheckmate()) {
      let gameState = determineGameState(game);
      if (gameState === GameState.ERROR && playersTime) {
        if (playersTime.whitePlayerTime <= 0 || playersTime.blackPlayerTime <= 0) gameState = GameState.TIMEOUT;
      }
      let winner = null;
      if (gameState === GameState.CHECKMATE || gameState === GameState.TIMEOUT) winner = determineWinner(game, props);
      const date = new Date(props.createdAt);
      game.setHeader("Event", props.gameMode.toString());
      game.setHeader("Site", "King's Sacrifice");
      game.setHeader("Round", "-");
      game.setHeader("White", props.whitePlayer?.nickname ?? "?");
      game.setHeader("Black", props.blackPlayer?.nickname ?? "?");
      game.setHeader("Date", `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, "0")}.${String(date.getDate()).padStart(2, "0")}`);
      game.setHeader("Result", game.turn() === "w" ? "0-1" : "1-0");
      saveGame({ uuid: props.uuid, gameResult: gameState, winner: winner?.uuid ?? null, pgn: game.pgn() });
    }
  }

  const handleUserMove = (move: { from: string; to: string; promotion?: string }) => {
    const newGame = new Chess();
    newGame.loadPgn(game.pgn());
    newGame.move(move);
    setGame(newGame);
    sendMessage({ destination: `/game/${props.uuid}/move`, body: move.from + move.to + (move.promotion ?? "") });
    processGameUpdate(game);
  };

  function formatTime(ms: number): string {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    const tenths = Math.floor((ms % 1000) / 100);
    const formattedSec = seconds < 10 ? `0${seconds}` : `${seconds}`;
    const formattedTenths = minutes === 0 && seconds < 10 ? `.${tenths}` : "";
    return `${minutes}:${formattedSec}${formattedTenths}`;
  }

  const opponentTime = getBoardOrientation() === "black" ? playersTime?.whitePlayerTime : playersTime?.blackPlayerTime;
  const playerTime = getBoardOrientation() === "white" ? playersTime?.whitePlayerTime : playersTime?.blackPlayerTime;

  // ── Game Over Screen ──────────────────────────────────────────
  if (gameResult !== GameResult.ONGOING) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] p-4">
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md bg-slate-900 border border-slate-700/60 rounded-2xl overflow-hidden shadow-[0_32px_64px_rgba(0,0,0,0.6)]"
        >
          {/* Accent bar */}
          <div className="h-1 bg-gradient-to-r from-blue-600 via-violet-500 to-blue-600" />

          <div className="p-8 text-center">
            <div className="text-5xl mb-4">
              {gameResult.toString().includes("WIN") ? "♔" : gameResult.toString().includes("DRAW") ? "½" : "♚"}
            </div>
            <h2 className="font-serif text-2xl font-black text-white mb-1">Game Over</h2>
            <p className="text-blue-400 font-mono text-sm mb-6">{gameResult}</p>

            <div className="space-y-2 text-sm mb-8">
              {[
                { label: "White",    value: props.whitePlayer?.nickname },
                { label: "Black",    value: props.blackPlayer?.nickname },
                { label: "Duration", value: getDurationString(props.createdAt, props.finishedAt) },
                { label: "Moves",    value: props.history.length },
              ].map((row) => (
                <div key={row.label} className="flex justify-between px-4 py-2 rounded-lg bg-slate-800/50">
                  <span className="text-slate-400">{row.label}</span>
                  <span className="text-slate-100 font-medium">{row.value}</span>
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => navigate("/dashboard")}
                className="flex-1 py-2.5 rounded-xl border border-slate-700 hover:border-slate-500 bg-slate-800/60 hover:bg-slate-800 text-slate-300 text-sm font-semibold transition-all"
              >
                My Games
              </button>
              <button
                onClick={() => navigate("/play/online")}
                className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-all shadow-[0_4px_20px_rgba(59,130,246,0.3)]"
              >
                Play Again
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // ── Active Game ───────────────────────────────────────────────
  return (
    <div className="flex flex-col lg:flex-row w-full min-h-0 text-white">

      {/* ── Board area ── */}
      <main className="flex-1 flex flex-col items-center justify-start px-2 py-4 lg:py-6">

        {/* Opponent info */}
        <PlayerBar
          nickname={opponent.nickname}
          time={opponentTime !== undefined ? formatTime(opponentTime) : null}
          isTop
        />

        {/* Board */}
        {player && (
          <div className="aspect-square shadow-[0_8px_32px_rgba(0,0,0,0.5)] rounded-lg overflow-hidden border border-slate-700/40 my-2">
            <ChessGameBoard
              game={game}
              onUserMove={handleUserMove}
              boardOrientation={getBoardOrientation()}
              canPlayerMove={canPlayerMove()}
            />
          </div>
        )}

        {/* Player info */}
        <PlayerBar
          nickname={player.nickname}
          time={playerTime !== undefined ? formatTime(playerTime) : null}
          isTop={false}
        />

        {/* Mobile: action buttons below board */}
        <div className="flex gap-2 mt-3 lg:hidden w-full max-w-[560px]">
          <button
            onClick={() => setShowPanel((v) => !v)}
            className="flex-1 py-2 rounded-xl border border-slate-700 bg-slate-800/60 text-slate-300 text-sm font-medium transition-all hover:bg-slate-800"
          >
            {showPanel ? "Hide panel" : "Moves & Chat"}
          </button>
          <button
            onClick={() => drawService.sendDrawRequest({
              fromPlayer: player,
              toPlayer: props?.whitePlayer?.uuid === player.uuid ? props.blackPlayer : props.whitePlayer,
              status: "REQUESTED",
            } as GameDrawRequest)}
            className="px-4 py-2 rounded-xl border border-amber-700/40 bg-amber-600/10 text-amber-400 text-sm font-medium transition-all hover:bg-amber-600/20"
          >
            ½ Draw
          </button>
          <button
            onClick={sendResignRequest}
            className="px-4 py-2 rounded-xl border border-red-700/40 bg-red-600/10 text-red-400 text-sm font-medium transition-all hover:bg-red-600/20"
          >
            ⚐ Resign
          </button>
        </div>

        {/* Mobile: collapsible panel */}
        <AnimatePresence>
          {showPanel && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="w-full max-w-[560px] overflow-hidden mt-2 lg:hidden"
            >
              <SidePanel
                game={game}
                drawService={drawService}
                player={player}
                props={props}
                sendResignRequest={sendResignRequest}
                showActions={false}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* ── Desktop right panel ── */}
      <aside className="hidden lg:flex w-80 xl:w-96 flex-col border-l border-slate-800/60 bg-slate-900/50">
        <SidePanel
          game={game}
          drawService={drawService}
          player={player}
          props={props}
          sendResignRequest={sendResignRequest}
          showActions
        />
      </aside>

      {/* Draw offer toast */}
      <AnimatePresence>
        {pendingDrawRequest && player?.uuid === pendingDrawRequest.toPlayer.uuid && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-6 right-4 left-4 sm:left-auto sm:w-80 z-50 bg-slate-900 border border-slate-700 shadow-[0_16px_40px_rgba(0,0,0,0.5)] rounded-2xl p-5"
          >
            <p className="text-sm text-slate-300 mb-4">
              <span className="font-semibold text-white">{pendingDrawRequest.fromPlayer.nickname ?? "Opponent"}</span>
              {" "}offered a draw.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => drawService.acceptDraw(pendingDrawRequest)}
                className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold transition-all"
              >
                Accept
              </button>
              <button
                onClick={() => drawService.rejectDraw(pendingDrawRequest)}
                className="flex-1 py-2 rounded-xl border border-slate-600 hover:border-slate-500 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold transition-all"
              >
                Decline
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ── Sub-components ────────────────────────────────────────────

const PlayerBar: React.FC<{ nickname: string; time: string | null; isTop: boolean }> = ({ nickname, time, isTop }) => (
  <div className={`flex items-center justify-between w-full max-w-[min(90vw,90vh,560px)] px-1 ${isTop ? "mb-1" : "mt-1"}`}>
    <div className="flex items-center gap-2">
      <div className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-sm">
        {isTop ? "♚" : "♔"}
      </div>
      <span className="text-sm font-semibold text-slate-200">{nickname}</span>
    </div>
    {time && (
      <div className="font-mono text-base font-bold text-slate-100 bg-slate-800/80 border border-slate-700/60 px-3 py-1 rounded-lg tabular-nums">
        {time}
      </div>
    )}
  </div>
);

const SidePanel: React.FC<{
  game: Chess;
  drawService: any;
  player: any;
  props: GameResponse;
  sendResignRequest: () => void;
  showActions: boolean;
}> = ({ game, drawService, player, props, sendResignRequest, showActions }) => {
  const moves = game.history();

  return (
    <div className="flex flex-col gap-3 p-4 h-full">

      {/* Move list */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden">
        <div className="px-4 py-2.5 border-b border-slate-800 flex items-center gap-2">
          <span className="text-xs uppercase tracking-widest text-slate-500 font-mono">Moves</span>
          <span className="ml-auto text-xs text-slate-600 font-mono">{Math.ceil(moves.length / 2)}</span>
        </div>
        <div className="h-36 lg:h-48 overflow-y-auto p-3">
          <div className="grid grid-cols-[auto_1fr_1fr] gap-x-3 gap-y-1 text-sm">
            {Array.from({ length: Math.ceil(moves.length / 2) }, (_, i) => (
              <React.Fragment key={i}>
                <span className="text-slate-600 font-mono text-xs pt-0.5">{i + 1}.</span>
                <span className="text-slate-200 font-mono hover:text-blue-400 cursor-pointer transition-colors">{moves[i * 2]}</span>
                <span className="text-slate-400 font-mono hover:text-blue-400 cursor-pointer transition-colors">{moves[i * 2 + 1] ?? ""}</span>
              </React.Fragment>
            ))}
          </div>
          {moves.length === 0 && (
            <p className="text-xs text-slate-600 text-center mt-4">No moves yet</p>
          )}
        </div>
      </div>

      {/* Chat */}
      <div className="flex-1 flex flex-col rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden min-h-0">
        <div className="px-4 py-2.5 border-b border-slate-800">
          <span className="text-xs uppercase tracking-widest text-slate-500 font-mono">Chat</span>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-2 text-sm min-h-[80px]">
          <ChatMessage name="Player1" text="Good luck!" />
          <ChatMessage name="Player2" text="You too!" />
        </div>
        <div className="p-3 border-t border-slate-800">
          <input
            type="text"
            placeholder="Type a message…"
            className="w-full bg-slate-800/60 border border-slate-700/60 text-slate-200 text-sm px-3 py-2 rounded-lg focus:outline-none focus:border-blue-600/50 placeholder-slate-500 transition-all"
          />
        </div>
      </div>

      {/* Actions — desktop only via showActions, mobile uses inline buttons */}
      {showActions && (
        <div className="flex gap-2">
          <button
            onClick={() => drawService.sendDrawRequest({
              fromPlayer: player,
              toPlayer: props?.whitePlayer?.uuid === player.uuid ? props.blackPlayer : props.whitePlayer,
              status: "REQUESTED",
            } as GameDrawRequest)}
            className="flex-1 py-2.5 rounded-xl border border-amber-700/40 bg-amber-600/10 hover:bg-amber-600/20 text-amber-400 text-sm font-semibold transition-all"
          >
            ½ Draw
          </button>
          <button
            onClick={sendResignRequest}
            className="flex-1 py-2.5 rounded-xl border border-red-700/40 bg-red-600/10 hover:bg-red-600/20 text-red-400 text-sm font-semibold transition-all"
          >
            ⚐ Resign
          </button>
        </div>
      )}
    </div>
  );
};

const ChatMessage: React.FC<{ name: string; text: string }> = ({ name, text }) => (
  <div className="flex gap-2">
    <span className="text-blue-400 font-semibold shrink-0">{name}:</span>
    <span className="text-slate-300">{text}</span>
  </div>
);