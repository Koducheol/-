import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { GraduationCap, Lock, Settings, Sparkles, RefreshCw, Unlock, ShieldCheck } from 'lucide-react';
import { Registration } from './types';
import RegistrationForm from './components/RegistrationForm';
import AdminDashboard from './components/AdminDashboard';

export default function App() {
  const [activeTab, setActiveTab] = useState<'submit' | 'gas'>('submit');
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [gasUrl, setGasUrl] = useState<string>('https://script.google.com/macros/s/AKfycbye-2HG2MGCU7jgH_M1g7GIQC86AVlZhjm7dcXCM5ens5FsF-qeSS60tSBfGCvqFeDWQg/exec');
  const [initializing, setInitializing] = useState(true);

  // Admin access protection states
  const [adminUnlocked, setAdminUnlocked] = useState(false);
  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const [passcodeInput, setPasscodeInput] = useState('');
  const [passcodeError, setPasscodeError] = useState('');

  // Load initial data from localStorage
  useEffect(() => {
    try {
      const storedRegs = localStorage.getItem('training_registrations');
      if (storedRegs) {
        setRegistrations(JSON.parse(storedRegs));
      }

      const storedGasUrl = localStorage.getItem('training_gas_url');
      if (storedGasUrl) {
        setGasUrl(storedGasUrl);
      } else {
        localStorage.setItem('training_gas_url', 'https://script.google.com/macros/s/AKfycbye-2HG2MGCU7jgH_M1g7GIQC86AVlZhjm7dcXCM5ens5FsF-qeSS60tSBfGCvqFeDWQg/exec');
      }
    } catch (e) {
      console.error('로컬 데이터 복원 과정 실패:', e);
    } finally {
      setInitializing(false);
    }
  }, []);

  // Save registrations to localStorage on update
  const saveRegistrations = (updated: Registration[]) => {
    setRegistrations(updated);
    localStorage.setItem('training_registrations', JSON.stringify(updated));
  };

  // Handle saving GAS URL
  const handleSaveGasUrl = (url: string) => {
    setGasUrl(url);
    localStorage.setItem('training_gas_url', url);
  };

  // Helper: POST registration to Google Apps Script Web App
  const postToGas = async (url: string, data: Omit<Registration, 'syncStatus'>): Promise<boolean> => {
    try {
      const payload = {
        id: data.id,
        name: data.name,
        neis: data.neis,
        course: data.course,
        timestamp: data.createdAt,
      };

      // CORS Preflight bypass
      await fetch(url, {
        method: 'POST',
        mode: 'no-cors',
        cache: 'no-cache',
        headers: {
          'Content-Type': 'text/plain',
        },
        body: JSON.stringify(payload),
      });

      return true;
    } catch (err) {
      console.error('스프레드시트 원격 업로드 장애:', err);
      return false;
    }
  };

  // Submit new registration
  const handleRegisterSubmit = async (
    formData: Omit<Registration, 'id' | 'createdAt' | 'status' | 'syncStatus'>
  ): Promise<boolean> => {
    const newId = `reg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newReg: Registration = {
      ...formData,
      id: newId,
      createdAt: new Date().toISOString(),
      status: 'pending',
      syncStatus: 'local',
    };

    let isSynced = false;
    if (gasUrl) {
      isSynced = await postToGas(gasUrl, newReg);
      newReg.syncStatus = isSynced ? 'synced' : 'failed';
    }

    const updated = [newReg, ...registrations];
    saveRegistrations(updated);
    return isSynced;
  };

  // Update applicant status
  const handleUpdateStatus = (id: string, status: Registration['status']) => {
    const updated = registrations.map((r) => {
      if (r.id === id) {
        return { ...r, status };
      }
      return r;
    });
    saveRegistrations(updated);
  };

  // Delete applicant record
  const handleDeleteRegistration = (id: string) => {
    if (window.confirm('해당 교사의 연수 신청 데이터를 명단에서 영구히 삭제하시겠습니까?')) {
      const updated = registrations.filter((r) => r.id !== id);
      saveRegistrations(updated);
    }
  };

  // Batch sync local registrations
  const handleSyncAllToGas = async (): Promise<{ success: number; failed: number }> => {
    if (!gasUrl) return { success: 0, failed: 0 };

    let successCount = 0;
    let failedCount = 0;

    const updated = await Promise.all(
      registrations.map(async (r) => {
        if (r.syncStatus === 'local' || r.syncStatus === 'failed') {
          const ok = await postToGas(gasUrl, r);
          if (ok) {
            successCount++;
            return { ...r, syncStatus: 'synced' as const };
          } else {
            failedCount++;
            return { ...r, syncStatus: 'failed' as const };
          }
        }
        return r;
      })
    );

    saveRegistrations(updated);
    return { success: successCount, failed: failedCount };
  };

  // Admin access validation
  const handleAdminVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcodeInput.trim() === 'dego3166') {
      setAdminUnlocked(true);
      setAdminModalOpen(false);
      setActiveTab('gas');
      setPasscodeInput('');
      setPasscodeError('');
    } else {
      setPasscodeError('비밀번호가 올바르지 않습니다. 다시 입력해 주세요.');
    }
  };

  const handleAdminLock = () => {
    setAdminUnlocked(false);
    setActiveTab('submit');
  };

  if (initializing) {
    return (
      <div className="min-h-screen bg-[#F5F7FB] flex flex-col items-center justify-center p-4 font-sans">
        <RefreshCw className="w-6 h-6 text-indigo-600 animate-spin" />
        <p className="text-xs text-slate-450 mt-4 font-semibold tracking-wide">시스템 모듈 분석 중...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F6F8FC] text-slate-800 font-sans antialiased selection:bg-indigo-150 relative overflow-x-hidden" id="application-layout">
      
      {/* Decorative colorful glowing blobs that float to bring Glassmorphism to life! */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[8%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-indigo-300/15 blur-[120px] animate-blob-1" />
        <div className="absolute bottom-[10%] right-[-10%] w-[55vw] h-[55vw] rounded-full bg-emerald-300/15 blur-[130px] animate-blob-2" />
        <div className="absolute top-[40%] left-[25%] w-[40vw] h-[40vw] rounded-full bg-amber-200/10 blur-[100px] animate-blob-3" />
      </div>

      {/* Main Content Space on top of background */}
      <main className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-10 relative z-10" id="main-content">
        <div className="space-y-6">
          {/* Form Tab */}
          {activeTab === 'submit' && (
            <div className="space-y-6">
              <RegistrationForm 
                gasUrl={gasUrl} 
                onRegisterSubmit={handleRegisterSubmit} 
                registrationCount={registrations.length} 
              />
            </div>
          )}

          {/* Secure Admin Console Tab */}
          {activeTab === 'gas' && adminUnlocked && (
            <AdminDashboard
              registrations={registrations}
              gasUrl={gasUrl}
              onSaveGasUrl={handleSaveGasUrl}
              onDeleteRegistration={handleDeleteRegistration}
              onSyncAllToGas={handleSyncAllToGas}
              onUpdateStatus={handleUpdateStatus}
              onLock={handleAdminLock}
            />
          )}
        </div>
      </main>

      {/* Admin Passcode Modal Dialog */}
      {adminModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white/95 border border-white/60 shadow-2xl rounded-3xl p-6 sm:p-8 max-w-sm w-full relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-500 to-purple-600" />
            
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-indigo-50 text-indigo-650 rounded-xl flex items-center justify-center">
                  <Lock className="w-4 h-4" />
                </div>
                <span className="text-sm font-black text-slate-800">관리 공간 인증</span>
              </div>
              <button 
                onClick={() => {
                  setAdminModalOpen(false);
                  setPasscodeInput('');
                  setPasscodeError('');
                }}
                className="text-slate-400 hover:text-slate-600 font-bold text-xs"
              >
                닫기
              </button>
            </div>

            <p className="text-[11.5px] font-bold text-slate-500 leading-relaxed mb-5">
              스프레드시트 연동 설정 및 신청자 명단 조회는 관리자 교사 전용 영역입니다. 비인가 사용자의 접근을 차단합니다.<br />
              <span className="text-indigo-650 font-extrabold mt-2 block bg-indigo-50/50 py-1.5 px-3 rounded-lg border border-indigo-100/60">💡 비밀번호 힌트: dego0000</span>
            </p>

            <form onSubmit={handleAdminVerify} className="space-y-4">
              <div className="space-y-1.5">
                <input
                  type="password"
                  value={passcodeInput}
                  onChange={(e) => setPasscodeInput(e.target.value)}
                  placeholder="관리 암호 입력"
                  className="w-full px-4 py-3 bg-slate-100 border border-slate-200/60 rounded-xl text-center text-sm font-bold tracking-widest focus:ring-4 focus:ring-indigo-100 focus:bg-white outline-none transition-all text-slate-800"
                  autoFocus
                />
                {passcodeError && (
                  <p className="text-[11px] text-rose-600 font-bold pl-1">{passcodeError}</p>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setAdminModalOpen(false);
                    setPasscodeInput('');
                    setPasscodeError('');
                  }}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-650 text-xs font-extrabold rounded-xl transition-all cursor-pointer"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-indigo-650 hover:bg-indigo-700 text-white text-xs font-extrabold rounded-xl shadow-md transition-all cursor-pointer"
                >
                  확인
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Premium minimal Footer block */}
      <footer className="w-full py-16 border-t border-slate-200/50 bg-white/20 text-center text-[10px] text-slate-400 font-extrabold tracking-widest relative z-10" id="footer-container">
        <p className="uppercase font-mono">Smart Educator Training Center • Technology Integration</p>
        <p className="mt-2 text-slate-400 font-semibold tracking-normal normal-case">
          본 신청기는 로컬 클라이언트 DB 보관과 구글 Apps Script Web App 실시간 트래킹 파이프라인을 연계 지원합니다.
        </p>

        {/* Dynamic Secure Admin Portal Switch in Footer */}
        <div className="mt-6 flex justify-center">
          {adminUnlocked ? (
            <button 
              onClick={handleAdminLock}
              className="px-4 py-2 border border-emerald-200 bg-emerald-50 text-emerald-800 text-[10.5px] font-black rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>관리 콘솔 로그인 상태 (안전 잠금하기)</span>
            </button>
          ) : (
            <button 
              onClick={() => setAdminModalOpen(true)}
              className="px-4 py-2 border border-slate-200/60 hover:border-slate-300 text-[10.5px] font-extrabold rounded-xl transition-all cursor-pointer bg-white/70 hover:bg-white text-slate-500 hover:text-indigo-650 flex items-center gap-1.5 shadow-sm"
            >
              <Lock className="w-3.5 h-3.5 text-slate-400" />
              <span>교직원 연수 관리자 공간 (설정/대장)</span>
            </button>
          )}

          {adminUnlocked && activeTab === 'submit' && (
            <button 
              onClick={() => setActiveTab('gas')}
              className="ml-2 px-4 py-2 border border-indigo-200 bg-indigo-50 text-indigo-800 text-[10.5px] font-black rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
            >
              <Settings className="w-3.5 h-3.5 text-indigo-600" />
              <span>관리 콘솔 바로가기</span>
            </button>
          )}

          {adminUnlocked && activeTab === 'gas' && (
            <button 
              onClick={() => setActiveTab('submit')}
              className="ml-2 px-4 py-2 border border-slate-200/60 bg-white/70 hover:bg-white text-slate-700 text-[10.5px] font-black rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
            >
              <GraduationCap className="w-3.5 h-3.5 text-indigo-600" />
              <span>연수 신청 화면 바로가기</span>
            </button>
          )}
        </div>
      </footer>
    </div>
  );
}
