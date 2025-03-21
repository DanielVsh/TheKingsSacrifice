import React, {useEffect, useState} from "react";
// import {useStartGameMutation} from "../app/state/api/GameApi.ts";
import {useSelector} from "react-redux";
import {RootState} from "../app/state/store.ts";
import SockJS from "sockjs-client";
import {backendIp} from "../app/config/backend.ts";
import {Client, Stomp} from "@stomp/stompjs";
import CopyUrlButton from "../components/CopyUrlButton.tsx";

export const WaitingRoomPage: React.FC<GameResponse> = (props) => {

  // const [startGame] = useStartGameMutation()
  const user = useSelector((state: RootState) => state.playerReducer.player)
  const [client, setClient] = useState<Client | null>(null)

  function webSocketConnection() {
    const sock = new SockJS(`${backendIp}/ws`);
    const client = Stomp.over(sock);
    client.debug = () => {};
    setClient(client)
    const onConnect = () => {
      client.subscribe(`/topic/game/${props.uuid}/started`, (message) => {
        if (message.body) {
          window.location.reload();
        }
      });
    };

    client.connect({}, onConnect);
    return client;
  }

  useEffect(() => {
    const client = webSocketConnection();

    return () => {
      client.disconnect();
    };
  }, []);

  const handleStartGame = () => {
    if (user == null) return;

    const whitePlayer: string = props.whitePlayer ? props.whitePlayer.uuid : user.uuid;
    const blackPlayer: string = props.blackPlayer ? props.blackPlayer.uuid : user.uuid;

    client && client.publish({
      destination: `/app/game/${props.uuid}/start`,
      body: JSON.stringify({
        "uuid": props.uuid,
        "whitePlayer": whitePlayer,
        "blackPlayer": blackPlayer
      })
    });

    window.location.reload();
  }

  return (
    <>
      <div>
        <CopyUrlButton url={window.location.href}/>

        {user?.uuid !== props?.whitePlayer?.uuid && user?.uuid !== props?.blackPlayer?.uuid
          ? <div onClick={handleStartGame}>Play game</div>
          : <div> :) </div>
        }
      </div>
    </>
  );
};