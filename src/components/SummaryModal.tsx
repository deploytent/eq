import React from 'react';
import { Trophy, RotateCcw, Home, Crown } from 'lucide-react';
import { motion } from 'motion/react';
import type { GameState, TileConfig } from '../types';
import { calculateNetWorth, COLOR_META, computeDiceStats } from '../gameRules';

interface SummaryModalProps {
  gameState: GameState;
  tiles: TileConfig[];
  onPlayAgain: () => void;
  onBackToLobby: () => void;
}

export const SummaryModal: React.FC<SummaryModalProps> = ({
  gameState,
  tiles,
  onPlayAgain,
  onBackToLobby,
}) => {
  const rankedPlayers = [...gameState.players].sort((a, b) => {
    if (a.bankrupt !== b.bankrupt) return a.bankrupt ? 1 : -1;
    return (
      calculateNetWorth(b, tiles, gameState.properties) -
      calculateNetWorth(a, tiles, gameState.properties)
    );
  });

  const winner =
    gameState.players.find((p) => p.id === gameState.winnerId) ?? rankedPlayers[0];
  const diceStats = computeDiceStats(gameState.diceCounts, Math.max(gameState.currentRound, 3));

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="summary-title"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl border border-slate-700 bg-slate-900 text-slate-100 shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="border-b border-slate-800 px-6 py-5 bg-slate-900 text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-400/15 border border-amber-400/30 text-amber-400">
            <Trophy className="h-6 w-6" />
          </div>
          <h2 id="summary-title" className="text-xl sm:text-2xl font-bold text-white">
            สรุปผลสถิติการแข่งขัน
          </h2>
          <p className="mt-1 text-sm text-slate-300">
            ผู้ชนะเลิศ:{' '}
            <span className="font-bold text-amber-300">{winner?.name}</span> ·{' '}
            {gameState.endReason === 'last_standing'
              ? 'ผู้รอดชีวิตคนสุดท้าย'
              : `ครบ ${gameState.maxRounds} รอบการแข่งขัน`}
          </p>
        </div>

        {/* Body */}
        <div className="overflow-y-auto custom-scrollbar p-6 space-y-5">
          {/* Leaderboard */}
          <div>
            <h3 className="text-sm font-semibold text-slate-300 mb-2.5">
              อันดับมูลค่าทรัพย์สินสุทธิ (Net Worth)
            </h3>
            <div className="overflow-hidden rounded-xl border border-slate-800">
              <table className="w-full text-xs sm:text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-800/80 text-slate-400 border-b border-slate-800">
                    <th className="py-2.5 px-3 text-left font-medium">อันดับ</th>
                    <th className="py-2.5 px-3 text-left font-medium">ผู้เล่น</th>
                    <th className="py-2.5 px-3 text-right font-medium">เงินสด</th>
                    <th className="py-2.5 px-3 text-right font-medium">ตอบคำถาม</th>
                    <th className="py-2.5 px-3 text-right font-medium">มูลค่าสุทธิ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {rankedPlayers.map((p, idx) => {
                    const netWorth = calculateNetWorth(p, tiles, gameState.properties);
                    const colorMeta = COLOR_META[p.color];
                    const quizAccuracy =
                      p.quizTotal > 0
                        ? `${Math.round((p.quizCorrect / p.quizTotal) * 100)}%`
                        : '-';
                    return (
                      <tr
                        key={p.id}
                        className={idx === 0 ? 'bg-amber-500/10' : 'bg-slate-900/40'}
                      >
                        <td className="py-2.5 px-3 font-mono-num font-bold text-slate-200">
                          #{idx + 1}
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="flex items-center gap-2">
                            <span
                              className="h-3 w-3 rounded-full shrink-0"
                              style={{ backgroundColor: colorMeta.hex }}
                            />
                            <span className="font-semibold text-white">{p.name}</span>
                            {p.bankrupt && (
                              <span className="text-[11px] text-rose-400">(ล้มละลาย)</span>
                            )}
                          </div>
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono-num text-slate-300">
                          {p.cash.toLocaleString()}฿
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono-num text-slate-300">
                          {p.quizCorrect}/{p.quizTotal} ({quizAccuracy})
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono-num font-bold text-emerald-400">
                          {netWorth.toLocaleString()}฿
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Match Dice Statistics */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 space-y-2">
            <div className="flex items-center justify-between text-xs sm:text-sm">
              <div className="flex items-center gap-1.5 font-semibold text-white">
                <Crown className="h-4 w-4 text-amber-400" />
                <span>สรุปการแจกแจงความถี่ลูกเต๋าตลอดเกม</span>
              </div>
              <span className="font-mono-num text-slate-400">
                ทอยทั้งหมด {diceStats.totalRolls} ครั้ง · ฐานนิยม: แต้ม{' '}
                {diceStats.modeFaces.length > 0 ? diceStats.modeFaces.join(', ') : '-'}
              </span>
            </div>
            <div className="grid grid-cols-6 gap-2 pt-1">
              {diceStats.rows.map((row) => (
                <div
                  key={row.face}
                  className={`rounded-lg border p-2 text-center ${
                    row.isMode
                      ? 'border-amber-400/60 bg-amber-500/10'
                      : 'border-slate-800 bg-slate-900'
                  }`}
                >
                  <div className="font-mono-num text-xs font-bold text-white">
                    แต้ม {row.face}
                  </div>
                  <div className="font-mono-num text-sm font-bold text-sky-400 mt-0.5">
                    {row.count}
                  </div>
                  <div className="font-mono-num text-[11px] text-slate-400">
                    {row.relativePercent.toFixed(1)}%
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-800 px-6 py-4 bg-slate-900">
          <button
            type="button"
            onClick={onBackToLobby}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-slate-700 text-slate-200 hover:bg-slate-800 text-sm font-semibold transition-colors whitespace-nowrap"
          >
            <Home className="h-4 w-4" />
            <span>กลับหน้าล็อบบี้</span>
          </button>
          <button
            type="button"
            onClick={onPlayAgain}
            data-start="true"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-sm transition-colors whitespace-nowrap"
          >
            <RotateCcw className="h-4 w-4" />
            <span>เล่นใหม่อีกครั้ง</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};
