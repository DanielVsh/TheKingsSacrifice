import {createApi, fetchBaseQuery} from "@reduxjs/toolkit/query/react";
import {backendIp} from "../../config/backend.ts";

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
  endpoints: (builder) => ({
    getPlayerData: builder.query<RegisteredPlayerResponse , void>({
      query: () => "/me",
    }),
  }),
})

export const {
  useGetPlayerDataQuery,
} = playerApi