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
      {selectedGameMode !== GameMode.NON_RATING && (
        <div className="w-full max-w-3xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-white/10 border border-white/10">

          {[
            {
              mode: GameMode.BULLET,
              icon: "⚡",
              title: "Bullet",
              desc: "Lightning-fast games. Every second counts - it all comes down to instinct and reflexes.",
              formats: ["1+0", "1+1", "2+1"],
            },
            {
              mode: GameMode.BLITZ,
              icon: "🔥",
              title: "Blitz",
              desc: "Quick games with time to think. A popular format for most players.",
              formats: ["3+0", "3+2", "5+0", "5+3"],
            },
            {
              mode: GameMode.RAPID,
              icon: "⏱",
              title: "Rapid",
              desc: "Plenty of time for strategy. Ideal for a deeper analysis of positions during the game.",
              formats: ["10+0", "10+5", "15+10", "25+10"],
            },
            {
              mode: GameMode.CLASSICAL,
              icon: "♟",
              title: "Classical",
              desc: "The longest format. Every move requires thorough preparation and long-term planning.",
              formats: ["30+0", "30+20", "60+0", "90+30"],
            },
          ]
            .filter((item) => item.mode === selectedGameMode)
            .map((item) => (
              <div
                key={item.mode}
                className="col-span-1 md:col-span-2 lg:col-span-3 grid grid-cols-1 lg:grid-cols-3 gap-px bg-white/10"
              >

                {/* Left: description */}
                <div className="lg:col-span-2 bg-zinc-900 p-4 md:p-6 flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl md:text-3xl">{item.icon}</span>
                    <h3 className="text-base md:text-lg font-bold uppercase tracking-widest text-white">
                      {item.title}
                    </h3>
                  </div>

                  <p className="text-white/60 text-sm leading-relaxed">
                    {item.desc}
                  </p>

                  <div className="flex flex-wrap gap-2 mt-2">
                    {item.formats.map((f) => (
                      <span
                        key={f}
                        className="px-3 py-1 border border-white/20 text-xs text-white/50 font-mono"
                      >
                  {f}
                </span>
                    ))}
                  </div>
                </div>

                {/* Right: rating tip */}
                <div className="bg-zinc-900 p-4 md:p-6 flex flex-col justify-between gap-4 border-t lg:border-t-0 lg:border-l border-white/10">
                  <div>
                    <p className="text-xs uppercase tracking-widest text-white/40 mb-2">
                      Rating system
                    </p>
                    <p className="text-white/60 text-sm leading-relaxed">
                      Every win, loss, or draw will affect your{" "}
                      <span className="text-white font-semibold">ELO</span> rating for this format separately
                    </p>
                  </div>

                  <div className="border-t border-white/10 pt-4">
                    <p className="text-xs uppercase tracking-widest text-white/40 mb-1">
                      Tip
                    </p>
                    <p className="text-white/50 text-xs leading-relaxed">
                      {item.mode === GameMode.BULLET &&
                        "Preset openings and quick patterns are the key to success."}
                      {item.mode === GameMode.BLITZ &&
                        "Practice tactical motifs - most games are decided by a mistake in the combination."}
                      {item.mode === GameMode.RAPID &&
                        "Take the time to study endgames - games are played to the very end here."}
                      {item.mode === GameMode.CLASSICAL &&
                        "Pre-opening preparations and a long-term strategy are crucial."}
                    </p>
                  </div>
                </div>
              </div>
            ))}
        </div>
      )}
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