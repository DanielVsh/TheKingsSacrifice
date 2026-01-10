export function ReviewPanel({ reviews }: any) {
  return (
    <div>
      <h3>Game Review</h3>
      {reviews.map((r: any, i: number) => (
        <div key={i}>
          Move {r.move}: {r.type} ({r.delta.toFixed(2)})
        </div>
      ))}
    </div>
  )
}