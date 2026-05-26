import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, KeyRound, CheckCircle2, ChevronRight, Loader2, AlertCircle, Calendar, Clock, MapPin, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Registration, TARGET_COURSE } from '../types';

interface RegistrationFormProps {
  gasUrl: string;
  onRegisterSubmit: (data: Omit<Registration, 'id' | 'createdAt' | 'status' | 'syncStatus'>) => Promise<boolean>;
  registrationCount: number;
}

export default function RegistrationForm({ gasUrl, onRegisterSubmit, registrationCount }: RegistrationFormProps) {
  const [name, setName] = useState('');
  const [neis, setNeis] = useState('');
  
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [submittedName, setSubmittedName] = useState('');
  const [error, setError] = useState('');

  const formatNeis = (val: string) => {
    let formatted = val.trim();
    if (formatted.length > 0) {
      formatted = formatted.charAt(0).toUpperCase() + formatted.slice(1);
    }
    setNeis(formatted);
  };

  const validateForm = () => {
    if (!name.trim()) {
      setError('신청자 성명을 입력해 주세요.');
      return false;
    }
    if (name.trim().length < 2) {
      setError('성명은 최소 2글자 이상 입력해 주세요.');
      return false;
    }
    if (!neis.trim()) {
      setError('나이스 개인번호를 입력해 주세요.');
      return false;
    }
    const cleanNeis = neis.trim();
    if (cleanNeis.length < 5) {
      setError('올바른 나이스 고유번호를 입력해 주세요.');
      return false;
    }
    setError('');
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    setError('');
    try {
      const ok = await onRegisterSubmit({
        name: name.trim(),
        neis: neis.trim(),
        course: TARGET_COURSE.title,
      });
      
      setSubmittedName(name.trim());
      setSuccess(true);
      
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 }
      });
      
      setName('');
      setNeis('');
    } catch (err) {
      setError('서버 또는 로컬 신청 중 에러가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto space-y-6" id="registration-form-container">
      <motion.div
        key="form-container"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="glass-panel p-6 sm:p-8 rounded-3xl shadow-[0_15px_40px_rgba(0,0,0,0.02)] relative overflow-hidden backdrop-blur-[20px]"
      >
        {/* Subtle light reflect line */}
        <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/80 to-transparent" />

        {/* Training Cover Image */}
        <div className="w-full h-40 sm:h-48 mb-6 rounded-2xl overflow-hidden relative shadow-inner ring-1 ring-slate-900/5">
          <img 
            src="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&q=80&w=1200" 
            alt="연수 과정 안내" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          {/* Floating Registration Count */}
          <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10">
            <div className="flex items-center gap-1.5 text-[10.5px] sm:text-[11px] font-black text-indigo-900 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-full shadow-lg border border-white/40">
              <User className="w-3.5 h-3.5 text-indigo-600" />
              현재 {registrationCount}명 신청 중
            </div>
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 via-slate-900/10 to-transparent flex items-end p-5 pointer-events-none">
            <span className="text-white font-black text-sm sm:text-base tracking-wide drop-shadow-md">
              에듀테크 수업 디자인 연수 과정
            </span>
          </div>
        </div>

        <div className="mb-7">
          <div className="bg-white/50 border border-white/80 rounded-2xl py-6 px-4 flex flex-col items-center justify-center text-center shadow-[0_4px_20px_rgba(31,38,135,0.03)] font-sans">
            <h3 className="text-xl sm:text-2xl lg:text-3xl font-black bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-500 bg-clip-text text-transparent leading-snug whitespace-pre-wrap">
              {TARGET_COURSE.title}
            </h3>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6" id="training-registration-form">
          {/* Teacher Name Input */}
          <div className="space-y-2">
            <label htmlFor="teacher-name" className="text-sm sm:text-base font-black text-slate-800 flex items-center gap-2 pl-0.5">
              <User className="w-4 h-4 text-slate-600" />
              <span>이름 <span className="text-rose-500">*</span></span>
            </label>
            <div className="relative">
              <input
                type="text"
                id="teacher-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="신청 교사 성명을 입력해 주세요"
                className="w-full px-5 py-4 bg-white/40 border border-slate-200/80 focus:border-slate-900 focus:bg-white focus:ring-4 focus:ring-slate-100 transition-all rounded-xl text-base sm:text-lg placeholder:text-sm sm:placeholder:text-base font-extrabold outline-none text-slate-800"
                required
              />
            </div>
          </div>

          {/* NEIS Personal Code Input */}
          <div className="space-y-2">
            <div className="flex justify-between items-center pl-0.5">
              <label htmlFor="neis-code" className="text-sm sm:text-base font-black text-slate-800 flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-slate-600" />
                <span>나이스 고유번호 <span className="text-rose-500">*</span></span>
              </label>
              <span className="text-[10px] sm:text-[11px] font-black text-slate-400 font-mono">예: S101001234 (대문자+9자리)</span>
            </div>
            <div className="relative">
              <input
                type="text"
                id="neis-code"
                value={neis}
                onChange={(e) => formatNeis(e.target.value)}
                placeholder="나이스 번호 10자리를 정확히 입력해 주세요"
                className="w-full px-5 py-4 bg-white/40 border border-slate-200/80 focus:border-slate-900 focus:bg-white focus:ring-4 focus:ring-slate-100 transition-all rounded-xl text-base sm:text-lg uppercase placeholder:text-sm sm:placeholder:text-base font-extrabold outline-none text-slate-800 font-mono tracking-wide"
                maxLength={15}
                required
              />
            </div>
          </div>

          <div className="bg-rose-50/50 border border-rose-200/60 rounded-xl p-3 flex gap-2.5 items-start mt-2">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            <p className="text-[11.5px] text-rose-700 font-bold leading-relaxed tracking-tight">
              나이스 고유번호가 틀릴 경우 연수 등록 처리가 어렵습니다.<br/>
              제출 전, 오타가 없는지 한 번 더 확인해 주시기 바랍니다.
            </p>
          </div>

          {/* Quick error state block */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 bg-rose-50/70 border border-rose-100 text-rose-700 text-xs font-bold rounded-xl flex items-center gap-2"
            >
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}

          {/* Form submit button */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white hover:bg-blue-600 disabled:bg-slate-300 text-lg font-extrabold py-3.5 px-4 rounded-xl shadow-md hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-150 active:scale-[0.99] cursor-pointer"
            id="submit-registration-btn"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white/50" />
                <span>신청서 전송 중...</span>
              </>
            ) : (
              <>
                <span>연수 신청 완료하기</span>
                <ChevronRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Detailed Training Plan Section inside form glass */}
        <div className="mt-8 pt-6 border-t border-slate-200/50 text-slate-600">
          {TARGET_COURSE.schedule && (
            <div className="space-y-4">
              <h5 className="text-sm font-extrabold text-slate-800 uppercase tracking-widest pl-0.5">연수 세부 일정</h5>
              <div className="border border-slate-200/60 rounded-xl overflow-hidden bg-white/40 shadow-sm text-sm">
                {TARGET_COURSE.schedule.map((item, idx) => (
                  <div key={idx} className={`p-4 sm:p-5 flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-5 ${idx !== TARGET_COURSE.schedule!.length - 1 ? 'border-b border-slate-200/50' : ''}`}>
                    <div className="sm:w-32 shrink-0 flex flex-col items-start gap-1.5">
                      <span className="inline-block px-3 py-1 bg-indigo-50/80 text-indigo-700 text-[13px] font-extrabold rounded-lg whitespace-nowrap border border-indigo-100">{item.date}</span>
                      <span className="text-[13px] font-bold text-slate-500 tracking-tight pl-1.5">14:00~16:40</span>
                    </div>
                    <div className="sm:w-44 shrink-0 text-slate-800 font-bold leading-relaxed whitespace-pre-wrap pt-0.5">
                      {item.topic}
                    </div>
                    <div className="flex-1 text-slate-600 font-medium leading-relaxed whitespace-pre-wrap pt-0.5">
                      {item.activity}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Success Modal Overlay */}
      <AnimatePresence>
        {success && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', duration: 0.5 }}
              className="bg-white/95 border border-white/60 shadow-2xl rounded-3xl p-6 sm:p-8 max-w-md w-full relative overflow-hidden text-center"
            >
              {/* Top gradient bar */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-400 via-teal-500 to-blue-500" />
              
              <div className="mx-auto w-16 h-16 bg-emerald-500/10 text-emerald-600 rounded-2xl flex items-center justify-center mb-5 mt-2 border border-emerald-500/20 shadow-inner">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mb-2 leading-snug">
                {submittedName} 선생님, <br/>
                신청해주셔서 감사합니다! 🎉
              </h3>
              
              <div className="bg-slate-900/5 hover:bg-slate-900/10 transition-colors p-4 rounded-2xl text-left border border-white/50 space-y-1 my-4">
                <span className="text-[10px] text-indigo-600 font-extrabold uppercase tracking-wider block">신청 완료 과목</span>
                <p className="text-xs font-bold text-slate-800 leading-relaxed font-sans whitespace-pre-wrap">{TARGET_COURSE.title}</p>
              </div>

              <p className="text-slate-500 text-xs leading-relaxed max-w-sm mx-auto mb-6">
                선생님의 나이스(NEIS) 개인정보 가상 대장에 등록 완료되었습니다. <br />
                {gasUrl ? (
                  <span className="font-extrabold text-emerald-600 mt-2 block bg-emerald-50/50 py-1.5 px-3 rounded-lg border border-emerald-100">
                    ✓ 구글 스프레드시트 연동 데이터 전송 완료
                  </span>
                ) : (
                  <span className="text-slate-450 mt-1 block">브라우저 안전 메모리에 수강 대기 정보가 보관되었습니다.</span>
                )}
              </p>
              
              <button
                onClick={() => setSuccess(false)}
                className="w-full py-3.5 px-6 font-extrabold text-sm text-white bg-blue-600 hover:bg-blue-700 active:scale-[0.99] transition-all rounded-xl cursor-pointer shadow-md shadow-blue-600/15"
                id="close-success-modal-btn"
              >
                확인
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
