import {LoadingElement} from "../components/LoadingElement.tsx";
import {NotFoundPage} from "./NotFoundPage.tsx";
import {useGetPuzzlesDataQuery} from "../app/state/api/PuzzleApi.ts";
import {Link} from "react-router-dom";
import {Chessboard} from "react-chessboard";

export const PuzzlePage = () => {

  const {data, isError, isLoading} = useGetPuzzlesDataQuery({})

  if (isLoading) return <LoadingElement/>;
  if (isError) return <NotFoundPage/>;

  const content = data!.content;
  return (
    <div className="min- p-6 text-slate-200">
      <h2 className="text-xl font-semibold mb-4">Puzzles</h2>

      <div className="space-y-3">
        {content.map(puzzle => (
          <div
            key={puzzle.id}
            className="flex items-center gap-4 rounded-xl border border-slate-800 p-3 hover:bg-slate-800/40 transition"
          >
            {/* Board preview */}
            <div className="w-24 h-24 rounded-md overflow-hidden border border-slate-700">
              <Chessboard
                position={puzzle.fen}
                arePiecesDraggable={false}
                boardOrientation={puzzle.sideToMove}
                customBoardStyle={{ borderRadius: "6px" }}
                customDarkSquareStyle={{
                  backgroundColor: "#757575"
                }}
                customLightSquareStyle={{
                  backgroundColor: "#FCFCFC"
                }}
              />
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium text-slate-100">
                  {puzzle.theme}
                </span>

                <span className="text-xs rounded-md bg-slate-700 px-2 py-0.5">
                  {puzzle.movesToSolve} moves
                </span>

                <span className="text-xs rounded-md bg-slate-700 px-2 py-0.5">
                  {puzzle.sideToMove === "white" ? "White to move" : "Black to move"}
                </span>
              </div>

              <div className="mt-1 flex items-center gap-3 text-sm text-slate-400">
                <span>
                  Difficulty: <span className="text-amber-400">{puzzle.difficulty}</span>
                </span>

                <span>
                  Eval: {puzzle.evaluation > 0 ? `+${puzzle.evaluation}` : puzzle.evaluation}
                </span>

                <span>
                  {new Date(puzzle.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Action */}
            <Link
              to={`/puzzle/${puzzle.id}`}
              className="rounded-md bg-blue-600/80 px-4 py-2 text-sm font-medium hover:bg-blue-600 transition"
            >
              Solve →
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}