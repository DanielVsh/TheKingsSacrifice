import { useNavigate } from "react-router-dom";
import { useCreateGameMutation } from "../app/state/api/GameApi.ts";
import { useSelector } from "react-redux";
import { RootState } from "../app/state/store.ts";
import { useEffect, useState } from "react";
import { GameMode, GameResponse, MatchmakingQueueSize, PlayerMatchRequest } from "../app/interfaces/IGame.ts";
import TimeModes from "../components/TimeModes.tsx";
import { useWebSocket } from "../hooks/useWebSocket.ts";
import SearchingModal from "../modals/SearchingModal.tsx";
import { getRatingByGameMode } from "../app/interfaces/IPlayer.ts";

export const OnlinePage = () => {
  const [selectedGameMode, setSelectedGameMode] = useState<GameMode>(GameMode.BLITZ);
  const user = useSelector((state: RootState) => state.playerReducer.player)!;
  const [createGame] = useCreateGameMutation();
  const navigate = useNavigate();
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);

  const [queueSize, setQueueSize] = useState<MatchmakingQueueSize | null>(null);
  const [isSearchingRatingGame, setSearchRatingGame] = useState<boolean>(false);
  const [currentMatchRequest, setCurrentMatchRequest] = useState<PlayerMatchRequest | null>(null);

  const { sendMessage } = useWebSocket([
    {
      topic: `/topic/user/${user.uuid}/queue/match`,
      handler: (message) => {
        const parsed = JSON.parse(message) as GameResponse;
        setSearchRatingGame(false);
        navigate(`/play/online/${parsed.uuid}`, { replace: true });
      },
    },
    {
      topic: `/topic/user/${user.uuid}/queue/match/size`,
      handler: (message) => {
        const parsed = JSON.parse(message) as MatchmakingQueueSize;
        setQueueSize(parsed);
      },
    },
  ]);

  useEffect(() => {
    if (isSearchingRatingGame) {
      sendMessage({
        destination: "/find-rated",
        body: JSON.stringify(currentMatchRequest),
      });

      const handleUnload = () => cancelSearch();
      const handleVisibilityChange = () => {
        if (document.visibilityState === "hidden") cancelSearch();
      };

      window.addEventListener("beforeunload", handleUnload);
      document.addEventListener("visibilitychange", handleVisibilityChange);

      return () => {
        cancelSearch();
        window.removeEventListener("beforeunload", handleUnload);
        document.removeEventListener("visibilitychange", handleVisibilityChange);
      };
    }
  }, [isSearchingRatingGame]);

  const cancelSearch = () => {
    setSearchRatingGame(false);
    sendMessage({
      destination: "/cancel-rated",
      body: JSON.stringify(currentMatchRequest),
    });
  };

  const handleCreateGame = (playerColor: string) => {
    if (!user) return;

    if (playerColor === "r") {
      playerColor = Math.random() < 0.5 ? "w" : "b";
    }

    createGame({
      whitePlayer: playerColor === "w" ? user.uuid : null,
      blackPlayer: playerColor === "b" ? user.uuid : null,
      timeFormat: `${minutes * 60}+${seconds}`,
      gameMode: GameMode.NON_RATING,
    }).then((value) => {
      if ("data" in value) {
        const valueData = value.data as GameResponse;
        navigate(`/play/online/${valueData.uuid}`, { replace: true });
      }
    });
  };

  const handleMinutesChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setMinutes(Math.max(parseInt(e.target.value), 0));

  const handleSecondsChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setSeconds(Math.max(parseInt(e.target.value), 0));

  const isTimeZero = minutes === 0 && seconds === 0;

  return (
    <div className="flex flex-col items-center justify-center p-6 text-white space-y-10">
      <SearchingModal queueSize={queueSize} isOpen={isSearchingRatingGame} onCancel={cancelSearch} />

      {/* Game Mode Selector */}
      <TimeModes
        onActiveCategoryChange={(category) => setSelectedGameMode(category)}
        onSelect={(mode) => {
          setSearchRatingGame(true);
          setCurrentMatchRequest({
            timeFormat: `${parseInt(mode.name.split("+")[0], 10) * 60}+${mode.name.split("+")[1]}`,
            rating: getRatingByGameMode(user, mode.category),
            playerUUID: user.uuid,
            gameMode: mode.category,
          });
        }}
      />

      {selectedGameMode === GameMode.NON_RATING && (
        <>
          {/* Time Configuration Card */}
          <div className="w-full max-w-2xl border border-white/20 p-6 flex flex-col gap-6 rounded-none bg-zinc-900">
            <h3 className="text-sm uppercase tracking-wide text-white/70 font-semibold">Time Configuration</h3>

            <div className="flex flex-col gap-6">
              {/* Minutes */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between text-sm text-white/70">
                  <span>Minutes per side</span>
                  <span className="font-semibold">{minutes} min</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={180}
                  value={minutes}
                  step={minutes < 15 ? 1 : 5}
                  onChange={handleMinutesChange}
                  className="w-full accent-white cursor-pointer"
                />
              </div>

              {/* Seconds */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between text-sm text-white/70">
                  <span>Increment per move</span>
                  <span className="font-semibold">{seconds} sec</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={180}
                  value={seconds}
                  step={seconds < 15 ? 1 : 5}
                  onChange={handleSecondsChange}
                  className="w-full accent-white cursor-pointer"
                />
              </div>

              {/* Preview */}
              <div className="text-center text-5xl font-extrabold tracking-tight">
                {minutes}m<span className="text-white/50">+</span>{seconds}s
              </div>
            </div>
          </div>

          {/* Color Selection Buttons */}
          <div className="flex flex-wrap justify-center gap-6">
            {[
              { key: "w", label: "White" },
              { key: "r", label: "Random" },
              { key: "b", label: "Black" },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => handleCreateGame(key)}
                disabled={isTimeZero}
                className={`px-10 py-5 text-3xl font-bold border border-white/20 rounded-none hover:bg-white/10 transition-all shadow-lg ${
                  isTimeZero ? "opacity-40 pointer-events-none" : ""
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};