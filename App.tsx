
import React, { useState, useMemo, useEffect } from 'react';
import { MOCK_DATA } from './constants';
import { fetchSheetData, parseCSV } from './services/sheetService';
import { exportToPowerPoint, exportToCSV } from './services/exportService';
import { ActivityData, DashboardMetrics, ActivityStatus } from './types';
import Sidebar from './components/Sidebar';
import StatsCard from './components/StatsCard';
import ActivityList from './components/ActivityList';
import BudgetRow from './components/BudgetRow';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from 'recharts';

const App: React.FC = () => {
  const [data, setData] = useState<ActivityData[]>([]);
  const [loading, setLoading] = useState(true);
  const [dataSource, setDataSource] = useState<'live' | 'local' | 'demo'>('demo');
  const [lastSync, setLastSync] = useState<string>('');
  const [selectedDomain, setSelectedDomain] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<ActivityStatus | 'all'>('all');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const sheetData = await fetchSheetData();
        setLastSync(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        if (sheetData.length > 0) {
          setData(sheetData);
          setDataSource('live');
        } else {
          setData(MOCK_DATA);
          setDataSource('demo');
        }
      } catch (error) {
        console.warn("Could not fetch live data, using mock data.", error);
        setData(MOCK_DATA);
        setDataSource('demo');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleFileUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (text) {
        try {
          const parsedData = parseCSV(text);
          if (parsedData.length > 0) {
            setData(parsedData);
            setDataSource('local');
            setLastSync('Manual Upload');
          }
        } catch (error) {
          console.error("Failed to parse CSV", error);
          alert("Invalid CSV format.");
        }
      }
    };
    reader.readAsText(file);
  };

  const domains = useMemo(() => {
    return Array.from(new Set(data.map(d => d.domainName))).filter(Boolean).sort();
  }, [data]);

  const filteredData = useMemo(() => {
    let result = data;
    if (selectedDomain) result = result.filter(d => d.domainName === selectedDomain);
    if (selectedStatus !== 'all') result = result.filter(d => d.status === selectedStatus);
    return result;
  }, [selectedDomain, selectedStatus, data]);

  const metrics: DashboardMetrics = useMemo(() => {
    const totalActivities = filteredData.length;
    const completed = filteredData.filter(d => d.status === ActivityStatus.COMPLETED).length;
    const onProcess = filteredData.filter(d => d.status === ActivityStatus.ON_PROCESS).length;
    const notStarted = filteredData.filter(d => d.status === ActivityStatus.NOT_STARTED).length;
    
    const totalBudget = filteredData.reduce((acc, curr) => acc + (curr.allocationBudget || 0), 0);
    const totalExpenditure = filteredData.reduce((acc, curr) => acc + (curr.expenditure || 0), 0);
    const totalBalance = filteredData.reduce((acc, curr) => acc + (curr.balance || 0), 0);
    
    const totalOverspent = filteredData.reduce((acc, curr) => {
        const bal = curr.balance || 0;
        return bal < 0 ? acc + Math.abs(bal) : acc;
    }, 0);

    const totalUnderspent = filteredData.reduce((acc, curr) => {
        const bal = curr.balance || 0;
        return bal > 0 ? acc + bal : acc;
    }, 0);

    const budgetUtilization = totalBudget > 0 ? (totalExpenditure / totalBudget) * 100 : 0;
    const balancePercentage = totalBudget > 0 ? (totalBalance / totalBudget) * 100 : 0;

    return {
      totalActivities, completed, onProcess, notStarted,
      totalBudget, totalExpenditure, totalBalance,
      budgetUtilization, balancePercentage,
      totalOverspent, totalUnderspent
    };
  }, [filteredData]);

  const chartData = useMemo(() => {
    if (!selectedDomain) {
      const domainMap = new Map();
      data.forEach(d => {
        if (!domainMap.has(d.domainName)) {
          domainMap.set(d.domainName, { name: d.domainName, Budget: 0, Spent: 0 });
        }
        const entry = domainMap.get(d.domainName);
        entry.Budget += d.allocationBudget || 0;
        entry.Spent += d.expenditure || 0;
      });
      return Array.from(domainMap.values());
    } else {
      return filteredData
        .sort((a, b) => b.allocationBudget - a.allocationBudget)
        .slice(0, 10) 
        .map(d => ({
          name: d.activityName.length > 15 ? d.activityName.substring(0, 15) + '...' : d.activityName,
          Budget: d.allocationBudget || 0,
          Spent: d.expenditure || 0
        }));
    }
  }, [selectedDomain, data, filteredData]);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-20 h-20">
            <div className="absolute inset-0 rounded-full border-4 border-slate-200"></div>
            <div className="absolute inset-0 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin"></div>
          </div>
          <p className="text-slate-500 font-bold animate-pulse tracking-widest uppercase text-[10px]">Production Engine Initializing...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-[#F8FAFC] font-sans text-slate-900 overflow-hidden">
      {/* Top Header - Enhanced for Production */}
      <header className="bg-white/95 backdrop-blur-xl h-16 flex items-center px-6 border-b border-slate-200 z-20 flex-shrink-0 justify-between sticky top-0 shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-lg">
             <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
          <div className="flex items-center gap-3">
             <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 bg-indigo-50 border border-indigo-100 rounded-md">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></div>
                <span className="text-[10px] font-black text-indigo-700 uppercase tracking-tighter">System Live</span>
             </div>
             <div className="w-[1px] h-4 bg-slate-200 hidden sm:block"></div>
             <div className="flex items-center gap-2 text-slate-400">
                <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">{selectedDomain || 'Global View'}</span>
             </div>
          </div>
        </div>

        <div className="flex items-center gap-6">
           <div className="hidden lg:flex flex-col items-end">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Last Sync</span>
              <span className="text-[11px] font-bold text-slate-600">{lastSync}</span>
           </div>
           
           <div className="h-9 w-9 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-lg shadow-slate-200 transform hover:scale-105 transition-transform cursor-pointer">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
           </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <div className={`${mobileMenuOpen ? 'block absolute z-40 h-full w-72' : 'hidden'} md:block h-full`}>
          <Sidebar 
            domains={domains} 
            selectedDomain={selectedDomain} 
            onSelectDomain={(d) => { setSelectedDomain(d); setMobileMenuOpen(false); }}
            onFileUpload={handleFileUpload}
            onExportPPT={() => exportToPowerPoint(filteredData, metrics, selectedDomain)}
            onExportCSV={() => exportToCSV(filteredData)}
          />
        </div>
        
        {mobileMenuOpen && <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] z-30 md:hidden" onClick={() => setMobileMenuOpen(false)}></div>}

        <main className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar bg-[#FBFBFE]">
          <div className="max-w-7xl mx-auto space-y-8 pb-12">
            
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              <StatsCard {...metrics} />
              
               <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-8 flex flex-col">
                  <div className="flex justify-between items-center mb-8">
                    <div>
                      <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest">Allocation Matrix</h3>
                      <p className="text-[11px] text-slate-400 font-medium mt-1">Resource distribution vs Actual utilization</p>
                    </div>
                    <div className="flex items-center gap-4">
                       <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 bg-slate-100 rounded-full border border-slate-200"></div> <span className="text-[9px] font-black text-slate-400 uppercase">Allocated</span></div>
                       <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 bg-indigo-600 rounded-full shadow-sm shadow-indigo-200"></div> <span className="text-[9px] font-black text-slate-400 uppercase">Spent</span></div>
                    </div>
                  </div>
                  <div className="flex-1 min-h-[260px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }} barGap={8}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f8fafc" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 9, fill: '#94a3b8', fontWeight: 700}} dy={15} />
                        <YAxis axisLine={false} tickLine={false} tick={{fontSize: 9, fill: '#94a3b8', fontWeight: 700}} tickFormatter={(value) => `$${value/1000}k`} />
                        <Tooltip 
                          cursor={{fill: '#f1f5f9', opacity: 0.4}} 
                          formatter={(value: number) => [`$${value.toLocaleString()}`]} 
                          contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', fontSize: '11px', fontWeight: '800', background: '#fff' }} 
                        />
                        <Bar dataKey="Budget" fill="#F1F5F9" radius={[6, 6, 6, 6]} barSize={28} />
                        <Bar dataKey="Spent" fill="#4F46E5" radius={[6, 6, 6, 6]} barSize={28} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
               </div>
            </div>

            {/* Status Filter Bar - More Sleek */}
            <div className="flex items-center gap-3 overflow-x-auto pb-2 no-scrollbar">
              <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-slate-200 shadow-sm">
                <svg className="w-3 h-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest whitespace-nowrap">Status</span>
              </div>
              {(['all', ActivityStatus.COMPLETED, ActivityStatus.ON_PROCESS, ActivityStatus.NOT_STARTED] as const).map(status => (
                <button
                  key={status}
                  onClick={() => setSelectedStatus(status)}
                  className={`px-5 py-2 rounded-full text-[11px] font-black transition-all border whitespace-nowrap uppercase tracking-tighter ${
                    selectedStatus === status 
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-100' 
                      : 'bg-white text-slate-500 border-slate-100 hover:border-indigo-200 hover:bg-slate-50'
                  }`}
                >
                  {status === 'all' ? 'Entire Pipeline' : status}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
               <div className="xl:col-span-2 bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-8">
                 <div className="flex items-center justify-between mb-10">
                   <div>
                     <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest">Real-Time Utilization</h3>
                     <p className="text-[11px] text-slate-400 font-medium mt-1">Live tracking per individual activity node</p>
                   </div>
                 </div>
                 <div className="space-y-2 overflow-y-auto max-h-[620px] custom-scrollbar pr-3">
                   {filteredData.length > 0 ? (
                     filteredData.map((activity) => <BudgetRow key={activity.no} activity={activity} />)
                   ) : (
                     <div className="flex flex-col items-center justify-center py-28 text-slate-300 opacity-40">
                        <svg className="w-20 h-20 mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                        <p className="font-black uppercase tracking-[0.2em] text-[10px]">No Records Found</p>
                     </div>
                   )}
                 </div>
               </div>

               <div className="space-y-8">
                 <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-8">
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest mb-10 text-center">Activity Flow</h3>
                    <div className="space-y-4">
                      {/* Highlighted Total Activities Row */}
                      <div className="p-5 rounded-2xl bg-indigo-600 flex items-center justify-between group transition-all shadow-xl shadow-indigo-100 transform hover:-translate-y-1">
                        <div className="flex items-center gap-4">
                           <div className="w-11 h-11 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg></div>
                           <span className="text-xs font-black text-white uppercase tracking-widest">Total Active</span>
                        </div>
                        <span className="text-3xl font-black text-white tracking-tighter">{metrics.totalActivities}</span>
                      </div>

                      <div className="p-5 rounded-2xl bg-[#F8FAFC] border border-slate-100 flex items-center justify-between group hover:bg-emerald-50 hover:border-emerald-100 transition-all cursor-default">
                        <div className="flex items-center gap-4">
                           <div className="w-11 h-11 rounded-xl bg-white shadow-sm border border-slate-100 flex items-center justify-center text-emerald-500"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg></div>
                           <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Completed</span>
                        </div>
                        <span className="text-2xl font-black text-slate-800">{metrics.completed}</span>
                      </div>
                      
                      <div className="p-5 rounded-2xl bg-[#F8FAFC] border border-slate-100 flex items-center justify-between group hover:bg-amber-50 hover:border-amber-100 transition-all cursor-default">
                        <div className="flex items-center gap-4">
                           <div className="w-11 h-11 rounded-xl bg-white shadow-sm border border-slate-100 flex items-center justify-center text-amber-500"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></div>
                           <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">In Progress</span>
                        </div>
                        <span className="text-2xl font-black text-slate-800">{metrics.onProcess}</span>
                      </div>

                      <div className="p-5 rounded-2xl bg-[#F8FAFC] border border-slate-100 flex items-center justify-between group hover:bg-slate-100 transition-all cursor-default">
                        <div className="flex items-center gap-4">
                           <div className="w-11 h-11 rounded-xl bg-white shadow-sm border border-slate-100 flex items-center justify-center text-slate-400"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg></div>
                           <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pending</span>
                        </div>
                        <span className="text-2xl font-black text-slate-800">{metrics.notStarted}</span>
                      </div>
                    </div>
                 </div>
               </div>
            </div>

            <ActivityList activities={filteredData} />
            
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
