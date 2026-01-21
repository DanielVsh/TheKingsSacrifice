import {LoadingElement} from "../components/LoadingElement.tsx";
import {NotFoundPage} from "./NotFoundPage.tsx";
import {useGetPuzzleDataQuery} from "../app/state/api/PuzzleApi.ts";
import {useParams} from "react-router-dom";
import {PuzzleGame} from "../components/PuzzleGame.tsx";
import {PuzzleResponse} from "../app/interfaces/IPuzzle.ts";

export const SpecificPuzzlePage = () => {
  const {id} = useParams();
  const puzzleId: string = id as string;

  const {data, isError, isLoading} = useGetPuzzleDataQuery(puzzleId)

  if (isLoading) return <LoadingElement />;
  if (isError) return <NotFoundPage />;

  const puzzle = data as PuzzleResponse
  return (
    <>
      <PuzzleGame puzzle={puzzle}/>
    </>
  );
}