import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../app/state/store.ts";
import SockJS from "sockjs-client";
import { backendIp } from "../app/config/backend.ts";
import { Client, Stomp } from "@stomp/stompjs";
import { GameResponse } from "../app/interfaces/IGame.ts";
import InvitePanel from "@/components/InvitePanel.tsx";

export const WaitingRoomPage: React.FC<GameResponse> = (props) => {
  const user = useSelector((state: RootState) => state.playerReducer.player);
  const [client, setClient] = useState<Client | null>(null);
  const [isStarting, setIsStarting] = useState(false);

  function webSocketConnection() {
    const sock = new SockJS(`${backendIp}/ws`);
    const stompClient = Stomp.over(sock);
    stompClient.debug = () => {};
    setClient(stompClient);

    stompClient.connect({}, () => {
      stompClient.subscribe(`/topic/game/${props.uuid}/started`, (message) => {
        if (message.body) window.location.reload();
      });
    });

    return stompClient;
  }

  useEffect(() => {
    const stompClient = webSocketConnection();
    return () => stompClient.disconnect();
  }, []);

  const handleStartGame = () => {
    if (!user || !client) return;
    setIsStarting(true);

    client.publish({
      destination: `/app/game/${props.uuid}/start`,
      body: JSON.stringify({
        uuid: props.uuid,
        whitePlayer: props.whitePlayer?.uuid ?? user.uuid,
        blackPlayer: props.blackPlayer?.uuid ?? user.uuid,
      }),
    });

    window.location.reload();
  };

  const isPlayer =
    user?.uuid === props?.whitePlayer?.uuid ||
    user?.uuid === props?.blackPlayer?.uuid;

  return (
    <div className="flex items-center justify-center p-6 relative overflow-hidden">

      {/* Main card */}
      <div className="relative z-10 w-full max-w-md bg-[#0f172a]/90 border border-[#c8952a]/20 rounded-2xl p-8 flex flex-col gap-7 shadow-[0_32px_64px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(200,149,42,0.1)]">

        {/* Header */}
        <div className="text-center">
          <span className="block text-4xl mb-2 drop-shadow-[0_0_12px_rgba(200,149,42,0.5)] animate-bounce">
            ♔
          </span>
          <h1 className="font-serif text-3xl font-black text-[#f0e6c8] tracking-wide">
            Waiting Room
          </h1>
          <p className="text-xs uppercase tracking-[0.12em] text-[#c8b98a]/60 mt-1">
            Share the link to invite your opponent
          </p>
        </div>

        {/* Player slots */}
        <div className="flex items-center gap-3">
          <PlayerSlot icon="♔" label="White" ready={!!props.whitePlayer} />
          <span className="font-serif text-xl font-bold text-[#c8952a] shrink-0">VS</span>
          <PlayerSlot icon="♚" label="Black" ready={!!props.blackPlayer} />
        </div>

        {/* Invite panel: QR + copy link */}
        <InvitePanel url={window.location.href} />

        {/* CTA */}
        <div className="flex justify-center">
          {!isPlayer ? (
            <button
              onClick={handleStartGame}
              disabled={isStarting}
              className="
                flex items-center gap-2 px-8 py-3 rounded-xl
                bg-gradient-to-br from-[#c8952a] to-[#f0b93a]
                text-[#1a1209] font-mono font-semibold text-sm tracking-wide
                shadow-[0_4px_20px_rgba(200,149,42,0.35)]
                transition-all duration-150
                hover:-translate-y-0.5 hover:shadow-[0_8px_28px_rgba(200,149,42,0.5)]
                active:translate-y-0
                disabled:opacity-60 disabled:cursor-not-allowed
              "
            >
              {isStarting ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-[#1a1209]/30 border-t-[#1a1209] rounded-full animate-spin" />
                  Starting…
                </>
              ) : (
                <>♟ Play Game</>
              )}
            </button>
          ) : (
            <div className="flex items-center gap-2.5 px-5 py-3 border border-[#c8952a]/20 rounded-xl text-xs text-[#c8b98a]/60 tracking-wide font-mono">
              <span className="w-2 h-2 rounded-full bg-[#c8952a] animate-pulse shrink-0" />
              You're in — waiting for opponent
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

/* ── PlayerSlot ── */
const PlayerSlot: React.FC<{ icon: string; label: string; ready: boolean }> = ({ icon, label, ready }) => (
  <div className={`
    flex-1 flex flex-col items-center gap-1 py-4 px-3 rounded-xl border transition-all duration-300
    ${ready
    ? "border-[#c8952a] shadow-[0_0_16px_rgba(200,149,42,0.15)]"
    : "border-[#c8952a]/15 bg-black/20"
  }
  `}>
    <span className="text-3xl leading-none">{icon}</span>
    <span className="text-[0.6rem] uppercase tracking-[0.12em] text-[#c8b98a]/50">{label}</span>
    <span className="text-xs text-[#f0e6c8] font-mono">{ready ? "Ready" : "Waiting…"}</span>
  </div>
);