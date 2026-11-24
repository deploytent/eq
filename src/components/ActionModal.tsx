import React, { useMemo, useState } from 'react';
import {
  Building2,
  ArrowUpCircle,
  Repeat,
  AlertCircle,
  Zap,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { motion } from 'motion/react';
import type { GameState, PendingAction, Player, TileConfig } from '../types';
import { getDiscountedPrice, getSellToBankValue } from '../gameRules';
import { pickBuyDiscountPuzzle } from '../gameData';

interface ActionModalProps {
  pendingAction: PendingAction;
  player: Player;
  tiles: TileConfig[];
  gameState: GameState;
  onBuyProperty: (paidPrice: number, usedDiscount: boolean) => void;
  onStartUpgradeChallenge: () => void;
  onTakeoverProperty: () => void;
  onSellPropertyForDebt: (tileId: number) => void;
  onDeclareBankruptcy: () => void;
  onDeclineAction: () => void;
}

export const ActionModal: React.FC<ActionModalProps> = ({
  pendingAction,
  player,
  tiles,
  gameState,
  onBuyProperty,
  onStartUpgradeChallenge,
  onTakeoverProperty,
  onSellPropertyForDebt,
  onDeclareBankruptcy,
  onDeclineAction,
}) => {
  const [discountMode, setDiscountMode] = useState(false);
  const [pickedOption, setPickedOption] = useState<number | null>(null);
  const puzzle = useMemo(() => pickBuyDiscountPuzzle(), []);

  const tile = tiles.find((t) => t.id === pendingAction.tileId);
  if (!tile && pendingAction.type !== 'sell_for_debt') return null;

  if (pendingAction.type === 'sell_for_debt') {
    const ownedTiles = tiles.filter(
      (t) => gameState.properties[t.id]?.ownerId === player.id
    );

    return (
      <div
        className="fixed inset-0 z-40 flex items-center justify-center bg-black/75 p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="debt-modal-title"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md rounded-2xl border border-[#E74C3C]/50 bg-[#2D3037] p-6 text-slate-100 shadow-2xl space-y-4"
        >
          <div className="flex items-center gap-2.5 text-[#E74C3C]">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <h2 id="debt-modal-title" className="text-lg font-bold text-white">
              เงินสดติดลบ! กรุณาขายทรัพย์สิน
            </h2>
          </div>

          <p className="text-sm text-slate-300">
            ยอดเงินสดปัจจุบัน:{' '}
            <span className="font-mono-num font-bold text-[#E74C3C]">
              ฿{player.cash.toLocaleString()}
            </span>
            <br />
            เลือกขายพื้นที่คืนธนาคาร (ได้รับ 50% ของมูลค่ารวม) จนกว่าเงินสดจะเป็น ฿0 ขึ้นไป
          </p>

          {ownedTiles.length > 0 ? (
            <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
              {ownedTiles.map((t) => {
                const state = gameState.properties[t.id];
                const sellVal = getSellToBankValue(t, state);
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => onSellPropertyForDebt(t.id)}
                    className="w-full flex items-center justify-between rounded-xl border border-white/10 bg-[#25272C] hover:bg-white/10 px-4 py-3 text-left text-sm transition-colors"
                  >
                    <div>
                      <p className="font-semibold text-white">{t.name}</p>
                      <p className="text-xs text-slate-400">ระดับ {state.level}</p>
                    </div>
                    <span className="font-mono-num font-bold text-[#2ECC71]">
                      +฿{sellVal.toLocaleString()}
                    </span>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="rounded-xl border border-white/10 bg-[#25272C] p-4 text-sm text-slate-400 text-center">
              คุณไม่มีพื้นที่เหลือให้ขายแล้ว
            </div>
          )}

          {ownedTiles.length === 0 && (
            <button
              type="button"
              onClick={onDeclareBankruptcy}
              className="w-full py-2.5 rounded-xl bg-[#E74C3C] hover:bg-rose-500 text-white font-bold text-sm transition-colors"
            >
              ยอมรับการล้มละลาย
            </button>
          )}
        </motion.div>
      </div>
    );
  }

  const fullPrice = pendingAction.amount;
  const discountedPrice = getDiscountedPrice(fullPrice);
  const canAffordFull = player.cash >= fullPrice;
  const canAffordDiscount = player.cash >= discountedPrice;
  const puzzleResolved = pickedOption !== null;
  const puzzleCorrect = pickedOption === puzzle.correctIndex;

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/75 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="action-modal-title"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.16 }}
        className="w-full max-w-md rounded-2xl border border-white/15 bg-[#2D3037] p-6 text-slate-100 shadow-2xl space-y-4"
      >
        <div className="flex items-center gap-2.5">
          {pendingAction.type === 'buy' && (
            <Building2 className="h-5 w-5 text-[#8CC63F] shrink-0" />
          )}
          {pendingAction.type === 'upgrade_prompt' && (
            <ArrowUpCircle className="h-5 w-5 text-[#F39C12] shrink-0" />
          )}
          {pendingAction.type === 'takeover' && (
            <Repeat className="h-5 w-5 text-[#4AA3DF] shrink-0" />
          )}
          <h2 id="action-modal-title" className="text-lg font-bold text-white">
            {pendingAction.type === 'buy' && `ซื้อพื้นที่: ${tile?.name}`}
            {pendingAction.type === 'upgrade_prompt' && `อัปเกรดพื้นที่: ${tile?.name}`}
            {pendingAction.type === 'takeover' && `เทคโอเวอร์กิจการ: ${tile?.name}`}
          </h2>
        </div>

        {/* Buy Discount Puzzle View */}
        {pendingAction.type === 'buy' && discountMode ? (
          <div className="space-y-3">
            <div className="rounded-xl bg-[#25272C] border border-[#F39C12]/40 p-4 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-[#F39C12]">
                <span className="inline-flex items-center gap-1">
                  <Zap className="h-3.5 w-3.5" />
                  ภารกิจลดราคา 20%
                </span>
                <span className="font-mono-num">
                  เหลือ ฿{discountedPrice.toLocaleString()}
                </span>
              </div>
              <p className="text-sm font-bold text-white leading-relaxed">
                {puzzle.prompt}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {puzzle.options.map((opt, idx) => {
                const isRight = idx === puzzle.correctIndex;
                const isPick = pickedOption === idx;
                let cls =
                  'border-white/15 bg-[#25272C] hover:bg-white/10 text-white';
                if (puzzleResolved) {
                  if (isRight) cls = 'border-[#27AE60] bg-[#27AE60]/20 text-emerald-200';
                  else if (isPick) cls = 'border-[#E74C3C] bg-[#E74C3C]/20 text-rose-200';
                  else cls = 'border-white/5 bg-[#25272C]/50 text-slate-500';
                }
                return (
                  <button
                    key={idx}
                    type="button"
                    disabled={puzzleResolved}
                    onClick={() => setPickedOption(idx)}
                    className={`flex items-center justify-between gap-2 rounded-xl border px-3 py-2.5 text-left text-sm font-semibold transition-colors ${cls}`}
                  >
                    <span>{opt}</span>
                    {puzzleResolved && isRight && (
                      <CheckCircle2 className="h-4 w-4 text-[#2ECC71] shrink-0" />
                    )}
                    {puzzleResolved && isPick && !isRight && (
                      <XCircle className="h-4 w-4 text-[#E74C3C] shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {puzzleResolved && (
              <div
                className={`rounded-xl border p-3 text-xs leading-relaxed ${
                  puzzleCorrect
                    ? 'border-[#27AE60]/50 bg-[#27AE60]/15 text-emerald-100'
                    : 'border-[#E74C3C]/50 bg-[#E74C3C]/15 text-rose-100'
                }`}
              >
                <p className="font-bold">
                  {puzzleCorrect
                    ? `เก่งมาก! รับส่วนลด 20% เหลือ ฿${discountedPrice.toLocaleString()}`
                    : 'ตอบยังไม่ถูก! สามารถซื้อราคาเต็มหรือข้ามได้'}
                </p>
                <p className="text-slate-200 mt-0.5">{puzzle.explanation}</p>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={onDeclineAction}
                className="px-4 py-2 rounded-xl border border-white/15 text-slate-300 hover:bg-white/10 text-sm font-semibold whitespace-nowrap"
              >
                ข้าม
              </button>
              {puzzleResolved && puzzleCorrect ? (
                <button
                  type="button"
                  disabled={!canAffordDiscount}
                  onClick={() => onBuyProperty(discountedPrice, true)}
                  className="px-5 py-2 rounded-xl bg-[#8CC63F] hover:bg-[#7BB434] disabled:bg-slate-600 text-slate-950 font-extrabold text-sm whitespace-nowrap"
                >
                  ซื้อเลย ฿{discountedPrice.toLocaleString()}
                </button>
              ) : puzzleResolved ? (
                <button
                  type="button"
                  disabled={!canAffordFull}
                  onClick={() => onBuyProperty(fullPrice, false)}
                  className="px-5 py-2 rounded-xl bg-[#4AA3DF] hover:bg-sky-400 disabled:bg-slate-600 text-white font-bold text-sm whitespace-nowrap"
                >
                  ซื้อราคาเต็ม ฿{fullPrice.toLocaleString()}
                </button>
              ) : null}
            </div>
          </div>
        ) : (
          <>
            <p className="text-sm text-slate-300 leading-relaxed">{tile?.description}</p>

            <div className="rounded-xl border border-white/10 bg-[#25272C] p-4 space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">
                  {pendingAction.type === 'buy'
                    ? 'ราคาซื้อปกติ'
                    : pendingAction.type === 'upgrade_prompt'
                      ? 'ค่าใช้จ่ายอัปเกรด'
                      : 'ราคาเทคโอเวอร์ (2× มูลค่ารวม)'}
                </span>
                <span className="font-mono-num font-bold text-[#F39C12]">
                  ฿{fullPrice.toLocaleString()}
                </span>
              </div>
              {pendingAction.type === 'buy' && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">ราคาหลังแก้โจทย์ไว (-20%)</span>
                  <span className="font-mono-num font-bold text-[#8CC63F]">
                    ฿{discountedPrice.toLocaleString()}
                  </span>
                </div>
              )}
              {tile?.baseRent && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">ค่าเช่าพื้นฐาน</span>
                  <span className="font-mono-num text-slate-200">
                    ฿{tile.baseRent.toLocaleString()}
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between border-t border-white/10 pt-2">
                <span className="text-slate-400">เงินสดคงเหลือของคุณ</span>
                <span
                  className={`font-mono-num font-bold ${
                    canAffordFull || (pendingAction.type === 'buy' && canAffordDiscount)
                      ? 'text-[#2ECC71]'
                      : 'text-[#E74C3C]'
                  }`}
                >
                  ฿{player.cash.toLocaleString()}
                </span>
              </div>
            </div>

            {pendingAction.type === 'upgrade_prompt' && (
              <p className="text-xs text-amber-200/90">
                แก้โจทย์ภาพสั้นๆ 1 ข้อเพื่อยืนยันการอัปเกรดเป็นค่าเช่า{' '}
                {(gameState.properties[tile!.id]?.level ?? 0) === 0 ? '2 เท่า' : '3 เท่า'}
              </p>
            )}

            <div className="flex flex-wrap items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onDeclineAction}
                className="px-4 py-2.5 rounded-xl border border-white/15 text-slate-300 hover:bg-white/10 text-sm font-semibold whitespace-nowrap"
              >
                ข้าม
              </button>

              {pendingAction.type === 'buy' && (
                <>
                  <button
                    type="button"
                    disabled={!canAffordFull}
                    onClick={() => onBuyProperty(fullPrice, false)}
                    className="px-4 py-2.5 rounded-xl bg-[#4AA3DF] hover:bg-sky-400 disabled:bg-slate-600 disabled:text-slate-400 text-white font-bold text-sm transition-colors whitespace-nowrap"
                  >
                    ซื้อราคาเต็ม
                  </button>
                  <button
                    type="button"
                    disabled={!canAffordDiscount}
                    onClick={() => setDiscountMode(true)}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#8CC63F] hover:bg-[#7BB434] disabled:bg-slate-600 disabled:text-slate-400 text-slate-950 font-extrabold text-sm transition-colors whitespace-nowrap"
                  >
                    <Zap className="h-4 w-4" />
                    <span>แก้โจทย์ไว ลด 20%!</span>
                  </button>
                </>
              )}

              {pendingAction.type === 'upgrade_prompt' && (
                <button
                  type="button"
                  disabled={!canAffordFull}
                  onClick={onStartUpgradeChallenge}
                  className="px-5 py-2.5 rounded-xl bg-[#F39C12] hover:bg-amber-400 disabled:bg-slate-600 text-slate-950 font-extrabold text-sm transition-colors whitespace-nowrap"
                >
                  ทำภารกิจอัปเกรด
                </button>
              )}

              {pendingAction.type === 'takeover' && (
                <button
                  type="button"
                  disabled={!canAffordFull}
                  onClick={onTakeoverProperty}
                  className="px-5 py-2.5 rounded-xl bg-[#4AA3DF] hover:bg-sky-400 disabled:bg-slate-600 text-white font-bold text-sm transition-colors whitespace-nowrap"
                >
                  ยืนยันเทคโอเวอร์
                </button>
              )}
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
};
