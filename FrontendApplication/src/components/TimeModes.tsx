import {useState} from "react";
import {motion} from "framer-motion";
import {GameMode} from "../app/interfaces/IGame.ts";

type TimeMode = {
  name: string;
  time: string;
  increment: string;
  category: GameMode;
};

const TIME_MODE_GROUPS: Record<GameMode, TimeMode[]> = {
  BULLET: [
    { name: "1+0", time: "1 min", increment: "0", category: GameMode.BULLET },
    { name: "1+1", time: "1 min", increment: "1s", category: GameMode.BULLET },
    { name: "2+1", time: "2 min", increment: "1s", category: GameMode.BULLET },
  ],
  BLITZ: [
    { name: "3+0", time: "3 min", increment: "0", category: GameMode.BLITZ },
    { name: "3+2", time: "3 min", increment: "2s", category: GameMode.BLITZ },
    { name: "5+0", time: "5 min", increment: "0", category: GameMode.BLITZ },
    { name: "5+3", time: "5 min", increment: "3s", category: GameMode.BLITZ },
  ],
  RAPID: [
    { name: "10+0", time: "10 min", increment: "0", category: GameMode.RAPID },
    { name: "10+5", time: "10 min", increment: "5s", category: GameMode.RAPID },
    { name: "15+10", time: "15 min", increment: "10s", category: GameMode.RAPID },
    { name: "25+10", time: "25 min", increment: "10s", category: GameMode.RAPID },
  ],
  CLASSICAL: [
    { name: "30+0", time: "30 min", increment: "0", category: GameMode.CLASSICAL },
    { name: "30+20", time: "30 min", increment: "20s", category: GameMode.CLASSICAL },
    { name: "60+0", time: "60 min", increment: "0", category: GameMode.CLASSICAL },
    { name: "90+30", time: "90 min", increment: "30s", category: GameMode.CLASSICAL },
  ],
  [GameMode.NON_RATING]: [

  ],
};

export default function TimeModes({onSelect, onActiveCategoryChange}: {
  onSelect: (mode: TimeMode) => void;
  onActiveCategoryChange: (category: GameMode) => void;
}) {
  const [selected, setSelected] = useState<TimeMode | null>(null);
  const [activeCategory, setActiveCategory] = useState<GameMode>(GameMode.BULLET);

  const categories = Object.keys(TIME_MODE_GROUPS) as GameMode[];

  return (
    <div className="w-full flex flex-col items-center text-white px-4 py-6 sm:py-8">
      {/* Header */}
      <h1 className="text-2xl sm:text-3xl font-bold text-center mb-4">
        Choose Time Control
      </h1>

      {/* Category Tabs */}
      <div className="flex gap-3 mb-6 flex-wrap justify-center">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => {
              setActiveCategory(cat)
              onActiveCategoryChange(cat)
            }
          }
            className={`px-4 py-2 rounded-xl font-semibold text-sm sm:text-base transition
              ${activeCategory === cat ? "bg-emerald-600 text-white" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"}`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Mode Buttons for Active Category */}
      <div className="w-full max-w-5xl flex flex-wrap gap-3 justify-center">
        {TIME_MODE_GROUPS[activeCategory].map((mode) => (
          <div key={mode.name} className="relative">
            {selected?.name === mode.name ? (
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2 }}
                onClick={() => onSelect(selected)}
                className="px-6 py-3 sm:px-8 sm:py-4 bg-emerald-600 hover:bg-emerald-700 rounded-xl text-sm sm:text-base font-semibold shadow-md"
              >
                Play {mode.name} Rated Game
              </motion.button>
            ) : (
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setSelected(mode)}
                className="rounded-xl border-2 px-4 py-3 text-left shadow-md text-sm sm:text-base transition-all
                  border-zinc-700 hover:border-emerald-500"
              >
                <div className="font-bold">{mode.name}</div>
                <div className="text-xs text-zinc-400">
                  {mode.time}
                  {mode.increment !== "0" && ` | +${mode.increment}`}
                </div>
              </motion.button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
