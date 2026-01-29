import React, { useState, useMemo } from 'react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, isAfter, differenceInCalendarDays } from 'date-fns';
import { vi } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Info, Edit3, Trash2, Sprout, AlertCircle, Sparkles } from 'lucide-react';
import { Transaction, Category } from '../types';
import { formatCurrency } from '../utils/helpers';
import { CATEGORY_ICONS } from '../constants';

interface CalendarProps {
  transactions: Transaction[];
  categories: Category[];
  onEdit: (t: Transaction) => void;
  onDelete: (id: string) => void;
}

const Calendar: React.FC<CalendarProps> = ({ transactions, categories, onEdit, onDelete }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(new Date());

  const today = new Date();

  const totalBalance = useMemo(() => {
    return transactions.reduce((acc, t) => acc + (t.type === 'INCOME' ? t.amount : -t.amount), 0);
  }, [transactions]);

  const averageDailyBurn = useMemo(() => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);
    const recentExpenses = transactions.filter(t => t.type === 'EXPENSE' && new Date(t.date) >= thirtyDaysAgo);
    return recentExpenses.length > 0 ? recentExpenses.reduce((acc, t) => acc + t.amount, 0) / 30 : 0;
  }, [transactions]);

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const dailyStats = useMemo(() => {
    const stats: Record<string, { income: number, expense: number, hasLargeSpend: boolean, count: number }> = {};
    transactions.forEach(t => {
      const dateKey = format(new Date(t.date), 'yyyy-MM-dd');
      if (!stats[dateKey]) stats[dateKey] = { income: 0, expense: 0, hasLargeSpend: false, count: 0 };
      if (t.type === 'INCOME') stats[dateKey].income += t.amount;
      else {
        stats[dateKey].expense += t.amount;
        if (t.amount >= 1000000) stats[dateKey].hasLargeSpend = true;
      }
      stats[dateKey].count++;
    });
    return stats;
  }, [transactions]);

  const dayTransactions = useMemo(() => {
    if (!selectedDay) return [];
    return transactions
      .filter(t => isSameDay(new Date(t.date), selectedDay))
      .sort((a, b) => b.createdAt - a.createdAt);
  }, [transactions, selectedDay]);

  const weekDays = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

  return (
    <div className="flex flex-col gap-6 animate-in slide-in-from-right duration-300 max-w-4xl mx-auto w-full">
      <div className="bg-white p-4 rounded-[2.5rem] shadow-sm border border-slate-100">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 px-2 pt-2">
          <div>
            <h2 className="font-black text-xl text-slate-800 capitalize flex items-center gap-2">
              {format(currentMonth, 'MMMM, yyyy', { locale: vi })}
              <Sparkles size={18} className="text-amber-400" />
            </h2>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">
              Sổ tay thu chi cá nhân
            </p>
          </div>
          <div className="flex bg-slate-100 p-1 rounded-2xl w-fit">
            <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-2 hover:bg-white rounded-xl transition-all">
              <ChevronLeft size={18} className="text-slate-600" />
            </button>
            <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-2 hover:bg-white rounded-xl transition-all">
              <ChevronRight size={18} className="text-slate-600" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 mb-4">
          {weekDays.map(day => (
            <div key={day} className="text-center text-[10px] font-black text-slate-300 py-2 uppercase tracking-widest">{day}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1.5 md:gap-2">
          {days.map((day, idx) => {
            const dateKey = format(day, 'yyyy-MM-dd');
            const stats = dailyStats[dateKey];
            const isSelected = selectedDay && isSameDay(day, selectedDay);
            const isToday = isSameDay(day, today);
            const isCurrentMonth = isSameMonth(day, currentMonth);
            const isFuture = isAfter(day, today);
            
            let predictedBalance = 0;
            if (isFuture) {
              const diffDays = differenceInCalendarDays(day, today);
              predictedBalance = totalBalance - (diffDays * averageDailyBurn);
            }

            return (
              <button 
                key={idx} 
                onClick={() => setSelectedDay(day)}
                className={`min-h-[60px] md:min-h-[70px] p-1.5 flex flex-col items-center justify-start relative rounded-2xl transition-all 
                  ${!isCurrentMonth ? 'opacity-20' : ''} 
                  ${isSelected ? 'bg-indigo-600 text-white shadow-xl scale-105 z-10' : 'bg-transparent text-slate-700 hover:bg-slate-50'}
                  ${isToday && !isSelected ? 'border-2 border-indigo-100 shadow-[0_0_15px_rgba(79,70,229,0.15)]' : ''}
                `}
              >
                <span className={`text-[10px] font-black mb-1 ${isToday && !isSelected ? 'text-indigo-600' : ''}`}>
                  {format(day, 'd')}
                </span>
                
                <div className="flex flex-col gap-0.5 items-center mt-auto pb-1">
                  {!isFuture ? (
                    <>
                      {stats?.income > 0 && <div className="w-1 h-1 bg-emerald-400 rounded-full"></div>}
                      {stats?.expense > 0 && <div className="w-1 h-1 bg-rose-400 rounded-full"></div>}
                      {(!stats || stats.count === 0) && isCurrentMonth && <Sprout size={10} className="text-emerald-500 opacity-60" />}
                    </>
                  ) : (
                    <span className={`text-[7px] font-black opacity-60 uppercase tracking-tighter ${predictedBalance < 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                      {formatCurrency(Math.max(0, predictedBalance))}
                    </span>
                  )}
                </div>

                {stats?.hasLargeSpend && !isFuture && (
                  <div className="absolute top-1 right-1">
                    <AlertCircle size={8} className="text-orange-500 fill-orange-500" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="w-full bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col h-full min-h-[300px] animate-in slide-in-from-bottom duration-300">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <CalendarIcon size={20} />
            </div>
            <div>
              <h3 className="font-black text-slate-800 leading-tight">Giao dịch trong ngày</h3>
              <p className="text-xs font-bold text-slate-400">
                {selectedDay ? format(selectedDay, 'eeee, dd/MM/yyyy', { locale: vi }) : 'Chọn ngày'}
              </p>
            </div>
          </div>
          {dayTransactions.length > 0 && (
            <span className="text-[10px] font-black bg-slate-100 px-2 py-1 rounded-full text-slate-500">
              {dayTransactions.length} mục
            </span>
          )}
        </div>
        
        <div className="flex-1 space-y-3 overflow-y-auto no-scrollbar max-h-[400px]">
          {dayTransactions.length > 0 ? (
            dayTransactions.map(t => {
              const category = categories.find(c => c.id === t.categoryId);
              return (
                <div key={t.id} className="group flex flex-col gap-2 p-4 bg-slate-50 hover:bg-white hover:shadow-xl rounded-[1.5rem] border border-slate-100 transition-all">
                  <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className={`p-2 rounded-xl flex-shrink-0 ${t.type === 'INCOME' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                              {category ? (CATEGORY_ICONS[category.name] || CATEGORY_ICONS[category.iconName]) : <Info size={16} />}
                          </div>
                          <div className="min-w-0">
                              <p className="text-xs font-black text-slate-700 truncate">{category?.name || 'Khác'}</p>
                              <p className="text-[10px] font-bold text-slate-400 truncate">{t.note || 'Không ghi chú'}</p>
                          </div>
                      </div>
                      <p className={`font-black text-xs whitespace-nowrap ml-2 ${t.type === 'INCOME' ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {t.type === 'INCOME' ? '+' : '-'}{formatCurrency(t.amount)}
                      </p>
                  </div>
                  <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 mt-1 pt-2 border-t border-slate-200/50">
                      <button 
                          onClick={(e) => { e.stopPropagation(); onEdit(t); }} 
                          className="flex items-center gap-1 px-3 py-1.5 text-[9px] font-black uppercase text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      >
                          <Edit3 size={12} /> Sửa
                      </button>
                      <button 
                          onClick={(e) => { e.stopPropagation(); onDelete(t.id); }} 
                          className="flex items-center gap-1 px-3 py-1.5 text-[9px] font-black uppercase text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      >
                          <Trash2 size={12} /> Xóa
                      </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-slate-300 gap-4">
              <div className="p-4 bg-slate-50 rounded-full">
                <Sprout size={32} className="text-slate-200" />
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest">Trống</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Calendar;