import { LoadingElement } from "../components/LoadingElement.tsx";
import { NotFoundPage } from "./NotFoundPage.tsx";
import { useGetPuzzlesDataQuery } from "../app/state/api/PuzzleApi.ts";
import { Link } from "react-router-dom";
import { Chessboard } from "react-chessboard";

export const PuzzlePage = () => {
  const { data, isError, isLoading } = useGetPuzzlesDataQuery({});

  if (isLoading) return <LoadingElement />;
  if (isError) return <NotFoundPage />;

  const content = data!.content;

  return (
    <div className="py-10 px-6 max-w-5xl mx-auto text-neutral-200">

      <div className="mb-8">
        <h2 className="text-2xl font-semibold tracking-wide">
          Puzzles
        </h2>
        <div className="mt-2 h-px bg-neutral-800" />
      </div>

      <div className="space-y-4">
        {content.map((puzzle) => (
          <div
            key={puzzle.id}
            className="flex items-center gap-6 border border-neutral-800 hover:border-neutral-600 transition p-4"
          >
            {/* Board preview */}
            <div className="w-24 h-24 shrink-0 overflow-hidden border border-neutral-700">
              <Chessboard
                position={puzzle.fen}
                arePiecesDraggable={false}
                boardOrientation={puzzle.sideToMove}
                customBoardStyle={{ borderRadius: "4px" }}
                customDarkSquareStyle={{ backgroundColor: "#6b6b6b" }}
                customLightSquareStyle={{ backgroundColor: "#f0f0f0" }}
              />
            </div>

            {/* Info */}
            <div className="flex-1 space-y-2">

              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-base font-medium text-neutral-100">
                  {puzzle.theme}
                </span>

                <span className="text-xs border border-neutral-700 px-2 py-0.5 text-neutral-400">
                  {puzzle.movesToSolve} moves
                </span>

                <span className="text-xs border border-neutral-700 px-2 py-0.5 text-neutral-400">
                  {puzzle.sideToMove === "white"
                    ? "White to move"
                    : "Black to move"}
                </span>
              </div>

              <div className="flex items-center gap-6 text-sm text-neutral-400">
                <span>
                  Difficulty: {puzzle.difficulty}
                </span>

                <span>
                  Eval: {puzzle.evaluation > 0
                  ? `+${puzzle.evaluation}`
                  : puzzle.evaluation}
                </span>

                <span>
                  {new Date(puzzle.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Action */}
            <Link
              to={`/puzzle/${puzzle.id}`}
              className="border border-neutral-600 hover:border-neutral-400 transition px-4 py-2 text-sm tracking-wide"
            >
              Solve →
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};