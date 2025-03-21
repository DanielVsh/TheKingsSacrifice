import {createApi, fetchBaseQuery} from "@reduxjs/toolkit/query/react";
import {backendIp} from "../../config/backend.ts";

export const playerApi = createApi({
  reducerPath: 'playerApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${backendIp}/rest/auth`,
  }),
  endpoints: (builder) => ({
    getPlayerData: builder.query<RegisteredPlayerResponse , string>({
      query: (playerID) => `/${playerID}`,
    }),
    createRegisteredPlayer: builder.mutation<PlayerTokens, CreatePlayerRequest>({
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
  useCreateRegisteredPlayerMutation,
} = playerApi