import { motion } from "framer-motion";
import {MatchmakingQueueSize} from "../app/interfaces/IGame.ts";

interface SearchingModalProps {
  queueSize: MatchmakingQueueSize | null;
  isOpen: boolean;
  onCancel: () => void;
}

export default function SearchingModal({queueSize, isOpen, onCancel }: SearchingModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-zinc-900 p-6 rounded-xl shadow-xl text-white w-[90%] max-w-sm text-center"
      >
        <h2 className="text-xl font-semibold mb-4">Searching for Opponent...</h2>
        <div className="flex justify-center mb-4">
          <div className="h-8 w-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
        </div>
        {queueSize && (
          <p className="text-sm text-zinc-400 mb-4">
            Total players online: {queueSize.total}. By selected mode: {queueSize.byTimeMode}
          </p>
        )}

        <p className="text-sm text-zinc-400 mb-4">
          Sit tight while we find a match. This may take a few seconds.
        </p>
        <button
          onClick={onCancel}
          className="mt-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm font-medium"
        >
          Cancel Search
        </button>
      </motion.div>
    </div>
  );
}
