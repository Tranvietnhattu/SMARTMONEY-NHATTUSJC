
import React, { useMemo, useState, useTransition } from 'react';
import { 
  Zap, ShieldAlert, TrendingUp, AlertCircle, 
  ArrowRight, Clock, FileJson, LayoutDashboard, Copy, Check,
  Target, Activity, BarChart3, Repeat, Sparkles, Loader2, BrainCircuit
} from 'lucide-react';
import { useFinanceStore } from '../store/useFinanceStore';
import { generateInternalReport } from '../utils/internalAnalyticEngine';
import { getCycleRange, calculateSummary } from '../utils/financeLogic';
import { formatCurrency } from '../utils/helpers';
import { format } from 'date-fns';
import { analyzeSpendingWithGemini, AIAnalyticReport } from '../utils/aiService';
import DailyInsight from '../components/DailyInsight';
import { WISDOM_DATABASE } from '../constants';

const AIAssistant: React.FC = () => {
  const { transactions, categories, cycleStartDay } = useFinanceStore();
  const [viewMode, setViewMode] = useState<'visual' | 'json'>('visual');
  const [reportSource, setReportSource] = useState<'internal' | 'gemini'>('internal');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiReport, setAiReport] = useState<AIAnalyticReport | null>(null);
  const [copied, setCopied] = useState(false);
  const [isPending, startTransition] = useTransition();

  const dailyWisdom = useMemo(() => {
    return WISDOM_DATABASE[Math.floor(Math.random() * WISDOM_DATABASE.length)];
  }, []);

  const range = useMemo(() => getCycleRange(new Date(), cycleStartDay), [cycleStartDay]);
  const internalReport = useMemo(() => generateInternalReport(transactions, categories, cycleStartDay), [transactions, categories, cycleStartDay]);
  
  const report = useMemo(() => {
    return (reportSource === 'gemini' && aiReport) ? aiReport : internalReport;
  }, [reportSource, aiReport, internalReport]);

  const handleDeepAnalysis = async () => {
    setIsAiLoading(true);
    try {
      const summary = calculateSummary(transactions, range);
      const period = `${format(range.start, 'dd/MM/yyyy')} - ${format(range.end, 'dd/MM/yyyy')}`;
      // Gọi bộ máy phân tích nội bộ (giả lập AI)
      const res = await analyzeSpendingWithGemini(transactions, categories, summary, period, cycleStartDay);
      setAiReport(res);
      setReportSource('gemini');
    } catch (error) {
      console.error("Analysis failed:", error);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(report, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col gap-6 pb-24 max-w-2xl mx-auto w-full px-2 animate-in fade-in duration-500">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between px-2">
        <div>
          <h2 className="font-black text-xl text-slate-800 tracking-tight">Trợ lý Tài chính</h2>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
            {reportSource === 'internal' ? 'Smart Analysis Engine' : 'Personalized AI Insights'}
          </p>
        </div>
        
        <div className="relative glass-tab p-1 rounded-2xl flex w-fit overflow-hidden border border-slate-200/50">
          <div 
            className="absolute top-1 bottom-1 bg-white rounded-xl shadow-sm tab-pill-active z-0 active-pill-shadow"
            style={{ 
              width: 'calc(50% - 4px)', 
              transform: `translateX(${viewMode === 'visual' ? '0' : '100%'})`
            }}
          />
          <button onClick={() => setViewMode('visual')} className={`relative z-10 px-5 py-2.5 flex items-center gap-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors ${viewMode === 'visual' ? 'text-indigo-600' : 'text-slate-400'}`}>
            <LayoutDashboard size={14} /> <span>Dashboard</span>
          </button>
          <button onClick={() => setViewMode('json')} className={`relative z-10 px-5 py-2.5 flex items-center gap-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors ${viewMode === 'json' ? 'text-indigo-600' : 'text-slate-400'}`}>
            <FileJson size={14} /> <span>JSON</span>
          </button>
        </div>
      </div>

      <div className="min-h-[400px] relative space-y-6">
        {viewMode === 'visual' && (
          <DailyInsight quote={dailyWisdom.quote} author={dailyWisdom.author} action={dailyWisdom.actionItem} />
        )}

        {viewMode === 'visual' && !isAiLoading && (
          <div className="grid grid-cols-1 gap-5 premium-content-fade">
            {reportSource === 'internal' && (
              <button 
                onClick={handleDeepAnalysis}
                className="relative overflow-hidden group w-full bg-indigo-600 text-white p-6 rounded-[2.5rem] shadow-xl hover:shadow-indigo-500/20 transition-all active:scale-[0.98] flex items-center justify-between"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-700 to-violet-700 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                <div className="relative z-10 flex items-center gap-4">
                  <div className="p-3 bg-white/20 rounded-2xl group-hover:bg-white/30">
                    <BrainCircuit size={24} className="animate-pulse" />
                  </div>
                  <div className="text-left">
                    <h4 className="text-sm font-black uppercase tracking-widest">Phân tích sâu (Intelligence)</h4>
                    <p className="text-[10px] font-bold text-indigo-100 group-hover:text-white transition-colors italic">Chạy thuật toán phân tích hành vi...</p>
                  </div>
                </div>
                <ArrowRight size={20} className="relative z-10 group-hover:translate-x-2 transition-transform duration-500" />
              </button>
            )}

            {report.alerts.length > 0 && (
              <div className="bg-rose-50 border border-rose-100 rounded-[2.5rem] p-6 space-y-4">
                <div className="flex items-center gap-2 text-rose-600">
                  <ShieldAlert size={18} />
                  <span className="text-[9px] font-black uppercase tracking-widest">Cảnh báo tài chính</span>
                </div>
                <div className="space-y-3">
                  {report.alerts.map((alert, i) => (
                    <div key={i} className="flex items-start gap-3 bg-white/60 p-4 rounded-2xl border border-rose-100/50">
                      <AlertCircle size={14} className={`shrink-0 mt-0.5 ${alert.level === 'CRITICAL' ? 'text-rose-500' : 'text-amber-500'}`} />
                      <p className="text-[11px] font-bold text-rose-800 leading-relaxed">{alert.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-white border border-slate-100 p-8 rounded-[2.5rem] shadow-sm relative overflow-hidden group">
              <div className="absolute -right-4 -top-4 opacity-[0.03] rotate-12 group-hover:scale-110 transition-transform duration-1000">
                <Activity size={100} />
              </div>
              <div className="relative z-10 space-y-6">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-slate-900 text-white rounded-lg"><Target size={12} className="fill-current" /></div>
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Tóm lược chu kỳ</span>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">Tỷ lệ chi/thu</p>
                    <h3 className="text-3xl font-black text-slate-800 tracking-tighter">{report.overview.expense_to_income_ratio_percent}%</h3>
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">Số dư ròng</p>
                    <h3 className={`text-xl font-black tracking-tighter ${report.overview.net_balance >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                      {report.overview.net_balance > 0 ? '+' : ''}{formatCurrency(report.overview.net_balance)}đ
                    </h3>
                  </div>
                </div>
                <div className="pt-6 border-t border-slate-50">
                  <div className="flex justify-between items-end mb-3">
                    <span className="text-[9px] font-black uppercase text-slate-300 tracking-widest">Cấu trúc ngân sách</span>
                    <span className="text-[9px] font-black text-indigo-500">{report.spending_analysis.structure.fixed_ratio_percent}% cố định</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden flex">
                    <div className="h-full bg-slate-800 transition-all duration-1000" style={{ width: `${report.spending_analysis.structure.fixed_ratio_percent}%` }}></div>
                    <div className="h-full bg-amber-400 transition-all duration-1000" style={{ width: `${100 - report.spending_analysis.structure.fixed_ratio_percent}%` }}></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-4">Đề xuất cải thiện</h3>
              <div className="grid grid-cols-1 gap-3">
                {report.recommendations.map((rec, i) => (
                  <div key={i} className="bg-white p-4 rounded-[1.5rem] border border-slate-100 flex items-start gap-4 group hover:bg-slate-50 transition-all">
                    <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-all">
                      <ArrowRight size={14} />
                    </div>
                    <p className="text-xs font-bold text-slate-600 leading-relaxed flex-1">{rec}</p>
                  </div>
                ))}
              </div>
            </div>

            {reportSource === 'gemini' && (
              <button 
                onClick={() => { setReportSource('internal'); setAiReport(null); }}
                className="w-full py-6 text-[9px] font-black uppercase text-slate-300 tracking-[0.3em] hover:text-indigo-600 transition-all flex items-center justify-center gap-4"
              >
                <div className="w-8 h-px bg-slate-100"></div> Quay lại báo cáo cơ bản <div className="w-8 h-px bg-slate-100"></div>
              </button>
            )}
          </div>
        )}

        {viewMode === 'json' && !isAiLoading && (
          <div className="bg-slate-900 rounded-[2.5rem] p-6 premium-content-fade relative overflow-hidden">
            <div className="absolute inset-0 bg-indigo-500/5 pointer-events-none"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6 px-2">
                <div className="flex items-center gap-2 text-indigo-400">
                  <FileJson size={16} /> <span className="text-[10px] font-black uppercase tracking-widest">Raw Data Export</span>
                </div>
                <button onClick={handleCopy} className="p-2 bg-white/5 text-white rounded-xl hover:bg-white/10 flex items-center gap-2 border border-white/5">
                  {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                  <span className="text-[9px] font-black uppercase tracking-widest">{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <div className="bg-black/40 p-5 rounded-3xl border border-white/5 overflow-hidden">
                <pre className="text-[10px] font-mono text-indigo-200/80 overflow-x-auto no-scrollbar leading-relaxed">
                  {JSON.stringify(report, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        )}

        {isAiLoading && (
          <div className="bg-white border border-slate-100 rounded-[2.5rem] p-12 flex flex-col items-center justify-center text-center space-y-6 premium-content-fade">
            <div className="relative">
              <Loader2 size={48} className="text-indigo-500 animate-spin" strokeWidth={1.5} />
              <BrainCircuit size={20} className="text-indigo-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            </div>
            <div className="space-y-3">
              <h4 className="text-slate-800 font-black text-sm uppercase tracking-[0.2em]">Đang chạy mô phỏng hành vi</h4>
              <p className="text-[9px] font-bold text-slate-400 animate-pulse uppercase tracking-widest">Internal Behavioral Logic v2.0...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIAssistant;
