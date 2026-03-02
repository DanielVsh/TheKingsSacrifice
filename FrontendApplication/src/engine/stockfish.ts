export function createStockfish(): Worker {
  const worker = new Worker("/engines/stockfish-17/stockfish-17-lite.js")
  worker.postMessage("uci")
  worker.postMessage("isready")
  return worker
}