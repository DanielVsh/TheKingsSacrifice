import {createApi, fetchBaseQuery} from "@reduxjs/toolkit/query/react";
import {backendIp} from "../../config/backend.ts";

export const playerApi = createApi({
  reducerPath: 'playerApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${backendIp}/rest/player`,
  }),
  endpoints: (builder) => ({
    getPlayerData: builder.query<RegisteredPlayerResponse | AnonymousPlayerResponse, string>({
      query: (playerID) => `/${playerID}`,
    }),
    createAnonymousPlayer: builder.mutation<AnonymousPlayerResponse, undefined>({
      query: () => ({
        url: `/anonymous`,
        method: "POST",
      }),
    }),
    createRegisteredPlayer: builder.mutation<RegisteredPlayerResponse, CreatePlayerRequest>({
      query: (arg) => ({
        url: `/register`,
        method: "POST",
        body: arg
      }),
    }),
  }),
})

export const {
  useGetPlayerDataQuery,
  useCreateAnonymousPlayerMutation,
  useCreateRegisteredPlayerMutation,
} = playerApi