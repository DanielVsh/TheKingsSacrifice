import {createSlice, PayloadAction} from "@reduxjs/toolkit";


interface PlayerState {
  player: AnonymousPlayerResponse | RegisteredPlayerResponse | null;
}

const initialState: PlayerState = {
  player: null,
};

const playerSlice = createSlice({
  name: 'playerReducer',
  initialState,
  reducers: {
    setPlayer: (state, action: PayloadAction<AnonymousPlayerResponse | RegisteredPlayerResponse>) => {
      state.player = action.payload;
    },
    clearPlayer: (state) => {
      state.player = null;
    },
  },
});

export const {
  setPlayer,
  clearPlayer,
} = playerSlice.actions;

export default playerSlice.reducer;