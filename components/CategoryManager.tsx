
import React, { useState } from 'react';
import { ArrowUpCircle, ArrowDownCircle, Plus, Trash2, X } from 'lucide-react';
import { Category, TransactionType } from '../types';
import { AVAILABLE_COLORS } from '../constants';

interface CategoryManagerProps {
  incomeCategories: Category[];
  expenseCategories: Category[];
  onAddCategory: (name: string, iconName: string, color: string, type: TransactionType) => void;
  onDeleteCategory: (id: string, type: TransactionType) => void;
}

const CategoryManager: React.FC<CategoryManagerProps> = ({
  incomeCategories,
  expenseCategories,
  onAddCategory,
  onDeleteCategory
}) => {
  const [showCatForm, setShowCatForm] = useState<{show: boolean, type: TransactionType}>({show: false, type: 'EXPENSE'});
  const [newCatName, setNewCatName] = useState('');
  const [newCatColor, setNewCatColor] = useState(AVAILABLE_COLORS[0]);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCatName.trim()) {
      onAddCategory(newCatName.trim(), 'MoreHorizontal', newCatColor, showCatForm.type);
      setNewCatName('');
      setShowCatForm({show: false, type: 'EXPENSE'});
    }
  };

  const handleDelete = (cat: Category) => {
    if (window.confirm(`Bạn có chắc muốn xóa danh mục "${cat.name}"? Các giao dịch hiện có sẽ được chuyển sang mục "Khác".`)) {
      onDeleteCategory(cat.id, cat.type);
    }
  };

  return (
    <div className="py-6 space-y-8 animate-in slide-in-from-top-2 duration-300 relative">
      {/* Thu nhập */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-1.5">
            <ArrowUpCircle size={14} /> Thu nhập
          </p>
          <button 
            onClick={() => setShowCatForm({show: true, type: 'INCOME'})}
            className="p-1 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-600 hover:text-white transition-all"
          >
            <Plus size={14} />
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {incomeCategories.map(cat => (
            <div key={cat.id} className="group relative flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-full hover:border-indigo-200 transition-all cursor-default">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }}></div>
              <span className="text-[10px] font-bold text-slate-600">{cat.name}</span>
              {!cat.isDefault && (
                <button 
                  onClick={() => handleDelete(cat)}
                  className="ml-1 text-rose-400 hover:text-rose-600 transition-colors"
                >
                  <Trash2 size={10} />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Chi tiêu */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-[9px] font-black text-rose-500 uppercase tracking-widest flex items-center gap-1.5">
            <ArrowDownCircle size={14} /> Chi tiêu
          </p>
          <button 
            onClick={() => setShowCatForm({show: true, type: 'EXPENSE'})}
            className="p-1 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-600 hover:text-white transition-all"
          >
            <Plus size={14} />
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {expenseCategories.map(cat => (
            <div key={cat.id} className="group relative flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-full hover:border-indigo-200 transition-all cursor-default">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }}></div>
              <span className="text-[10px] font-bold text-slate-600">{cat.name}</span>
              {!cat.isDefault && (
                <button 
                  onClick={() => handleDelete(cat)}
                  className="ml-1 text-rose-400 hover:text-rose-600 transition-colors"
                >
                  <Trash2 size={10} />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {showCatForm.show && (
        <div className="absolute inset-x-0 -top-4 z-40 bg-white p-4 border border-slate-100 shadow-2xl rounded-3xl animate-in slide-in-from-bottom-2">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[10px] font-black uppercase text-indigo-600">Thêm mục {showCatForm.type === 'INCOME' ? 'Thu' : 'Chi'}</p>
            <button onClick={() => setShowCatForm({show: false, type: 'EXPENSE'})} className="p-1.5 bg-slate-100 text-slate-400 rounded-full"><X size={14} /></button>
          </div>
          <form onSubmit={handleAddSubmit}>
            <input 
              type="text" 
              value={newCatName} 
              onChange={(e) => setNewCatName(e.target.value)} 
              placeholder="Tên danh mục..." 
              className="w-full p-3 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-indigo-100 font-bold text-xs mb-4" 
              autoFocus 
              required
            />
            <div className="flex gap-2 mb-4 overflow-x-auto pb-2 no-scrollbar">
              {AVAILABLE_COLORS.map(color => (
                <button 
                  key={color} 
                  type="button" 
                  onClick={() => setNewCatColor(color)} 
                  className={`w-6 h-6 rounded-full shrink-0 border-2 ${newCatColor === color ? 'border-slate-800 scale-110' : 'border-transparent'}`} 
                  style={{ backgroundColor: color }} 
                />
              ))}
            </div>
            <button 
              type="submit"
              className="w-full bg-indigo-600 text-white font-black py-3 rounded-xl uppercase text-[9px] tracking-widest shadow-lg shadow-indigo-100"
            >
              Xác nhận
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default CategoryManager;
