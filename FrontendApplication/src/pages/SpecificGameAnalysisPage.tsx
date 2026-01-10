import {useParams} from "react-router-dom";
import {useGetGameDataQuery} from "../app/state/api/GameApi.ts";
import {LoadingElement} from "../components/LoadingElement.tsx";
import {NotFoundPage} from "./NotFoundPage.tsx";
import {AnalysisPage} from "./AnalysisPage.tsx";
import {useSelector} from "react-redux";
import {RootState} from "../app/state/store.ts";

export const SpecificGameAnalysisPage = () => {
  const {id} = useParams();
  const gameID: string = id as string;

  const player = useSelector((state: RootState) => state.playerReducer.player!);
  const {data, isLoading, isError} = useGetGameDataQuery(gameID);

  if (isLoading) return <LoadingElement />;
  if (isError) return <NotFoundPage />;

  const getBoardOrientation = (): "white" | "black" => {
    if (player && data!.whitePlayer && data!.whitePlayer.uuid === player.uuid) {
      return "white"
    } else if (player && data!.blackPlayer && data!.blackPlayer.uuid === player.uuid) {
      return "black"
    }
    return "white"
  }

  return (
    <>
      <AnalysisPage fens={data?.history} boardOrientation={getBoardOrientation()} />
    </>
  )
}