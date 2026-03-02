import { useGameDatabase } from "@/hooks/useGameDatabase";
import { Icon } from "@iconify/react";
import {  Grid, IconButton, Tooltip } from "@mui/material";
import { useAtomValue } from "jotai";
import { boardAtom, gameAtom, gameEvalAtom } from "../states";
import { getGameToSave } from "@/lib/chess";
import {useNavigate} from "react-router-dom";
import {blue} from "@mui/material/colors";

export default function SaveButton() {
  const game = useAtomValue(gameAtom);
  const board = useAtomValue(boardAtom);
  const gameEval = useAtomValue(gameEvalAtom);
  const { addGame, setGameEval, gameFromUrl } = useGameDatabase();
  const navigate = useNavigate();

  const enableSave =
    !gameFromUrl && (board.history().length || game.history().length);

  const handleSave = async () => {
    if (!enableSave) return;

    const gameToSave = getGameToSave(game, board);

    const gameId = await addGame(gameToSave);
    if (gameEval) {
      await setGameEval(gameId, gameEval);
    }

    navigate(`/analysis?gameId=${gameId}`);
  };

  return (
    <>
      {gameFromUrl ? (
        <Tooltip title="Game saved in database">
          <Grid>
            <IconButton disabled={true} sx={{ paddingX: 1.2, paddingY: 0.5 }}>
              <Icon icon="ri:folder-check-line" color={blue[400]}/>
            </IconButton>
          </Grid>
        </Tooltip>
      ) : (
        <Tooltip title="Save game">
          <Grid>
            <IconButton
              onClick={handleSave}
              disabled={!enableSave}
              sx={{ paddingX: 1.2, paddingY: 0.5 }}
            >
              <Icon icon="ri:save-3-line" color={blue[400]}/>
            </IconButton>
          </Grid>
        </Tooltip>
      )}
    </>
  );
}
