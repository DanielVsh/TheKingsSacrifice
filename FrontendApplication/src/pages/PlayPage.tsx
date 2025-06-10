import {useParams} from "react-router-dom";
import {useEffect, useMemo, useState} from "react";
import {useSelector} from "react-redux";
import {RootState} from "../app/state/store.ts";
import {useGetGameDataQuery} from "../app/state/api/GameApi.ts";
import {useWebSocket} from "../hooks/useWebSocket.ts";

import {PlayComponent} from "../components/PlayComponent.tsx";
import {LoadingElement} from "../components/LoadingElement.tsx";
import {NotFoundPage} from "./NotFoundPage.tsx";
import {WaitingRoomPage} from "./WaitingRoomPage.tsx";
import GameResultModal from "../modals/GameResultModal.tsx";

import {GameResponse} from "../app/interfaces/IGame.ts";
import {GameResult} from "../app/enums/GameResult.ts";
import {determineGameResult} from "../services/GameService.ts";

export const PlayPage = () => {
  const {id} = useParams();
  const gameID: string = id as string;

  const player = useSelector((state: RootState) => state.playerReducer.player!);
  const [gameResponse, setGameResponse] = useState<GameResponse | null>(null);
  const [hasShownResultModal, setHasShownResultModal] = useState(false);
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);

  const {data, isLoading, isError} = useGetGameDataQuery(gameID);

  // WebSocket subscription
  useWebSocket([
    {
      topic: `/topic/game/${gameID}/finished`,
      handler: (message) => {
        const response = JSON.parse(message) as GameResponse;
        setGameResponse(response);
      }
    }
  ]);

  // Set game data on fetch
  useEffect(() => {
    if (data) setGameResponse(data);
  }, [data]);

  // Calculate game result (memoized)
  const gameResult = useMemo(() => {
    return gameResponse ? determineGameResult(gameResponse, player) : null;
  }, [gameResponse, player]);

  // Show result modal if game finished
  useEffect(() => {
    if (
      gameResult &&
      gameResult !== GameResult.ONGOING &&
      !hasShownResultModal
    ) {
      setIsResultModalOpen(true);
      setHasShownResultModal(true);
    }
  }, [gameResult, hasShownResultModal]);

  if (isLoading) return <LoadingElement />;
  if (isError || !gameResponse) return <NotFoundPage />;

  return (
    <>
      {gameResponse.whitePlayer && gameResponse.blackPlayer ? (
        <PlayComponent {...gameResponse} />
      ) : (
        <WaitingRoomPage {...gameResponse} />
      )}

      {gameResult && gameResult !== GameResult.ONGOING && (
        <GameResultModal
          isOpen={isResultModalOpen}
          result={gameResult}
          onClose={() => setIsResultModalOpen(false)}
        />
      )}
    </>
  );
};
