import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileSpreadsheet, 
  Settings, 
  Trash2, 
  CloudLightning, 
  RefreshCw, 
  CheckCircle2, 
  XCircle, 
  User, 
  Lock, 
  ExternalLink, 
  Copy, 
  Check, 
  Terminal, 
  ShieldAlert 
} from 'lucide-react';
import { Registration } from '../types';
import GasGuide from './GasGuide';

interface AdminDashboardProps {
  registrations: Registration[];
  gasUrl: string;
  onSaveGasUrl: (url: string) => void;
  spreadsheetUrl: string;
  onSaveSpreadsheetUrl: (url: string) => void;
  onDeleteRegistration: (id: string) => void;
  onSyncAllToGas: () => Promise<{ success: number; failed: number }>;
  onUpdateStatus: (id: string, status: Registration['status']) => void;
  onLock: () => void;
}

export default function AdminDashboard({
  registrations,
  gasUrl,
  onSaveGasUrl,
  spreadsheetUrl,
  onSaveSpreadsheetUrl,
  onDeleteRegistration,
  onSyncAllToGas,
  onUpdateStatus,
  onLock,
}: AdminDashboardProps) {
  const [activeSubTab, setActiveSubTab] = useState<'list' | 'guide'>('list');
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<{ show: boolean; success: number; failed: number } | null>(null);

  const handleBatchSync = async () => {
    setSyncing(true);
    setSyncResult(null);
    try {
      const result = await onSyncAllToGas();
      setSyncResult({ show: true, ...result });
      setTimeout(() => {
        setSyncResult(prev => prev ? { ...prev, show: false } : null);
      }, 4000);
    } catch (err) {
      console.error(err);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="w-full space-y-6" id="admin-dashboard-root">
      {/* Admin Dashboard Header */}
      <div className="glass-panel p-6 rounded-3xl shadow-[0_8px_32px_0_rgba(31,38,135,0.02)] border border-white/60 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 backdrop-blur-[20px]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-650 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-600/10">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
              연수 통합 관리자 콘솔
            </h2>
            <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider font-mono">
              Secure Administrative Space
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          {/* Sub Navigation */}
          <div className="flex bg-slate-100 p-1 rounded-xl w-full md:w-auto">
            <button
              onClick={() => setActiveSubTab('list')}
              className={`flex-1 md:flex-initial px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeSubTab === 'list'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              신청자 명단
            </button>
            <button
              onClick={() => setActiveSubTab('guide')}
              className={`flex-1 md:flex-initial px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeSubTab === 'guide'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              구글 API 설정
            </button>
          </div>

          <button
            onClick={onLock}
            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 shadow-sm"
          >
            🔒 로그아웃
          </button>
        </div>
      </div>

      {/* Main Panel Content */}
      <AnimatePresence mode="wait">
        {activeSubTab === 'list' ? (
          <motion.div
            key="list-panel"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* Quick Stats Panel */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="glass-panel p-5 rounded-2xl border border-white/60 shadow-[0_4px_12px_rgba(0,0,0,0.01)] backdrop-blur-[10px]">
                <span className="text-[10px] uppercase font-extrabold tracking-widest text-slate-400 block mb-1">총 신청자 수</span>
                <span className="text-3xl font-black text-indigo-650 font-mono">{registrations.length}명</span>
              </div>
              <div className="glass-panel p-5 rounded-2xl border border-white/60 shadow-[0_4px_12px_rgba(0,0,0,0.01)] backdrop-blur-[10px]">
                <span className="text-[10px] uppercase font-extrabold tracking-widest text-slate-400 block mb-1">구글 동기화 상태</span>
                <span className="text-3xl font-black text-emerald-600 font-mono">
                  {registrations.filter(r => r.syncStatus === 'synced').length}명
                </span>
              </div>
              <div className="glass-panel p-5 rounded-2xl border border-white/60 shadow-[0_4px_12px_rgba(0,0,0,0.01)] backdrop-blur-[10px] flex flex-col justify-between">
                <div>
                  <span className="text-[10px] uppercase font-extrabold tracking-widest text-slate-400 block mb-1">미동기 데이터</span>
                  <span className="text-xl font-bold text-rose-500 font-mono">
                    {registrations.filter(r => r.syncStatus === 'local' || r.syncStatus === 'failed').length}건
                  </span>
                </div>
                {registrations.some(r => r.syncStatus === 'local' || r.syncStatus === 'failed') && (
                  <button
                    onClick={handleBatchSync}
                    disabled={syncing}
                    className="mt-3 w-full py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[10.5px] font-extrabold rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
                  >
                    {syncing ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <CloudLightning className="w-3.5 h-3.5" />
                    )}
                    <span>모두 구글에 동기화하기</span>
                  </button>
                )}
              </div>
            </div>

            {/* Sync feedback notification */}
            <AnimatePresence>
              {syncResult?.show && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 text-xs font-bold rounded-2xl flex items-center justify-between"
                >
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    성공적으로 {syncResult.success}건 스마트 스프레드시트에 연동(POST) 전송하였습니다. (실패: {syncResult.failed}건)
                  </span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Registrations List table block */}
            <div className="glass-panel overflow-hidden rounded-3xl border border-white/60 shadow-[0_15px_40px_rgba(0,0,0,0.02)] backdrop-blur-[20px]">
              <div className="p-5 border-b border-slate-100 bg-white/30 flex justify-between items-center">
                <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-widest pl-0.5">
                  실시간 연수 등록자 대장
                </h3>
                <span className="text-[10px] text-slate-400 font-mono font-bold">최신 정렬 기준</span>
              </div>

              {registrations.length === 0 ? (
                <div className="py-16 text-center text-slate-400 text-xs font-semibold">
                  아직 접수된 연수 신청 데이터가 없습니다.
                </div>
              ) : (
                <>
                  {/* Desktop Table - Hidden on tiny screens but displays gracefully on larger ones */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left font-sans text-xs">
                      <thead>
                        <tr className="bg-slate-900/[0.02] border-b border-slate-100 text-slate-500 uppercase tracking-wider text-[10px] font-black">
                          <th className="py-4 px-6">접수 시각</th>
                          <th className="py-4 px-6">신청 교사</th>
                          <th className="py-4 px-6">나이스 고유번호</th>
                          <th className="py-4 px-6">신청 코스</th>
                          <th className="py-4 px-6 text-center">연동 상태</th>
                          <th className="py-4 px-6 text-right">관리</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100/55">
                        {registrations.map((reg) => (
                          <tr key={reg.id} className="hover:bg-white/40 transition-colors">
                            <td className="py-4 px-6 text-slate-400 font-mono font-bold">
                              {new Date(reg.createdAt).toLocaleString('ko-KR', {
                                month: '2-digit',
                                day: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </td>
                            <td className="py-4 px-6 font-black text-slate-800 text-[13px]">{reg.name} 선생님</td>
                            <td className="py-4 px-6 font-mono font-bold text-slate-600 tracking-wide uppercase">
                              {reg.neis}
                            </td>
                            <td className="py-4 px-6 font-medium text-slate-500 truncate max-w-[200px]" title={reg.course}>
                              {reg.course}
                            </td>
                            <td className="py-4 px-6 text-center">
                              {reg.syncStatus === 'synced' ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-extrabold rounded-full border border-emerald-100">
                                  ✓ 구글 연동 완료
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-700 text-[10px] font-extrabold rounded-full border border-amber-100 animate-pulse">
                                  ⚠ 미동기 (PC보관)
                                </span>
                              )}
                            </td>
                            <td className="py-4 px-6 text-right">
                              <button
                                onClick={() => onDeleteRegistration(reg.id)}
                                className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 hover:text-rose-700 rounded-lg transition-all cursor-pointer"
                                title="신청자 삭제"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Responsive Clean Cards - Displays elegantly on mobile screens */}
                  <div className="block md:hidden divide-y divide-slate-100/55 p-3 space-y-3">
                    {registrations.map((reg) => (
                      <div key={reg.id} className="p-4 bg-white/40 rounded-2xl space-y-3 shadow-sm border border-white/50">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-[10px] text-slate-400 font-mono font-bold block mb-0.5">
                              {new Date(reg.createdAt).toLocaleString('ko-KR')}
                            </span>
                            <h4 className="text-sm font-black text-slate-800">{reg.name} 선생님</h4>
                          </div>
                          
                          <button
                            onClick={() => onDeleteRegistration(reg.id)}
                            className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition-all cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs border-t border-slate-100/50 pt-2.5">
                          <div>
                            <span className="text-[9.5px] text-slate-400 font-extrabold uppercase leading-none block mb-1">나이스번호</span>
                            <span className="font-mono font-black text-slate-700 uppercase tracking-wider">{reg.neis}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-[9.5px] text-slate-400 font-extrabold uppercase leading-none block mb-1">연동 상태</span>
                            <span>
                              {reg.syncStatus === 'synced' ? (
                                <span className="inline-block px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[9.5px] font-extrabold rounded-full border border-emerald-100">
                                  ✓ 구글 연 완료
                                </span>
                              ) : (
                                <span className="inline-block px-2 py-0.5 bg-amber-50 text-amber-700 text-[9.5px] font-extrabold rounded-full border border-amber-100">
                                  ⚠ 미송출
                                </span>
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="guide-panel"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <GasGuide 
              gasUrl={gasUrl} 
              onSaveGasUrl={onSaveGasUrl} 
              spreadsheetUrl={spreadsheetUrl}
              onSaveSpreadsheetUrl={onSaveSpreadsheetUrl}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
