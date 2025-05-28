interface GameResponse {
  uuid: string
  whitePlayer: RegisteredPlayerResponse | null
  blackPlayer: RegisteredPlayerResponse | null
  history: string[]
  winner: string | null
  gameResult: GameState
  date: Date
}

interface GameCreateRequest {
  whitePlayer: string | null
  blackPlayer: string | null
  timeFormat: string
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