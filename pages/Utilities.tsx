import React, { useRef, useState, useEffect, useMemo } from 'react';
import { 
  Trash2, Download, Upload, Database, X, 
  ToggleLeft, ToggleRight, 
  ChevronDown, ChevronRight, Package, Settings, Info, Globe, Mail, AlertTriangle
} from 'lucide-react';
import { Transaction, Category, TransactionType, FinancialJar } from '../types';
import { getCycleRange, calculateSummary } from '../utils/financeLogic';
import { formatCurrency } from '../utils/helpers';
import CategoryManager from '../components/CategoryManager';

interface UtilitiesProps {
  transactions: Transaction[];
  incomeCategories: Category[];
  expenseCategories: Category[];
  cycleStartDay: number;
  isAutoLock: boolean;
  jars: FinancialJar[];
  onClear: () => void;
  onImport: (data: { transactions: Transaction[] }) => void;
  onAddCategory: (name: string, iconName: string, color: string, type: TransactionType) => void;
  onDeleteCategory: (id: string, type: TransactionType) => void;
  onSaveSettings: (startDay: number, autoLock: boolean) => void;
  onUpdateJar: (id: string, percentage: number) => void;
}

const AppBranding = () => (
  <div className="mt-12 mb-8 pt-8 border-t border-slate-100 flex flex-col items-center text-center space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-1000">
    <div className="space-y-1.5">
      <h2 className="text-sm font-black text-slate-800 tracking-[0.25em] uppercase">SMART MONEY v2.0</h2>
      <div className="flex items-center justify-center gap-2">
        <div className="h-[1px] w-4 bg-slate-200"></div>
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">NHATTU SJC Core</p>
        <div className="h-[1px] w-4 bg-slate-200"></div>
      </div>
    </div>
    
    <div className="max-w-[280px] space-y-4">
      <p className="text-[10px] font-medium text-slate-500 leading-relaxed italic">
        "Công cụ quản trị tài sản cá nhân tinh gọn, bảo mật và hiệu quả."
      </p>
      
      <div className="flex flex-col items-center gap-2">
        <a 
          href="https://nhattu.netlify.app/" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="flex items-center gap-1.5 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black transition-all hover:bg-indigo-600 hover:text-white group"
        >
          <Globe size={12} className="group-hover:rotate-12 transition-transform" />
          nhattu.netlify.app
        </a>
      </div>
    </div>

    <div className="px-6 py-4 bg-slate-50/50 rounded-3xl border border-slate-100/50 max-w-sm">
      <div className="flex items-center justify-center gap-2 mb-1.5">
        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></div>
        <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Bảo mật cục bộ</p>
      </div>
      <p className="text-[9px] font-bold text-slate-400 leading-normal">
        Toàn bộ dữ liệu được lưu trữ trực tiếp trên thiết bị của bạn. Không có thông tin nhạy cảm nào được tải lên máy chủ.
      </p>
    </div>

    <div className="pt-4">
      <p className="text-[8px] font-black text-slate-300 uppercase tracking-[0.2em]">
        © 2026 SMART MONEY - NHATTU SJC.
      </p>
    </div>
  </div>
);

const Utilities: React.FC<UtilitiesProps> = ({ 
  transactions, 
  incomeCategories,
  expenseCategories,
  cycleStartDay, 
  isAutoLock, 
  jars,
  onClear, 
  onImport, 
  onAddCategory,
  onDeleteCategory,
  onSaveSettings,
  onUpdateJar
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    categories: false,
    jars: true,
    system: false
  });

  const [localStartDay, setLocalStartDay] = useState(cycleStartDay);
  const [localAutoLock, setLocalAutoLock] = useState(isAutoLock);

  useEffect(() => {
    setLocalStartDay(cycleStartDay);
    setLocalAutoLock(isAutoLock);
  }, [cycleStartDay, isAutoLock]);

  const currentPeriod = useMemo(() => getCycleRange(new Date(), cycleStartDay), [cycleStartDay]);
  const summary = useMemo(() => calculateSummary(transactions, currentPeriod), [transactions, currentPeriod]);
  const totalPercentage = jars.reduce((acc, jar) => acc + jar.percentage, 0);

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleApplySettings = () => {
    onSaveSettings(localStartDay, localAutoLock);
  };

  const handleJarChange = (id: string, delta: number) => {
    const jar = jars.find(j => j.id === id);
    if (jar) {
      const newVal = Math.max(0, jar.percentage + delta);
      onUpdateJar(id, newVal);
    }
  };

  const handleHardClear = () => {
    if (window.confirm('Xóa vĩnh viễn toàn bộ dữ liệu giao dịch và cấu hình? Thao tác này không thể hoàn tác.')) {
      onClear();
    }
  };

  const handleExport = () => {
    const data = {
      transactions,
      exportDate: new Date().toISOString(),
      version: '2.0'
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const result = event.target?.result as string;
        const data = JSON.parse(result);
        if (data && data.transactions) {
          onImport(data);
          alert('Nhập dữ liệu thành công!');
        }
      } catch (err) {
        alert('Lỗi định dạng file.');
      }
    };
    reader.readAsText(file);
  };

  const AccordionHeader = ({ id, icon: Icon, title, isOpen }: { id: string, icon: any, title: string, isOpen: boolean }) => (
    <button 
      onClick={() => toggleSection(id)}
      className="w-full flex items-center justify-between py-5 border-b border-slate-100 group transition-all"
    >
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-xl transition-colors ${isOpen ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'}`}>
          <Icon size={18} />
        </div>
        <span className={`text-[11px] font-black uppercase tracking-[0.15em] ${isOpen ? 'text-slate-800' : 'text-slate-400 group-hover:text-slate-600'}`}>
          {title}
        </span>
      </div>
      {isOpen ? <ChevronDown size={18} className="text-indigo-600" /> : <ChevronRight size={18} className="text-slate-300" />}
    </button>
  );

  return (
    <div className="flex flex-col gap-4 animate-in fade-in duration-500 max-w-2xl mx-auto w-full pb-20 pt-4 px-2">
      <div className="mb-4">
        <h2 className="font-black text-2xl text-slate-800 tracking-tight">Tiện ích hệ thống</h2>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Cấu hình & Quản trị dữ liệu</p>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden px-6">
        
        <AccordionHeader id="categories" icon={Package} title="Danh mục phân loại" isOpen={openSections.categories} />
        {openSections.categories && (
          <CategoryManager 
            incomeCategories={incomeCategories}
            expenseCategories={expenseCategories}
            onAddCategory={onAddCategory}
            onDeleteCategory={onDeleteCategory}
          />
        )}

        <AccordionHeader id="jars" icon={Database} title="Hạn mức 6 hũ tài chính" isOpen={openSections.jars} />
        {openSections.jars && (
          <div className="py-6 space-y-6 animate-in slide-in-from-top-2 duration-300">
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Tỷ trọng hiện tại</span>
                <div className="flex items-center gap-2">
                    {totalPercentage !== 100 && <AlertTriangle size={12} className="text-rose-500 animate-bounce" />}
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${totalPercentage === 100 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                        {totalPercentage}% / 100%
                    </span>
                </div>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full flex overflow-hidden">
                {jars.map(jar => (
                  <div key={jar.id} style={{ width: `${jar.percentage}%`, backgroundColor: jar.color }} className="h-full border-r border-white/20 transition-all duration-500" />
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {jars.map(jar => {
                const jarBudget = (summary.income * jar.percentage) / 100;
                return (
                  <div key={jar.id} className={`p-4 border border-slate-100 rounded-3xl flex flex-col gap-2 bg-white hover:border-indigo-100 transition-all`}>
                    <div className="flex items-center justify-between">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: jar.color }}></div>
                      <span className="text-[10px] font-black text-slate-400">{jar.percentage}%</span>
                    </div>
                    <div>
                      <h4 className="text-[10px] font-black text-slate-800 truncate uppercase">{jar.name}</h4>
                      <p className="text-[9px] font-bold text-slate-400 truncate mt-0.5">Hạn mức: {formatCurrency(jarBudget)}đ</p>
                    </div>
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-50">
                      <button onClick={() => handleJarChange(jar.id, -5)} className="w-8 h-8 flex items-center justify-center bg-slate-50 border border-slate-100 rounded-xl text-slate-500 hover:bg-rose-50 hover:text-rose-600 active:scale-90 font-black">-</button>
                      <button onClick={() => handleJarChange(jar.id, 5)} className="w-8 h-8 flex items-center justify-center bg-slate-50 border border-slate-100 rounded-xl text-slate-500 hover:bg-emerald-50 hover:text-emerald-600 active:scale-90 font-black">+</button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <AccordionHeader id="system" icon={Settings} title="Thiết lập logic & Bảo mật" isOpen={openSections.system} />
        {openSections.system && (
          <div className="py-6 space-y-8 animate-in slide-in-from-top-2 duration-300">
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black text-slate-800 uppercase tracking-widest">Ngày chốt chu kỳ</p>
                </div>
                <div className="flex items-center gap-3">
                  <input type="range" min="1" max="28" value={localStartDay} onChange={(e) => setLocalStartDay(parseInt(e.target.value))} className="accent-indigo-600 w-24 h-1.5" />
                  <span className="w-9 h-9 flex items-center justify-center bg-indigo-50 text-indigo-600 font-black rounded-xl text-xs">{localStartDay}</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black text-slate-800 uppercase tracking-widest">Khóa chỉnh sửa chu kỳ cũ</p>
                </div>
                <button onClick={() => setLocalAutoLock(!localAutoLock)} className="text-indigo-600 transition-transform active:scale-90">
                  {localAutoLock ? <ToggleRight size={36} /> : <ToggleLeft size={36} className="text-slate-200" />}
                </button>
              </div>

              <button onClick={handleApplySettings} className="w-full bg-slate-900 text-white font-black py-4 rounded-2xl uppercase text-[10px] tracking-widest hover:bg-black transition-all shadow-lg">Lưu cấu hình</button>
            </div>

            <div className="pt-8 border-t border-slate-100 space-y-4">
              <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em]">Dữ liệu</p>
              <div className="grid grid-cols-2 gap-4">
                <button onClick={handleExport} className="flex items-center justify-center gap-2 p-4 bg-slate-50 rounded-2xl hover:bg-indigo-50 transition-all group border border-slate-100">
                  <Download size={16} className="text-indigo-600" />
                  <span className="text-[10px] font-black text-slate-600 group-hover:text-indigo-600 uppercase">Sao lưu</span>
                </button>
                <button onClick={() => fileInputRef.current?.click()} className="flex items-center justify-center gap-2 p-4 bg-slate-50 rounded-2xl hover:bg-emerald-50 transition-all group border border-slate-100">
                  <Upload size={16} className="text-emerald-600" />
                  <span className="text-[10px] font-black text-slate-600 group-hover:text-emerald-600 uppercase">Khôi phục</span>
                  <input type="file" ref={fileInputRef} onChange={handleImport} accept=".json" className="hidden" />
                </button>
              </div>
              <button onClick={handleHardClear} className="w-full flex items-center justify-center gap-2 p-4 bg-rose-50 rounded-2xl border border-rose-100 hover:bg-rose-100 transition-all group">
                <Trash2 size={18} className="text-rose-600" />
                <span className="text-[10px] font-black text-rose-600 uppercase tracking-widest">Xóa trắng toàn bộ ứng dụng</span>
              </button>
            </div>
          </div>
        )}

      </div>

      <div className="px-5 py-5 flex items-start gap-4 bg-indigo-50/50 rounded-[2rem] border border-indigo-100/50 mt-4">
        <Info size={20} className="text-indigo-600 shrink-0 mt-0.5" />
        <p className="text-[10px] font-bold text-indigo-700/80 leading-relaxed italic">
          Ghi chú: Dữ liệu của bạn được lưu trữ an toàn trong Local Storage. Hãy sao lưu định kỳ để tránh mất mát khi xóa cache trình duyệt.
        </p>
      </div>

      <AppBranding />
    </div>
  );
};

export default Utilities;