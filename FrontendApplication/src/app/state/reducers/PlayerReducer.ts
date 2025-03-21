import {createSlice, PayloadAction} from "@reduxjs/toolkit";


interface PlayerState {
  accessToken: string | null;
  refreshToken: string | null;
  player: RegisteredPlayerResponse | null;
}

const initialState: PlayerState = {
  player: null,
  accessToken: null,
  refreshToken: null,
};

const playerSlice = createSlice({
  name: 'playerReducer',
  initialState,
  reducers: {
    setPlayer: (state, action: PayloadAction<RegisteredPlayerResponse>) => {
      state.player = action.payload;
    },
    setTokens: (state, action: PayloadAction<PlayerTokens>) => {
      const payload = action.payload;
      state.accessToken = payload.accessToken;
      state.refreshToken = payload.refreshToken;
    },
    clearPlayer: (state) => {
      state.player = null;
      state.accessToken = null;
      state.refreshToken = null;
    },
  },
});

export const {
  setPlayer,
  clearPlayer,
  setTokens,
} = playerSlice.actions;

export default playerSlice.reducer;