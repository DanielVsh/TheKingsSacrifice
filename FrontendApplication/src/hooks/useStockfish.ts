import { useEffect, useRef, useState } from "react"
import { createStockfish } from "../engine/stockfish"

export interface EngineResult {
  eval: number | "MATE"
  pv: string[]
  depth: number
}

export function useStockfish() {
  const engine = useRef<Worker | null>(null)
  const [result, setResult] = useState<EngineResult | null>(null)

  useEffect(() => {
    engine.current = createStockfish()

    engine.current.onmessage = e => {
      const line = e.data as string
      if (!line.includes("info")) return

      const depth = Number(line.match(/depth (\d+)/)?.[1])
      const cp = line.match(/score cp (-?\d+)/)?.[1]
      const mate = line.match(/score mate (-?\d+)/)?.[1]
      const pv = line.match(/ pv (.+)/)?.[1]

      if (!pv || !depth) return

      setResult({
        depth,
        eval: mate ? "MATE" : Number(cp) / 100,
        pv: pv.split(" ").slice(0, 7),
      })
    }

    return () => engine.current?.terminate()
  }, [])

  const analyze = (fen: string, depth = 16) => {
    engine.current?.postMessage("stop")
    engine.current?.postMessage(`position fen ${fen}`)
    engine.current?.postMessage(`go depth ${depth}`)
  }

  return { analyze, result }
}