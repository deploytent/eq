import React, { useState } from 'react';
import { ArrowUpCircle, CheckCircle2, XCircle } from 'lucide-react';
import { motion } from 'motion/react';
import type { PropertyState, TileConfig, UpgradeChallenge } from '../types';

interface UpgradeModalProps {
  tile: TileConfig;
  propState: PropertyState;
  challenge: UpgradeChallenge;
  onComplete: (success: boolean) => void;
  onCancel: () => void;
}

const UpgradePieSvg: React.FC<{
  slices: NonNullable<UpgradeChallenge['pieSlices']>;
}> = ({ slices }) => {
  const cx = 64;
  const cy = 64;
  const r = 52;
  let angle = -Math.PI / 2;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 rounded-xl border border-white/10 bg-[#25272C] p-3.5">
      <svg viewBox="0 0 128 128" className="w-28 h-28 shrink-0" role="img" aria-label="แผนภูมิวงกลม">
        {slices.map((s) => {
          const sliceAngle = (s.percent / 100) * Math.PI * 2;
          const x1 = cx + r * Math.cos(angle);
          const y1 = cy + r * Math.sin(angle);
          const next = angle + sliceAngle;
          const x2 = cx + r * Math.cos(next);
          const y2 = cy + r * Math.sin(next);
          const largeArc = sliceAngle > Math.PI ? 1 : 0;
          const mid = angle + sliceAngle / 2;
          const lx = cx + r * 0.62 * Math.cos(mid);
          const ly = cy + r * 0.62 * Math.sin(mid);
          angle = next;

          return (
            <g key={s.label}>
              <path
                d={`M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`}
                fill={s.color}
                stroke="#25272C"
                strokeWidth="2"
              />
              <text
                x={lx}
                y={ly + 4}
                textAnchor="middle"
                fill="#FFFFFF"
                fontSize="11"
                fontWeight="800"
              >
                {s.isMissing ? '?' : `${s.percent}%`}
              </text>
            </g>
          );
        })}
      </svg>
      <div className="space-y-1.5 text-xs">
        {slices.map((s) => (
          <div key={s.label} className="flex items-center gap-2">
            <span
              className="h-3 w-3 rounded-sm shrink-0"
              style={{ backgroundColor: s.color }}
            />
            <span className="text-slate-200 font-medium">{s.label}</span>
            <span className="font-mono-num font-bold text-white">
              {s.isMissing ? '?%' : `${s.percent}%`}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export const UpgradeModal: React.FC<UpgradeModalProps> = ({
  tile,
  propState,
  challenge,
  onComplete,
  onCancel,
}) => {
  const [selected, setSelected] = useState<number | null>(null);
  const nextLevel = propState.level + 1;
  const cost = tile.price ?? 0;
  const resolved = selected !== null;
  const isCorrect = selected === challenge.correctIndex;

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/75 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="upgrade-modal-title"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.18 }}
        className="w-full max-w-lg rounded-2xl border border-white/15 bg-[#2D3037] text-slate-100 shadow-2xl overflow-hidden"
      >
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <div className="flex items-center gap-2.5">
            <ArrowUpCircle className="h-5 w-5 text-[#F39C12] shrink-0" />
            <div>
              <h2 id="upgrade-modal-title" className="text-base font-bold text-white">
                ภารกิจอัปเกรด: {tile.name}
              </h2>
              <p className="text-xs text-slate-300">
                อัปเกรดเป็น Level {nextLevel} (ค่าเช่า {nextLevel === 1 ? '2×' : '3×'}) · ค่าใช้จ่าย{' '}
                <span className="font-mono-num text-[#F39C12] font-bold">
                  ฿{cost.toLocaleString()}
                </span>
              </p>
            </div>
          </div>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-[#F39C12] mb-1">
              {challenge.title}
            </h3>
            <p className="text-sm text-slate-200">{challenge.prompt}</p>
          </div>

          {challenge.pieSlices && <UpgradePieSvg slices={challenge.pieSlices} />}

          {challenge.tableRows && (
            <div className="overflow-hidden rounded-xl border border-white/10">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="bg-[#25272C] text-slate-300 border-b border-white/10">
                    <th className="py-2 px-3 text-left font-medium">หมวดหมู่</th>
                    <th className="py-2 px-3 text-right font-medium">ความถี่ (f)</th>
                    <th className="py-2 px-3 text-right font-medium">ความถี่สัมพัทธ์ (%)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {challenge.tableRows.map((row) => (
                    <tr key={row.label} className="bg-[#25272C]/60">
                      <td className="py-2 px-3 text-slate-200">{row.label}</td>
                      <td className="py-2 px-3 text-right font-mono-num text-slate-200">
                        {row.freq}
                      </td>
                      <td
                        className={`py-2 px-3 text-right font-mono-num font-bold ${
                          row.relFreqDisplay === '?'
                            ? 'text-[#F39C12] bg-[#F39C12]/15'
                            : 'text-slate-300'
                        }`}
                      >
                        {row.relFreqDisplay}
                      </td>
                    </tr>
                  ))}
                  {challenge.totalFreq && (
                    <tr className="bg-[#25272C] font-bold text-white">
                      <td className="py-2 px-3">รวมทั้งหมด</td>
                      <td className="py-2 px-3 text-right font-mono-num">
                        {challenge.totalFreq}
                      </td>
                      <td className="py-2 px-3 text-right font-mono-num">100%</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {challenge.options.map((opt, idx) => {
              const isRight = idx === challenge.correctIndex;
              const isPick = selected === idx;
              let cls =
                'border-white/15 bg-[#25272C] hover:bg-white/10 text-slate-100';
              if (resolved) {
                if (isRight) {
                  cls = 'border-[#27AE60] bg-[#27AE60]/20 text-emerald-200';
                } else if (isPick) {
                  cls = 'border-[#E74C3C] bg-[#E74C3C]/20 text-rose-200';
                } else {
                  cls = 'border-white/5 bg-[#25272C]/50 text-slate-500';
                }
              }
              return (
                <button
                  key={idx}
                  type="button"
                  disabled={resolved}
                  onClick={() => setSelected(idx)}
                  className={`flex items-center justify-between gap-2 rounded-xl border px-3.5 py-2.5 text-left text-sm font-semibold transition-colors ${cls}`}
                >
                  <span>{opt}</span>
                  {resolved && isRight && (
                    <CheckCircle2 className="h-4 w-4 text-[#2ECC71] shrink-0" />
                  )}
                  {resolved && isPick && !isRight && (
                    <XCircle className="h-4 w-4 text-[#E74C3C] shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {resolved && (
            <div
              className={`rounded-xl border p-3 text-xs leading-relaxed ${
                isCorrect
                  ? 'border-[#27AE60]/50 bg-[#27AE60]/15 text-emerald-100'
                  : 'border-[#E74C3C]/50 bg-[#E74C3C]/15 text-rose-100'
              }`}
            >
              <p className="font-bold mb-0.5">
                {isCorrect
                  ? `ภารกิจสำเร็จ! พร้อมอัปเกรดเป็น Level ${nextLevel}`
                  : 'คำตอบยังไม่ถูกต้อง การอัปเกรดถูกยกเลิกในรอบนี้'}
              </p>
              <p className="text-slate-200">{challenge.explanation}</p>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-white/10 px-5 py-3.5 bg-[#25272C]">
          {!resolved ? (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 rounded-xl border border-white/15 text-slate-300 hover:bg-white/10 text-sm font-semibold whitespace-nowrap"
            >
              ยกเลิกการอัปเกรด
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onComplete(isCorrect)}
              className="px-5 py-2 rounded-xl bg-[#F39C12] hover:bg-amber-400 text-slate-950 font-extrabold text-sm transition-colors whitespace-nowrap"
            >
              {isCorrect
                ? `จ่าย ฿${cost.toLocaleString()} และอัปเกรด`
                : 'ปิดหน้าต่าง'}
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};
