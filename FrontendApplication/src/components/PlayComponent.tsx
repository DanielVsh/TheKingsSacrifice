import React, {useEffect, useState} from "react";
import {Client, Stomp} from "@stomp/stompjs";
import {Chess} from "chess.js";
import SockJS from "sockjs-client";
import {ChessGameBoard} from "./ChessGameBoard.tsx";
import {useSaveGameMutation} from "../app/state/api/GameApi.ts";
import {backendIp} from "../app/config/backend.ts";
import {determineGameState, determineWinner} from "../services/GameService.ts";
import {useSelector} from "react-redux";
import {RootState} from "../app/state/store.ts";


export const PlayComponent: React.FC<GameResponse> = (props) => {
  const [stompClient, setStompClient] = useState<Client | null>(null);
  const [game, setGame] = useState(new Chess());

  const [saveGame] = useSaveGameMutation();

  const player = useSelector((state: RootState) => state.playerReducer.player);

  const getBoardOrientation = (): "white" | "black" => {
    if (player && props.whitePlayer && props.whitePlayer.uuid === player.uuid) {
      return "white"
    } else if (player && props.blackPlayer && props.blackPlayer.uuid === player.uuid) {
      return "black"
    }
    return "white"
  }

  function webSocketConnection() {
    const sock = new SockJS(`${backendIp}/ws`);
    const client = Stomp.over(sock);
    setStompClient(client)
    const onConnect = () => {
      client.subscribe(`/topic/game/${props.uuid}`, (message) => {
        setGame(new Chess(message.body));
      });
    };

    client.connect({}, onConnect);
    return client;
  }

  useEffect(() => {
    props.history.forEach(fen => game.load(fen))

    if (game.isGameOver()) {
      setGame(new Chess(game.fen()))
      return () => {
      };
    }

    const client = webSocketConnection();

    return () => {
      client.disconnect();
    };
  }, []);


  const sendMove = (fen: string) => {
    stompClient && stompClient.publish({
      destination: `/app/game/${props.uuid}/move`,
      body: fen,
    });
  };

  const canPlayerMove = () : boolean => {
    if (player && props.whitePlayer && game.turn() === 'w' && player.uuid !== props.whitePlayer.uuid) return false;
    if (player && props.blackPlayer && game.turn() === 'b' && player.uuid !== props.blackPlayer.uuid) return false;

    return true;
  }

  const handleUserMove = (fen: string) => {
    setGame(new Chess(fen));
    sendMove(game.fen());

    if (game.isGameOver()) {
      const gameState = determineGameState(game);
      const winner = gameState === GameState.CHECKMATE ? determineWinner(game, props) : null;

      saveGame({
        uuid: props.uuid,
        gameResult: gameState,
        winner: winner?.uuid ?? null,
      });
    }
  };

  return (
    <>
      {player &&
        <ChessGameBoard
          game={game}
          onUserMove={handleUserMove}
          boardOrientation={getBoardOrientation()}
          canPlayerMove={canPlayerMove()}/>
      }
    </>
  )
};