import {useEffect, useRef} from "react";

const REVIEW_COLORS = {
  BLUNDER: "text-red-400 bg-red-500/10",
  MISTAKE: "text-orange-400 bg-orange-500/10",
  INACCURACY: "text-yellow-400 bg-yellow-500/10"
}

export const ReviewPanel = ({ reviews }) => {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = containerRef.current
    if (el) {
      el.scrollTop = el.scrollHeight
    }
  }, [reviews])

  if (reviews.length === 0) return null

  return (
    <div className="bg-neutral-900 rounded-lg p-3">
      <div className="font-semibold text-sm mb-2 text-neutral-300">
        Mistakes
      </div>

      <div className="flex flex-col gap-1 max-h-36 overflow-y-auto pr-1 custom-scroll" ref={containerRef}>
        {reviews.map((r, i) => (
          <li
            key={i}
            className={`rounded p-2 text-sm ${REVIEW_COLORS[r.type]}`}
          >
            <div className="flex justify-between">
              <span>{r.move}</span>
              <span>{r.type}</span>
            </div>
            <div className="text-xs opacity-70">
              Eval change: {r.delta.toFixed(2)}
            </div>
          </li>
        ))}
      </div>

      <style>{`
        .custom-scroll::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scroll::-webkit-scrollbar-thumb {
          background-color: #00ff88;
          border-radius: 3px;
        }
        .custom-scroll::-webkit-scrollbar-track {
          background: #222;
        }
      `}</style>
    </div>
  )
}
