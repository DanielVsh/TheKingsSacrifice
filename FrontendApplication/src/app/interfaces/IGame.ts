interface GameResponse {
  uuid: string
  whitePlayer: AnonymousPlayerResponse | null
  blackPlayer: AnonymousPlayerResponse | null
  history: string[]
  winner: string | null
  gameResult: GameState
  date: Date
}

interface GameCreateRequest {
  whitePlayer: string | null
  blackPlayer: string | null
}

interface GameStartRequest {
  uuid: string
  whitePlayer: string
  blackPlayer: string
}

interface GameSaveRequest {
  uuid: string
  winner: string | null
  gameResult: GameState
}