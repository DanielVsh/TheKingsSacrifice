import {useGetPlayerDataQuery} from "../app/state/api/PlayerApi.ts";
import {setPlayer} from "../app/state/reducers/PlayerReducer.ts";
import {useEffect} from "react";
import {useDispatch} from "react-redux";
import {LoadingElement} from "../components/LoadingElement.tsx";
import {useGetGamesDataQuery} from "../app/state/api/GameApi.ts";
import {Link} from "react-router-dom";
import {GameResponse} from "../app/interfaces/IGame.ts";


export const DashboardPage = () => {
  const dispatch = useDispatch();

  const { data: playerData, error: playerError, isLoading: playerLoading } = useGetPlayerDataQuery();

  const { data: gamesData, error: gamesError, isLoading: gamesLoading } = useGetGamesDataQuery({
    page: 0,
    size: 10,
    sort: 'finishedAt,desc',
  });

  useEffect(() => {
    if (playerData) {
      dispatch(setPlayer(playerData));
    }
  }, [playerData]);

  if (playerLoading || gamesLoading) return <LoadingElement/>;
  if (playerError || gamesError) return <div>Error loading data.</div>;

  function formatDuration(ms: number) {
    const totalSeconds = Math.floor(ms / 1000)
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  return (
    <div className="p-6 text-slate-200">
      <h2 className="text-xl font-semibold mb-4">Games</h2>

      <div className="overflow-hidden rounded-xl border border-slate-800">
        <table className="w-full text-sm">
          <thead className="bg-slate-800/60 text-slate-400">
          <tr>
            <th className="px-4 py-2 text-left">White</th>
            <th className="px-4 py-2 text-left">Black</th>
            <th className="px-4 py-2 text-center">Result</th>
            <th className="px-4 py-2 text-center">Mode</th>
            <th className="px-4 py-2 text-center">Moves</th>
            <th className="px-4 py-2 text-center">Duration</th>
            <th className="px-4 py-2 text-center">Rating</th>
            <th className="px-4 py-2 text-right">Date</th>
            <th className="px-4 py-2"></th>
          </tr>
          </thead>

          <tbody>
          {gamesData?.content.map((game: GameResponse) => {
            const isPlayerWhite = game.whitePlayer?.uuid === playerData?.uuid
            // const isWhiteWin = game.whitePlayer?.uuid === game.winner?.uuid
            const isPlayerWon = game.winner?.uuid === playerData?.uuid

            const movesCount = Math.floor(game.history.length / 2)

            const duration =
              game.finishedAt && game.createdAt
                ? formatDuration(
                  new Date(game.finishedAt).getTime() -
                  new Date(game.createdAt).getTime()
                )
                : "—"

            const ratingReached = isPlayerWhite ? game.whiteRatingDelta : game.blackRatingDelta

            return (
              <tr
                key={game.uuid}
                className="border-t border-slate-800 hover:bg-slate-800/40 transition"
              >
                <td className={`px-4 py-2 font-medium`}>
                  {game.winner && isPlayerWon ? "👑" : ""}{isPlayerWhite ? "You" : game.whitePlayer?.nickname}
                </td>

                <td className={`px-4 py-2 font-medium`}>
                  {game.winner && !isPlayerWon ? "👑" : ""}{!isPlayerWhite ? "You" : game.blackPlayer?.nickname}
                </td>

                <td className="px-4 py-2 text-center">
                    <span className="rounded-md bg-slate-700 px-2 py-0.5 text-xs">
                      {game.gameResult}
                    </span>
                </td>
                <td className="px-4 py-2 text-center">
                    <span className="rounded-md bg-slate-700 px-2 py-0.5 text-xs">
                      {game.gameMode}
                    </span>
                </td>

                <td className="px-4 py-2 text-center text-slate-300">
                  {movesCount}
                </td>

                <td className="px-4 py-2 text-center text-slate-300">
                  {duration}
                </td>

                <td className={`px-4 py-2 text-center text-amber-400 font-medium ${ratingReached >= 0 ? "text-green-400" : "text-red-400"}`}>
                  {ratingReached >= 0 ? `${"+" + ratingReached}` : `${ratingReached}`}
                </td>

                <td className="px-4 py-2 text-right text-slate-400">
                  {new Date(game.finishedAt ?? game.createdAt).toLocaleDateString()}
                </td>

                <td className="px-4 py-2 text-right">
                  <Link
                    to={`/game/${game.uuid}`}
                    className="text-blue-400 hover:text-blue-300"
                  >
                    View
                  </Link>
                </td>
              </tr>
            )
          })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4 text-sm">
        <button
          disabled={gamesData?.first}
          className="px-3 py-1 rounded-md bg-slate-800 disabled:opacity-40"
        >
          Prev
        </button>

        <span className="text-slate-400">
          Page {gamesData!.number + 1} / {gamesData?.totalPages}
        </span>

        <button
          disabled={gamesData?.last}
          className="px-3 py-1 rounded-md bg-slate-800 disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  )

}