
import React, { useRef } from 'react';

interface SidebarProps {
  domains: string[];
  selectedDomain: string | null;
  onSelectDomain: (domain: string | null) => void;
  onFileUpload: (file: File) => void;
  onExportPPT: () => void;
  onExportCSV: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  domains, 
  selectedDomain, 
  onSelectDomain, 
  onFileUpload,
  onExportPPT,
  onExportCSV
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      onFileUpload(event.target.files[0]);
    }
  };

  return (
    <aside className="w-72 bg-white border-r border-slate-200 hidden md:flex flex-col h-full shadow-[1px_0_10px_rgba(0,0,0,0.02)] z-10 relative">
      <div className="p-8 border-b border-slate-50 flex items-center gap-4">
        <div className="w-11 h-11 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-100 transform -rotate-3">
           <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
           </svg>
        </div>
        <div>
          <h1 className="text-xl font-black text-slate-800 tracking-tighter leading-none">Insight<span className="text-indigo-600">Pro</span></h1>
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Enterprise Analytics</p>
        </div>
      </div>

      <div className="p-6">
         <button
            onClick={() => onSelectDomain(null)}
            className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all duration-300 group ${
              selectedDomain === null
                ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100 translate-x-1'
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
            Master View
          </button>
      </div>

      <div className="px-6 flex-1 overflow-y-auto custom-scrollbar">
        <div className="flex items-center justify-between mb-5 px-1">
          <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Domains</h2>
          <span className="text-[10px] font-bold text-slate-300">{domains.length}</span>
        </div>
        <nav className="space-y-1.5">
          {domains.map((domain) => (
            <button
              key={domain}
              onClick={() => onSelectDomain(domain)}
              className={`w-full flex items-center gap-3 px-5 py-3.5 rounded-2xl text-[11px] font-bold transition-all duration-200 group border ${
                selectedDomain === domain
                  ? 'bg-white text-indigo-600 border-indigo-100 shadow-md translate-x-1 ring-1 ring-indigo-50'
                  : 'text-slate-400 border-transparent hover:bg-slate-50 hover:text-slate-700'
              }`}
            >
              <div className={`w-1.5 h-1.5 rounded-full transition-all ${selectedDomain === domain ? 'bg-indigo-500 scale-125' : 'bg-slate-200 group-hover:bg-slate-400'}`} />
              {domain}
            </button>
          ))}
        </nav>
      </div>

      <div className="mt-auto p-6 bg-slate-50/80 border-t border-slate-100 space-y-4">
        <div className="space-y-2">
            <button 
              type="button"
              onClick={onExportPPT}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 text-white bg-slate-900 hover:bg-indigo-600 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all shadow-lg hover:shadow-indigo-100 active:scale-95 group"
            >
              <svg className="w-4 h-4 group-hover:animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export Report
            </button>

            <div className="grid grid-cols-2 gap-2">
                <button 
                  onClick={onExportCSV}
                  className="flex flex-col items-center justify-center gap-1.5 p-3 text-slate-500 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-[9px] font-black uppercase tracking-tighter transition-all"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 17v-2a4 4 0 10-8 0v2" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 17v-2a4 4 0 10-8 0v2" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 17v-2a4 4 0 11-8 0v2" /></svg>
                  CSV
                </button>
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="flex flex-col items-center justify-center gap-1.5 p-3 text-slate-500 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-[9px] font-black uppercase tracking-tighter transition-all"
                >
                  <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".csv" className="hidden" />
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                  Upload
                </button>
            </div>
        </div>

        <div className="pt-4 border-t border-slate-200/60 flex items-center justify-between">
           <div className="flex flex-col">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Environment</span>
              <span className="text-[10px] font-bold text-emerald-600">Production Ready</span>
           </div>
           <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
