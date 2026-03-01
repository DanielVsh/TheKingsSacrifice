import { useEffect, useRef, useState } from "react"
import { createStockfish } from "../engine/stockfish"

export interface EngineResult {
  eval: number | "MATE"
  pv: string[]
  depth: number
}

export function useStockfish() {
  const engine = useRef<Worker | null>(null)
  const bestRef = useRef<EngineResult | null>(null)
  const [result, setResult] = useState<EngineResult | null>(null)

  useEffect(() => {
    engine.current = createStockfish()

    engine.current.onmessage = e => {
      const line = e.data as string

      if (!line.startsWith("info")) return
      if (line.includes("multipv") && !line.includes("multipv 1")) return

      const depth = Number(line.match(/depth (\d+)/)?.[1])
      if (!depth) return

      const mate = line.match(/score mate (-?\d+)/)?.[1]
      const cp = line.match(/score cp (-?\d+)/)?.[1]
      const pv = line.match(/ pv (.+)/)?.[1]
      if (!pv) return

      const next: EngineResult = {
        depth,
        eval: mate ? "MATE" : Number(cp) / 100,
        pv: pv.split(" ").slice(0, 10),
      }

      if (!bestRef.current || depth >= bestRef.current.depth) {
        bestRef.current = next
        setResult(next)
      }
    }

    return () => engine.current?.terminate()
  }, [])

  const analyze = (fen: string, depth = 18) => {
    if (!engine.current) return

    bestRef.current = null

    engine.current.postMessage("stop")
    engine.current.postMessage("ucinewgame")
    engine.current.postMessage(`position fen ${fen}`)
    engine.current.postMessage(`go depth ${depth}`)
  }

  return { analyze, result }
}
