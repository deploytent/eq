import React from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowUp } from 'lucide-react';
import type { GamePhase, MoneyPopup, Player, PropertyGroup, PropertyState, TileConfig } from '../types';
import { COLOR_META } from '../gameRules';

interface TileProps {
  tile: TileConfig;
  propState?: PropertyState;
  owner?: Player;
  playersHere: Player[];
  activePlayerId?: string;
  phase?: GamePhase;
  gameSpeed?: 1 | 2;
  moneyPopups?: MoneyPopup[];
  isWarpTarget: boolean;
  isCurrentTurnTile: boolean;
  onSelectWarp?: (tileId: number) => void;
  gridAreaClass: string;
}

const GROUP_BG_HEX: Record<Exclude<PropertyGroup, 'utility'>, string> = {
  green: '#8CC63F',
  sky: '#4AA3DF',
  orange: '#F39C12',
  red: '#E74C3C',
};

function renderFlatVectorIcon(tile: TileConfig) {
  switch (tile.type) {
    case 'start':
      return (
        <svg viewBox="0 0 40 40" className="h-7 w-7 sm:h-9 sm:w-9" aria-hidden="true">
          <circle cx="20" cy="20" r="16" fill="#E2E8F0" />
          <path
            d="M20 10 L29 20 H23.5 V30 H16.5 V20 H11 Z"
            fill="#64748B"
          />
        </svg>
      );
    case 'quiz_basic':
    case 'quiz_visual': {
      const cardColor = tile.type === 'quiz_basic' ? '#4AA3DF' : '#F39C12';
      return (
        <svg viewBox="0 0 40 40" className="h-7 w-7 sm:h-9 sm:w-9" aria-hidden="true">
          <rect x="8" y="5" width="24" height="30" rx="5" fill={cardColor} />
          <rect x="11" y="8" width="18" height="24" rx="3" fill="#FFFFFF" fillOpacity="0.2" />
          <text
            x="20"
            y="26"
            textAnchor="middle"
            fill="#FFFFFF"
            fontSize="18"
            fontWeight="800"
          >
            ?
          </text>
        </svg>
      );
    }
    case 'lab':
      return (
        <svg viewBox="0 0 44 40" className="h-7 w-8 sm:h-9 sm:w-10" aria-hidden="true">
          {/* Isometric Lab Building */}
          <polygon points="22,6 38,14 22,22 6,14" fill="#A5B4FC" />
          <polygon points="6,14 22,22 22,36 6,28" fill="#6366F1" />
          <polygon points="38,14 22,22 22,36 38,28" fill="#4F46E5" />
          <rect x="11" y="21" width="4" height="5" rx="1" fill="#E0E7FF" />
          <rect x="27" y="21" width="4" height="5" rx="1" fill="#C7D2FE" />
          <circle cx="22" cy="14" r="3.5" fill="#FFFFFF" />
        </svg>
      );
    case 'utility':
      return (
        <svg viewBox="0 0 40 40" className="h-6 w-6 sm:h-8 sm:w-8" aria-hidden="true">
          <circle cx="20" cy="16" r="9" fill="#FDE047" stroke="#EAB308" strokeWidth="1.5" />
          <rect x="16" y="25" width="8" height="4" rx="1.5" fill="#64748B" />
          <rect x="17" y="30" width="6" height="2.5" rx="1" fill="#475569" />
          <path d="M20 4 V7 M9 10 L11.5 12 M31 10 L28.5 12" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case 'warp':
      return (
        <svg viewBox="0 0 40 40" className="h-7 w-7 sm:h-9 sm:w-9" aria-hidden="true">
          {/* Flat-vector Gavel / Conference icon */}
          <rect x="18" y="8" width="14" height="8" rx="2" transform="rotate(35 25 12)" fill="#8B5CF6" />
          <rect x="10" y="20" width="14" height="4" rx="1.5" transform="rotate(-45 17 22)" fill="#64748B" />
          <rect x="9" y="30" width="22" height="4" rx="2" fill="#CBD5E1" />
        </svg>
      );
    case 'go_to_lab':
      return (
        <svg viewBox="0 0 40 40" className="h-7 w-7 sm:h-9 sm:w-9" aria-hidden="true">
          <polygon points="20,6 35,32 5,32" fill="#EF4444" />
          <rect x="18.5" y="14" width="3" height="9" rx="1.5" fill="#FFFFFF" />
          <circle cx="20" cy="27.5" r="2" fill="#FFFFFF" />
        </svg>
      );
    case 'tax':
      return (
        <svg viewBox="0 0 40 40" className="h-7 w-7 sm:h-9 sm:w-9" aria-hidden="true">
          <circle cx="20" cy="20" r="13" fill="#F59E0B" />
          <circle cx="20" cy="20" r="9.5" fill="#FBBF24" />
          <text x="20" y="24.5" textAnchor="middle" fill="#78350F" fontSize="13" fontWeight="800">
            ฿
          </text>
        </svg>
      );
    default:
      return null;
  }
}

export const Tile: React.FC<TileProps> = ({
  tile,
  propState,
  owner,
  playersHere,
  activePlayerId,
  phase,
  gameSpeed = 1,
  moneyPopups = [],
  isWarpTarget,
  isCurrentTurnTile,
  onSelectWarp,
  gridAreaClass,
}) => {
  const isColoredProperty = tile.type === 'property' && tile.group && tile.group !== 'utility';
  const hasPriceBar = tile.type === 'property' || tile.type === 'utility';
  const propBgColor =
    isColoredProperty && tile.group !== 'utility'
      ? GROUP_BG_HEX[tile.group!]
      : '#FFFFFF';

  const ownerMeta = owner ? COLOR_META[owner.color] : null;
  const level = propState?.level ?? 0;
  const hasActiveOrPopup =
    playersHere.some((p) => p.id === activePlayerId) ||
    playersHere.some((p) => moneyPopups.some((m) => m.playerId === p.id));

  const content = (
    <div
      className={`relative h-full w-full rounded-xl select-none transition-transform overflow-visible ${
        hasActiveOrPopup ? 'z-20' : 'z-0'
      } ${
        isWarpTarget
          ? 'ring-3 ring-violet-400 cursor-pointer hover:scale-[1.03] shadow-lg'
          : isCurrentTurnTile
            ? 'ring-3 ring-white shadow-lg'
            : 'ring-1 ring-black/15 shadow-sm'
      }`}
    >
      <div
        style={{ backgroundColor: propBgColor }}
        className="h-full w-full flex flex-col justify-between rounded-xl overflow-hidden"
      >
      {/* Top Price / Owner Bar */}
      {hasPriceBar ? (
        <div
          style={ownerMeta ? { backgroundColor: ownerMeta.hex } : undefined}
          className={`flex items-center justify-between px-1.5 py-0.5 sm:py-1 text-[9px] sm:text-[11px] font-bold leading-none ${
            ownerMeta
              ? 'text-white shadow-sm'
              : isColoredProperty
                ? 'bg-black/22 text-white'
                : 'bg-slate-200 text-slate-700'
          }`}
        >
          <span className="font-mono-num truncate">
            {ownerMeta
              ? owner?.name
              : `฿${(tile.price ?? 0).toLocaleString()}`}
          </span>
          {level > 0 && (
            <span className="inline-flex items-center gap-0.5 rounded bg-emerald-500 px-1 py-0.5 text-[8px] sm:text-[9px] font-extrabold text-white shrink-0">
              <ArrowUp className="h-2.5 w-2.5 stroke-[3]" />
              <span>{level === 1 ? '2×' : '3×'}</span>
            </span>
          )}
        </div>
      ) : (
        <div className="px-1.5 pt-1 flex items-center justify-between text-[8px] sm:text-[10px] font-mono-num font-bold text-slate-400">
          <span>#{tile.id}</span>
        </div>
      )}

      {/* Center Content: Flat-Vector Icon on White/Special Tiles, Clean Space on Colored Property */}
      <div className="flex-1 flex flex-col items-center justify-center px-1 min-h-0">
        {!isColoredProperty && renderFlatVectorIcon(tile)}
      </div>

      {/* Bottom Label */}
      <div className="px-1 sm:px-1.5 pb-1 sm:pb-1.5 flex items-center justify-center">
        {isColoredProperty ? (
          <p className="text-[9px] sm:text-xs font-extrabold text-white text-center leading-tight line-clamp-2 drop-shadow-[0_1px_1px_rgba(0,0,0,0.28)]">
            {tile.shortName}
          </p>
        ) : (
          <span className="inline-block max-w-full truncate rounded-full bg-slate-200/90 px-2 py-0.5 text-[8px] sm:text-[10px] font-bold text-slate-700">
            {tile.shortName}
          </span>
        )}
      </div>
      </div>

      {/* Player 3D Puck Tokens Overlay + Step Hop + Glow + Floating Money Text */}
      {playersHere.length > 0 && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-20 overflow-visible">
          <div className="flex flex-wrap items-center justify-center gap-0.5 sm:gap-1 p-1 overflow-visible">
            {playersHere.map((p) => {
              const c = COLOR_META[p.color];
              const isActiveToken = p.id === activePlayerId;
              const isStepping = phase === 'MOVING' && isActiveToken;
              const tokenPopups = moneyPopups.filter((m) => m.playerId === p.id);

              return (
                <motion.div
                  key={p.id}
                  layoutId={`token-${p.id}`}
                  transition={{ type: 'spring', stiffness: 240, damping: 24 }}
                  title={p.name}
                  className="relative flex items-center justify-center"
                >
                  {/* Active / Hopping Glow Aura beneath token */}
                  {isActiveToken && (
                    <motion.span
                      animate={{
                        scale: isStepping ? [1, 1.55, 1.1] : [1, 1.32, 1],
                        opacity: isStepping ? [0.85, 0.35, 0.85] : [0.65, 0.25, 0.65],
                      }}
                      transition={{
                        duration: isStepping
                          ? gameSpeed === 2
                            ? 0.33
                            : 0.65
                          : 2.0,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }}
                      className="absolute inset-0 rounded-full pointer-events-none"
                      style={{
                        backgroundColor: c.hex,
                        boxShadow: `0 0 12px 3px ${c.hex}`,
                      }}
                    />
                  )}

                  {/* Per-Tile Hop Bounce */}
                  <motion.div
                    key={isStepping ? `hop-${p.id}-${p.position}` : `idle-${p.id}`}
                    initial={isStepping ? { y: 0, scale: 1 } : false}
                    animate={
                      isStepping
                        ? { y: [0, -16, 0], scale: [1, 1.28, 1] }
                        : { y: 0, scale: 1 }
                    }
                    transition={{
                      duration: gameSpeed === 2 ? 0.17 : 0.34,
                      ease: 'easeOut',
                    }}
                    className="relative h-5 w-5 sm:h-6 sm:w-6 rounded-full border-2 border-white shadow-[0_3px_0_rgba(0,0,0,0.35)] flex items-center justify-center text-[9px] sm:text-[10px] font-extrabold text-white"
                    style={{ backgroundColor: c.hex }}
                  >
                    {p.isBot ? p.name.replace('บอท', '').slice(0, 1) : p.name.slice(0, 1)}
                  </motion.div>

                  {/* Floating Money Text above Token */}
                  <AnimatePresence>
                    {tokenPopups.map((pop) => (
                      <motion.div
                        key={pop.id}
                        initial={{ opacity: 0, y: 2, scale: 0.8 }}
                        animate={{
                          opacity: [0, 1, 1, 0],
                          y: [2, -18, -30, -40],
                          scale: [0.8, 1.12, 1, 0.95],
                        }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1.8, ease: 'easeOut' }}
                        className={`absolute -top-5 left-1/2 -translate-x-1/2 whitespace-nowrap font-mono-num text-[10px] sm:text-xs font-extrabold px-1.5 py-0.5 rounded-full shadow-md pointer-events-none z-30 ${
                          pop.amount >= 0
                            ? 'bg-emerald-500 text-white'
                            : 'bg-[#E74C3C] text-white'
                        }`}
                      >
                        {pop.amount >= 0
                          ? `+฿${pop.amount.toLocaleString()}`
                          : `-฿${Math.abs(pop.amount).toLocaleString()}`}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );

  if (isWarpTarget && onSelectWarp) {
    return (
      <button
        type="button"
        onClick={() => onSelectWarp(tile.id)}
        aria-label={`วาร์ปไปที่ ${tile.name}`}
        className={`${gridAreaClass} text-left focus-visible:outline-none`}
      >
        {content}
      </button>
    );
  }

  return (
    <div className={gridAreaClass} title={`${tile.name}: ${tile.description}`}>
      {content}
    </div>
  );
};
