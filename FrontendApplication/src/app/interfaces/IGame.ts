import {GameState} from "../enums/GameState.ts";
import {RegisteredPlayerResponse} from "./IPlayer.ts";

export interface GameResponse {
  uuid: string
  whitePlayer: RegisteredPlayerResponse | null
  blackPlayer: RegisteredPlayerResponse | null
  history: string[]
  winner: RegisteredPlayerResponse | null
  gameResult: GameState
  createdAt: Date
  finishedAt: Date
  gameMode: GameMode
  whiteRatingDelta: number
  blackRatingDelta: number
}

export interface GameCreateRequest {
  whitePlayer: string | null
  blackPlayer: string | null
  timeFormat: string
  gameMode: GameMode
}

export interface GameStartRequest {
  uuid: string
  whitePlayer: string
  blackPlayer: string
}

export interface GameSaveRequest {
  uuid: string
  winner: string | null
  gameResult: GameState
}

export interface GameDrawRequest {
  fromPlayer: RegisteredPlayerResponse,
  toPlayer: RegisteredPlayerResponse,
  status: "REQUESTED" | "ACCEPTED" | "REJECTED"
}


export interface PlayerMatchRequest {
  playerUUID: string
  rating: number
  timeFormat: string,
  gameMode: GameMode
}

export interface MatchmakingQueueSize {
  total: number
  byTimeMode: number
}

export enum GameMode {
  BULLET = "BULLET",
  BLITZ = "BLITZ",
  RAPID = "RAPID",
  CLASSICAL = "CLASSICAL",
  NON_RATING = "NON_RATING",
}