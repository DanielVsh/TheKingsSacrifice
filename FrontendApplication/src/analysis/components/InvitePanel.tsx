import React, { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";

type InvitePanelProps = {
  url: string;
};

type CopyState = "idle" | "copied" | "error";

const InvitePanel: React.FC<InvitePanelProps> = ({ url }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [qrReady, setQrReady] = useState(false);
  const [copyState, setCopyState] = useState<CopyState>("idle");

  useEffect(() => {
    if (!canvasRef.current) return;
    QRCode.toCanvas(canvasRef.current, url, {
      width: 160,
      margin: 1,
      color: { dark: "#1a1209", light: "#f0e6c8" },
    })
      .then(() => setQrReady(true))
      .catch(console.error);
  }, [url]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopyState("copied");
    } catch {
      setCopyState("error");
    } finally {
      setTimeout(() => setCopyState("idle"), 2200);
    }
  };

  const shortUrl = url.replace(/^https?:\/\//, "");

  const copyButtonClass = {
    idle:   "border-[#c8952a]/40 bg-[#c8952a]/10 text-[#c8952a] hover:bg-[#c8952a]/20 hover:border-[#c8952a]/70",
    copied: "border-green-500/50 bg-green-500/10 text-green-400",
    error:  "border-red-500/40 bg-red-500/10 text-red-400",
  }[copyState];

  return (
    <div className="flex flex-col items-center gap-4 p-5 rounded-xl border border-[#c8952a]/20 bg-black/20">

      {/* QR Code */}
      <div className="flex flex-col items-center gap-2">
        <div className="relative">
          {/* Skeleton shown until QR renders */}
          {!qrReady && (
            <div className="w-[160px] h-[160px] rounded-lg bg-[#c8952a]/10 animate-pulse" />
          )}
          <canvas
            ref={canvasRef}
            className={`rounded-lg border-2 border-[#c8952a]/30 block transition-all duration-500 ${
              qrReady ? "opacity-100 scale-100" : "opacity-0 scale-95 absolute inset-0"
            }`}
          />
        </div>
        <span className="text-[0.65rem] uppercase tracking-[0.1em] text-[#c8b98a]/50">
          Scan to join
        </span>
      </div>

      {/* Divider */}
      <div className="w-full flex items-center gap-3">
        <div className="flex-1 h-px bg-[#c8952a]/20" />
        <span className="text-[0.65rem] uppercase tracking-[0.1em] text-[#c8b98a]/40 whitespace-nowrap">
          or share the link
        </span>
        <div className="flex-1 h-px bg-[#c8952a]/20" />
      </div>

      {/* URL + Copy button */}
      <div className="w-full flex items-center gap-2 px-3 py-2 bg-black/30 border border-[#c8952a]/20 rounded-lg">
        <span className="flex-1 text-[0.7rem] text-[#c8b98a]/60 font-mono truncate" title={url}>
          {shortUrl}
        </span>
        <button
          onClick={handleCopy}
          aria-label="Copy invite URL"
          className={`
            shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-md
            text-[0.72rem] font-mono font-medium tracking-wide border
            transition-all duration-150 hover:-translate-y-px active:translate-y-0
            ${copyButtonClass}
          `}
        >
          {copyState === "copied" ? (
            <><CheckIcon /> Copied!</>
          ) : copyState === "error" ? (
            "Error"
          ) : (
            <><CopyIcon /> Copy</>
          )}
        </button>
      </div>

    </div>
  );
};

const CopyIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <rect x="9" y="9" width="13" height="13" rx="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);

const CheckIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

export default InvitePanel;