import {createApi, fetchBaseQuery} from "@reduxjs/toolkit/query/react";
import {backendIp} from "../../config/backend.ts";
import {RootState} from "../store.ts";
import {RegisteredPlayerRequest, RegisteredPlayerResponse} from "../../interfaces/IPlayer.ts";

export const playerApi = createApi({
  reducerPath: 'playerApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${backendIp}/rest/player`,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).playerReducer.accessToken;
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Player'],
  endpoints: (builder) => ({
    getPlayerData: builder.query<RegisteredPlayerResponse , void>({
      query: () => "/me",
      providesTags: ['Player']
    }),
    updatePlayer: builder.mutation<RegisteredPlayerResponse , RegisteredPlayerRequest>({
      query: (arg) => ({
        url: `/${arg.uuid}/update`,
        method: `PATCH`,
        body: arg
      }),
      invalidatesTags: ['Player']
    }),
  }),
})

export const {
  useGetPlayerDataQuery,
  useUpdatePlayerMutation,
} = playerApi