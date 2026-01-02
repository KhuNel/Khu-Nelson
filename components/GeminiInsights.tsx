
import React, { useState } from 'react';
import { ActivityData } from '../types';
import { analyzeDashboardData } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';

interface GeminiInsightsProps {
  data: ActivityData[];
  selectedDomain: string | null;
}

const GeminiInsights: React.FC<GeminiInsightsProps> = ({ data, selectedDomain }) => {
  const [insight, setInsight] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerateInsight = async () => {
    setLoading(true);
    const result = await analyzeDashboardData(data, selectedDomain);
    setInsight(result || "No response generated.");
    setLoading(false);
  };

  return (
    <div className="relative overflow-hidden bg-slate-900 rounded-2xl shadow-xl border border-slate-800">
      {/* Abstract Background Pattern */}
      <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-bold text-white tracking-tight">AI Strategic Insights</h3>
              <p className="text-sm text-slate-400 font-medium">Powered by Gemini 3 Flash</p>
            </div>
          </div>
          <button
            onClick={handleGenerateInsight}
            disabled={loading}
            className={`flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
              loading 
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
                : 'bg-white text-slate-900 hover:bg-indigo-50 hover:scale-[1.02] active:scale-95 shadow-lg shadow-white/5'
            }`}
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                Analyzing Data...
              </>
            ) : (
              'Generate Analysis'
            )}
          </button>
        </div>
        
        <div className={`transition-all duration-500 ease-in-out ${insight ? 'max-h-[1000px] opacity-100' : 'max-h-[120px] opacity-80'}`}>
          <div className="bg-slate-800/40 backdrop-blur-md rounded-xl p-5 border border-slate-700/50 min-h-[100px]">
            {insight ? (
              <div className="prose prose-invert prose-sm max-w-none text-slate-300 leading-relaxed">
                <ReactMarkdown>{insight}</ReactMarkdown>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-4 text-center">
                <p className="text-slate-500 text-sm font-medium italic max-w-md">
                  Let AI analyze your current dashboard view to uncover hidden risks, budget leakage, and provide management recommendations.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeminiInsights;
