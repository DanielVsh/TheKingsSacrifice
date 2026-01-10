import {LoadingElement} from "../components/LoadingElement.tsx";
import {useGetGamesDataQuery} from "../app/state/api/GameApi.ts";
import {Link} from "react-router-dom";

export const ProfilePage = () => {

  const {data, error, isLoading} = useGetGamesDataQuery({
    page: 0,
    size: 10,
    sort: 'finishedAt,desc',
  });

  if (isLoading) return <LoadingElement/>;
  if (error) return <div>Error loading data.</div>;


  return (
    <>
      <div>
        <h2>Games</h2>

        {data?.content.map(game => (
          <div key={game.uuid} className={`flex items-center gap-2`}>
            <div className={`${game.whitePlayer?.uuid === game.winner?.uuid ? 'text-green-600' : 'text-red-600'}`}>
              {game.whitePlayer?.nickname}
            </div>
            <span>vs</span>
            <div className={`${game.blackPlayer?.uuid === game.winner?.uuid ? 'text-green-600' : 'text-red-600'}`}>
              {game.blackPlayer?.nickname}
            </div>
            <span>– {game.gameResult}</span>
            <Link to={`/game/${game.uuid}`} className={`flex items-center gap-2`}>View Game</Link>
          </div>
        ))}

        <div className="flex gap-2 mt-4">
          <button disabled={data?.first}>Prev</button>
          <span>
        Page {data?.number! + 1} / {data?.totalPages}
      </span>
          <button disabled={data?.last}>Next</button>
        </div>
      </div>
    </>
  )
}