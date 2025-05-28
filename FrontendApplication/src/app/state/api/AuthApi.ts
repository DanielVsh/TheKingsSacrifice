import {createApi, fetchBaseQuery} from "@reduxjs/toolkit/query/react";
import {backendIp} from "../../config/backend.ts";

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${backendIp}/rest/auth`,
  }),
  endpoints: (builder) => ({
    createRegisteredPlayer: builder.mutation<PlayerTokens, CreatePlayerRequest>({
      query: (arg) => ({
        url: `/register`,
        method: "POST",
        body: arg
      }),
    }),
    authenticateRegisteredPlayer: builder.mutation<PlayerTokens, AuthenticatePlayerRequest>({
      query: (arg) => ({
        url: `/authenticate`,
        method: "POST",
        body: arg
      }),
    }),
  }),
})

export const {
  useCreateRegisteredPlayerMutation,
  useAuthenticateRegisteredPlayerMutation,
} = authApi