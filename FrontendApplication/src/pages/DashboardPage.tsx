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

export const DashboardPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const setBoardOrientation = useSetAtom(boardOrientationAtom);
  const { addGame, getGame } = useGameDatabase();

  const [page, setPage] = useState(0);
  const size = 10;

  const { data: playerData, error: playerError, isLoading: playerLoading } =
    useGetPlayerDataQuery();

  const {
    data: gamesData,
    error: gamesError,
    isLoading: gamesLoading,
    isFetching,
  } = useGetGamesDataQuery({ page, size, sort: "finishedAt,desc" });

  useEffect(() => {
    if (playerData) dispatch(setPlayer(playerData));
  }, [playerData, dispatch]);

  if (playerLoading || gamesLoading) return <LoadingElement />;
  if (playerError || gamesError) return <div>Error loading data.</div>;

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

  const handlePrev = () => !gamesData?.first && setPage((prev) => prev - 1);
  const handleNext = () => !gamesData?.last && setPage((prev) => prev + 1);

  return (
    <div className="p-6 text-white space-y-6">
      <h2 className="text-xl font-semibold mb-6 tracking-wide">Games</h2>

      <div className="overflow-hidden rounded-none border border-white/20">
        <table className="w-full text-sm">
          <thead className="bg-white/10 text-white uppercase text-xs tracking-wider">
          <tr>
            <th className="px-4 py-3 text-left">White</th>
            <th className="px-4 py-3 text-left">Black</th>
            <th className="px-4 py-3 text-center">Result</th>
            <th className="px-4 py-3 text-center">Mode</th>
            <th className="px-4 py-3 text-center">Moves</th>
            <th className="px-4 py-3 text-center">Duration</th>
            <th className="px-4 py-3 text-center">Rating</th>
            <th className="px-4 py-3 text-right">Date</th>
            <th className="px-4 py-3"></th>
          </tr>
          </thead>

          <tbody>
          {gamesData?.content.map((game: GameResponse) => {
            const isPlayerWhite = game.whitePlayer?.uuid === playerData?.uuid;
            const isWhiteWon = game.winner?.uuid === game.whitePlayer?.uuid;
            const isBlackWon = game.winner?.uuid === game.blackPlayer?.uuid;
            const movesCount = Math.floor(game.history.length / 2);
            const duration =
              game.finishedAt && game.createdAt
                ? formatDuration(
                  new Date(game.finishedAt).getTime() -
                  new Date(game.createdAt).getTime()
                )
                : "—";
            const ratingDelta = isPlayerWhite
              ? game.whiteRatingDelta
              : game.blackRatingDelta;

            return (
              <tr
                key={game.uuid}
                className="border-t border-white/20 hover:bg-white/10 transition-colors"
              >
                <td className="px-4 py-3 font-medium">
                  {isPlayerWhite ? "You" : game.whitePlayer?.nickname}
                  {isWhiteWon && <span className="ml-2 text-amber-400">♔</span>}
                </td>
                <td className="px-4 py-3 font-medium">
                  {!isPlayerWhite ? "You" : game.blackPlayer?.nickname}
                  {isBlackWon && <span className="ml-2 text-amber-400">♔</span>}
                </td>

                {/* Badges */}
                <td className="px-4 py-3 text-center">
                    <span className="px-2 py-0.5 border border-white/20 rounded text-xs">
                      {game.gameResult}
                    </span>
                </td>
                <td className="px-4 py-3 text-center">
                    <span className="px-2 py-0.5 border border-white/20 rounded text-xs">
                      {game.gameMode}
                    </span>
                </td>
                <td className="px-4 py-3 text-center">
                    <span className="px-2 py-0.5 border border-white/20 rounded text-xs">
                      {movesCount}
                    </span>
                </td>
                <td className="px-4 py-3 text-center">
                    <span className="px-2 py-0.5 border border-white/20 rounded text-xs">
                      {duration}
                    </span>
                </td>
                <td className="px-4 py-3 text-center font-medium">
                    <span
                      className={`px-2 py-0.5 border border-white/20 rounded text-xs ${
                        ratingDelta >= 0 ? "text-green-400" : "text-red-400"
                      }`}
                    >
                      {ratingDelta >= 0 ? `+${ratingDelta}` : ratingDelta}
                    </span>
                </td>

                <td className="px-4 py-3 text-right text-slate-400">
                  {new Date(game.finishedAt ?? game.createdAt).toLocaleDateString()}
                </td>

                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => handleAnalysisGame(game, isPlayerWhite)}
                    className="px-4 py-2 text-sm font-medium border border-white/20 rounded hover:bg-white/10 transition-colors"
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

      {/* Pagination */}
      <div className="flex items-center justify-between mt-6 text-sm text-white">
        <button
          onClick={handlePrev}
          disabled={gamesData?.first || isFetching}
          className="px-3 py-1.5 border border-white/20 rounded hover:bg-white/10 disabled:opacity-40 transition"
        >
          Prev
        </button>
        <span>
          Page {gamesData!.number + 1} / {gamesData?.totalPages}
        </span>
        <button
          onClick={handleNext}
          disabled={gamesData?.last || isFetching}
          className="px-3 py-1.5 border border-white/20 rounded hover:bg-white/10 disabled:opacity-40 transition"
        >
          Next
        </button>
      </div>
    </div>
  );
};