import React, { useState } from 'react';
import {
  Bot,
  Globe,
  LogIn,
  Copy,
  Check,
  Play,
  BookOpen,
  UserPlus,
  AlertTriangle,
  ArrowLeft,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import type {
  BotDifficulty,
  CurriculumMode,
  GameState,
  TokenColor,
} from '../types';
import { COLOR_META, getModeLabel } from '../gameRules';
import { isFirebaseConfigured } from '../firebaseConfig';

interface LobbyProps {
  playerName: string;
  setPlayerName: (name: string) => void;
  playerColor: TokenColor;
  setPlayerColor: (color: TokenColor) => void;
  curriculumMode: CurriculumMode;
  setCurriculumMode: (mode: CurriculumMode) => void;
  maxRounds: 10 | 15 | 20;
  setMaxRounds: (rounds: 10 | 15 | 20) => void;
  onlineRoom: GameState | null;
  localPlayerId: string;
  onlineError: string | null;
  onStartSolo: (botCount: 1 | 2 | 3, difficulty: BotDifficulty, rounds: 10 | 15 | 20) => void;
  onCreateOnlineRoom: () => void;
  onJoinOnlineRoom: (code: string) => void;
  onAddOnlineBot: () => void;
  onStartOnlineGame: () => void;
  onLeaveOnlineRoom: () => void;
  onOpenRules: () => void;
  takenColorsInJoinRoom: TokenColor[];
  onCheckJoinRoomColors: (code: string) => void;
}

const CURRICULUM_OPTIONS: {
  id: CurriculumMode;
  title: string;
  subtitle: string;
  accent: string;
}[] = [
  {
    id: 'mode1',
    title: 'โหมด 1: ความหมายของสถิติศาสตร์และข้อมูล',
    subtitle: 'ประชากร/ตัวอย่าง · พารามิเตอร์/ค่าสถิติ · ปฐมภูมิ/ทุติยภูมิ · เชิงปริมาณ/คุณภาพ',
    accent: '#8CC63F',
  },
  {
    id: 'mode2',
    title: 'โหมด 2: การวิเคราะห์และนำเสนอข้อมูลเชิงคุณภาพ',
    subtitle: 'ตารางความถี่ · ความถี่สัมพัทธ์ · ฐานนิยม · แผนภูมิแท่ง/วงกลม/รูปภาพ',
    accent: '#4AA3DF',
  },
  {
    id: 'mode3',
    title: 'โหมด 3: โหมดผสมผสาน (All-in-One)',
    subtitle: 'รวมเนื้อหาทั้งบทที่ 1 และบทที่ 2 ครบทุกมิติ (แนะนำ)',
    accent: '#F39C12',
  },
];

const ALL_COLORS: TokenColor[] = ['red', 'blue', 'green', 'yellow'];

export const Lobby: React.FC<LobbyProps> = ({
  playerName,
  setPlayerName,
  playerColor,
  setPlayerColor,
  curriculumMode,
  setCurriculumMode,
  maxRounds,
  setMaxRounds,
  onlineRoom,
  localPlayerId,
  onlineError,
  onStartSolo,
  onCreateOnlineRoom,
  onJoinOnlineRoom,
  onAddOnlineBot,
  onStartOnlineGame,
  onLeaveOnlineRoom,
  onOpenRules,
  takenColorsInJoinRoom,
  onCheckJoinRoomColors,
}) => {
  const [showSoloSetup, setShowSoloSetup] = useState(false);
  const [botCount, setBotCount] = useState<1 | 2 | 3>(2);
  const [botDifficulty, setBotDifficulty] = useState<BotDifficulty>('rookie');
  const [joinCode, setJoinCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [nameWarning, setNameWarning] = useState<string | null>(null);

  const validateName = (): boolean => {
    if (!playerName.trim()) {
      setNameWarning('กรุณากรอกชื่อผู้เล่นก่อนเริ่มเกม');
      return false;
    }
    setNameWarning(null);
    return true;
  };

  const handleCopyCode = () => {
    if (!onlineRoom?.roomCode) return;
    navigator.clipboard?.writeText(onlineRoom.roomCode).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ==================== WAITING LOBBY VIEW ====================
  if (onlineRoom && onlineRoom.status === 'waiting') {
    const isHost = onlineRoom.hostId === localPlayerId;
    const takenColors = new Set(onlineRoom.players.map((p) => p.color));

    return (
      <div className="min-h-screen bg-[#25272C] text-slate-100 flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-2xl rounded-2xl border border-white/10 bg-[#2F3239] p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5">
            <div>
              <p className="text-xs text-slate-400">ห้องรอเล่นออนไลน์</p>
              <h1 className="text-2xl font-bold text-white mt-0.5">
                รหัสห้อง:{' '}
                <span className="font-mono-num tracking-widest text-[#F39C12]">
                  {onlineRoom.roomCode}
                </span>
              </h1>
            </div>
            <button
              type="button"
              onClick={handleCopyCode}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#25272C] hover:bg-white/10 text-slate-100 text-sm font-semibold transition-colors whitespace-nowrap"
            >
              {copied ? (
                <Check className="h-4 w-4 text-[#2ECC71]" />
              ) : (
                <Copy className="h-4 w-4 text-[#4AA3DF]" />
              )}
              <span>{copied ? 'คัดลอกแล้ว' : 'คัดลอกรหัสห้อง'}</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 text-xs sm:text-sm text-slate-300">
            <span>{getModeLabel(onlineRoom.curriculumMode)}</span>
            <span className="font-mono-num">
              จำนวนรอบ: {onlineRoom.maxRounds} รอบ · ผู้เล่น {onlineRoom.players.length}/4 คน
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[0, 1, 2, 3].map((slotIdx) => {
              const p = onlineRoom.players[slotIdx];
              if (!p) {
                return (
                  <div
                    key={slotIdx}
                    className="flex items-center justify-between rounded-xl border border-dashed border-white/15 bg-[#25272C]/50 px-4 py-3.5 text-sm text-slate-500"
                  >
                    <span>ช่องผู้เล่น #{slotIdx + 1} (ว่าง)</span>
                  </div>
                );
              }
              const meta = COLOR_META[p.color];
              return (
                <div
                  key={p.id}
                  className="flex items-center justify-between rounded-xl border border-white/10 bg-[#25272C] px-4 py-3.5"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className="h-5 w-5 rounded-full shrink-0 border-2 border-white shadow"
                      style={{ backgroundColor: meta.hex }}
                    />
                    <span className="font-semibold text-white truncate">{p.name}</span>
                  </div>
                  <span className="text-xs text-slate-400 whitespace-nowrap">
                    {p.id === onlineRoom.hostId
                      ? 'หัวหน้าห้อง'
                      : p.isBot
                        ? 'บอท AI'
                        : 'ผู้เล่น'}
                  </span>
                </div>
              );
            })}
          </div>

          {takenColors.size > 0 && (
            <p className="text-xs text-slate-400">
              ผู้เล่นที่เข้าร่วมด้วยรหัส <span className="font-mono-num text-white">{onlineRoom.roomCode}</span> จะถูกล็อกสีที่ถูกเลือกแล้วอัตโนมัติ
            </p>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-5">
            <button
              type="button"
              onClick={onLeaveOnlineRoom}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/15 text-slate-300 hover:bg-white/10 text-sm font-semibold transition-colors whitespace-nowrap"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>ออกจากห้อง</span>
            </button>

            <div className="flex items-center gap-2.5">
              {isHost && onlineRoom.players.length < 4 && (
                <button
                  type="button"
                  onClick={onAddOnlineBot}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#4AA3DF]/20 hover:bg-[#4AA3DF]/30 text-[#4AA3DF] text-sm font-bold transition-colors whitespace-nowrap"
                >
                  <UserPlus className="h-4 w-4" />
                  <span>+ เพิ่มบอท</span>
                </button>
              )}
              {isHost ? (
                <button
                  type="button"
                  disabled={onlineRoom.players.length < 2}
                  onClick={onStartOnlineGame}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#8CC63F] hover:bg-[#7BB434] disabled:bg-slate-700 disabled:text-slate-500 text-slate-950 font-extrabold text-sm transition-colors whitespace-nowrap"
                >
                  <Play className="h-4 w-4" />
                  <span>เริ่มเกม</span>
                </button>
              ) : (
                <span className="text-sm text-[#F39C12] font-medium">
                  รอหัวหน้าห้องกดเริ่มเกม...
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==================== HOME SCREEN (#25272C Matte Charcoal) ====================
  return (
    <div className="min-h-screen bg-[#25272C] text-slate-100 flex flex-col justify-center p-4 sm:p-8">
      <div className="w-full max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left Brand & Pastel Board Preview Card */}
        <div className="lg:col-span-5 rounded-2xl border border-white/10 bg-[#2F3239] p-6 sm:p-8 flex flex-col justify-between gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3.5">
              <svg viewBox="0 0 64 64" className="h-14 w-14 shrink-0" aria-hidden="true">
                <rect x="4" y="4" width="56" height="56" rx="14" fill="#D8E9F4" />
                <rect x="13" y="34" width="9" height="17" rx="2.5" fill="#8CC63F" />
                <rect x="27.5" y="23" width="9" height="28" rx="2.5" fill="#F39C12" />
                <rect x="42" y="14" width="9" height="37" rx="2.5" fill="#4AA3DF" />
                <circle cx="46.5" cy="14" r="4" fill="#E74C3C" stroke="#FFFFFF" strokeWidth="1.5" />
              </svg>
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
                  Data Tycoon
                </h1>
                <p className="text-base sm:text-lg font-bold text-[#F39C12]">
                  สถิติพิชิตเศรษฐี
                </p>
              </div>
            </div>

            <p className="text-sm text-slate-300 leading-relaxed">
              เกมกระดานเศรษฐีสไตล์เวกเตอร์เพื่อการเรียนรู้สถิติศาสตร์ภาษาไทย ซื้อพื้นที่ด้วยโจทย์ไวลด 20% อัปเกรดด้วยมินิเกมแผนภูมิ และชิงโบนัสฐานนิยมลูกเต๋า
            </p>

            {/* Color Group Mini Strip */}
            <div className="grid grid-cols-4 gap-1.5 pt-1">
              <div className="h-2 rounded-full bg-[#8CC63F]" />
              <div className="h-2 rounded-full bg-[#4AA3DF]" />
              <div className="h-2 rounded-full bg-[#F39C12]" />
              <div className="h-2 rounded-full bg-[#E74C3C]" />
            </div>

            <div className="space-y-2.5 pt-2 border-t border-white/10 text-xs sm:text-sm text-slate-300">
              <div className="flex items-center justify-between">
                <span>กระดานการเรียนรู้</span>
                <span className="font-mono-num text-white font-semibold">16 ช่อง · 3 โหมด</span>
              </div>
              <div className="flex items-center justify-between">
                <span>ทุนวิจัยเริ่มต้น</span>
                <span className="font-mono-num text-[#2ECC71] font-semibold">฿20,000</span>
              </div>
              <div className="flex items-center justify-between">
                <span>โจทย์ไวลดราคาซื้อพื้นที่</span>
                <span className="font-mono-num text-[#8CC63F] font-semibold">ลดทันที 20%</span>
              </div>
              <div className="flex items-center justify-between">
                <span>โบนัสฐานนิยมลูกเต๋า</span>
                <span className="font-mono-num text-[#F39C12] font-semibold">+฿2,000 (ตั้งแต่รอบ 3)</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onOpenRules}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/15 text-slate-200 hover:bg-white/10 text-sm font-semibold transition-colors whitespace-nowrap"
            >
              <BookOpen className="h-4 w-4 text-[#F39C12]" />
              <span>คู่มือกติกาการเล่น</span>
            </button>
            <span className="text-xs text-slate-400">Enter / Space เพื่อเริ่มเล่น</span>
          </div>
        </div>

        {/* Right Setup Card */}
        <div className="lg:col-span-7 rounded-2xl border border-white/10 bg-[#2F3239] p-6 sm:p-8 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="player-name-input"
                className="block text-sm font-semibold text-slate-200 mb-1.5"
              >
                ชื่อผู้เล่น (Player Name)
              </label>
              <input
                id="player-name-input"
                type="text"
                maxLength={18}
                value={playerName}
                onChange={(e) => {
                  setPlayerName(e.target.value);
                  if (nameWarning) setNameWarning(null);
                }}
                placeholder="เช่น น้องซิกมา"
                className="w-full rounded-xl border border-white/15 bg-[#25272C] px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:border-[#4AA3DF] focus:outline-none"
              />
              {nameWarning && (
                <p className="mt-1 text-xs text-[#E74C3C]">{nameWarning}</p>
              )}
            </div>

            <div>
              <span className="block text-sm font-semibold text-slate-200 mb-1.5">
                สีตัวหมาก 3D (Token Color)
              </span>
              <div className="grid grid-cols-4 gap-2">
                {ALL_COLORS.map((c) => {
                  const meta = COLOR_META[c];
                  const active = playerColor === c;
                  const isTaken = takenColorsInJoinRoom.includes(c);
                  return (
                    <button
                      key={c}
                      type="button"
                      disabled={isTaken}
                      onClick={() => setPlayerColor(c)}
                      aria-label={isTaken ? `${meta.label} (ถูกเลือกแล้ว)` : meta.label}
                      className={`flex flex-col items-center justify-center gap-1 rounded-xl border py-2 text-xs font-medium transition-all ${
                        isTaken
                          ? 'border-white/5 bg-[#25272C]/40 text-slate-600 opacity-45 cursor-not-allowed'
                          : active
                            ? 'border-white bg-[#25272C] text-white shadow'
                            : 'border-white/10 bg-[#25272C]/70 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <span
                        className="h-5 w-5 rounded-full border-2 border-white shadow-[0_2px_0_rgba(0,0,0,0.3)]"
                        style={{ backgroundColor: meta.hex }}
                      />
                      <span>{isTaken ? 'ถูกใช้' : meta.label.replace('สี', '')}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div>
            <span className="block text-sm font-semibold text-slate-200 mb-2">
              เลือกเรื่องที่จะเล่น (Curriculum Mode)
            </span>
            <div className="space-y-2">
              {CURRICULUM_OPTIONS.map((opt) => {
                const selected = curriculumMode === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setCurriculumMode(opt.id)}
                    className={`w-full rounded-xl border px-4 py-3 text-left transition-colors ${
                      selected
                        ? 'border-[#4AA3DF] bg-[#4AA3DF]/15 text-white'
                        : 'border-white/10 bg-[#25272C]/70 text-slate-300 hover:border-white/25'
                    }`}
                  >
                    <p className="text-sm font-bold">{opt.title}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{opt.subtitle}</p>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-4 border-t border-white/10 pt-5">
            <button
              type="button"
              data-start="true"
              onClick={() => {
                if (validateName()) setShowSoloSetup(true);
              }}
              className="w-full inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-[#8CC63F] hover:bg-[#7BB434] text-slate-950 font-extrabold text-base shadow-[0_4px_0_#65952B] active:translate-y-0.5 transition-all whitespace-nowrap"
            >
              <Bot className="h-5 w-5" />
              <span>เล่นคนเดียวกับบอท (Solo vs Bot)</span>
            </button>

            <div className="rounded-xl border border-white/10 bg-[#25272C] p-4 space-y-3">
              {!isFirebaseConfigured && (
                <div className="flex items-start gap-2.5 rounded-lg border border-[#F39C12]/30 bg-[#F39C12]/10 px-3 py-2.5 text-xs text-amber-200">
                  <AlertTriangle className="h-4 w-4 text-[#F39C12] shrink-0 mt-0.5" />
                  <p>กรุณาตั้งค่า Firebase Realtime Database ใน src/firebaseConfig.ts</p>
                </div>
              )}

              {onlineError && (
                <p className="rounded-lg border border-[#E74C3C]/40 bg-[#E74C3C]/10 px-3 py-2 text-xs text-rose-200">
                  {onlineError}
                </p>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    if (validateName()) onCreateOnlineRoom();
                  }}
                  className="sm:col-span-5 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#4AA3DF] hover:bg-sky-400 text-white font-bold text-sm transition-colors whitespace-nowrap"
                >
                  <Globe className="h-4 w-4" />
                  <span>สร้างห้องออนไลน์</span>
                </button>

                <div className="sm:col-span-7 flex items-center gap-2">
                  <input
                    type="text"
                    maxLength={6}
                    value={joinCode}
                    onChange={(e) => {
                      const next = e.target.value.toUpperCase();
                      setJoinCode(next);
                      onCheckJoinRoomColors(next);
                    }}
                    placeholder="รหัสห้อง 6 หลัก"
                    aria-label="รหัสห้อง 6 หลัก"
                    className="flex-1 min-w-0 rounded-xl border border-white/15 bg-[#2F3239] px-3 py-2.5 text-sm font-mono-num uppercase tracking-wider text-white placeholder-slate-500 focus:border-[#4AA3DF] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (validateName()) onJoinOnlineRoom(joinCode.trim().toUpperCase());
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-white/15 bg-[#2F3239] hover:bg-white/10 text-white font-semibold text-sm transition-colors whitespace-nowrap shrink-0"
                  >
                    <LogIn className="h-4 w-4" />
                    <span>เข้าร่วมห้อง</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Solo Setup Modal */}
      <AnimatePresence>
        {showSoloSetup && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="solo-setup-title"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.16 }}
              className="w-full max-w-md rounded-2xl border border-white/15 bg-[#2F3239] p-6 space-y-5 shadow-2xl"
            >
              <div>
                <h2 id="solo-setup-title" className="text-lg font-bold text-white">
                  ตั้งค่าการแข่งขันกับบอท AI
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  เลือกจำนวนคู่แข่ง ระดับความฉลาด และจำนวนรอบการแข่งขัน
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <span className="block text-xs font-semibold text-slate-300 mb-2">
                    จำนวนบอท AI
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    {([1, 2, 3] as const).map((cnt) => (
                      <button
                        key={cnt}
                        type="button"
                        onClick={() => setBotCount(cnt)}
                        className={`py-2.5 rounded-xl border text-sm font-bold transition-colors ${
                          botCount === cnt
                            ? 'border-[#8CC63F] bg-[#8CC63F]/15 text-[#8CC63F]'
                            : 'border-white/10 bg-[#25272C] text-slate-300 hover:border-white/25'
                        }`}
                      >
                        {cnt} ตัว ({cnt + 1} คน)
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="block text-xs font-semibold text-slate-300 mb-2">
                    ระดับความเก่งของบอท
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setBotDifficulty('rookie')}
                      className={`p-3 rounded-xl border text-left transition-colors ${
                        botDifficulty === 'rookie'
                          ? 'border-[#4AA3DF] bg-[#4AA3DF]/15 text-white'
                          : 'border-white/10 bg-[#25272C] text-slate-300'
                      }`}
                    >
                      <p className="text-sm font-bold">บอทมือใหม่</p>
                      <p className="text-[11px] text-slate-400">ตอบถูกประมาณ 50%</p>
                    </button>
                    <button
                      type="button"
                      onClick={() => setBotDifficulty('professor')}
                      className={`p-3 rounded-xl border text-left transition-colors ${
                        botDifficulty === 'professor'
                          ? 'border-[#4AA3DF] bg-[#4AA3DF]/15 text-white'
                          : 'border-white/10 bg-[#25272C] text-slate-300'
                      }`}
                    >
                      <p className="text-sm font-bold">บอทศาสตราจารย์</p>
                      <p className="text-[11px] text-slate-400">ตอบถูกประมาณ 85%</p>
                    </button>
                  </div>
                </div>

                <div>
                  <span className="block text-xs font-semibold text-slate-300 mb-2">
                    จำนวนรอบสูงสุด
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    {([10, 15, 20] as const).map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setMaxRounds(r)}
                        className={`py-2 rounded-xl border text-sm font-mono-num font-bold transition-colors ${
                          maxRounds === r
                            ? 'border-[#F39C12] bg-[#F39C12]/15 text-[#F39C12]'
                            : 'border-white/10 bg-[#25272C] text-slate-300'
                        }`}
                      >
                        {r} รอบ
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowSoloSetup(false)}
                  className="px-4 py-2.5 rounded-xl border border-white/15 text-slate-300 hover:bg-white/10 text-sm font-semibold whitespace-nowrap"
                >
                  ยกเลิก
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowSoloSetup(false);
                    onStartSolo(botCount, botDifficulty, maxRounds);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-[#8CC63F] hover:bg-[#7BB434] text-slate-950 font-extrabold text-sm transition-colors whitespace-nowrap"
                >
                  เริ่มเกมทันที
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
