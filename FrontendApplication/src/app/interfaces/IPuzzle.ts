export interface PuzzleResponse {
  id: number;
  fen: string;
  solutionMoves: string[];
  theme: string;
  difficulty: number;
  evaluation: number;
  sideToMove: "white" | "black";
  movesToSolve: number
  createdAt: Date
}