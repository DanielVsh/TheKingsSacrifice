import {GameMode} from "./IGame.ts";

export interface RegisteredPlayerResponse {
  uuid: string;
  nickname: string;
  email: string;
  bulletRating: number;
  blitzRating: number;
  rapidRating: number;
  classicalRating: number;
  roles: Role[]
}

export interface PlayerTokens {
  accessToken: string;
  refreshToken: string;
}

export interface RegisteredPlayerRequest {
  uuid: string;
  email?: string;
  nickname?: string;
  password?: string;
  rating?: number;
}

export interface AuthenticatePlayerRequest {
  email: string;
  password: string;
}

export function getRatingByGameMode(
  player: RegisteredPlayerResponse,
  mode: GameMode
): number {
  switch (mode) {
    case GameMode.BULLET:
      return player.bulletRating;
    case GameMode.BLITZ:
      return player.blitzRating;
    case GameMode.RAPID:
      return player.rapidRating;
    case GameMode.CLASSICAL:
      return player.classicalRating;
    default:
      throw new Error("Unknown game mode");
  }
}