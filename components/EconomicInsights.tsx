import React, { useMemo } from 'react';
import { ShieldAlert, Zap, TrendingUp, Search, AlertTriangle } from 'lucide-react';
import { formatCurrency } from '../utils/helpers';
import { Transaction, FinancialJar } from '../types';
import { getCycleRange } from '../utils/financeLogic';

interface Props {
  transactions: Transaction[];
  jars: FinancialJar[];
  balance: number;
  onUpdateJar?: (id: string, percentage: number) => void;
  cycleStartDay?: number;
}

const KEYWORDS_LEAK = ['lãng phí', 'quên', 'phạt', 'mua hố', 'ngẫu hứng', 'cafe', 'shopping', 'ăn vặt', 'trà sữa'];

const EconomicInsights: React.FC<Props> = ({ 
  transactions, 
  jars, 
  onUpdateJar, 
  cycleStartDay = 1 
}) => {
  const currentRange = useMemo(() => getCycleRange(new Date(), cycleStartDay), [cycleStartDay]);

  const auditResult = useMemo(() => {
    const leakTransactions = transactions.filter(t => {
      const txDate = new Date(t.date);
      if (txDate < currentRange.start || txDate > currentRange.end) return false;
      if (t.type !== 'EXPENSE') return false;
      
      const note = t.note?.toLowerCase() || '';
      return KEYWORDS_LEAK.some(kw => note.includes(kw));
    });

    const totalLeak = leakTransactions.reduce((sum, t) => sum + t.amount, 0);
    return {
      totalLeak,
      count: leakTransactions.length
    };
  }, [transactions, currentRange]);

  const handleOptimize = () => {
    if (!onUpdateJar) return;
    
    const playJar = jars.find(j => j.label === 'PLAY');
    const ffaJar = jars.find(j => j.label === 'FFA');

    if (!playJar || !ffaJar) return;

    const penaltyValue = 5; 
    if (playJar.percentage >= penaltyValue) {
      onUpdateJar(playJar.id, playJar.percentage - penaltyValue);
      onUpdateJar(ffaJar.id, ffaJar.percentage + penaltyValue);
      alert(`Hệ thống thực thi: Chuyển ${penaltyValue}% từ hũ Hưởng thụ sang hũ Đầu tư.`);
    } else {
      alert("Hạn mức hũ Hưởng thụ không đủ để thực hiện khấu trừ.");
    }
  };

  if (auditResult.totalLeak === 0) {
    return (
      <div className="bg-emerald-50 border border-emerald-100 p-5 rounded-[2rem] flex items-center gap-4">
        <div className="p-2.5 bg-emerald-500 text-white rounded-2xl">
          <ShieldAlert size={20} />
        </div>
        <div>
          <h3 className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Hệ thống: Ổn định</h3>
          <p className="text-[11px] font-bold text-slate-700">Không phát hiện rò rỉ bất thường trong chu kỳ này.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 text-white p-6 rounded-[2.5rem] shadow-xl relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-8 opacity-5 -rotate-12">
        <Search size={100} />
      </div>

      <div className="relative z-10 space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-indigo-500 rounded-lg">
              <Zap size={14} className="text-white fill-current" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-300">Hệ thống Phân tích - NHATTU SJC</span>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-1 bg-rose-500/20 border border-rose-500/30 rounded-full">
            <AlertTriangle size={10} className="text-rose-400" />
            <span className="text-[8px] font-black uppercase text-rose-400">Phát hiện rủi ro</span>
          </div>
        </div>

        <div className="space-y-1">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Tổng rò rỉ tài chính dự kiến</p>
          <h4 className="text-3xl font-black text-rose-400 tracking-tighter">
            {formatCurrency(auditResult.totalLeak)}đ
          </h4>
          <p className="text-[10px] font-medium text-slate-400 italic">
            Dựa trên {auditResult.count} giao dịch có dấu hiệu không tối ưu.
          </p>
        </div>

        <div className="pt-2">
          <button 
            onClick={handleOptimize}
            className="w-full bg-white text-slate-900 font-black py-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg hover:bg-indigo-50 transition-all active:scale-[0.98] uppercase text-[10px] tracking-widest"
          >
            <TrendingUp size={16} className="text-indigo-600" />
            Tối ưu hóa ngân sách
          </button>
        </div>
      </div>
    </div>
  );
};

export default EconomicInsights;