export function createStockfish(): Worker {
  const worker = new Worker("/stockfish/stockfish-17-lite.js")
  worker.postMessage("uci")
  worker.postMessage("isready")
  return worker
}