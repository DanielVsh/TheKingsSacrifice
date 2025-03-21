
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

interface CreatePlayerRequest {
  email: string;
  nickname: string;
  password: string;
  rating: number;
}