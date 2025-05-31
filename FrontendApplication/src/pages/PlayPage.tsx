import {useParams} from "react-router-dom";
import {PlayComponent} from "../components/PlayComponent.tsx";
import {LoadingElement} from "../components/LoadingElement.tsx";
import {NotFoundPage} from "./NotFoundPage.tsx";
import {useEffect, useState} from "react";
import {WaitingRoomPage} from "./WaitingRoomPage.tsx";
import GameResultModal from "../modals/GameResultModal.tsx";
import {useGetGameDataQuery} from "../app/state/api/GameApi.ts";
import {useSelector} from "react-redux";
import {RootState} from "../app/state/store.ts";
import {determineGameResult} from "../services/GameService.ts";
import {GameResult} from "../app/enums/GameResult.ts";
import {useUpdatePlayerMutation} from "../app/state/api/PlayerApi.ts";
import {EloService} from "../services/EloService.ts";

export const PlayPage = () => {
  const {id} = useParams();
  const gameID: string = id as string;
  const player = useSelector((state: RootState) => state.playerReducer.player !!);

  const [updatePlayer] = useUpdatePlayerMutation();

  const [isResultModalOpen, setIsResultModalOpen] = useState(false);

  const {data, isLoading, isError, refetch} = useGetGameDataQuery(gameID)
  const gameResult = data && determineGameResult(data, player);

  useEffect(() => {
    if (gameResult !== GameResult.ONGOING && !isResultModalOpen) {
      setIsResultModalOpen(true);
    }

  }, [data]);

  useEffect(() => {
    if (gameResult && gameResult !== GameResult.ONGOING && data?.whitePlayer && data.blackPlayer) {
      const {newWhiteRating, newBlackRating} = eloService.calculateNewRatings(
        data.whitePlayer.rating,
        data.blackPlayer.rating,
        gameResult
      );

      updatePlayer({uuid: data.whitePlayer.uuid, rating: newWhiteRating});
      updatePlayer({uuid: data.blackPlayer.uuid, rating: newBlackRating});
    }
  }, [gameResult])

  const eloService = new EloService();

  if (isLoading) return <LoadingElement/>
  if (isError) return <NotFoundPage/>

  return (
    <>
      {data?.whitePlayer && data?.blackPlayer
        ? data && <PlayComponent {...data} refetch={refetch} />
        : data && <WaitingRoomPage {...data} />
      }

      {gameResult && gameResult !== GameResult.ONGOING && (
        <GameResultModal
          isOpen={isResultModalOpen}
          result={gameResult}
          onClose={() => setIsResultModalOpen(false)}
        />
      )}
    </>
  )
};