interface AnonymousPlayerResponse {
  uuid: string;
}

interface RegisteredPlayerResponse {
  uuid: string;
  nickname: string;
  email: string;
  rating: number;
  roles: Role[]
}

interface CreatePlayerRequest {
  nickname: string;
  email: string;
  rating: number;
}