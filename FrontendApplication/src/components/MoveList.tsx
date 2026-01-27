import React, {useEffect, useRef} from "react";

interface MoveListProps {
  moves: { san: string; fen: string }[];
  activeIndex?: number | null;
  onSelect?: (index: number) => void;
}

export const MoveList: React.FC<MoveListProps> = ({
                                                    moves,
                                                    activeIndex,
                                                    onSelect
                                                  }) => {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = containerRef.current
    if (el) {
      el.scrollTop = el.scrollHeight
    }
  }, [moves])

  return (
    <div className="bg-neutral-900 rounded-lg p-3">
      <div className="text-sm mb-2 text-neutral-300">Moves</div>

      <div
        className="flex flex-wrap gap-x-2 gap-y-1 max-h-[4.5rem] overflow-y-auto custom-scroll"
        style={{
          display: "flex",
          flexWrap: "wrap",
          maxHeight: "4.5rem"
        }}
        ref={containerRef}
      >
        {moves.map((m, i) => (
          <span
            key={i}
            onClick={() => onSelect ? onSelect(i) : null}
            className={`
              px-1.5 py-0.5 rounded cursor-pointer
              ${i === activeIndex
              ? "bg-green-600 text-white"
              : "hover:bg-neutral-700"}
            `}
          >
            {i % 2 === 0 && (
              <span className="text-neutral-400 mr-1">
                {Math.floor(i / 2) + 1}.
              </span>
            )}
            {m.san}
          </span>
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

