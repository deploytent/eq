import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { BarChart3, FlaskConical, PlaneTakeoff, SkipForward } from 'lucide-react';
import type { GameState, MoneyPopup, TileConfig } from '../types';
import { Tile } from './Tile';
import { FrequencyTracker } from './FrequencyTracker';
import { LAB_BAIL_COST } from '../gameRules';

interface BoardProps {
  gameState: GameState;
  tiles: TileConfig[];
  isMyTurn: boolean;
  gameSpeed?: 1 | 2;
  moneyPopups?: MoneyPopup[];
  canSkipOnlineTurn: boolean;
  secondsLeftToSkip: number;
  onRollDice: () => void;
  onPayLabBail: () => void;
  onSelectWarp: (tileId: number) => void;
  onSkipWarp: () => void;
  onSkipOnlineTurn: () => void;
}

const TILE_GRID_CLASSES: Record<number, string> = {
  1: 'col-start-1 row-start-1',
  2: 'col-start-2 row-start-1',
  3: 'col-start-3 row-start-1',
  4: 'col-start-4 row-start-1',
  5: 'col-start-5 row-start-1',
  6: 'col-start-5 row-start-2',
  7: 'col-start-5 row-start-3',
  8: 'col-start-5 row-start-4',
  9: 'col-start-5 row-start-5',
  10: 'col-start-4 row-start-5',
  11: 'col-start-3 row-start-5',
  12: 'col-start-2 row-start-5',
  13: 'col-start-1 row-start-5',
  14: 'col-start-1 row-start-4',
  15: 'col-start-1 row-start-3',
  16: 'col-start-1 row-start-2',
};

const DICE_PIPS: Record<number, number[]> = {
  1: [4],
  2: [0, 8],
  3: [0, 4, 8],
  4: [0, 2, 6, 8],
  5: [0, 2, 4, 6, 8],
  6: [0, 2, 3, 5, 6, 8],
};

const IsometricObservatoryGraphic: React.FC = () => (
  <svg
    viewBox="0 0 180 120"
    className="w-28 sm:w-36 h-auto drop-shadow-sm select-none"
    aria-hidden="true"
  >
    {/* Ground Isometric Base */}
    <polygon points="90,104 162,72 90,42 18,72" fill="#B8D8EB" />
    <polygon points="90,98 152,70 90,44 28,70" fill="#F8FAFC" />

    {/* Main Research Building */}
    <polygon points="56,74 90,89 90,54 56,39" fill="#4AA3DF" />
    <polygon points="124,74 90,89 90,54 124,39" fill="#2980B9" />
    <polygon points="90,25 124,39 90,54 56,39" fill="#85C1E9" />

    {/* Observatory Dome */}
    <path d="M72 34 C72 17, 108 17, 108 34 Z" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1.5" />
    <ellipse cx="90" cy="34" rx="18" ry="6" fill="#E2E8F0" />
    <rect x="98" y="16" width="12" height="5" rx="2.5" transform="rotate(-25 98 16)" fill="#F39C12" />

    {/* Windows & Chart Accent */}
    <polygon points="64,50 72,53.5 72,62 64,58.5" fill="#E0F2FE" />
    <polygon points="77,55.5 85,59 85,67.5 77,64" fill="#E0F2FE" />
    <polygon points="96,59 104,55.5 104,64 96,67.5" fill="#BAE6FD" />
    <polygon points="109,53.5 117,50 117,58.5 109,62" fill="#BAE6FD" />

    {/* Floating Mini Bar Stat Pillar */}
    <rect x="38" y="58" width="6" height="14" rx="1.5" fill="#8CC63F" />
    <rect x="46" y="51" width="6" height="21" rx="1.5" fill="#F39C12" />
  </svg>
);

export const Board: React.FC<BoardProps> = ({
  gameState,
  tiles,
  isMyTurn,
  gameSpeed = 1,
  moneyPopups = [],
  canSkipOnlineTurn,
  secondsLeftToSkip,
  onRollDice,
  onPayLabBail,
  onSelectWarp,
  onSkipWarp,
  onSkipOnlineTurn,
}) => {
  const [expandedTracker, setExpandedTracker] = useState(false);
  const [rollingFace, setRollingFace] = useState<number>(5);
  const currentPlayer = gameState.players[gameState.turnIndex];
  const isWarpMode =
    gameState.phase === 'ACTION' &&
    gameState.pendingAction?.type === 'warp' &&
    isMyTurn &&
    !currentPlayer?.isBot;

  const canRollHere =
    gameState.phase === 'IDLE' && isMyTurn && !currentPlayer?.isBot;

  useEffect(() => {
    if (gameState.phase !== 'ROLLING') return;
    const interval = window.setInterval(
      () => {
        setRollingFace((prev) => ((prev % 6) + 1));
      },
      gameSpeed === 2 ? 65 : 120
    );
    return () => window.clearInterval(interval);
  }, [gameState.phase, gameSpeed]);

  const activeDice =
    gameState.phase === 'ROLLING' ? rollingFace : (gameState.lastDice ?? 5);
  const pips = DICE_PIPS[activeDice] ?? [4];

  return (
    <div className="w-full max-w-[680px] mx-auto">
      {/* 5x5 Square Board Perimeter */}
      <div className="grid grid-cols-5 grid-rows-5 gap-1.5 sm:gap-2 aspect-square rounded-2xl bg-[#1E2025] p-2 sm:p-2.5 shadow-2xl border border-white/10">
        {tiles.map((tile) => {
          const propState = gameState.properties[tile.id];
          const owner = propState?.ownerId
            ? gameState.players.find((p) => p.id === propState.ownerId)
            : undefined;
          const playersHere = gameState.players.filter(
            (p) => !p.bankrupt && p.position === tile.id
          );
          const isCurrentTurnTile =
            Boolean(currentPlayer) &&
            !currentPlayer.bankrupt &&
            currentPlayer.position === tile.id;

          return (
            <Tile
              key={tile.id}
              tile={tile}
              propState={propState}
              owner={owner}
              playersHere={playersHere}
              activePlayerId={currentPlayer?.id}
              phase={gameState.phase}
              gameSpeed={gameSpeed}
              moneyPopups={moneyPopups}
              isWarpTarget={isWarpMode && tile.id !== 9}
              isCurrentTurnTile={isCurrentTurnTile}
              onSelectWarp={onSelectWarp}
              gridAreaClass={TILE_GRID_CLASSES[tile.id]}
            />
          );
        })}

        {/* Pastel Sky Blue Center Stage (#D8E9F4) */}
        <div className="col-start-2 col-end-5 row-start-2 row-end-5 rounded-2xl bg-[#D8E9F4] p-2 sm:p-4 flex flex-col items-center justify-between gap-1.5 sm:gap-2.5 overflow-hidden relative">
          {/* Top Row: Round Info + Toggleable Frequency Tracker Button */}
          <div className="w-full flex items-center justify-between gap-2 text-[11px] sm:text-xs font-bold text-slate-700">
            <span className="font-mono-num">
              รอบ {Math.min(gameState.currentRound, gameState.maxRounds)}/{gameState.maxRounds}
            </span>
            <button
              type="button"
              onClick={() => setExpandedTracker((v) => !v)}
              className="hidden sm:inline-flex items-center gap-1 rounded-full bg-white/90 hover:bg-white px-2.5 py-1 text-[11px] font-bold text-slate-700 shadow-sm transition-colors whitespace-nowrap"
            >
              <BarChart3 className="h-3.5 w-3.5 text-[#4AA3DF]" />
              <span>{expandedTracker ? 'ย่อตารางความถี่' : 'ตารางความถี่ (f)'}</span>
            </button>
          </div>

          {/* Speech Bubble Banner with Downward Pointer */}
          <div className="relative w-full max-w-sm">
            <div className="rounded-xl bg-white px-3 py-2 sm:px-4 sm:py-2.5 text-center shadow-sm border border-sky-200/80">
              <p className="text-[11px] sm:text-sm font-bold text-slate-800 leading-snug line-clamp-2">
                {gameState.speechMessage}
              </p>
            </div>
            <div
              className="mx-auto w-0 h-0 border-l-[7px] border-l-transparent border-r-[7px] border-r-transparent border-t-[7px] border-t-white"
              aria-hidden="true"
            />
          </div>

          {/* Middle: Isometric Vector Graphic OR Expanded Frequency Table */}
          <div className="w-full flex-1 min-h-0 flex flex-col items-center justify-center">
            {expandedTracker ? (
              <div className="hidden sm:block w-full max-w-md max-h-full overflow-y-auto custom-scrollbar">
                <FrequencyTracker
                  diceCounts={gameState.diceCounts}
                  currentRound={gameState.currentRound}
                  lastDice={gameState.lastDice}
                />
              </div>
            ) : (
              <div className="w-full flex flex-col items-center justify-center gap-1.5">
                <IsometricObservatoryGraphic />
                <div className="hidden sm:block w-full max-w-sm">
                  <FrequencyTracker
                    diceCounts={gameState.diceCounts}
                    currentRound={gameState.currentRound}
                    lastDice={gameState.lastDice}
                    compact
                  />
                </div>
              </div>
            )}
          </div>

          {/* Bottom-Center Edge: Crisp White 3D Dice with Red Pips + Contextual Action */}
          <div className="w-full flex flex-wrap items-center justify-center gap-2 sm:gap-3 pt-0.5">
            {isWarpMode ? (
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-violet-600 px-3 py-1.5 text-xs font-bold text-white shadow">
                  <PlaneTakeoff className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">คลิกช่องบนกระดานเพื่อวาร์ป</span>
                  <span className="sm:hidden">แตะช่องที่จะไป</span>
                </span>
                <button
                  type="button"
                  onClick={onSkipWarp}
                  className="rounded-full bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-100 whitespace-nowrap"
                >
                  ไม่วาร์ป
                </button>
              </div>
            ) : (
              <>
                {canRollHere && currentPlayer?.inLab && currentPlayer.cash >= LAB_BAIL_COST && (
                  <button
                    type="button"
                    onClick={onPayLabBail}
                    className="inline-flex items-center gap-1 rounded-full bg-indigo-600 hover:bg-indigo-500 px-3 py-1.5 text-xs font-bold text-white shadow transition-colors whitespace-nowrap"
                  >
                    <FlaskConical className="h-3.5 w-3.5" />
                    <span>จ่าย ฿{LAB_BAIL_COST.toLocaleString()} ออกแล็บ</span>
                  </button>
                )}

                <motion.button
                  type="button"
                  disabled={!canRollHere}
                  onClick={onRollDice}
                  data-testid="center-dice-btn"
                  aria-label={canRollHere ? 'กดทอยลูกเต๋า' : `หน้าลูกเต๋า ${activeDice}`}
                  key={`${gameState.totalRolls}-${gameState.phase === 'ROLLING' ? 'rolling' : 'rest'}`}
                  animate={
                    gameState.phase === 'ROLLING'
                      ? {
                          rotate: [0, -20, 22, -16, 14, 360],
                          x: [0, -4, 4, -3, 3, 0],
                          y: [0, -6, 2, -4, 0],
                          scale: [1, 1.18, 1.08, 1.16, 1],
                        }
                      : { rotate: 0, x: 0, y: 0, scale: 1 }
                  }
                  transition={{
                    duration: gameState.phase === 'ROLLING' ? (gameSpeed === 2 ? 0.48 : 0.95) : 0.28,
                    ease: 'easeInOut',
                  }}
                  className={`h-11 w-11 sm:h-14 sm:w-14 rounded-xl bg-white border border-slate-200 shadow-[0_5px_0_#CBD5E1] p-2 sm:p-2.5 grid grid-cols-3 grid-rows-3 place-items-center transition-transform ${
                    canRollHere
                      ? 'cursor-pointer hover:-translate-y-0.5 active:translate-y-0.5 ring-2 ring-[#4AA3DF]'
                      : 'cursor-default'
                  }`}
                >
                  {Array.from({ length: 9 }).map((_, idx) => (
                    <span
                      key={idx}
                      className={`h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full ${
                        pips.includes(idx) ? 'bg-[#E74C3C]' : 'bg-transparent'
                      }`}
                    />
                  ))}
                </motion.button>

                {gameState.isOnline && !isMyTurn && (
                  <button
                    type="button"
                    disabled={!canSkipOnlineTurn}
                    onClick={onSkipOnlineTurn}
                    className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-bold shadow-sm whitespace-nowrap ${
                      canSkipOnlineTurn
                        ? 'bg-[#E74C3C] hover:bg-rose-500 text-white'
                        : 'bg-white/80 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    <SkipForward className="h-3.5 w-3.5" />
                    <span>
                      {canSkipOnlineTurn ? 'ข้ามตา' : `ข้าม (${secondsLeftToSkip}s)`}
                    </span>
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Compact Frequency Tracker below board */}
      <div className="sm:hidden mt-3">
        <FrequencyTracker
          diceCounts={gameState.diceCounts}
          currentRound={gameState.currentRound}
          lastDice={gameState.lastDice}
          compact
        />
      </div>
    </div>
  );
};
