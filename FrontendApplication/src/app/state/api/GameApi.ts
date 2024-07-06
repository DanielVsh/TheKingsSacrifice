import {createApi, fetchBaseQuery} from "@reduxjs/toolkit/query/react";
import {backendIp} from "../../config/backend.ts";

export const gameApi = createApi({
  reducerPath: 'gameApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${backendIp}/rest/game`,
  }),
  endpoints: (builder) => ({
    getGameData: builder.query<GameResponse, string>({
      query: (gameID) => `/${gameID}`,
    }),
    createGame: builder.mutation<GameResponse, GameCreateRequest>({
      query: (arg) => ({
        url: `/create`,
        method: "PATCH",
        body: arg
      }),
    }),
    startGame: builder.mutation<GameResponse, GameStartRequest>({
      query: (arg) => ({
        url: `/start`,
        method: "POST",
        body: arg
      }),
    }),
    saveGame: builder.mutation<GameResponse, GameSaveRequest>({
      query: (arg) => ({
        url: `/save`,
        method: "POST",
        body: arg
      }),
    }),
  }),
})

export const {
  useGetGameDataQuery,
  useCreateGameMutation,
  useStartGameMutation,
  useSaveGameMutation,
} = gameApi