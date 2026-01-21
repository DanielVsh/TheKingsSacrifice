import {createApi, fetchBaseQuery} from "@reduxjs/toolkit/query/react";
import {backendIp} from "../../config/backend.ts";
import {RootState} from "../store.ts";
import {Page} from "../../interfaces/IPageable.ts";
import {PuzzleResponse} from "../../interfaces/IPuzzle.ts";

export const puzzleApi = createApi({
  reducerPath: 'puzzleApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${backendIp}/rest/puzzle`,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).playerReducer.accessToken;
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({
    getPuzzlesData: builder.query<Page<PuzzleResponse>, { page?: number; size?: number; sort?: string }>({
      query: ({ page = 0, size = 100, sort = 'createdAt,desc' }) => ({
        url: '/all',
        params: { page, size, sort },
      }),
    }),
    getPuzzleData: builder.query<PuzzleResponse, string>({
      query: (id) => ({
        url: '/' + id,
      }),
    }),
  }),
})

export const {
  useGetPuzzlesDataQuery,
  useGetPuzzleDataQuery,
} = puzzleApi