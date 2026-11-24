import React from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Dices, FlaskConical } from 'lucide-react';
import type { GameState, MoneyPopup, TileConfig } from '../types';
import { calculateNetWorth, COLOR_META } from '../gameRules';

interface BottomPlayerHudProps {
  gameState: GameState;
  tiles: TileConfig[];
  localPlayerId: string;
  isMyTurn: boolean;
  elapsedSeconds: number;
  moneyPopups?: MoneyPopup[];
  onRollDice: () => void;
}

export const BottomPlayerHud: React.FC<BottomPlayerHudProps> = ({
  gameState,
  tiles,
  localPlayerId,
  isMyTurn,
  elapsedSeconds,
  moneyPopups = [],
  onRollDice,
}) => {
  const currentPlayerId = gameState.players[gameState.turnIndex]?.id;
  const colClass =
    gameState.players.length <= 2
      ? 'grid-cols-1 sm:grid-cols-2'
      : gameState.players.length === 3
        ? 'grid-cols-1 sm:grid-cols-3'
        : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4';

  const timerProgress = Math.max(0, Math.min(100, ((45 - elapsedSeconds) / 45) * 100));

  return (
    <section
      aria-label="แถบสถานะผู้เล่น"
      className={`w-full max-w-6xl mx-auto grid ${colClass} gap-3`}
    >
      {gameState.players.map((p) => {
        const meta = COLOR_META[p.color];
        const isActive = p.id === currentPlayerId && !p.bankrupt;
        const netWorth = calculateNetWorth(p, tiles, gameState.properties);
        const showRollBtn =
          isActive && isMyTurn && !p.isBot && gameState.phase === 'IDLE';
        const initial = p.isBot
          ? p.name.replace('บอท', '').slice(0, 1)
          : p.name.slice(0, 1);
        const playerPopups = moneyPopups.filter((m) => m.playerId === p.id);

        return (
          <div
            key={p.id}
            className={`relative rounded-2xl p-3.5 transition-all overflow-visible ${
              p.bankrupt
                ? 'bg-[#1D1F24] opacity-55 border border-white/5'
                : isActive
                  ? 'bg-[#31343C] border-2 border-[#4AA3DF] shadow-lg'
                  : 'bg-[#2D3037] border border-white/10'
            }`}
          >
            {/* Top Row: Avatar + Puck Token + Name + Online/Active Dot + Your Turn Badge */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                {/* Circular Avatar with adjacent 3D Puck Token */}
                <div className="relative flex items-center shrink-0">
                  <div className="h-9 w-9 rounded-full bg-[#25272C] border border-white/15 flex items-center justify-center text-xs font-extrabold text-white">
                    {initial}
                  </div>
                  <div
                    className="-ml-2 h-5 w-5 rounded-full border-2 border-white shadow-[0_2px_0_rgba(0,0,0,0.35)]"
                    style={{ backgroundColor: meta.hex }}
                    title={meta.label}
                  />
                </div>

                <div className="min-w-0 relative">
                  <div className="flex items-center gap-1.5">
                    {/* Live status dot */}
                    <span
                      className={`h-2 w-2 rounded-full shrink-0 ${
                        p.bankrupt ? 'bg-slate-500' : 'bg-[#27AE60]'
                      }`}
                      aria-hidden="true"
                    />
                    <span className="text-sm font-bold text-white truncate">
                      {p.name}
                    </span>
                    {p.id === localPlayerId && !p.isBot && (
                      <span className="text-[11px] text-slate-400 shrink-0">(คุณ)</span>
                    )}
                  </div>
                  <div className="relative flex items-center gap-2 text-xs font-mono-num mt-0.5">
                    <span className="font-bold text-white">
                      ฿{p.cash.toLocaleString()}
                    </span>
                    <span className="font-bold text-[#2ECC71]">
                      (฿{netWorth.toLocaleString()})
                    </span>

                    <AnimatePresence>
                      {playerPopups.map((pop) => (
                        <motion.span
                          key={pop.id}
                          initial={{ opacity: 0, y: 4, scale: 0.85 }}
                          animate={{
                            opacity: [0, 1, 1, 0],
                            y: [4, -16, -28, -38],
                            scale: [0.85, 1.12, 1, 0.95],
                          }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 1.8, ease: 'easeOut' }}
                          className={`absolute -top-6 left-0 whitespace-nowrap font-mono-num text-xs font-extrabold px-2 py-0.5 rounded-full shadow-lg pointer-events-none z-30 ${
                            pop.amount >= 0
                              ? 'bg-emerald-500 text-white'
                              : 'bg-[#E74C3C] text-white'
                          }`}
                        >
                          {pop.amount >= 0
                            ? `+฿${pop.amount.toLocaleString()}`
                            : `-฿${Math.abs(pop.amount).toLocaleString()}`}
                        </motion.span>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-end gap-1.5 shrink-0">
                {isActive && (
                  <span className="rounded-full bg-[#4AA3DF] px-2.5 py-0.5 text-[10px] font-extrabold text-white whitespace-nowrap">
                    ตาของคุณ
                  </span>
                )}
                {showRollBtn && (
                  <button
                    type="button"
                    onClick={onRollDice}
                    data-testid="roll-dice-btn"
                    className="inline-flex items-center gap-1 rounded-full bg-[#8CC63F] hover:bg-[#7BB434] px-3 py-1 text-xs font-extrabold text-slate-950 shadow-sm transition-colors whitespace-nowrap"
                  >
                    <Dices className="h-3.5 w-3.5" />
                    <span>ทอยเต๋า</span>
                  </button>
                )}
                {p.inLab && !p.bankrupt && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-300">
                    <FlaskConical className="h-3 w-3" />
                    <span>แล็บ {p.labTurns}/2</span>
                  </span>
                )}
                {p.bankrupt && (
                  <span className="text-[11px] font-bold text-[#E74C3C]">ล้มละลาย</span>
                )}
              </div>
            </div>

            {/* Active Turn Horizontal Countdown Bar */}
            {isActive && (
              <div className="mt-2.5 h-1.5 w-full rounded-full bg-[#25272C] overflow-hidden">
                <div
                  className="h-full bg-[#4AA3DF] transition-all duration-1000"
                  style={{ width: `${gameState.isOnline ? timerProgress : 100}%` }}
                />
              </div>
            )}
          </div>
        );
      })}
    </section>
  );
};
