import React from 'react';
import { HelpCircle, CheckCircle2, XCircle, Bot } from 'lucide-react';
import { motion } from 'motion/react';
import type { ActiveQuizState, ChartSpec, Player } from '../types';
import { QUIZ_PENALTY, QUIZ_REWARD } from '../gameRules';

interface QuizModalProps {
  quizState: ActiveQuizState;
  player: Player;
  canInteract: boolean;
  onSelectAnswer: (index: number) => void;
  onContinue: () => void;
}

const InlineQuizChart: React.FC<{ chart: ChartSpec }> = ({ chart }) => {
  if (chart.kind === 'bar') {
    const maxVal = Math.max(...chart.items.map((i) => i.value), 1);
    const chartW = 340;
    const chartH = 165;
    const padLeft = 36;
    const padBottom = 32;
    const padTop = 22;
    const plotH = chartH - padTop - padBottom;
    const barSlot = (chartW - padLeft - 16) / chart.items.length;

    return (
      <div className="rounded-xl border border-slate-700 bg-slate-950/80 p-3">
        <p className="text-xs font-semibold text-slate-200 mb-2 text-center">
          {chart.title}
        </p>
        <svg
          viewBox={`0 0 ${chartW} ${chartH}`}
          className="w-full max-w-[360px] mx-auto h-auto"
          role="img"
          aria-label={chart.title}
        >
          {/* Baseline */}
          <line
            x1={padLeft}
            y1={padTop + plotH}
            x2={chartW - 10}
            y2={padTop + plotH}
            stroke="#475569"
            strokeWidth="1.5"
          />
          <line
            x1={padLeft}
            y1={padTop}
            x2={padLeft}
            y2={padTop + plotH}
            stroke="#475569"
            strokeWidth="1.5"
          />
          {/* Horizontal gridlines */}
          {[0.5, 1].map((ratio) => {
            const y = padTop + plotH * (1 - ratio);
            const labelVal = Math.round(maxVal * ratio);
            return (
              <g key={ratio}>
                <line
                  x1={padLeft}
                  y1={y}
                  x2={chartW - 10}
                  y2={y}
                  stroke="#334155"
                  strokeDasharray="3 3"
                  strokeWidth="1"
                />
                <text
                  x={padLeft - 6}
                  y={y + 3}
                  textAnchor="end"
                  fill="#94A3B8"
                  fontSize="10"
                >
                  {labelVal}
                </text>
              </g>
            );
          })}
          {chart.items.map((item, idx) => {
            const barH = (item.value / maxVal) * plotH;
            const barW = Math.min(38, barSlot * 0.62);
            const x = padLeft + idx * barSlot + (barSlot - barW) / 2;
            const y = padTop + plotH - barH;
            return (
              <g key={item.label}>
                <rect
                  x={x}
                  y={y}
                  width={barW}
                  height={barH}
                  rx="4"
                  fill={item.color}
                />
                <text
                  x={x + barW / 2}
                  y={y - 5}
                  textAnchor="middle"
                  fill="#F8FAFC"
                  fontSize="11"
                  fontWeight="700"
                >
                  {item.value}
                </text>
                <text
                  x={x + barW / 2}
                  y={padTop + plotH + 15}
                  textAnchor="middle"
                  fill="#CBD5E1"
                  fontSize="10"
                >
                  {item.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    );
  }

  if (chart.kind === 'pie') {
    const cx = 75;
    const cy = 75;
    const r = 60;
    let cumulativeAngle = -Math.PI / 2;

    return (
      <div className="rounded-xl border border-slate-700 bg-slate-950/80 p-3">
        <p className="text-xs font-semibold text-slate-200 mb-2 text-center">
          {chart.title}
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <svg
            viewBox="0 0 150 150"
            className="w-36 h-36 shrink-0"
            role="img"
            aria-label={chart.title}
          >
            {chart.items.map((item) => {
              const sliceAngle = (item.percent / 100) * Math.PI * 2;
              const x1 = cx + r * Math.cos(cumulativeAngle);
              const y1 = cy + r * Math.sin(cumulativeAngle);
              const nextAngle = cumulativeAngle + sliceAngle;
              const x2 = cx + r * Math.cos(nextAngle);
              const y2 = cy + r * Math.sin(nextAngle);
              const largeArc = sliceAngle > Math.PI ? 1 : 0;

              const midAngle = cumulativeAngle + sliceAngle / 2;
              const lx = cx + r * 0.62 * Math.cos(midAngle);
              const ly = cy + r * 0.62 * Math.sin(midAngle);

              cumulativeAngle = nextAngle;
              const d = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`;

              return (
                <g key={item.label}>
                  <path d={d} fill={item.color} stroke="#0F172A" strokeWidth="1.5" />
                  <text
                    x={lx}
                    y={ly + 3}
                    textAnchor="middle"
                    fill="#FFFFFF"
                    fontSize="10"
                    fontWeight="700"
                  >
                    {item.percent}%
                  </text>
                </g>
              );
            })}
          </svg>
          <div className="space-y-1.5 text-xs">
            {chart.items.map((item) => (
              <div key={item.label} className="flex items-center gap-2">
                <span
                  className="inline-block h-3 w-3 rounded-sm shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-slate-200">{item.label}</span>
                <span className="font-mono-num text-slate-400">({item.percent}%)</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Pictogram
  return (
    <div className="rounded-xl border border-slate-700 bg-slate-950/80 p-3">
      <div className="flex items-center justify-between gap-2 mb-2">
        <p className="text-xs font-semibold text-slate-200">{chart.title}</p>
        <span className="text-[11px] text-amber-300 font-medium">
          กำหนดให้ 1 {chart.symbolLabel} = {chart.unitPerSymbol} หน่วย
        </span>
      </div>
      <div className="space-y-1.5">
        {chart.items.map((row) => (
          <div
            key={row.label}
            className="flex items-center justify-between rounded-lg bg-slate-900 px-3 py-1.5 text-xs"
          >
            <span className="font-medium text-slate-200 w-24 shrink-0">
              {row.label}
            </span>
            <div className="flex-1 flex items-center gap-1.5 text-base leading-none">
              {Array.from({ length: row.symbols }).map((_, idx) => (
                <span key={idx} aria-hidden="true">
                  {chart.symbolLabel}
                </span>
              ))}
              <span className="ml-auto font-mono-num text-[11px] text-slate-400">
                ({row.symbols} รูป)
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const QuizModal: React.FC<QuizModalProps> = ({
  quizState,
  player,
  canInteract,
  onSelectAnswer,
  onContinue,
}) => {
  const { question, selectedIndex, isResolved } = quizState;
  const isCorrect = selectedIndex === question.correctIndex;

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/75 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="quiz-modal-title"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.18 }}
        className="w-full max-w-xl max-h-[90vh] flex flex-col rounded-2xl border border-slate-700 bg-slate-900 text-slate-100 shadow-2xl overflow-hidden"
      >
        <div className="flex items-center justify-between border-b border-slate-800 px-5 py-3.5 bg-slate-900">
          <div className="flex items-center gap-2.5 min-w-0">
            <HelpCircle className="h-5 w-5 text-sky-400 shrink-0" />
            <div className="min-w-0">
              <h2 id="quiz-modal-title" className="text-sm sm:text-base font-bold text-white truncate">
                การ์ดคำถามสถิติ · {question.category}
              </h2>
              <p className="text-xs text-slate-400">
                ผู้ตอบ: <span className="text-slate-200 font-medium">{player.name}</span>
                {player.isBot && ' (บอทกำลังวิเคราะห์โจทย์)'}
              </p>
            </div>
          </div>
          <div className="text-right text-xs font-mono-num shrink-0">
            <span className="text-emerald-400">+{QUIZ_REWARD.toLocaleString()}฿</span>
            <span className="text-slate-500 mx-1">/</span>
            <span className="text-rose-400">-{QUIZ_PENALTY.toLocaleString()}฿</span>
          </div>
        </div>

        <div className="overflow-y-auto custom-scrollbar p-5 space-y-4">
          {player.isBot && !isResolved && (
            <div className="flex items-center gap-2 rounded-lg border border-sky-500/30 bg-sky-500/10 px-3 py-2 text-xs text-sky-200">
              <Bot className="h-4 w-4 text-sky-400 shrink-0" />
              <span>บอทกำลังอ่านโจทย์... คุณสามารถอ่านคำถามเพื่อเรียนรู้ไปพร้อมกันได้</span>
            </div>
          )}

          {question.chart && <InlineQuizChart chart={question.chart} />}

          <p className="text-sm sm:text-base font-medium text-white leading-relaxed">
            {question.question}
          </p>

          <div className="space-y-2">
            {question.options.map((opt, idx) => {
              const isSelected = selectedIndex === idx;
              const isRightOption = idx === question.correctIndex;
              let btnStyle =
                'border-slate-700 bg-slate-800/70 hover:bg-slate-800 text-slate-100';

              if (isResolved) {
                if (isRightOption) {
                  btnStyle =
                    'border-emerald-500 bg-emerald-500/15 text-emerald-200';
                } else if (isSelected && !isRightOption) {
                  btnStyle = 'border-rose-500 bg-rose-500/15 text-rose-200';
                } else {
                  btnStyle = 'border-slate-800 bg-slate-900/50 text-slate-500';
                }
              }

              return (
                <button
                  key={idx}
                  type="button"
                  disabled={!canInteract || isResolved || player.isBot}
                  onClick={() => onSelectAnswer(idx)}
                  className={`w-full flex items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left text-sm transition-colors disabled:cursor-default ${btnStyle}`}
                >
                  <div className="flex items-start gap-2.5">
                    <span className="font-mono-num font-bold text-slate-400 shrink-0">
                      {String.fromCharCode(65 + idx)}.
                    </span>
                    <span>{opt}</span>
                  </div>
                  {isResolved && isRightOption && (
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  )}
                  {isResolved && isSelected && !isRightOption && (
                    <XCircle className="h-4 w-4 text-rose-400 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {isResolved && (
            <div
              className={`rounded-xl border p-3.5 text-xs sm:text-sm space-y-1 ${
                isCorrect
                  ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-100'
                  : 'border-rose-500/40 bg-rose-500/10 text-rose-100'
              }`}
            >
              <p className="font-bold">
                {isCorrect
                  ? `ถูกต้อง! ได้รับทุนวิจัย +${QUIZ_REWARD.toLocaleString()} บาท`
                  : `ยังไม่ถูก! เสียค่าปรับ -${QUIZ_PENALTY.toLocaleString()} บาท`}
              </p>
              <p className="text-slate-200 leading-relaxed">
                <strong>คำอธิบาย:</strong> {question.explanation}
              </p>
            </div>
          )}
        </div>

        {isResolved && !player.isBot && canInteract && (
          <div className="flex justify-end border-t border-slate-800 px-5 py-3.5 bg-slate-900">
            <button
              type="button"
              onClick={onContinue}
              className="px-5 py-2.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold text-sm transition-colors whitespace-nowrap"
            >
              ดำเนินการต่อ
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};
