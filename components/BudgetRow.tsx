import React from 'react';
import { ActivityData } from '../types';

interface BudgetRowProps {
  activity: ActivityData;
}

const BudgetRow: React.FC<BudgetRowProps> = ({ activity }) => {
  const percentage = Math.min(Math.max(activity.budgetProgress, 0), 100);
  
  // Icon placeholder generation based on activity name
  const getIcon = () => {
    const isOver = activity.budgetProgress > 100;
    return (
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold shadow-sm transition-transform group-hover:scale-105
        ${isOver ? 'bg-rose-500 shadow-rose-200' : 'bg-indigo-500 shadow-indigo-200'}
      `}>
        {activity.activityName.charAt(0)}
      </div>
    );
  };

  return (
    <div className="group mb-5 last:mb-0 p-3 hover:bg-slate-50 rounded-xl transition-all border border-transparent hover:border-slate-100">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-4">
          {getIcon()}
          <div>
            <h4 className="text-sm font-bold text-slate-800 line-clamp-1">{activity.activityName}</h4>
            <p className="text-xs text-slate-400 font-medium">{activity.timeline}</p>
          </div>
        </div>
        <div className="text-right">
           <span className="text-sm font-bold text-slate-800">{activity.budgetProgress.toFixed(0)}%</span>
           <p className="text-[10px] text-slate-400 uppercase tracking-wide">Utilized</p>
        </div>
      </div>

      <div className="relative w-full h-2 bg-slate-100 rounded-full overflow-hidden mb-2.5">
        <div 
          className={`absolute top-0 left-0 h-full rounded-full transition-all duration-700 ease-out ${
            activity.budgetProgress > 100 ? 'bg-rose-500' : 'bg-emerald-500'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      <div className="flex justify-between text-xs items-center">
        <span className="text-slate-500 font-medium bg-slate-100 px-2 py-0.5 rounded">
          ${activity.expenditure.toLocaleString()} <span className="text-slate-400 font-normal">spent</span>
        </span>
        <span className="text-slate-700 font-bold">
          ${activity.allocationBudget.toLocaleString()} <span className="text-slate-400 font-normal">total</span>
        </span>
      </div>
    </div>
  );
};

export default BudgetRow;