import {useState} from "react";
import {motion} from "framer-motion";

type TimeMode = {
  name: string;
  time: string;
  increment: string;
  category: Category;
};

type Category = "Bullet" | "Blitz" | "Rapid" | "Classical";

const TIME_MODE_GROUPS: Record<Category, TimeMode[]> = {
  Bullet: [
    {name: "1+0", time: "1 min", increment: "0", category: "Bullet"},
    {name: "1+1", time: "1 min", increment: "1s", category: "Bullet"},
    {name: "2+1", time: "2 min", increment: "1s", category: "Bullet"},
  ],
  Blitz: [
    {name: "3+0", time: "3 min", increment: "0", category: "Blitz"},
    {name: "3+2", time: "3 min", increment: "2s", category: "Blitz"},
    {name: "5+0", time: "5 min", increment: "0", category: "Blitz"},
    {name: "5+3", time: "5 min", increment: "3s", category: "Blitz"},
  ],
  Rapid: [
    {name: "10+0", time: "10 min", increment: "0", category: "Rapid"},
    {name: "10+5", time: "10 min", increment: "5s", category: "Rapid"},
    {name: "15+10", time: "15 min", increment: "10s", category: "Rapid"},
    {name: "25+10", time: "25 min", increment: "10s", category: "Rapid"},
  ],
  Classical: [
    {name: "30+0", time: "30 min", increment: "0", category: "Classical"},
    {name: "30+20", time: "30 min", increment: "20s", category: "Classical"},
    {name: "60+0", time: "60 min", increment: "0", category: "Classical"},
    {name: "90+30", time: "90 min", increment: "30s", category: "Classical"},
  ],
};

export default function TimeModes({onSelect,}: {
  onSelect: (mode: TimeMode) => void;
}) {
  const [selected, setSelected] = useState<TimeMode | null>(null);

  return (
    <div className="h-screen w-full flex flex-col justify-between items-center bg-zinc-950 text-white px-4 py-6 sm:py-8">
      {/* Header */}
      <h1 className="text-2xl sm:text-3xl font-bold text-center mb-2">
        Choose Time Control
      </h1>

      {/* Mode Groups */}
      <div className="w-full max-w-5xl flex flex-col gap-4 overflow-hidden">
        {Object.entries(TIME_MODE_GROUPS).map(([category, modes]) => (
          <div key={category} className="flex flex-col">
            <h2 className="text-lg sm:text-xl font-semibold mb-1">{category}</h2>
            <div className="flex flex-wrap gap-2 sm:gap-3">
              {modes.map((mode) => (
                <motion.button
                  key={mode.name}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setSelected(mode)}
                  className={`rounded-xl border-2 px-4 py-3 text-left shadow-md text-sm sm:text-base transition-all
                  ${selected?.name === mode.name
                    ? "border-emerald-500 bg-emerald-900/40"
                    : "border-zinc-700 hover:border-emerald-500"
                  }`}
                >
                  <div className="font-bold">{mode.name}</div>
                  <div className="text-xs text-zinc-400">
                    {mode.time}{mode.increment !== "0" && ` | +${mode.increment}`}
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Play Button */}
      {selected && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center mt-4 sm:mt-6"
        >
          <button
            onClick={() => onSelect(selected)}
            className="px-6 py-3 sm:px-8 sm:py-3 bg-emerald-600 hover:bg-emerald-700 rounded-full text-base sm:text-lg font-semibold"
          >
            Play {selected.name} Rated Game
          </button>
        </motion.div>
      )}
    </div>
  );
}
