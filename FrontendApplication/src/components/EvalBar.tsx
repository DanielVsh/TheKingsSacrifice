export function EvalBar({
                          evalScore,
                          height
                        }: {
  evalScore: number
  height: number
}) {
  const percent = Math.min(100, Math.max(0, 50 + evalScore * 10))

  return (
    <div
      style={{
        height,
        width: 18,
        background: "#000",
        borderRadius: 4,
        overflow: "hidden"
      }}
    >
      <div
        style={{
          height: `${percent}%`,
          background: "#fff",
          transition: "height 0.3s"
        }}
      />
    </div>
  )
}