import React, {useEffect, useRef, useState} from "react"
import {Chess} from "chess.js"
import {ChessGameBoard} from "../components/ChessGameBoard"
import {useStockfish} from "../hooks/useStockfish"
import {EvalBar} from "../components/EvalBar"
import {MoveList} from "../components/MoveList"
import {ReviewPanel} from "../components/ReviewPanel"
import { useBoardSize} from "../hooks/useBoardSize.ts";

interface AnalysisPageProps {
  fens?: string[]
  boardOrientation: "white" | "black"
}

export const AnalysisPage: React.FC<AnalysisPageProps> = ({ fens, boardOrientation }) => {
  const fullGameRef = useRef(new Chess()) // stores full original game
  const boardRef = useRef(new Chess()) // current board for display & edits
  const { analyze, result } = useStockfish()

  const [moves, setMoves] = useState<{ san: string; fen: string }[]>([])
  const [reviews, setReviews] = useState<any[]>([])
  const [currentMoveIndex, setCurrentMoveIndex] = useState<number>(-1) // -1 = empty board
  const lastEval = useRef<number | null>(null)

  // Load FENs if provided
  useEffect(() => {
    fullGameRef.current.reset()
    const history: { san: string; fen: string }[] = []

    if (fens && fens.length > 0) {
      fens.forEach((fen, i) => {
        // Just store the FEN as a "move"
        history.push({ san: `Move ${i + 1}`, fen })
      })
    }

    setMoves(history)
    setCurrentMoveIndex(history.length - 1) // start at last move
  }, [fens])


  // Update board whenever currentMoveIndex changes
  // useEffect(() => {
  //   boardRef.current.reset()
  //   if (currentMoveIndex >= 0) {
  //     const fen = moves[currentMoveIndex].fen
  //     boardRef.current.load(fen)
  //   }
  //
  //   analyze(boardRef.current.fen())
  // }, [currentMoveIndex, moves, analyze])


  // Handle user move at any point
  const onUserMove = (fen: string) => {
    analyze(fen)

    // Build new moves array: truncate future moves if user moved in the middle
    const newMoves = moves.slice(0, currentMoveIndex + 1)
    const lastMove = boardRef.current.history({ verbose: true }).pop()
    if (lastMove) {
      newMoves.push({ san: lastMove.san, fen })
      setMoves(newMoves)
      setCurrentMoveIndex(newMoves.length - 1)
    }

    // Calculate review
    if (result && typeof result.eval === "number" && lastEval.current !== null) {
      const delta = result.eval - lastEval.current
      let type: "INACCURACY" | "MISTAKE" | "BLUNDER" | null = null
      if (delta < -3) type = "BLUNDER"
      else if (delta < -1.5) type = "MISTAKE"
      else if (delta < -0.5) type = "INACCURACY"

      if (type) {
        setReviews(r => [
          ...r,
          {
            move: lastMove?.san,
            delta,
            type
          }
        ])
      }
    }

    // @ts-ignore
    lastEval.current = result?.eval ?? null
  }

  const goToPreviousMove = () => {
    setCurrentMoveIndex(idx => Math.max(idx - 1, -1))
  }

  const goToNextMove = () => {
    setCurrentMoveIndex(idx => Math.min(idx + 1, moves.length - 1))
  }

  const height = useBoardSize();
  return (
    <div className="w-full  flex justify-center py-10">
      <div className="flex gap-6 items-start">
        <div className="flex flex-col gap-2">
          <ChessGameBoard
            // key={currentMoveIndex}
            fen={moves[currentMoveIndex]?.fen}
            game={boardRef.current}
            boardOrientation={boardOrientation}
            canPlayerMove={true}
            onUserMove={onUserMove}
          />

          <div className="flex gap-2 mt-2">
            <button onClick={goToPreviousMove} disabled={currentMoveIndex < 0}>
              Previous
            </button>
            <button onClick={goToNextMove} disabled={currentMoveIndex >= moves.length - 1}>
              Next
            </button>
          </div>
        </div>

        {typeof result?.eval === "number" && (
          <EvalBar evalScore={result.eval} height={height} />
        )}

        <div className="flex flex-col gap-4 w-72">
          <MoveList moves={moves}
                    activeIndex={currentMoveIndex}
                    onSelect={setCurrentMoveIndex} />
          <ReviewPanel reviews={reviews} />

          {result?.pv && (
            <div className="text-sm">
              <b>Best line:</b> {result.pv.join(" ")}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
