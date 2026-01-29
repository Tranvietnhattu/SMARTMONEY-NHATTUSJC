
import React, { useState, useMemo, useEffect, useTransition } from 'react';
import { ChevronDown, Calendar as CalendarIcon, FileText, X, Save, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { Transaction, TransactionType, Category, PaymentSource } from '../types';
import { CATEGORY_ICONS, SOURCE_ICONS } from '../constants';
import { toVietnameseWords } from '../utils/helpers';

interface AddTransactionProps {
  onSave: (t: Transaction) => void;
  onCancel: () => void;
  categories: Category[];
  initialData?: Transaction | null;
}

const AddTransaction: React.FC<AddTransactionProps> = ({ onSave, onCancel, categories: allCategories, initialData }) => {
  const [type, setType] = useState<TransactionType>(initialData?.type || 'EXPENSE');
  const [amount, setAmount] = useState<string>(initialData?.amount?.toString() || '');
  const [date, setDate] = useState<string>(initialData ? initialData.date.split('T')[0] : new Date().toISOString().split('T')[0]);
  const [source, setSource] = useState<PaymentSource>(initialData?.source || 'Tiền mặt');
  const [note, setNote] = useState<string>(initialData?.note || '');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(initialData?.categoryId || '');
  const [isPending, startTransition] = useTransition();

  const filteredCategories = useMemo(() => 
    allCategories.filter(c => c.type === type), 
  [allCategories, type]);

  useEffect(() => {
    if (!initialData && !filteredCategories.find(c => c.id === selectedCategoryId)) {
      setSelectedCategoryId(filteredCategories[0]?.id || '');
    }
  }, [type, filteredCategories, initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || isNaN(Number(amount)) || !selectedCategoryId) return;

    const transaction: Transaction = {
      id: initialData?.id || crypto.randomUUID(),
      type,
      amount: Number(amount),
      categoryId: selectedCategoryId,
      date: new Date(date).toISOString(),
      source,
      note,
      createdAt: initialData?.createdAt || Date.now(),
      isLocked: initialData?.isLocked || false
    };

    onSave(transaction);
  };

  const amountNumber = Number(amount);
  const isValidAmount = !isNaN(amountNumber) && amountNumber > 0;

  return (
    <div className="flex flex-col h-full bg-white rounded-t-3xl overflow-hidden">
      {/* Header Mobile Compact */}
      <div className="p-4 flex items-center justify-between border-b border-slate-50 sticky top-0 bg-white/90 backdrop-blur-md z-20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-slate-900 text-white rounded-lg flex items-center justify-center">
            <FileText size={16} />
          </div>
          <h2 className="font-black text-base text-slate-800 tracking-tight">
            {initialData ? 'Sửa giao dịch' : 'Ghi chép mới'}
          </h2>
        </div>
        <button onClick={onCancel} className="p-2 bg-slate-50 text-slate-400 rounded-full active:scale-90 transition-transform">
          <X size={18}/>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-5 space-y-8 overflow-y-auto no-scrollbar">
        {/* Type Switcher - Optimized for Tap */}
        <div className="relative glass-tab p-1 rounded-xl flex w-full border border-slate-100">
          <div 
            className="absolute top-1 bottom-1 bg-white rounded-lg shadow-sm tab-pill-active z-0 active-pill-shadow"
            style={{ 
              width: 'calc(50% - 4px)', 
              transform: `translateX(${type === 'EXPENSE' ? '0' : '100%'})`
            }}
          />
          <button type="button" onClick={() => setType('EXPENSE')} className={`relative z-10 flex-1 py-2.5 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest transition-colors ${type === 'EXPENSE' ? 'text-rose-600' : 'text-slate-400'}`}>
            <ArrowDownLeft size={14} /> Chi tiêu
          </button>
          <button type="button" onClick={() => setType('INCOME')} className={`relative z-10 flex-1 py-2.5 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest transition-colors ${type === 'INCOME' ? 'text-emerald-600' : 'text-slate-400'}`}>
            <ArrowUpRight size={14} /> Thu nhập
          </button>
        </div>

        {/* Amount Input - Balanced Size */}
        <div className="space-y-2">
          <label className="text-[9px] font-black text-slate-300 uppercase tracking-widest px-1">Số tiền (đ)</label>
          <input
            type="number"
            inputMode="numeric"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0"
            className="w-full bg-transparent text-4xl font-black outline-none border-b-4 border-slate-50 focus:border-indigo-600 transition-all pb-2 tracking-tighter"
            autoFocus
          />
          {isValidAmount && (
            <p className="text-[10px] font-bold text-indigo-500 italic premium-content-fade">
              {toVietnameseWords(amountNumber)}
            </p>
          )}
        </div>

        {/* Categories - Compact Grid */}
        <div className="space-y-3">
          <label className="text-[9px] font-black text-slate-300 uppercase tracking-widest px-1">Danh mục</label>
          <div className="grid grid-cols-4 gap-2">
            {filteredCategories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategoryId(cat.id)}
                className={`flex flex-col items-center gap-2 p-3 rounded-xl transition-all border-2 active:scale-95 ${
                  selectedCategoryId === cat.id 
                    ? 'bg-slate-900 border-slate-900 text-white' 
                    : 'bg-white border-slate-50 text-slate-400'
                }`}
              >
                <div style={{ color: selectedCategoryId === cat.id ? 'white' : cat.color }}>
                  {CATEGORY_ICONS[cat.name] || CATEGORY_ICONS[cat.iconName]}
                </div>
                <span className="text-[8px] font-black uppercase tracking-tighter truncate w-full text-center">{cat.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Source & Date - Optimized for mobile width */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Nguồn tiền</label>
            <div className="relative">
              <select
                value={source}
                onChange={(e) => setSource(e.target.value as PaymentSource)}
                className="w-full bg-slate-50 rounded-xl py-3 pl-3 pr-8 text-xs font-bold appearance-none outline-none focus:ring-1 focus:ring-indigo-200"
              >
                <option value="Tiền mặt">Tiền mặt</option>
                <option value="Ví điện tử">Ví điện tử</option>
                <option value="Ngân hàng">Ngân hàng</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Thời gian</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-slate-50 rounded-xl py-3 px-3 text-xs font-bold outline-none focus:ring-1 focus:ring-indigo-200"
            />
          </div>
        </div>

        {/* Note */}
        <div className="space-y-2 pb-4">
          <label className="text-[9px] font-black text-slate-300 uppercase tracking-widest px-1">Ghi chú</label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Nội dung chi tiết..."
            rows={2}
            className="w-full bg-slate-50 rounded-xl p-3 text-xs font-bold outline-none focus:ring-1 focus:ring-indigo-200 resize-none"
          />
        </div>
      </form>

      {/* Action Footer */}
      <div className="p-4 border-t border-slate-50 bg-white/95 backdrop-blur-md flex gap-3 safe-bottom">
        <button onClick={onCancel} className="flex-1 bg-slate-100 text-slate-500 font-black py-3.5 rounded-xl uppercase text-[10px] tracking-widest active:scale-95 transition-transform">
          Hủy
        </button>
        <button onClick={handleSubmit} disabled={!amount || !selectedCategoryId} className="flex-[2] bg-slate-900 text-white font-black py-3.5 rounded-xl uppercase text-[10px] tracking-widest shadow-lg active:scale-95 transition-transform disabled:opacity-20">
          Lưu lại
        </button>
      </div>
    </div>
  );
};

export default AddTransaction;
