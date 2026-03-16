import { LoadingElement } from "../components/LoadingElement.tsx";
import { NotFoundPage } from "./NotFoundPage.tsx";
import { useGetPuzzlesDataQuery } from "../app/state/api/PuzzleApi.ts";
import { Link } from "react-router-dom";
import { Chessboard } from "react-chessboard";

const difficultyStyle: Record<string, string> = {
  EASY:   "text-emerald-400 bg-emerald-400/10 border-emerald-400/30",
  MEDIUM: "text-amber-400  bg-amber-400/10  border-amber-400/30",
  HARD:   "text-red-400    bg-red-400/10    border-red-400/30",
};

export const PuzzlePage = () => {
  const { data, isError, isLoading } = useGetPuzzlesDataQuery({});

  if (isLoading) return <LoadingElement />;
  if (isError) return <NotFoundPage />;

  const content = data!.content;

  return (
    <div className="py-8 px-4 md:px-6 max-w-5xl mx-auto text-slate-200">

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <span className="text-2xl">♞</span>
          <h1 className="font-serif text-2xl md:text-3xl font-black text-white">Puzzles</h1>
        </div>
        <p className="text-slate-500 text-sm ml-9">Sharpen your tactical vision</p>
        <div className="mt-4 h-px bg-slate-800" />
      </div>

      {/* Puzzle list */}
      <div className="space-y-3">
        {content.map((puzzle) => (
          <div
            key={puzzle.id}
            className="group flex flex-col sm:flex-row items-start sm:items-center gap-4 border border-slate-800 hover:border-blue-700/50 bg-slate-900/50 hover:bg-slate-900/80 transition-all duration-200 rounded-xl p-4"
          >
            {/* Board preview */}
            <div className="w-20 h-20 md:w-24 md:h-24 shrink-0 overflow-hidden rounded-lg border border-slate-700/60 group-hover:border-blue-700/40 transition-colors">
              <Chessboard
                position={puzzle.fen}
                arePiecesDraggable={false}
                boardOrientation={puzzle.sideToMove}
                customBoardStyle={{ borderRadius: "6px" }}
                customDarkSquareStyle={{ backgroundColor: "#334155" }}
                customLightSquareStyle={{ backgroundColor: "#94a3b8" }}
              />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0 space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm md:text-base font-semibold text-slate-100">
                  {puzzle.theme}
                </span>
                <span className={`text-[0.65rem] font-mono uppercase tracking-wide px-2 py-0.5 rounded border ${
                  difficultyStyle[puzzle.difficulty] ?? "text-slate-400 bg-slate-800 border-slate-700"
                }`}>
                  {puzzle.difficulty}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Badge>{puzzle.movesToSolve} moves</Badge>
                <Badge>{puzzle.sideToMove === "white" ? "♔ White to move" : "♚ Black to move"}</Badge>
                <Badge>
                  Eval: {puzzle.evaluation > 0 ? `+${puzzle.evaluation}` : puzzle.evaluation}
                </Badge>
                <span className="text-xs text-slate-600">
                  {new Date(puzzle.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Action */}
            <Link
              to={`/puzzle/${puzzle.id}`}
              className="shrink-0 self-end sm:self-auto flex items-center gap-1.5 px-4 py-2 rounded-lg border border-blue-700/40 bg-blue-600/10 hover:bg-blue-600/20 hover:border-blue-600/60 text-blue-400 text-xs font-mono font-semibold uppercase tracking-wide transition-all hover:-translate-y-0.5"
            >
              Solve
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

const Badge: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="text-xs border border-slate-700/60 bg-slate-800/50 px-2 py-0.5 rounded-md text-slate-400">
    {children}
  </span>
);