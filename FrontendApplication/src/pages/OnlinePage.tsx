import {useNavigate} from "react-router-dom";
import {useCreateGameMutation} from "../app/state/api/GameApi.ts";
import {useSelector} from "react-redux";
import {RootState} from "../app/state/store.ts";

export const OnlinePage = () => {

  const user = useSelector((state: RootState) => state.playerReducer.player)
  const [createGame] = useCreateGameMutation()
  const navigate = useNavigate()

  const handleCreateGame = () => {
    if(user == null) return;
    createGame({whitePlayer: user.uuid, blackPlayer: null})
      .then(value => {
        if ('data' in value) {
          const valueData = value.data as GameResponse;
          navigate(`/play/online/${valueData.uuid}`, { replace: true });
        }
      })
  }

  return (
    <>
      <div onClick={handleCreateGame} className="text-3xl font-bold underline">
        Create Game
      </div>
    </>
  );
};