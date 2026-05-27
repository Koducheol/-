import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Copy, Check, FileSpreadsheet, ExternalLink, Settings, Terminal, ShieldAlert } from 'lucide-react';

interface GasGuideProps {
  gasUrl: string;
  onSaveGasUrl: (url: string) => void;
}

export default function GasGuide({ gasUrl, onSaveGasUrl }: GasGuideProps) {
  const [urlInput, setUrlInput] = useState(gasUrl);
  const [copied, setCopied] = useState(false);
  const [verified, setVerified] = useState(false);

  // Updated modern Google Apps Script code (removed phone)
  const appsScriptCode = `/**
 * 교사 연수 신청서 구글 스프레드시트 연동용 Apps Script
 * 업데이트: 2026-05-27 (지능적 중복 방지 및 실시간 GET 조회 통합본)
 */

// 1. 실시간 신청자 명단 조회 (GET) - PC, 모바일 기기 간 카운터 동기화 지원
function doGet(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = sheet.getDataRange().getValues();
    var list = [];
    
    // 첫 행(헤더)을 제외하고 데이터 추출
    for (var i = 1; i < data.length; i++) {
      var row = data[i];
      if (!row[1]) continue; // 교사명 필드가 없으면 스킵
      
      var timestampStr = "";
      if (row[0] instanceof Date) {
        timestampStr = row[0].toISOString();
      } else if (row[0]) {
        timestampStr = new Date(row[0]).toISOString();
      } else {
        timestampStr = new Date().toISOString();
      }

      list.push({
        id: "sheet-" + i + "-" + String(row[2]).trim(),
        name: String(row[1]).trim(),
        neis: String(row[2]).trim(),
        course: String(row[3]).trim(),
        createdAt: timestampStr,
        status: "pending",
        syncStatus: "synced"
      });
    }
    
    return ContentService.createTextOutput(JSON.stringify({ 
      status: "success", 
      data: list 
    }))
    .setMimeType(ContentService.MimeType.JSON);
    
  } catch(err) {
    return ContentService.createTextOutput(JSON.stringify({ 
      status: "error", 
      message: err.toString() 
    }))
    .setMimeType(ContentService.MimeType.JSON);
  }
}

// 2. 실시간 연수 신청 기록 (POST) - 교사명 & 나이스 고유번호 이용한 이중 등록 차단 기능 내장
function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = JSON.parse(e.postData.contents);
    
    var timestamp = new Date();
    var name = (data.name || "").toString().trim();
    var neis = (data.neis || "").toString().trim();
    var course = (data.course || "").toString().trim();
    
    if (!name || !neis) {
      throw new Error("필수 입력 값이 누락되었습니다.");
    }

    var values = sheet.getDataRange().getValues();
    var exists = false;
    var rowIdx = -1;
    
    // 이중 등록 방지 (이름과 나이스 고유번호 일치 감지)
    for (var i = 1; i < values.length; i++) {
      var rowName = String(values[i][1]).trim();
      var rowNeis = String(values[i][2]).trim();
      if (rowName === name && rowNeis === neis) {
        exists = true;
        rowIdx = i + 1;
        break;
      }
    }
    
    if (exists) {
      // 이미 신청된 경우, 최근 신청 시각 포함 정보 최신화
      sheet.getRange(rowIdx, 1, 1, 4).setValues([[timestamp, name, neis, course]]);
    } else {
      // 새로운 신청인 경우 행 추가
      sheet.appendRow([timestamp, name, neis, course]);
    }
    
    return ContentService.createTextOutput(JSON.stringify({ 
      status: "success", 
      message: "연수 신청이 정상적으로 기록되었습니다." 
    }))
    .setMimeType(ContentService.MimeType.JSON);
    
  } catch(err) {
    return ContentService.createTextOutput(JSON.stringify({ 
      status: "error", 
      message: err.toString() 
    }))
    .setMimeType(ContentService.MimeType.JSON);
  }
}
`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(appsScriptCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveUrl = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveGasUrl(urlInput.trim());
    setVerified(true);
    setTimeout(() => setVerified(false), 2000);
  };

  return (
    <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6" id="gas-guide-root">
      {/* Settings Input Card */}
      <div className="lg:col-span-5 space-y-5">
        <div className="glass-panel rounded-3xl p-6 shadow-[0_8px_32px_0_rgba(31,38,135,0.03)] backdrop-blur-[20px]">
          <div className="flex items-center gap-2.5 mb-5">
            <div className="p-2.5 bg-indigo-500/10 text-indigo-700 border border-indigo-55/10 rounded-xl">
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">구글 API 연동 관리</h3>
              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider font-mono">Web App deployment</p>
            </div>
          </div>

          <form onSubmit={handleSaveUrl} className="space-y-4" id="gas-url-setup-form">
            <div className="space-y-2">
              <label htmlFor="gas-url-input" className="text-[10.5px] font-extrabold text-slate-600 pl-0.5">
                배포 완료된 Web App 주소 (URL)
              </label>
              <input
                type="url"
                id="gas-url-input"
                placeholder="https://script.google.com/macros/s/.../exec"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                className="w-full px-3.5 py-2.5 glass-input text-xs rounded-xl outline-none transition-all text-slate-705 font-bold"
              />
              <p className="text-[10px] text-slate-400 leading-normal pl-0.5 font-semibold">
                안정적인 수신을 위해 액세스 수준을 <strong>'모든 사람(Anyone)'</strong>으로 배포해야 정상 작동합니다.
              </p>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white text-xs font-extrabold rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {verified ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : null}
              {verified ? '구글 연동 저장 완료' : '스프레드시트 활성 저장'}
            </button>
          </form>

          {gasUrl ? (
            <div className="mt-5 p-4 bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-800 rounded-xl space-y-1.5 font-bold leading-relaxed shadow-inner">
              <div className="font-extrabold flex items-center gap-1.5 text-emerald-700">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-550 animate-pulse" />
                <span>스마트 연수 실시간 연동 활성화</span>
              </div>
              <p className="text-slate-500 truncate font-mono text-[9.5px] font-semibold">URL: {gasUrl}</p>
            </div>
          ) : (
            <div className="mt-5 p-4 bg-slate-900/[0.03] border border-white/50 text-[11px] text-slate-500 rounded-xl leading-relaxed font-semibold">
              💡 아직 구글 연동 전입니다. 신청 데이터는 현재 브라우저 내부에 보관 중이며, 아래 매뉴얼을 완료하고 주소를 붙여넣는 즉시 실시간 업로드가 가능하며 기존 보관 자료도 보낼 수 있습니다.
            </div>
          )}
        </div>

        {/* Setup Checklists */}
        <div className="glass-panel rounded-3xl p-6 shadow-[0_8px_32px_0_rgba(31,38,135,0.03)] backdrop-blur-[20px] space-y-4">
          <h4 className="text-xs font-extrabold text-slate-800 flex items-center gap-2 pl-0.5">
            <Terminal className="w-3.5 h-3.5 text-slate-650" /> Apps Script 권한 수락 핵심 가이드
          </h4>
          <ul className="text-[11px] text-slate-500 space-y-3 pl-0.5 leading-relaxed font-semibold">
            <li className="flex items-start gap-2.5">
              <span className="text-indigo-600 font-extrabold text-[12px] leading-none">1.</span>
              <span><strong>나(Me)</strong> 명의로 실행되도록 구성해야 합니다. (자신 외 신청자의 구글시트 편집을 허가할 필요가 없어 보안에 유리합니다.)</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="text-indigo-600 font-extrabold text-[12px] leading-none">2.</span>
              <span>액세스 권한 보유자를 <strong>모든 사람(Anyone)</strong>으로 구성하여 누구나 연수 신청 창에서 즉시 응답할 수 있도록 조치하세요.</span>
            </li>
            <li className="flex items-start gap-2.5 text-rose-600">
              <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
              <span><strong>주의:</strong> 코드를 수정하면 항상 '새 배포(New Deployment)'를 통해 신규 URL을 만들어야 서버가 업데이트됩니다.</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Steps & Code Viewer Card */}
      <div className="lg:col-span-7 space-y-5">
        <div className="glass-panel rounded-3xl p-6 sm:p-7 shadow-[0_8px_32px_0_rgba(31,38,135,0.03)] backdrop-blur-[20px] space-y-4.5">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" /> 3분 구글 연동 구축 가이드
            </h3>
            <button
              onClick={() => window.open('https://docs.google.com/spreadsheets', '_blank')}
              className="text-[10px] text-slate-500 hover:text-slate-800 font-bold flex items-center gap-1 cursor-pointer"
            >
              스프레드시트 열기 <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-4 text-xs text-slate-600 leading-relaxed font-semibold">
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 bg-slate-900 text-white font-extrabold rounded-lg flex items-center justify-center shrink-0 text-[10px]">1</div>
              <div>
                <strong className="text-slate-900 text-xs font-black">구글 스프레드시트 새 문서 준비</strong>
                <p className="text-[11px] text-slate-450 mt-1">새 스프레드시트를 생성하고 첫 행(1열부터 D열)에 아래 순서로 헤더를 넣으세요.<br /><code className="bg-slate-900/5 border border-white/60 px-1.5 py-0.5 text-[10px] rounded text-slate-700 font-mono inline-block mt-1 font-bold">신청시각, 이름, 나이스번호, 연수명</code></p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-5 h-5 bg-slate-900 text-white font-extrabold rounded-lg flex items-center justify-center shrink-0 text-[10px]">2</div>
              <div>
                <strong className="text-slate-900 text-xs font-black">Apps Script 편집기 실행</strong>
                <p className="text-[11px] text-slate-450 mt-1">상단 메뉴의 <strong>확장 프로그램(Extensions) &gt; Apps Script</strong>를 클릭합니다.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-5 h-5 bg-slate-900 text-white font-extrabold rounded-lg flex items-center justify-center shrink-0 text-[10px]">3</div>
              <div className="space-y-1 w-full">
                <span className="flex justify-between items-center pr-2">
                  <strong className="text-slate-900 text-xs font-black">연동 코드 입력 및 복사</strong>
                  <button
                    onClick={handleCopyCode}
                    className="text-[10px] font-bold flex items-center gap-1 px-2.5 py-1.5 border border-slate-250/20 bg-white hover:bg-slate-50 rounded-lg text-slate-700 cursor-pointer shadow-sm hover:shadow transition-all"
                  >
                    {copied ? <Check className="w-3 h-3 text-emerald-500" /> : '복사하기'}
                  </button>
                </span>
                <p className="text-[11px] text-slate-450">
                  기존에 작성되어 있는 기본 코드를 전체 삭제한 뒤, 이 코드를 복사하여 그대로 입력하고 저장합니다.
                </p>
                
                {/* Apps Script Code editor view */}
                <div className="bg-slate-950 rounded-xl p-4 font-mono text-[9px] sm:text-[10px] leading-relaxed overflow-x-auto max-h-56 mt-2 text-slate-300 shadow-inner border border-slate-800">
                  <pre>{appsScriptCode}</pre>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-5 h-5 bg-slate-900 text-white font-extrabold rounded-lg flex items-center justify-center shrink-0 text-[10px]">4</div>
              <div>
                <strong className="text-slate-900 text-xs font-black">웹 앱(Web App) 배포 진행</strong>
                <p className="text-[11px] text-slate-450 mt-1 space-y-1">
                  1) 우측 상단 <strong>배포 (Deploy) &gt; 새 배포 (New Deployment)</strong> 버튼 선택<br />
                  2) 설정 태그(⚙️) 아이콘에서 <strong>'웹 앱 (Web App)'</strong>을 누릅니다.<br />
                  3) 웹 앱 실행 권한: <strong>웹 앱을 실행하는 사용자(나/Me)</strong> 설정<br />
                  4) 액세스 설정: <strong>모든 사람 (Anyone)</strong>으로 설정하여 배포 완료<br />
                  5) 구글 보증 로그인 승인을 진행하고 완료 시 생성되는 <strong>Web App URL</strong> 주소를 복사하여 좌측 설정란에 입력해 주세요.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
