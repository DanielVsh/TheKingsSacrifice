import React, {useEffect, useMemo, useState} from "react";
import {Chess} from "chess.js";
import {ChessGameBoard} from "./ChessGameBoard.tsx";
import {useSaveGameMutation} from "../app/state/api/GameApi.ts";
import {determineGameResult, determineGameState, determineWinner} from "../services/GameService.ts";
import {useSelector} from "react-redux";
import {RootState} from "../app/state/store.ts";
import {useWebSocket} from "../hooks/useWebSocket.ts";
import {createDrawService} from "../services/GameDrawService.ts";
import {GameDrawRequest, GameResponse, GameSaveRequest} from "../app/interfaces/IGame.ts";
import {GameState} from "../app/enums/GameState.ts";
import {motion} from "framer-motion";
import {GameResult} from "../app/enums/GameResult.ts";
import {SoundService} from "../services/SoundService.ts";
import {getDurationString} from "../services/DateTimeService.ts";

interface PlayerTime {
  whitePlayerTime: number;
  blackPlayerTime: number;
}

interface PlayComponentProps extends GameResponse {

}

let isBeginGameSoundPlayed = false;

export const PlayComponent: React.FC<PlayComponentProps> = (props) => {
  if (props.gameResult === GameState.ONGOING && !isBeginGameSoundPlayed) {
    SoundService.play("game_begin")
    isBeginGameSoundPlayed = true;
  }

  const [game, setGame] = useState(new Chess());
  const [playersTime, setPlayersTime] = useState<PlayerTime>()

  const [saveGame] = useSaveGameMutation<GameSaveRequest>();

  const player = useSelector((state: RootState) => state.playerReducer.player !!);
  const opponent = props.whitePlayer!.uuid === player!.uuid ? props.blackPlayer !! : props.whitePlayer !!
  const gameResult = determineGameResult(props, player)

  const {sendMessage} = useWebSocket([
    {
      topic: `/topic/game/${props.uuid}/draw`,
      handler: (message) => {
        const parsed = JSON.parse(message) as GameDrawRequest;
        drawService.handleDrawRequest(parsed);
      },
    },
    {
      topic: `/topic/game/${props.uuid}`,
      handler: (message: string) => {
        setGame(new Chess(message));
      },
    },
    {
      topic: `/topic/game/${props.uuid}/time`,
      handler: (message) => {
        message = JSON.parse(message) as PlayerTime;
        setPlayersTime(message)
      },
    },
    {
      topic: `/topic/game/${props.uuid}/saved`,
      handler: (message) => {
        message = JSON.parse(message) as GameResponse;
        setPlayersTime(message)
      },
    },
  ])

  const [pendingDrawRequest, setPendingDrawRequest] = useState<GameDrawRequest | null>(null);
  const drawService = useMemo(() =>
    createDrawService({
      player,
      gameId: props.uuid,
      sendMessage,
      onDrawRequested: setPendingDrawRequest,
      onDrawAccepted: () => {
        setPendingDrawRequest(null)
        saveGame({
          uuid: props.uuid,
          winner: null,
          gameResult: GameState.DRAW_AGREEMENT
        })
      },
      onDrawRejected: () => setPendingDrawRequest(null),
    }), [player, props.uuid, sendMessage]);

  function sendResignRequest() {
    saveGame({
      uuid: props.uuid,
      winner: opponent.uuid,
      gameResult: GameState.RESIGNATION
    })
  }


  const getBoardOrientation = (): "white" | "black" => {
    if (player && props.whitePlayer && props.whitePlayer.uuid === player.uuid) {
      return "white"
    } else if (player && props.blackPlayer && props.blackPlayer.uuid === player.uuid) {
      return "black"
    }
    return "white"
  }

  useEffect(() => {
    props.history.forEach(fen => game.load(fen))

    if (game.isGameOver()) {
      setGame(new Chess(game.fen()))
    }

  }, []);


  const sendMove = (fen: string) => {
    sendMessage({
      destination: `/game/${props.uuid}/move`,
      body: fen,
    })
  };

  const canPlayerMove = (): boolean => {
    if (gameResult != GameResult.ONGOING) return false;

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


  return (
    <>
      {gameResult !== GameResult.ONGOING
        ? (<div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mx-auto mt-8 w-full max-w-xl bg-white dark:bg-gray-900 shadow-lg rounded-2xl p-6 text-center border dark:border-gray-700"
          >
            <h2 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mb-4">
              {"Game is no longer ongoing."}
            </h2>

            <div className="grid grid-cols-2 gap-4 text-sm text-gray-700 dark:text-gray-200">
              <div className="font-semibold text-right">Result:</div>
              <div className="text-left">{gameResult}</div>

              <div className="font-semibold text-right">White:</div>
              <div className="text-left">{props.whitePlayer?.nickname}</div>

              <div className="font-semibold text-right">Black:</div>
              <div className="text-left">{props.blackPlayer?.nickname}</div>

              <div className="font-semibold text-right">Game Duration:</div>
              <div className="text-left">{getDurationString(props.createdAt, props.finishedAt)}</div>

              <div className="font-semibold text-right">Total Moves:</div>
              <div className="text-left">{props.history.length}</div>
            </div>
          </motion.div>
        </div>)
        : (<div className="flex  w-full text-white font-sans">
          {/* Center content */}
          <main className="flex-1 flex flex-col items-center justify-center px-4">
            {/* Top Player Info */}
            <div className="text-center mb-4">
              <p className="text-lg font-semibold">{opponent.nickname}</p>
              {playersTime && <p className="text-sm text-gray-400">{formatTime(
                getBoardOrientation() === "black" ? playersTime.whitePlayerTime : playersTime.blackPlayerTime)}</p>}
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
              <p className="text-lg font-semibold">{player.nickname}</p>
              {playersTime && <p className="text-sm text-gray-400">{formatTime(
                getBoardOrientation() === "white" ? playersTime.whitePlayerTime : playersTime.blackPlayerTime)}</p>}
            </div>
          </main>

          {/* Right Panel */}
          <aside className="w-[340px] p-4 flex flex-col bg-neutral-900 border-l border-neutral-800">
            {/* Move List */}
            <div className="mb-6">
              <h3 className="text-lg font-bold mb-2">Moves</h3>
              <div className="border border-white/10 rounded p-2 h-48 overflow-y-auto bg-black">
                <ul className="text-sm space-y-1 text-gray-200">
                  //moves
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
            {pendingDrawRequest && player?.uuid === pendingDrawRequest.toPlayer.uuid && (
              <motion.div
                initial={{opacity: 0, y: 10}}
                animate={{opacity: 1, y: 0}}
                transition={{duration: 0.5, ease: "easeOut"}}
                className="fixed bottom-6 right-6 bg-white/90 backdrop-blur-md border border-gray-200 shadow-lg rounded-xl p-4 z-40 max-w-sm w-full"
              >
                <p className="text-base text-gray-700 mb-3">
                  <span className="font-medium">{pendingDrawRequest.fromPlayer.nickname ?? 'Opponent'}</span> offered a
                  draw.
                </p>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => drawService.acceptDraw(pendingDrawRequest)}
                    className="px-4 py-1.5 rounded-md text-sm font-medium text-white bg-emerald-500 hover:bg-emerald-600 transition"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => drawService.rejectDraw(pendingDrawRequest)}
                    className="px-4 py-1.5 rounded-md text-sm font-medium text-white bg-gray-400 hover:bg-gray-500 transition"
                  >
                    Decline
                  </button>
                </div>
              </motion.div>
            )}
            <div className="flex-2 flex flex-col border border-white/10 rounded p-2 bg-black">
              <button className="bg-grey-600 hover:bg-red-900 text-white font-semibold py-2 px-4 rounded-lg transition"
                      onClick={() => drawService.sendDrawRequest({
                        fromPlayer: player,
                        toPlayer: props?.whitePlayer?.uuid === player.uuid ? props.blackPlayer : props.whitePlayer,
                        status: 'REQUESTED'
                      } as GameDrawRequest)}
              >Draw
              </button>
              <button className="bg-grey-600 hover:bg-red-900 text-white font-semibold py-2 px-4 rounded-lg transition"
                      onClick={() => sendResignRequest()}
              >Resign
              </button>
            </div>
          </aside>
        </div>)
      }


    </>
  );

};