import { Icon } from "@iconify/react";
import {  Grid, IconButton, Tooltip } from "@mui/material";
import { useAtomValue } from "jotai";
import { boardAtom, gameAtom } from "../states";
import { useChessActions } from "@/hooks/useChessActions";
import { useEffect } from "react";
import {blue} from "@mui/material/colors";

export default function GoToLastPositionButton() {
  const { setPgn: setBoardPgn } = useChessActions(boardAtom);
  const game = useAtomValue(gameAtom);
  const board = useAtomValue(boardAtom);

  const gameHistory = game.history();
  const boardHistory = board.history();

  const isButtonDisabled = boardHistory >= gameHistory;

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowUp") {
        if (isButtonDisabled) return;
        setBoardPgn(game.pgn());
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isButtonDisabled, setBoardPgn, game]);

  return (
    <Tooltip title="Go to final position">
      <Grid>
        <IconButton
          onClick={() => {
            if (isButtonDisabled) return;
            setBoardPgn(game.pgn());
          }}
          disabled={isButtonDisabled}
          sx={{ paddingX: 1.2, paddingY: 0.5 }}
        >
          <Icon icon="ri:skip-forward-line" color={blue[400]}/>
        </IconButton>
      </Grid>
    </Tooltip>
  );
}
