export function MoveList({ moves }: { moves: any[] }) {
  return (
    <div>
      {moves.map((m, i) => (
        <span key={i}>
          {i % 2 === 0 && `${i / 2 + 1}. `}
          {m.san}{" "}
        </span>
      ))}
    </div>
  )
}