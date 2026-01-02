
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface SummaryProps {
  totalBudget: number;
  totalExpenditure: number;
  totalBalance: number;
  totalOverspent: number;
  totalUnderspent: number;
}

const StatsCard: React.FC<SummaryProps> = ({ 
  totalBudget, 
  totalExpenditure, 
  totalBalance,
  totalOverspent,
  totalUnderspent
}) => {
  const data = [
    { name: 'Spent', value: totalExpenditure, color: '#6366f1' }, 
    { name: 'Available', value: totalBalance > 0 ? totalBalance : 0, color: '#f1f5f9' },
  ];

  const utilization = totalBudget > 0 ? Math.round((totalExpenditure / totalBudget) * 100) : 0;
  const fmt = (n: number) => n.toLocaleString();

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col md:flex-row items-stretch justify-between gap-8 h-full">
      <div className="flex-1 w-full flex flex-col justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-8">Financial Overview</h3>
          
          <div className="space-y-6">
            <div>
               <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Total Net Balance</p>
               <div className="flex items-center gap-3">
                 <span className={`text-4xl font-black tracking-tighter ${totalBalance >= 0 ? 'text-slate-900' : 'text-rose-600'}`}>
                   ${fmt(totalBalance)}
                 </span>
                 {totalBalance < 0 && (
                   <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-600 text-[10px] font-bold border border-rose-100">DEFICIT</span>
                 )}
               </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div className="bg-slate-50/50 rounded-xl p-4 border border-slate-100">
                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Expenditure</div>
                  <div className="text-xl font-extrabold text-slate-800">${fmt(totalExpenditure)}</div>
               </div>
               <div className="bg-slate-50/50 rounded-xl p-4 border border-slate-100">
                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Budget Cap</div>
                  <div className="text-xl font-extrabold text-slate-800">${fmt(totalBudget)}</div>
               </div>
            </div>
          </div>
        </div>

        <div className="flex gap-6 mt-8 pt-6 border-t border-slate-50">
           <div className="flex flex-col">
              <span className="text-[9px] font-black text-rose-500 uppercase tracking-widest">Overspent</span>
              <span className="text-sm font-bold text-slate-700">${fmt(totalOverspent)}</span>
           </div>
           <div className="flex flex-col">
              <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Savings</span>
              <span className="text-sm font-bold text-slate-700">${fmt(totalUnderspent)}</span>
           </div>
        </div>
      </div>

      <div className="w-full md:w-52 h-52 relative flex-shrink-0 self-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={70}
              outerRadius={85}
              startAngle={90}
              endAngle={-270}
              dataKey="value"
              paddingAngle={2}
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
            <span className="text-[9px] text-slate-400 font-black uppercase tracking-tighter">Utilization</span>
            <span className="text-3xl font-black text-slate-900 tracking-tighter">{utilization}%</span>
        </div>
      </div>
    </div>
  );
};

export default StatsCard;
