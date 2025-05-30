import {useEffect} from "react";
import {motion} from "framer-motion";
import {AiOutlineClose} from "react-icons/ai";
import confetti from "canvas-confetti";
import {GameResult} from "../app/enums/GameResult.ts";
import {SoundService} from "../services/SoundService.ts";

interface GameResultModalProps {
  isOpen: boolean;
  result: GameResult;
  onClose: () => void;
}

const GameResultModal = ({ isOpen, result, onClose }: GameResultModalProps) => {
  useEffect(() => {
    if (!isOpen) return;

    if (result === GameResult.WIN) SoundService.play("win");
    else if (result === GameResult.LOSS) SoundService.play("loss");
    else SoundService.play("draw")

    if (result === GameResult.WIN) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
    if (result === GameResult.LOSS) {
      const duration = 1.5 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 10, spread: 360, ticks: 60, zIndex: 1000 };

      const interval = setInterval(() => {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        confetti({
          ...defaults,
          particleCount: 2,
          angle: 90,
          origin: { x: Math.random(), y: 0 },
          colors: ['#ff0000'],
          shapes: ['circle'],
        });
      }, 250);
    }
    if (result === GameResult.DRAW) {
      confetti({
        particleCount: 50,
        spread: 45,
        startVelocity: 20,
        origin: { y: 0.4 },
        colors: ['#999999', '#cccccc'],
        shapes: ['square'],
        gravity: 0.6,
        scalar: 0.8,
      });
    }
  }, [isOpen, result]);

  if (!isOpen) return null;

  const bgColor =
    result === GameResult.WIN
      ? "bg-green-500"
      : result === GameResult.LOSS
        ? "bg-red-600"
        : "bg-gray-600";

  const title =
    result === GameResult.WIN
      ? "You Won! 🎉"
      : result === GameResult.LOSS
        ? "You Lost 😞"
        : "It's a Draw 🤝";

  const message =
    result === GameResult.WIN
      ? "Great job, champion!"
      : result === GameResult.LOSS
        ? "Better luck next time!"
        : "Nobody wins this time.";

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-70 flex justify-center items-center" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.7 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.7 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className={`p-6 rounded-2xl w-[90%] max-w-md text-center shadow-2xl relative ${bgColor} text-white`}
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-xl">
          <AiOutlineClose />
        </button>
        <h2 className="text-4xl font-extrabold mb-4">{title}</h2>
        <p className="text-lg mb-6">{message}</p>
        <button
          onClick={onClose}
          className="mt-4 px-6 py-2 bg-black rounded-full hover:bg-opacity-80"
        >
          Close
        </button>
      </motion.div>
    </div>
  );
};

export default GameResultModal;
