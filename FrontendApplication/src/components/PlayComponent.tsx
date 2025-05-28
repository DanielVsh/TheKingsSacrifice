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

interface PlayerTime {
  whitePlayerTime: number;
  blackPlayerTime: number;
}


export const PlayComponent: React.FC<GameResponse> = (props) => {
  const [stompClient, setStompClient] = useState<Client | null>(null);
  const [game, setGame] = useState(new Chess());
  const [playersTime, setPlayersTime] = useState<PlayerTime>()

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
    client.debug = () => {};
    setStompClient(client)
    const onConnect = () => {
      client.subscribe(`/topic/game/${props.uuid}`, (message) => {
        setGame(new Chess(message.body));
      });
      client.subscribe(`/topic/game/${props.uuid}/time`, (message) => {
        setPlayersTime(JSON.parse(message.body))
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

  const canPlayerMove = (): boolean => {
    if (player && props.whitePlayer && game.turn() === 'w' && player.uuid !== props.whitePlayer.uuid) return false;
    if (player && props.blackPlayer && game.turn() === 'b' && player.uuid !== props.blackPlayer.uuid) return false;

    return true;
  }

  const handleUserMove = (fen: string) => {
    setGame(new Chess(fen));
    sendMove(game.fen());

    if (game.isGameOver()) {
      let gameState = determineGameState(game);
      if (gameState === GameState.ERROR) {
        if (playersTime && (playersTime.whitePlayerTime <= 0 || playersTime.blackPlayerTime <= 0)) {
          gameState = GameState.TIMEOUT;
        }
      }
      let winner = null;
      if (gameState === GameState.CHECKMATE || gameState === GameState.TIMEOUT) {
        winner = determineWinner(game, props);
      }

      saveGame({
        uuid: props.uuid,
        gameResult: gameState,
        winner: winner?.uuid ?? null,
      });
    }
  };

  function formatTime(milliseconds: number): string {
    const minutes: number = Math.floor(milliseconds / 60000);
    const remainingMilliseconds: number = milliseconds % 60000;
    const seconds: number = Math.floor(remainingMilliseconds / 1000);
    const tenths: number = Math.floor((remainingMilliseconds % 1000) / 100);

    const formattedSeconds: string = seconds < 10 ? `0${seconds}` : `${seconds}`;
    const formattedTenths: string = minutes === 0 && seconds < 10 ? `.${tenths}` : '';

    return `${minutes}:${formattedSeconds}${formattedTenths}`;
  }

  function getBeautyMoves(): string[] {
    const moves = game.history() ?? [];
    const groupedMoves = [];
    for (let i = 0; i < moves.length; i += 2) {
      const white = moves[i];
      const black = moves[i + 1] ?? '';
      groupedMoves.push({ number: Math.floor(i / 2) + 1, white, black });
    }
    return groupedMoves.map(({ number, white, black }) => (
      <li key={number}>
        {number}. {white} {black}
      </li>
    ));
  }

  return (
    <div className="flex h-screen w-full bg-black text-white font-sans">
      {/* Center content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4">
        {/* Top Player Info */}
        <div className="text-center mb-4">
          <p className="text-lg font-semibold">{props.whitePlayer?.nickname}</p>
          {playersTime && <p className="text-sm text-gray-400">{formatTime(playersTime.whitePlayerTime)}</p>}
        </div>

        {/* Chess Board */}
        {player && (
          <div className="shadow-lg rounded-md overflow-hidden">
            <ChessGameBoard
              game={game}
              onUserMove={handleUserMove}
              boardOrientation={getBoardOrientation()}
              canPlayerMove={canPlayerMove()}
            />
          </div>
        )}

        {/* Bottom Player Info */}
        <div className="text-center mt-4">
          <p className="text-lg font-semibold">{props.blackPlayer?.nickname}</p>
          {playersTime && <p className="text-sm text-gray-400">{formatTime(playersTime.blackPlayerTime)}</p>}
        </div>
      </main>

      {/* Right Panel */}
      <aside className="w-[340px] p-4 flex flex-col bg-neutral-900 border-l border-neutral-800">
        {/* Move List */}
        <div className="mb-6">
          <h3 className="text-lg font-bold mb-2">Moves</h3>
          <div className="border border-white/10 rounded p-2 h-48 overflow-y-auto bg-black">
            <ul className="text-sm space-y-1 text-gray-200">
              {getBeautyMoves()}
            </ul>
          </div>
        </div>

        {/* Chat Box */}
        <div className="flex-1 flex flex-col border border-white/10 rounded p-2 bg-black">
          <h3 className="text-lg font-bold mb-2">Chat</h3>
          <div className="flex-1 overflow-y-auto text-sm text-gray-300 space-y-1 mb-2">
            <p>Player1: Good luck!</p>
            <p>Player2: You too!</p>
          </div>
          <input
            type="text"
            placeholder="Type a message..."
            className="bg-neutral-800 text-white text-sm px-3 py-2 rounded focus:outline-none placeholder-gray-500"
          />
        </div>
      </aside>
    </div>
  );

};