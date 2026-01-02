import React from 'react';
import { ActivityData, ActivityStatus } from '../types';

interface ActivityListProps {
  activities: ActivityData[];
}

const ActivityList: React.FC<ActivityListProps> = ({ activities }) => {
  const getStatusStyle = (status: ActivityStatus) => {
    switch (status) {
      case ActivityStatus.COMPLETED: 
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case ActivityStatus.ON_PROCESS: 
        return 'bg-amber-100 text-amber-700 border-amber-200';
      case ActivityStatus.NOT_STARTED: 
        return 'bg-slate-100 text-slate-600 border-slate-200';
      default: 
        return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full">
      <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-white">
        <div>
           <h3 className="text-lg font-bold text-slate-800">Detailed Activity List</h3>
           <p className="text-sm text-slate-400 mt-1">Comprehensive breakdown of all tracked items</p>
        </div>
        <div className="text-xs font-medium text-slate-500 bg-slate-50 px-3 py-1 rounded-full border border-slate-200">
           {activities.length} Items
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-100">
          <thead className="bg-slate-50/80">
            <tr>
              <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Activity Name</th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Domain</th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Timeline</th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Progress</th>
              <th scope="col" className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Budget</th>
              <th scope="col" className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Spent</th>
              <th scope="col" className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Balance</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-50">
            {activities.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-12 text-center">
                   <div className="flex flex-col items-center justify-center text-slate-400">
                      <svg className="w-12 h-12 mb-3 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <p className="text-sm font-medium">No activities found.</p>
                   </div>
                </td>
              </tr>
            ) : (
              activities.map((activity) => (
                <tr key={activity.no} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                       <span className="text-sm font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors">{activity.activityName}</span>
                       <span className="text-xs text-slate-400 font-mono mt-0.5">{activity.activityCode}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600">
                      {activity.domainName}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 font-medium">
                    {activity.timeline}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStatusStyle(activity.status)}`}>
                      {activity.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap align-middle">
                    <div className="w-full max-w-[140px]">
                      <div className="flex justify-between mb-1">
                        <span className="text-[10px] font-bold text-slate-500">{activity.budgetProgress.toFixed(0)}%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div 
                          className={`h-1.5 rounded-full shadow-sm ${activity.budgetProgress > 100 ? 'bg-rose-500' : 'bg-indigo-500'}`} 
                          style={{ width: `${Math.min(activity.budgetProgress, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-slate-800 font-medium">
                    ${activity.allocationBudget.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-rose-600/80">
                    ${activity.expenditure.toLocaleString()}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-bold ${activity.balance >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    ${activity.balance.toLocaleString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ActivityList;