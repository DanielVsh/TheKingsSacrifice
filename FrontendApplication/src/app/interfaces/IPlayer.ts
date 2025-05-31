
interface RegisteredPlayerResponse {
  uuid: string;
  nickname: string;
  email: string;
  rating: number;
  roles: Role[]
}

interface PlayerTokens {
  accessToken: string;
  refreshToken: string;
}

interface RegisteredPlayerRequest {
  uuid: string;
  email?: string;
  nickname?: string;
  password?: string;
  rating?: number;
}

interface AuthenticatePlayerRequest {
  email: string;
  password: string;
}