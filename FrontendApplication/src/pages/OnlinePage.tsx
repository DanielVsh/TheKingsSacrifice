import {useNavigate} from "react-router-dom";
import {useCreateGameMutation} from "../app/state/api/GameApi.ts";
import {useSelector} from "react-redux";
import {RootState} from "../app/state/store.ts";
import {useEffect, useState} from "react";
import {GameMode, GameResponse, MatchmakingQueueSize, PlayerMatchRequest} from "../app/interfaces/IGame.ts";
import TimeModes from "../components/TimeModes.tsx";
import {useWebSocket} from "../hooks/useWebSocket.ts";
import SearchingModal from "../modals/SearchingModal.tsx";
import {getRatingByGameMode} from "../app/interfaces/IPlayer.ts";

export const OnlinePage = () => {

  const [selectedGameMode, setSelectedGameMode] = useState<GameMode>(GameMode.BLITZ)
  const user = useSelector((state: RootState) => state.playerReducer.player)!!
  const [createGame] = useCreateGameMutation()
  const navigate = useNavigate()
  const [minutes, setMinutes] = useState(0)
  const [seconds, setSeconds] = useState(0)

  const [queueSize, setQueueSize] = useState<MatchmakingQueueSize | null>(null)
  const [isSearchingRatingGame, setSearchRatingGame] = useState<boolean>(false)
  const [currentMatchRequest, setCurrentMatchRequest] = useState<PlayerMatchRequest | null>(null)

  const {sendMessage} = useWebSocket([
    {
      topic: `/topic/user/${user.uuid}/queue/match`,
      handler: (message) => {
        const parsed = JSON.parse(message) as GameResponse;
        setSearchRatingGame(false)
        navigate(`/play/online/${parsed.uuid}`, {replace: true});
      },
    },
    {
      topic: `/topic/user/${user.uuid}/queue/match/size`,
      handler: (message) => {
        const parsed = JSON.parse(message) as MatchmakingQueueSize;
        setQueueSize(parsed);
      },
    },
  ])

  useEffect(() => {
    if (isSearchingRatingGame) {
      // Start matchmaking
      sendMessage({
        destination: "/find-rated",
        body: JSON.stringify(currentMatchRequest)
      });

      // Cleanup function for tab close, modal close, or navigation
      const handleUnload = () => cancelSearch();
      const handleVisibilityChange = () => {
        if (document.visibilityState === "hidden") cancelSearch();
      };

      window.addEventListener("beforeunload", handleUnload);
      document.addEventListener("visibilitychange", handleVisibilityChange);

      return () => {
        // Component unmounted or `isSearchingRatingGame` changed
        cancelSearch();

        window.removeEventListener("beforeunload", handleUnload);
        document.removeEventListener("visibilitychange", handleVisibilityChange);
      };
    }
  }, [isSearchingRatingGame]);

  function cancelSearch() {
    setSearchRatingGame(false)
    sendMessage({
      destination: "/cancel-rated",
      body: JSON.stringify(currentMatchRequest)
    })
  }

  const handleCreateGame = (playerColor: string) => {
    if (user == null) return;

    if (playerColor === 'r') {
      Math.floor(Math.random() * 2) === 0 ? playerColor = 'w' : playerColor = 'b'
    }

    createGame({
      whitePlayer: playerColor === 'w' ? user.uuid : null,
      blackPlayer: playerColor === 'b' ? user.uuid : null,
      timeFormat: `${minutes * 60}+${seconds}`,
      gameMode: GameMode.NON_RATING
    })
      .then(value => {
        if ('data' in value) {
          const valueData = value.data as GameResponse;
          navigate(`/play/online/${valueData.uuid}`, {replace: true});
        }
      })
  }

  const handleMinutesChange = (event: { target: { value: string; }; }) => {
    const newMinutes = parseInt(event.target.value);
    setMinutes(newMinutes >= 0 ? newMinutes : 0);
  };

  const handleSecondsChange = (event: { target: { value: string; }; }) => {
    const newSeconds = parseInt(event.target.value);
    setSeconds(newSeconds >= 0 ? newSeconds : 0);
  };

  const commonButtonClassName = `${minutes === 0 && seconds === 0
    ? 'pointer-events-none opacity-50 cursor-not-allowed '
    : 'cursor-pointer'}`;


  return (
    <>
      <div className=" overflow-hidden flex flex-col items-center justify-center text-white">
        <div>
          <SearchingModal queueSize={queueSize} isOpen={isSearchingRatingGame} onCancel={() => cancelSearch()}/>
          <TimeModes onActiveCategoryChange={category => setSelectedGameMode(category)}
                     onSelect={(mode) => {
                       setSearchRatingGame(true)
                       setCurrentMatchRequest({
                         timeFormat: `${parseInt(mode.name.split("+")[0], 10) * 60}+${mode.name.split("+")[1]}`,
                         rating: getRatingByGameMode(user, mode.category),
                         playerUUID: user!.uuid,
                         gameMode: mode.category
                       })
                     }}/>
          {selectedGameMode === GameMode.NON_RATING ?
            <>
              {/* Time configuration card */}
              <div className="w-full max-w-2xl bg-zinc-900 rounded-2xl p-6 shadow-xl flex flex-col items-center gap-6">

                {/* Mode select */}
                <div className="w-full flex flex-col items-center gap-2">
                  <label
                    htmlFor="modes"
                    className="text-sm uppercase tracking-wide text-zinc-400 font-semibold"
                  >
                    Time Mode
                  </label>
                </div>

                {/* Sliders */}

                  <div className="w-full flex flex-col gap-6">

                    {/* Minutes */}
                    <div className="flex flex-col gap-2">
                      <div className="flex justify-between text-sm text-zinc-400">
                        <span>Minutes per side</span>
                        <span className="font-semibold text-white">{minutes} min</span>
                      </div>

                      <input
                        type="range"
                        min="0"
                        max="180"
                        value={minutes}
                        step={minutes < 15 ? 1 : 5}
                        onChange={handleMinutesChange}
                        className="w-full accent-white cursor-pointer"
                      />
                    </div>

                    {/* Seconds */}
                    <div className="flex flex-col gap-2">
                      <div className="flex justify-between text-sm text-zinc-400">
                        <span>Increment per move</span>
                        <span className="font-semibold text-white">{seconds} sec</span>
                      </div>

                      <input
                        type="range"
                        min="0"
                        max="180"
                        value={seconds}
                        step={seconds < 15 ? 1 : 5}
                        onChange={handleSecondsChange}
                        className="w-full accent-white cursor-pointer"
                      />
                    </div>

                    {/* Time preview */}
                    <div className="text-center text-5xl font-extrabold tracking-tight pt-2">
                      {minutes}m<span className="text-zinc-400">+</span>{seconds}s
                    </div>
                  </div>

              </div>

              {/* Color buttons */}
              <div className="flex flex-wrap justify-center gap-6 pt-10">
                {[
                  {key: "w", label: "White"},
                  {key: "r", label: "Random"},
                  {key: "b", label: "Black"},
                ].map(({key, label}) => (
                  <button
                    key={key}
                    onClick={() => handleCreateGame(key)}
                    className={`
          ${commonButtonClassName}
          px-10 py-5 rounded-2xl
          text-3xl font-bold
          bg-zinc-800 hover:bg-zinc-700
          active:scale-95 transition-all
          shadow-lg
        `}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </>

            :
            <></>
          }
        </div>
      </div>
    </>
  );
};