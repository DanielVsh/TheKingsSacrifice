import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useSetAtom } from "jotai";

import { useGetPlayerDataQuery } from "../app/state/api/PlayerApi.ts";
import { useGetGamesDataQuery } from "../app/state/api/GameApi.ts";
import { setPlayer } from "../app/state/reducers/PlayerReducer.ts";
import { LoadingElement } from "../components/LoadingElement.tsx";
import { GameResponse } from "../app/interfaces/IGame.ts";
import { useGameDatabase } from "@/hooks/useGameDatabase.ts";
import { boardOrientationAtom } from "@/sections/analysis/states.ts";
import { getGameFromPgn } from "@/lib/chess.ts";

const resultStyle: Record<string, string> = {
  CHECKMATE:        "text-emerald-400 bg-emerald-400/10 border-emerald-500/30",
  RESIGNATION:      "text-emerald-400 bg-emerald-400/10 border-emerald-500/30",
  TIMEOUT:          "text-red-400    bg-red-400/10    border-red-500/30",
  DRAW_AGREEMENT:   "text-slate-400  bg-slate-400/10  border-slate-500/30",
  STALEMATE:        "text-slate-400  bg-slate-400/10  border-slate-500/30",
};

const modeStyle: Record<string, string> = {
  BULLET: "text-red-400    bg-red-400/10    border-red-500/30",
  BLITZ:  "text-amber-400  bg-amber-400/10  border-amber-500/30",
  RAPID:  "text-blue-400   bg-blue-400/10   border-blue-500/30",
};

export const DashboardPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const setBoardOrientation = useSetAtom(boardOrientationAtom);
  const { addGame, getGame } = useGameDatabase();

  const [page, setPage] = useState(0);
  const size = 10;

  const { data: playerData, error: playerError, isLoading: playerLoading } = useGetPlayerDataQuery();
  const { data: gamesData, error: gamesError, isLoading: gamesLoading, isFetching } =
    useGetGamesDataQuery({ page, size, sort: "finishedAt,desc" });

  useEffect(() => {
    if (playerData) dispatch(setPlayer(playerData));
  }, [playerData, dispatch]);

  if (playerLoading || gamesLoading) return <LoadingElement />;
  if (playerError || gamesError) return (
    <div className="flex items-center justify-center min-h-[40vh] text-red-400 text-sm">
      Failed to load data. Please try again.
    </div>
  );

  const formatDuration = (ms: number) => {
    const totalSec = Math.floor(ms / 1000);
    const min = Math.floor(totalSec / 60);
    const sec = totalSec % 60;
    return `${min}:${sec.toString().padStart(2, "0")}`;
  };

  const handleAnalysisGame = async (game: GameResponse, isPlayerWhite: boolean) => {
    if (!game.pgn) return;
    const gameToAdd = getGameFromPgn(game.pgn);
    if (!(await getGame(game.uuid))) await addGame(gameToAdd, game.uuid);
    setBoardOrientation(isPlayerWhite);
    navigate("/analysis?gameId=" + game.uuid);
  };

  const handlePrev = () => !gamesData?.first && setPage((p) => p - 1);
  const handleNext = () => !gamesData?.last && setPage((p) => p + 1);

  return (
    <div className="p-4 md:p-6 text-slate-200 space-y-6 max-w-6xl mx-auto">

      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <span className="text-2xl">♜</span>
          <h1 className="font-serif text-2xl md:text-3xl font-black text-white">Game History</h1>
        </div>
        <p className="text-slate-500 text-sm ml-9">
          {gamesData?.totalElements ?? 0} games played
        </p>
      </div>

      {/* ── Desktop Table ─────────────────────────────────────── */}
      <div className="hidden md:block rounded-xl border border-slate-800 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
          <tr className="bg-slate-800/60 border-b border-slate-700/60">
            {["White", "Black", "Result", "Mode", "Moves", "Duration", "Rating Δ", "Date", ""].map((h) => (
              <th
                key={h}
                className={`px-4 py-3 text-[0.65rem] uppercase tracking-[0.12em] font-mono text-slate-500 ${
                  h === "White" || h === "Black" ? "text-left" :
                    h === "Date" || h === "" ? "text-right" : "text-center"
                }`}
              >
                {h}
              </th>
            ))}
          </tr>
          </thead>
          <tbody>
          {gamesData?.content.map((game: GameResponse) => {
            const isPlayerWhite = game.whitePlayer?.uuid === playerData?.uuid;
            const isWhiteWon = game.winner?.uuid === game.whitePlayer?.uuid;
            const isBlackWon = game.winner?.uuid === game.blackPlayer?.uuid;
            const movesCount = Math.floor(game.history.length / 2);
            const duration = game.finishedAt && game.createdAt
              ? formatDuration(new Date(game.finishedAt).getTime() - new Date(game.createdAt).getTime())
              : "—";
            const ratingDelta = isPlayerWhite ? game.whiteRatingDelta : game.blackRatingDelta;

            return (
              <tr
                key={game.uuid}
                className="border-t border-slate-800/60 hover:bg-slate-800/40 transition-colors group"
              >
                {/* White */}
                <td className="px-4 py-3 font-medium text-slate-200">
                  <div className="flex items-center gap-2">
                      <span className={isPlayerWhite ? "text-white font-semibold" : "text-slate-400"}>
                        {isPlayerWhite ? "You" : game.whitePlayer?.nickname}
                      </span>
                    {isWhiteWon && <span className="text-amber-400 text-xs">♔</span>}
                  </div>
                </td>

                {/* Black */}
                <td className="px-4 py-3 font-medium">
                  <div className="flex items-center gap-2">
                      <span className={!isPlayerWhite ? "text-white font-semibold" : "text-slate-400"}>
                        {!isPlayerWhite ? "You" : game.blackPlayer?.nickname}
                      </span>
                    {isBlackWon && <span className="text-amber-400 text-xs">♔</span>}
                  </div>
                </td>

                {/* Result */}
                <td className="px-4 py-3 text-center">
                  <Badge className={resultStyle[game.gameResult] ?? "text-slate-400 bg-slate-800 border-slate-700"}>
                    {game.gameResult?.replace("_", " ")}
                  </Badge>
                </td>

                {/* Mode */}
                <td className="px-4 py-3 text-center">
                  <Badge className={modeStyle[game.gameMode] ?? "text-slate-400 bg-slate-800 border-slate-700"}>
                    {game.gameMode}
                  </Badge>
                </td>

                {/* Moves */}
                <td className="px-4 py-3 text-center">
                  <span className="font-mono text-slate-300 text-xs">{movesCount}</span>
                </td>

                {/* Duration */}
                <td className="px-4 py-3 text-center">
                  <span className="font-mono text-slate-400 text-xs">{duration}</span>
                </td>

                {/* Rating delta */}
                <td className="px-4 py-3 text-center">
                    <span className={`font-mono text-xs font-bold ${ratingDelta >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                      {ratingDelta >= 0 ? `+${ratingDelta}` : ratingDelta}
                    </span>
                </td>

                {/* Date */}
                <td className="px-4 py-3 text-right text-slate-500 text-xs font-mono">
                  {new Date(game.finishedAt ?? game.createdAt).toLocaleDateString()}
                </td>

                {/* Analyze */}
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => handleAnalysisGame(game, isPlayerWhite)}
                    className="px-3 py-1.5 rounded-lg border border-blue-700/40 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 text-xs font-mono font-semibold transition-all opacity-0 group-hover:opacity-100"
                  >
                    Analyze
                  </button>
                </td>
              </tr>
            );
          })}
          </tbody>
        </table>
      </div>

      {/* ── Mobile Cards ──────────────────────────────────────── */}
      <div className="md:hidden space-y-3">
        {gamesData?.content.map((game: GameResponse) => {
          const isPlayerWhite = game.whitePlayer?.uuid === playerData?.uuid;
          const isWhiteWon = game.winner?.uuid === game.whitePlayer?.uuid;
          const isBlackWon = game.winner?.uuid === game.blackPlayer?.uuid;
          const movesCount = Math.floor(game.history.length / 2);
          const duration = game.finishedAt && game.createdAt
            ? formatDuration(new Date(game.finishedAt).getTime() - new Date(game.createdAt).getTime())
            : "—";
          const ratingDelta = isPlayerWhite ? game.whiteRatingDelta : game.blackRatingDelta;

          return (
            <div
              key={game.uuid}
              className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-3"
            >
              {/* Players row */}
              <div className="flex items-center gap-2 text-sm">
                <span className={`font-semibold ${isPlayerWhite ? "text-white" : "text-slate-400"}`}>
                  {isPlayerWhite ? "You" : game.whitePlayer?.nickname}
                  {isWhiteWon && " ♔"}
                </span>
                <span className="text-slate-600 font-serif">vs</span>
                <span className={`font-semibold ${!isPlayerWhite ? "text-white" : "text-slate-400"}`}>
                  {!isPlayerWhite ? "You" : game.blackPlayer?.nickname}
                  {isBlackWon && " ♔"}
                </span>
                <span className={`ml-auto font-mono text-xs font-bold ${ratingDelta >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                  {ratingDelta >= 0 ? `+${ratingDelta}` : ratingDelta}
                </span>
              </div>

              {/* Badges row */}
              <div className="flex flex-wrap items-center gap-2">
                <Badge className={resultStyle[game.gameResult] ?? "text-slate-400 bg-slate-800 border-slate-700"}>
                  {game.gameResult?.replace("_", " ")}
                </Badge>
                <Badge className={modeStyle[game.gameMode] ?? "text-slate-400 bg-slate-800 border-slate-700"}>
                  {game.gameMode}
                </Badge>
                <span className="text-xs text-slate-500 font-mono">{movesCount} moves</span>
                <span className="text-xs text-slate-500 font-mono">{duration}</span>
                <span className="text-xs text-slate-600 font-mono ml-auto">
                  {new Date(game.finishedAt ?? game.createdAt).toLocaleDateString()}
                </span>
              </div>

              {/* Analyze button */}
              <button
                onClick={() => handleAnalysisGame(game, isPlayerWhite)}
                className="w-full py-2 rounded-lg border border-blue-700/40 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 text-xs font-mono font-semibold transition-all"
              >
                Analyze →
              </button>
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between pt-2 text-sm">
        <button
          onClick={handlePrev}
          disabled={gamesData?.first || isFetching}
          className="px-4 py-2 rounded-xl border border-slate-700 hover:border-slate-500 bg-slate-800/50 hover:bg-slate-800 text-slate-300 text-xs font-mono transition-all disabled:opacity-30 disabled:cursor-not-allowed"
        >
          ← Prev
        </button>

        <span className="text-xs text-slate-500 font-mono">
          {gamesData!.number + 1} / {gamesData?.totalPages}
        </span>

        <button
          onClick={handleNext}
          disabled={gamesData?.last || isFetching}
          className="px-4 py-2 rounded-xl border border-slate-700 hover:border-slate-500 bg-slate-800/50 hover:bg-slate-800 text-slate-300 text-xs font-mono transition-all disabled:opacity-30 disabled:cursor-not-allowed"
        >
          Next →
        </button>
      </div>

    </div>
  );
};

const Badge: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = "" }) => (
  <span className={`inline-flex items-center px-2 py-0.5 rounded-md border text-[0.65rem] font-mono uppercase tracking-wide ${className}`}>
    {children}
  </span>
);