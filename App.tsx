import React, { useState } from 'react';
import Navigation from './components/Navigation';
import Overview from './pages/Overview';
import Calendar from './pages/Calendar';
import AddTransaction from './pages/AddTransaction';
import AIAssistant from './pages/AIAssistant';
import Utilities from './pages/Utilities';
import { useFinanceStore } from './store/useFinanceStore';
import { Transaction } from './types';
import { AlertCircle } from 'lucide-react';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  const { 
    transactions, 
    categories, 
    incomeCategories,
    expenseCategories,
    cycleStartDay, 
    isAutoLock,
    jars,
    saveSettings, 
    updateJarPercentage,
    addTransaction, 
    updateTransaction,
    deleteTransaction,
    addCategory,
    deleteCategory,
    clearData
  } = useFinanceStore();

  const handleTabChange = (tab: string) => {
    if (tab === 'add') {
        setEditingTransaction(null);
        setShowAddModal(true);
    }
    else setActiveTab(tab);
  };

  const handleSaveTransaction = (t: Transaction) => {
    if (editingTransaction) updateTransaction(t);
    else addTransaction(t);
    setShowAddModal(false);
    setEditingTransaction(null);
  };

  const renderContentSafe = () => {
    try {
      switch (activeTab) {
        case 'overview':
          return (
            <Overview 
              transactions={transactions} 
              categories={categories} 
              jars={jars} 
              cycleStartDay={cycleStartDay} 
              onEdit={setEditingTransaction} 
              onDelete={deleteTransaction}
              onUpdateJar={updateJarPercentage}
            />
          );
        case 'calendar':
          return <Calendar transactions={transactions} categories={categories} onEdit={setEditingTransaction} onDelete={deleteTransaction} />;
        case 'ai':
          return <AIAssistant />;
        case 'settings':
          return (
            <Utilities 
              transactions={transactions} 
              incomeCategories={incomeCategories}
              expenseCategories={expenseCategories}
              cycleStartDay={cycleStartDay}
              isAutoLock={isAutoLock}
              jars={jars}
              onClear={clearData} 
              onImport={() => {}} 
              onAddCategory={addCategory}
              onDeleteCategory={deleteCategory}
              onSaveSettings={saveSettings}
              onUpdateJar={updateJarPercentage}
            />
          );
        default:
          return (
            <Overview 
              transactions={transactions} 
              categories={categories} 
              jars={jars} 
              cycleStartDay={cycleStartDay} 
              onEdit={setEditingTransaction} 
              onDelete={deleteTransaction}
              onUpdateJar={updateJarPercentage}
            />
          );
      }
    } catch (e) {
      return (
        <div className="p-10 text-center">
          <AlertCircle className="mx-auto text-rose-500 mb-4" size={48} />
          <h2 className="font-black text-slate-800">Lỗi hiển thị dữ liệu</h2>
          <button onClick={() => window.location.reload()} className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-xl">Tải lại</button>
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center">
      <div className="w-full max-w-5xl min-h-screen flex flex-col relative bg-slate-50">
        <main className="flex-1 px-4 pb-24 pt-6">{renderContentSafe()}</main>
        <div className="fixed bottom-0 left-0 right-0 z-50"><Navigation activeTab={activeTab} onTabChange={handleTabChange} /></div>
        {showAddModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
            <div className="w-full max-w-2xl bg-white rounded-3xl overflow-hidden shadow-2xl">
              <AddTransaction onSave={handleSaveTransaction} onCancel={() => setShowAddModal(false)} categories={categories} initialData={editingTransaction} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;