import React from 'react';
import { X, BookOpen, Crown, TrendingUp, HelpCircle, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface RulesModalProps {
  open: boolean;
  onClose: () => void;
}

export const RulesModal: React.FC<RulesModalProps> = ({ open, onClose }) => {
  return (
    <AnimatePresence>
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="rules-modal-title"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.18 }}
            className="w-full max-w-2xl max-h-[88vh] flex flex-col rounded-2xl border border-slate-700 bg-slate-900 text-slate-100 shadow-2xl overflow-hidden"
          >
            <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
              <div className="flex items-center gap-3">
                <BookOpen className="h-5 w-5 text-amber-400" />
                <h2 id="rules-modal-title" className="text-lg font-bold text-white">
                  กติกาการเล่น Data Tycoon: สถิติพิชิตเศรษฐี
                </h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="ปิดหน้าต่างกติกา"
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="overflow-y-auto custom-scrollbar p-6 space-y-6 text-sm leading-relaxed text-slate-300">
              <section className="space-y-2">
                <h3 className="text-base font-semibold text-white">
                  1. เป้าหมายและเงินเริ่มต้น
                </h3>
                <p>
                  ผู้เล่นทุกคนเริ่มต้นที่ช่อง <strong>จุดเริ่มต้น</strong> พร้อมทุนวิจัย{' '}
                  <span className="font-mono-num text-emerald-400 font-semibold">20,000 บาท</span>{' '}
                  เมื่อเดินผ่านหรือตกที่จุดเริ่มต้นจะได้รับทุนวิจัยเพิ่ม{' '}
                  <span className="font-mono-num text-emerald-400 font-semibold">+3,000 บาท</span>{' '}
                  ผู้ที่เหลือรอดเป็นคนสุดท้าย หรือมีมูลค่าทรัพย์สินสุทธิ (เงินสด + มูลค่าที่ดินและสิ่งปลูกสร้าง) สูงสุดเมื่อครบจำนวนรอบที่กำหนดจะเป็นผู้ชนะ
                </p>
              </section>

              <section className="space-y-2 border-t border-slate-800 pt-4">
                <div className="flex items-center gap-2">
                  <Crown className="h-4 w-4 text-amber-400" />
                  <h3 className="text-base font-semibold text-white">
                    2. ตารางความถี่และโบนัสฐานนิยม (Mode Bonus)
                  </h3>
                </div>
                <p>
                  ทุกครั้งที่มีการทอยลูกเต๋า ระบบจะบันทึกความถี่ (f) และความถี่สัมพัทธ์ (%) ลงในตารางกลางกระดานแบบเรียลไทม์{' '}
                  <strong>ตั้งแต่รอบที่ 3 เป็นต้นไป</strong> แต้มที่ออกบ่อยที่สุดจะได้รับมงกุฎ{' '}
                  <strong>ฐานนิยม (Mode)</strong> หากผู้เล่นทอยได้แต้มตรงกับฐานนิยมปัจจุบัน จะได้รับโบนัสทันที{' '}
                  <span className="font-mono-num text-amber-300 font-semibold">+2,000 บาท</span>!
                </p>
              </section>

              <section className="space-y-2 border-t border-slate-800 pt-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-sky-400" />
                  <h3 className="text-base font-semibold text-white">
                    3. การลงทุน อัปเกรด และเทคโอเวอร์
                  </h3>
                </div>
                <ul className="list-disc pl-5 space-y-1.5">
                  <li>
                    <strong>ชุดสีผูกขาด (Group Monopoly):</strong> หากครอบครองพื้นที่ครบทั้ง 2 ช่องในกลุ่มสีเดียวกัน ค่าเช่าพื้นฐานจะเพิ่มขึ้นทันที{' '}
                    <span className="font-mono-num text-sky-300 font-semibold">+500 บาท</span>
                  </li>
                  <li>
                    <strong>การอัปเกรด (Level 1 และ Level 2):</strong> เมื่อตกพื้นที่ของตนเอง สามารถจ่ายเงินเท่ากับราคาซื้อและ{' '}
                    <strong>ทำภารกิจสถิติสั้นๆ</strong> เพื่ออัปเกรดเป็น Level 1 (ค่าเช่า 2 เท่า) หรือ Level 2 (ค่าเช่า 3 เท่า)
                  </li>
                  <li>
                    <strong>การเทคโอเวอร์ (Takeover):</strong> เมื่อตกพื้นที่ของคู่แข่งที่ยังไม่ถึง Level 2 หลังจ่ายค่าเช่าแล้ว สามารถซื้อกิจการต่อได้ในราคา{' '}
                    <strong>2 เท่าของมูลค่ารวม</strong>
                  </li>
                </ul>
              </section>

              <section className="space-y-2 border-t border-slate-800 pt-4">
                <div className="flex items-center gap-2">
                  <HelpCircle className="h-4 w-4 text-emerald-400" />
                  <h3 className="text-base font-semibold text-white">
                    4. การ์ดคำถามและช่องพิเศษ
                  </h3>
                </div>
                <ul className="list-disc pl-5 space-y-1.5">
                  <li>
                    <strong>ช่อง 3 และ 11 (การ์ดคำถาม):</strong> ตอบถูกได้รับ{' '}
                    <span className="font-mono-num text-emerald-400">+1,500 บาท</span>{' '}
                    ตอบผิดเสีย{' '}
                    <span className="font-mono-num text-rose-400">-1,000 บาท</span>{' '}
                    พร้อมคำอธิบายเฉลยท้ายข้อ
                  </li>
                  <li>
                    <strong>ช่อง 5 (ห้องแล็บวิจัย) และ ช่อง 13 (ข้อมูลคลาดเคลื่อน):</strong> หากถูกส่งเข้าห้องแล็บ ต้องจ่าย{' '}
                    <span className="font-mono-num">1,500 บาท</span> หรือทอยลูกเต๋าให้ได้เลขคู่ (2, 4, 6) เพื่อออก (สูงสุด 2 รอบ)
                  </li>
                  <li>
                    <strong>ช่อง 9 (ศูนย์ประชุมวิชาการ):</strong> เลือกจ่าย{' '}
                    <span className="font-mono-num">1,000 บาท</span> เพื่อวาร์ปไปยังช่องใดก็ได้บนกระดาน
                  </li>
                </ul>
              </section>

              <section className="space-y-2 border-t border-slate-800 pt-4">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="h-4 w-4 text-rose-400" />
                  <h3 className="text-base font-semibold text-white">
                    5. การจัดการหนี้สินและการล้มละลาย
                  </h3>
                </div>
                <p>
                  หากเงินสดติดลบ ผู้เล่นสามารถเลือกขายพื้นที่ที่ครอบครองอยู่คืนธนาคารในราคา 50% ของมูลค่ารวมเพื่อพยุงสถานะ หากไม่มีทรัพย์สินเหลือให้ขายและเงินสดยังคงติดลบ จะถือว่าล้มละลายและยุติบทบาท
                </p>
              </section>
            </div>

            <div className="flex justify-end border-t border-slate-800 px-6 py-4 bg-slate-900">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold text-sm transition-colors whitespace-nowrap"
              >
                เข้าใจกติกาแล้ว
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
