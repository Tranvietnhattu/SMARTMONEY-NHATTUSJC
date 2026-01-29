import React, { useMemo } from 'react';
import { Transaction, Category, FinancialJar } from '../types';
import { formatCurrency } from '../utils/helpers';
import { AlertCircle, CheckCircle2, TrendingUp, Wallet, Coffee, Sparkles, Heart, Landmark, GraduationCap } from 'lucide-react';

interface Props {
  transactions: Transaction[];
  categories: Category[];
  jars: FinancialJar[];
  income: number;
}

const JarIcon = ({ label, size = 14, className = "" }: { label: string, size?: number, className?: string }) => {
  switch (label) {
    case 'NEC': return <Wallet size={size} className={className} />;
    case 'EDU': return <GraduationCap size={size} className={className} />;
    case 'LTSS': return <Landmark size={size} className={className} />;
    case 'PLAY': return <Coffee size={size} className={className} />;
    case 'FFA': return <TrendingUp size={size} className={className} />;
    case 'GIVE': return <Heart size={size} className={className} />;
    default: return <Sparkles size={size} className={className} />;
  }
};

const FinancialHealthReport: React.FC<Props> = ({ transactions, categories, jars, income }) => {
  const activeJars = useMemo(() => jars.filter(j => j.percentage > 0), [jars]);
  
  const stats = useMemo(() => {
    if (income <= 0) {
      const emptyStats: Record<string, number> = {};
      jars.forEach(j => emptyStats[j.label] = 0);
      return emptyStats;
    }

    const getJarLabelForCategory = (catId: string) => {
      const cat = categories.find(c => c.id === catId);
      if (!cat) return 'NEC';
      const name = cat.name.toLowerCase();
      
      if (name.includes('ăn') || name.includes('hóa đơn') || name.includes('nhà') || name.includes('điện') || name.includes('khác')) return 'NEC';
      if (name.includes('giải trí') || name.includes('mua sắm') || name.includes('cafe') || name.includes('du lịch')) return 'PLAY';
      if (name.includes('học') || name.includes('giáo dục')) return 'EDU';
      if (name.includes('đầu tư') || name.includes('tự do')) return 'FFA';
      if (name.includes('tiết kiệm') || name.includes('tích lũy')) return 'LTSS';
      if (name.includes('từ thiện') || name.includes('cho đi')) return 'GIVE';
      return 'NEC';
    };

    const totals = transactions.reduce((acc, t) => {
      if (t.type === 'EXPENSE') {
        const label = getJarLabelForCategory(t.categoryId);
        acc[label] = (acc[label] || 0) + t.amount;
      }
      return acc;
    }, {} as Record<string, number>);

    const result: Record<string, number> = {};
    jars.forEach(jar => {
      const spent = totals[jar.label] || 0;
      result[jar.label] = Math.round((spent / income) * 100);
    });

    return result;
  }, [transactions, categories, income, jars]);

  return (
    <div className="bg-white p-5 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-5">
      <div className="flex items-center justify-between px-1">
        <div>
           <h3 className="text-sm font-black text-slate-800 leading-none mb-1">Báo cáo chỉ số tiêu dùng</h3>
        </div>
        <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
           <CheckCircle2 size={18} />
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {activeJars.map((jar) => {
          const currentRate = stats[jar.label] || 0;
          const isWarning = currentRate > jar.percentage;
          
          return (
            <div key={jar.id} className="flex flex-col gap-2 p-3 bg-slate-50/50 rounded-2xl border border-slate-100 group transition-all hover:bg-white hover:shadow-md">
              <div className="flex items-center justify-between">
                <JarIcon label={jar.label} className="text-slate-400" />
                {isWarning && <AlertCircle size={10} className="text-rose-500 animate-pulse" />}
              </div>
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase truncate mb-0.5">{jar.name}</p>
                <div className="flex items-baseline gap-1">
                  <p className="text-sm font-black text-slate-800">{currentRate}%</p>
                  <p className="text-[8px] font-bold text-slate-300">/ {jar.percentage}%</p>
                </div>
              </div>
              <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-1000 ${isWarning ? 'bg-rose-500' : 'bg-emerald-500'}`}
                  style={{ width: `${Math.min(100, (currentRate / (jar.percentage || 1)) * 100)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="pt-2 border-t border-slate-50 flex items-center justify-between">
         <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest italic">Hệ thống phân tích - NHATTU SJC</p>
         <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
            <span className="text-[8px] font-bold text-slate-400 uppercase">Dữ liệu thực tế</span>
         </div>
      </div>
    </div>
  );
};

export default FinancialHealthReport;