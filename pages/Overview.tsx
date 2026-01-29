
import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ShieldCheck, ArrowUpRight, ArrowDownRight, Wallet, Activity, ChevronRight, Sparkles, Zap } from 'lucide-react';
import { Transaction, Category, FinancialJar } from '../types';
import { formatCurrency } from '../utils/helpers';
import { calculateFinancialScore, getCycleRange, calculateSummary, analyzeProfessionalROI } from '../utils/financeLogic';
import { format } from 'date-fns';
import { CATEGORY_ICONS } from '../constants';

interface Props {
  transactions: Transaction[];
  categories: Category[];
  jars: FinancialJar[];
  cycleStartDay: number;
  onEdit: (t: Transaction) => void;
  onDelete: (id: string) => void;
  onUpdateJar: (id: string, percentage: number) => void;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900/95 backdrop-blur-md p-3 shadow-xl rounded-2xl border border-white/10 animate-in fade-in zoom-in duration-200">
        <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2 border-b border-white/5 pb-1">{label}</p>
        <div className="space-y-1.5">
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between gap-4">
              <span className="text-[9px] font-bold text-white/70 uppercase">{entry.name}</span>
              <span className="text-xs font-black text-white">{formatCurrency(entry.value)}đ</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

const Overview: React.FC<Props> = ({ transactions, categories, jars, cycleStartDay, onEdit }) => {
  const range = useMemo(() => getCycleRange(new Date(), cycleStartDay), [cycleStartDay]);
  const sum = useMemo(() => calculateSummary(transactions, range), [transactions, range]);
  const score = useMemo(() => calculateFinancialScore(transactions, cycleStartDay), [transactions, cycleStartDay]);
  const roi = useMemo(() => analyzeProfessionalROI(transactions, categories), [transactions, categories]);

  const recentTransactions = useMemo(() => {
    return [...transactions]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 4);
  }, [transactions]);

  const config = useMemo(() => {
    if (score < 50) return { color: '#f43f5e', text: 'RỦI RO', iconColor: 'text-rose-500' };
    if (score < 80) return { color: '#f59e0b', text: 'ỔN ĐỊNH', iconColor: 'text-amber-500' };
    return { color: '#10b981', text: 'RẤT TỐT', iconColor: 'text-emerald-500' };
  }, [score]);

  return (
    <div className="flex flex-col gap-4 pb-20 w-full max-w-md mx-auto">
      
      {/* Score Card - Compact */}
      <section className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between relative overflow-hidden premium-content-fade">
        <div className="flex items-center gap-4 relative z-10">
          <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 64 64">
              <circle cx="32" cy="32" r="28" stroke="#f1f5f9" strokeWidth="5" fill="transparent" />
              <circle cx="32" cy="32" r="28" stroke={config.color} strokeWidth="5" fill="transparent" 
                strokeDasharray={176} strokeDashoffset={176 - (score/100)*176} strokeLinecap="round" 
                className="transition-all duration-1000"
              />
            </svg>
            <span className="absolute text-sm font-black text-slate-800">{score}</span>
          </div>
          <div>
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className={`text-[9px] font-black uppercase tracking-widest ${config.iconColor}`}>{config.text}</span>
              <Sparkles size={10} className="text-amber-400" />
            </div>
            <h3 className="text-sm font-bold text-slate-800 leading-none">Sức khỏe tài chính</h3>
          </div>
        </div>
        <button className="p-2 bg-slate-50 text-slate-400 rounded-full active:scale-90 transition-transform">
          <ChevronRight size={18} />
        </button>
      </section>

      {/* KPI 2-Column Grid */}
      <section className="grid grid-cols-2 gap-3 premium-content-fade">
        <div className="bg-white p-3 rounded-2xl border border-slate-50 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 bg-emerald-50 text-emerald-500 rounded-lg"><ArrowUpRight size={14} /></div>
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Thu nhập</span>
          </div>
          <p className="text-base font-black text-slate-800 tracking-tight truncate">{formatCurrency(sum.income)}đ</p>
        </div>
        <div className="bg-white p-3 rounded-2xl border border-slate-50 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 bg-rose-50 text-rose-500 rounded-lg"><ArrowDownRight size={14} /></div>
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Chi tiêu</span>
          </div>
          <p className="text-base font-black text-slate-800 tracking-tight truncate">{formatCurrency(sum.expense)}đ</p>
        </div>
        <div className="col-span-2 bg-slate-900 p-3 rounded-2xl shadow-lg flex items-center justify-between">
          <div>
            <span className="text-[9px] font-black text-indigo-300 uppercase tracking-widest block mb-0.5">Số dư khả dụng</span>
            <p className="text-lg font-black text-white tracking-tighter">{formatCurrency(sum.balance)}đ</p>
          </div>
          <div className="p-2 bg-white/10 rounded-xl text-white"><Wallet size={18} /></div>
        </div>
      </section>

      {/* Simplified Trend Chart */}
      <section className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm premium-content-fade">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Activity size={16} className="text-indigo-600" />
            <h3 className="text-[10px] font-black text-slate-800 uppercase tracking-widest">Xu hướng dòng tiền</h3>
          </div>
          <div className="text-[8px] font-black bg-slate-50 text-slate-400 px-2 py-0.5 rounded-full uppercase">6 tháng</div>
        </div>
        <div className="h-44 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={roi.chartData} margin={{ top: 5, right: 0, left: -25, bottom: 0 }}>
              <defs>
                <linearGradient id="mColorIncome" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{fontSize: 9, fontWeight: 700, fill: '#94a3b8'}} axisLine={false} tickLine={false} dy={10} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="income" stroke="#10b981" strokeWidth={3} fill="url(#mColorIncome)" activeDot={{ r: 4 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Compact Transaction List */}
      <section className="space-y-3 premium-content-fade">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Gần đây</h3>
          <button className="text-[9px] font-black text-indigo-600 uppercase">Tất cả</button>
        </div>
        <div className="space-y-2">
          {recentTransactions.map((t) => {
            const category = categories.find(c => c.id === t.categoryId);
            return (
              <div key={t.id} onClick={() => onEdit(t)} className="bg-white p-3 rounded-xl flex items-center justify-between border border-slate-50 shadow-sm active:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${t.type === 'INCOME' ? 'bg-emerald-50 text-emerald-500' : 'bg-rose-50 text-rose-500'}`}>
                    {category ? (CATEGORY_ICONS[category.name] || CATEGORY_ICONS[category.iconName]) : <Zap size={14} />}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 leading-none mb-1">{category?.name || 'Khác'}</h4>
                    <p className="text-[9px] text-slate-400 font-bold uppercase">{format(new Date(t.date), 'dd/MM')} • {t.source}</p>
                  </div>
                </div>
                <p className={`text-xs font-black tracking-tight ${t.type === 'INCOME' ? 'text-emerald-500' : 'text-rose-500'}`}>
                  {t.type === 'INCOME' ? '+' : '-'}{formatCurrency(t.amount)}
                </p>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default Overview;
