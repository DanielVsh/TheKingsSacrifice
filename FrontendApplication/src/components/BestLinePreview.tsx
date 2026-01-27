import React, { useState, useMemo } from "react"
import { Chess } from "chess.js"
import { Chessboard } from "react-chessboard"
import { BoardOrientation, Square, Arrow } from "react-chessboard/dist/chessboard/types"

interface BestLinePreviewProps {
  pv: string[]
  boardOrientation: BoardOrientation
  initialFen?: string
}

export const BestLinePreview: React.FC<BestLinePreviewProps> = ({ pv, boardOrientation, initialFen }) => {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null)

  const cachedFensAndLastMove = useMemo(() => {
    const chess = new Chess(initialFen ?? undefined)
    const result: { fen: string; lastMove?: { from: Square; to: Square } }[] = []

    for (let i = 0; i < pv.length; i++) {
      const moveStr = pv[i]
      const from = moveStr.slice(0, 2) as Square
      const to = moveStr.slice(2, 4) as Square

      const legalMove = chess.moves({ verbose: true }).find(m => m.from === from && m.to === to)
      if (legalMove) chess.move(legalMove)
      else console.warn("Invalid PV move:", moveStr)

      result.push({ fen: chess.fen(), lastMove: { from, to } })
    }

    return result
  }, [pv, initialFen])

  return (
    <div className="bg-neutral-900 p-3 rounded-lg w-full mt-2">
      <div className="text-sm mb-2 text-neutral-300 font-semibold">Best line:</div>
      <div className="flex flex-wrap gap-1">
        {pv.map((move, idx) => {
          const cache = cachedFensAndLastMove[idx]
          const highlightArrow: Arrow[] = cache?.lastMove
            ? [[cache.lastMove.from, cache.lastMove.to, "rgba(0,255,0,0.7)"]]
            : []

          return (
            <div key={idx} className="relative group"
                 onMouseEnter={() => setHoverIndex(idx)}
                 onMouseLeave={() => setHoverIndex(null)}>
              <button className="px-2 py-1 bg-neutral-700 hover:bg-green-600 text-white rounded text-xs">
                {move}
              </button>

              {hoverIndex === idx && cache && (
                <div className="absolute z-50 -top-50 left-0 p-2 bg-neutral-800 rounded-lg shadow-lg">
                  <div className="text-xs text-neutral-300 mb-1">Move preview</div>
                  <Chessboard
                    position={cache.fen}
                    arePiecesDraggable={false}
                    boardOrientation={boardOrientation}
                    customBoardStyle={{ borderRadius: "6px", width: 200 }}
                    customDarkSquareStyle={{ backgroundColor: "#757575" }}
                    customLightSquareStyle={{ backgroundColor: "#FCFCFC" }}
                    customArrows={highlightArrow}
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
