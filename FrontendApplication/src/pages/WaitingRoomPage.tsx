import React from "react";
import {useStartGameMutation} from "../app/state/api/GameApi.ts";
import {useSelector} from "react-redux";
import {RootState} from "../app/state/store.ts";

export const WaitingRoomPage: React.FC<GameResponse> = (props) => {

  const [startGame] = useStartGameMutation()
  const user = useSelector((state: RootState) => state.playerReducer.player)

  const handleStartGame = () => {
    if (user == null) return;

    const whitePlayer: string = props.whitePlayer ? props.whitePlayer.uuid : user.uuid;
    const blackPlayer: string = props.blackPlayer ? props.blackPlayer.uuid : user.uuid;

    startGame({
      uuid: props.uuid,
      whitePlayer: whitePlayer,
      blackPlayer: blackPlayer
    })
  }

  return (
    <>
      <div>
        {window.location.href}

        {user?.uuid !== props?.whitePlayer?.uuid && user?.uuid !== props?.blackPlayer?.uuid
          ? <div onClick={handleStartGame}>Play game</div>
          : <div> :) </div>
        }
      </div>
    </>
  );
};