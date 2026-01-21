import React from "react";

interface MoveListProps {
  moves: { san: string; fen: string }[];
  activeIndex?: number | null;
  onSelect?: (index: number) => void;
}

export const MoveList: React.FC<MoveListProps> = ({
                                                    moves,
                                                    activeIndex,
                                                    onSelect,
                                                  }) => (
  <div>
    {moves.map((m, i) => (
      <span key={i} onClick={() => onSelect?.(i)}>
          {i % 2 === 0 && `${i / 2 + 1}. `}
        {m.san}{" "}
        </span>
    ))}
  </div>

)
