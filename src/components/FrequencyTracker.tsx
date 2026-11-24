import React from 'react';
import { Crown, BarChart3 } from 'lucide-react';
import { computeDiceStats } from '../gameRules';

interface FrequencyTrackerProps {
  diceCounts: Record<number, number>;
  currentRound: number;
  lastDice: number | null;
  compact?: boolean;
}

export const FrequencyTracker: React.FC<FrequencyTrackerProps> = ({
  diceCounts,
  currentRound,
  lastDice,
  compact = false,
}) => {
  const stats = computeDiceStats(diceCounts, currentRound);
  const maxBarCount = Math.max(stats.maxCount, 1);

  if (compact) {
    return (
      <div className="rounded-xl bg-white/90 border border-sky-200/80 px-3 py-2 shadow-sm text-slate-800">
        <div className="flex items-center justify-between gap-2 text-xs mb-1.5">
          <div className="flex items-center gap-1.5 font-bold text-slate-800">
            <BarChart3 className="h-3.5 w-3.5 text-[#4AA3DF]" />
            <span>ความถี่ลูกเต๋า (รวม {stats.totalRolls})</span>
          </div>
          {stats.modeActive ? (
            <span className="inline-flex items-center gap-1 font-mono-num font-bold text-amber-600">
              <Crown className="h-3.5 w-3.5 fill-amber-400 text-amber-500" />
              ฐานนิยม: {stats.modeFaces.join(', ')}
            </span>
          ) : (
            <span className="text-[11px] text-slate-500">
              โบนัสฐานนิยมเริ่มรอบ 3
            </span>
          )}
        </div>
        <div className="grid grid-cols-6 gap-1.5">
          {stats.rows.map((row) => {
            const barH =
              stats.totalRolls > 0
                ? Math.max(Math.round((row.count / maxBarCount) * 24), row.count > 0 ? 4 : 2)
                : 2;
            return (
              <div
                key={row.face}
                className={`flex flex-col items-center rounded-lg px-1 py-1 ${
                  row.isMode
                    ? 'bg-amber-100 border border-amber-300'
                    : lastDice === row.face
                      ? 'bg-sky-100 border border-sky-300'
                      : 'bg-slate-100/80'
                }`}
              >
                <div className="h-7 flex items-end justify-center w-full">
                  <div
                    className={`w-3 rounded-t-sm transition-all ${
                      row.isMode
                        ? 'bg-amber-500'
                        : lastDice === row.face
                          ? 'bg-[#4AA3DF]'
                          : 'bg-[#8CC63F]'
                    }`}
                    style={{ height: `${barH}px` }}
                  />
                </div>
                <span className="font-mono-num text-[10px] font-bold text-slate-800 mt-0.5">
                  {row.face}
                </span>
                <span className="font-mono-num text-[9px] text-slate-500">
                  {row.count} ({row.relativePercent.toFixed(0)}%)
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 rounded-xl border border-sky-200 bg-white/95 p-3 text-slate-800 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <BarChart3 className="h-4 w-4 text-[#4AA3DF] shrink-0" />
          <h3 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
            ตารางความถี่แต้มลูกเต๋า
          </h3>
        </div>
        <span className="text-[11px] font-mono-num text-slate-500 whitespace-nowrap shrink-0">
          รวม {stats.totalRolls} ครั้ง
        </span>
      </div>

      <div className="flex items-center justify-between gap-2 rounded-lg bg-[#D8E9F4]/60 px-2.5 py-1.5 text-xs">
        <div className="flex items-center gap-1.5 text-slate-700 font-medium">
          <Crown
            className={`h-3.5 w-3.5 shrink-0 ${
              stats.modeActive ? 'text-amber-500 fill-amber-400' : 'text-slate-400'
            }`}
          />
          <span>โบนัสฐานนิยม (+฿2,000):</span>
        </div>
        {stats.modeActive ? (
          <span className="font-mono-num font-bold text-amber-700 whitespace-nowrap">
            แต้ม {stats.modeFaces.join(', ')}
          </span>
        ) : (
          <span className="text-slate-500 text-[11px] whitespace-nowrap">
            เริ่มรอบที่ 3 (ตอนนี้รอบ {currentRound})
          </span>
        )}
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-200">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="bg-slate-100 text-slate-600 border-b border-slate-200">
              <th className="py-1 px-2 text-left font-semibold">แต้ม</th>
              <th className="py-1 px-2 text-right font-semibold">ความถี่ (f)</th>
              <th className="py-1 px-2 text-right font-semibold">ร้อยละ</th>
              <th className="py-1 px-2 text-left font-semibold w-24 sm:w-28">แผนภูมิ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {stats.rows.map((row) => {
              const barWidth =
                stats.totalRolls > 0
                  ? Math.max((row.count / maxBarCount) * 100, row.count > 0 ? 8 : 0)
                  : 0;
              const isLastRolled = lastDice === row.face;
              return (
                <tr
                  key={row.face}
                  className={
                    row.isMode
                      ? 'bg-amber-50'
                      : isLastRolled
                        ? 'bg-sky-50'
                        : 'bg-white'
                  }
                >
                  <td className="py-1 px-2 font-mono-num font-bold text-slate-900">
                    <div className="flex items-center gap-1">
                      <span>{row.face}</span>
                      {row.isMode && (
                        <Crown
                          className="h-3 w-3 text-amber-500 fill-amber-400 shrink-0"
                          aria-label="ฐานนิยม"
                        />
                      )}
                    </div>
                  </td>
                  <td className="py-1 px-2 text-right font-mono-num text-slate-800">
                    {row.count}
                  </td>
                  <td className="py-1 px-2 text-right font-mono-num text-slate-600">
                    {row.relativePercent.toFixed(1)}%
                  </td>
                  <td className="py-1 px-2">
                    <div className="h-2.5 w-full rounded-sm bg-slate-200 overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          row.isMode
                            ? 'bg-amber-500'
                            : isLastRolled
                              ? 'bg-[#4AA3DF]'
                              : 'bg-[#8CC63F]'
                        }`}
                        style={{ width: `${barWidth}%` }}
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
