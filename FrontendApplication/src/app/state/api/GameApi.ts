import {createApi, fetchBaseQuery} from "@reduxjs/toolkit/query/react";
import {backendIp} from "../../config/backend.ts";
import {GameCreateRequest, GameResponse, GameSaveRequest, GameStartRequest} from "../../interfaces/IGame.ts";
import {RootState} from "../store.ts";

export const gameApi = createApi({
  reducerPath: 'gameApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${backendIp}/rest/game`,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).playerReducer.accessToken;
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Game'],
  endpoints: (builder) => ({
    getGameData: builder.query<GameResponse, string>({
      query: (gameID) => `/${gameID}`,
      providesTags: (result, error, gameID) => [{ type: 'Game', id: gameID }],
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
        url: `/${arg.uuid}/start`,
        method: "POST",
        body: arg
      }),
    }),
    saveGame: builder.mutation<GameResponse, GameSaveRequest>({
      query: (arg) => ({
        url: `/${arg.uuid}/save`,
        method: "POST",
        body: arg
      }),
      invalidatesTags: (result, error, arg) => [{ type: 'Game', id: arg.uuid }],
    }),
  }),
})

export const {
  useGetGameDataQuery,
  useCreateGameMutation,
  useStartGameMutation,
  useSaveGameMutation,
} = gameApi