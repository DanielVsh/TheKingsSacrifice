import { useState } from 'react';
import { Crown, Zap, Trophy, Star } from 'lucide-react';

export interface Bot {
  id: number;
  name: string;
  elo: number;
  avatar: string;
}

const bots: Bot[] = [
  { id: 1, name: 'PawnBot', elo: 800, avatar: '/avatars/pawn.png' },
  { id: 2, name: 'Rookie', elo: 1000, avatar: '/avatars/rookie.png' },
  { id: 3, name: 'Knightmare', elo: 1200, avatar: '/avatars/knight.png' },
  { id: 4, name: 'QueenGenius', elo: 1500, avatar: '/avatars/queen.png' },
  { id: 5, name: 'MasterFish', elo: 2000, avatar: '/avatars/master.png' },
  { id: 6, name: 'GM Crusher', elo: 2500, avatar: '/avatars/gm.png' },
  { id: 7, name: 'Stockfish 17', elo: 2800, avatar: '/avatars/stockfish.png' },
];

const getDifficultyColor = (elo: number) => {
  if (elo < 1000) return 'from-green-400 to-green-600';
  if (elo < 1300) return 'from-blue-400 to-blue-600';
  if (elo < 1600) return 'from-purple-400 to-purple-600';
  if (elo < 2000) return 'from-orange-400 to-orange-600';
  if (elo < 2400) return 'from-red-400 to-red-600';
  return 'from-gray-800 to-black';
};

const getDifficultyIcon = (elo: number) => {
  if (elo < 1000) return <Star className="w-5 h-5" />;
  if (elo < 1300) return <Zap className="w-5 h-5" />;
  if (elo < 1600) return <Trophy className="w-5 h-5" />;
  return <Crown className="w-5 h-5" />;
};

const getDifficultyLabel = (elo: number) => {
  if (elo < 1000) return 'Beginner';
  if (elo < 1300) return 'Intermediate';
  if (elo < 1600) return 'Advanced';
  if (elo < 2000) return 'Expert';
  if (elo < 2400) return 'Master';
  return 'Grandmaster';
};

const BotSelector = ({onSelect}) => {
  const [selectedBot, setSelectedBot] = useState<number | null>(null);
  const [hoveredBot, setHoveredBot] = useState<number | null>(null);

  const handleBotSelect = (bot: Bot) => {
    setSelectedBot(bot.id);
    onSelect(bot);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-4 md:p-8">
      <div className="max-w-screen mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-white via-blue-100 to-cyan-300 bg-clip-text text-transparent mb-4">
            Choose Your Opponent
          </h1>
          <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto">
            Select a chess bot to challenge. Each bot has a unique playing style and difficulty level.
          </p>
        </div>

        {/* Bot Cards Container */}
        <div className="relative">
          <div className="flex gap-6 overflow-x-auto pb-6 scrollbar-hide snap-x snap-mandatory">
            {bots.map((bot, index) => (
              <div
                key={bot.id}
                className={`flex-none w-72 snap-center transform transition-all duration-300 ${
                  hoveredBot === bot.id ? 'scale-105' : 'scale-100'
                } ${
                  selectedBot === bot.id ? 'ring-4 ring-cyan-400 ring-opacity-60' : ''
                }`}
                onMouseEnter={() => setHoveredBot(bot.id)}
                onMouseLeave={() => setHoveredBot(null)}
                onClick={() => handleBotSelect(bot)}
              >
                <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-sm rounded-2xl p-6 h-full cursor-pointer border border-slate-700/50 hover:border-cyan-400/50 transition-all duration-300 shadow-2xl hover:shadow-cyan-500/20">
                  {/* Bot Avatar */}
                  <div className="relative mb-6">
                    <div className={`w-24 h-24 mx-auto rounded-full bg-gradient-to-r ${getDifficultyColor(bot.elo)} p-1 shadow-lg`}>
                      <div className="w-full h-full rounded-full bg-slate-800 flex items-center justify-center text-3xl font-bold text-white">
                        {bot.name.charAt(0)}
                      </div>
                    </div>
                    {selectedBot === bot.id && (
                      <div className="absolute -top-2 -right-2 w-8 h-8 bg-cyan-400 rounded-full flex items-center justify-center animate-pulse">
                        <div className="w-4 h-4 bg-white rounded-full"></div>
                      </div>
                    )}
                  </div>

                  {/* Bot Info */}
                  <div className="text-center space-y-4">
                    <h3 className="text-xl font-bold text-white">{bot.name}</h3>

                    <div className="space-y-3">
                      <div className="flex items-center justify-center gap-2 text-slate-300">
                        {getDifficultyIcon(bot.elo)}
                        <span className="text-sm font-medium">{getDifficultyLabel(bot.elo)}</span>
                      </div>

                      <div className="bg-slate-700/50 rounded-lg px-3 py-2">
                        <div className="text-xs text-slate-400 uppercase tracking-wide">ELO Rating</div>
                        <div className="text-2xl font-bold text-cyan-400">{bot.elo}</div>
                      </div>
                    </div>

                    {/* Progress bar showing relative strength */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs text-slate-400">
                        <span>Strength</span>
                        <span>{Math.round((bot.elo / 2800) * 100)}%</span>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full bg-gradient-to-r ${getDifficultyColor(bot.elo)} transition-all duration-700 ease-out`}
                          style={{ width: `${(bot.elo / 2800) * 100}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Challenge Button */}
                    <button
                      className={`w-full py-3 px-4 rounded-lg font-semibold transition-all duration-200 ${
                        selectedBot === bot.id
                          ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/30'
                          : 'bg-slate-600/50 text-slate-300 hover:bg-slate-600/70 hover:text-white'
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleBotSelect(bot);
                      }}
                    >
                      {selectedBot === bot.id ? 'Selected' : 'Challenge'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Scroll indicators */}
          <div className="flex justify-center mt-6 gap-2">
            {bots.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  hoveredBot === bots[index].id ? 'bg-cyan-400' : 'bg-slate-600'
                }`}
              ></div>
            ))}
          </div>
        </div>

        {/* Selected Bot Info */}
        {selectedBot && (
          <div className="mt-12 text-center">
            <div className="bg-gradient-to-r from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-2xl p-6 border border-cyan-400/30 inline-block">
              <p className="text-slate-300 mb-2">Ready to challenge</p>
              <p className="text-2xl font-bold text-cyan-400">
                {bots.find(bot => bot.id === selectedBot)?.name}
              </p>
              <button className="mt-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-cyan-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-cyan-500/30 transform hover:scale-105">
                Start Game
              </button>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default BotSelector;
