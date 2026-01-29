import { useState, useEffect } from 'react';
import { Transaction, Category, TransactionType, FinancialJar } from '../types';

const TX_KEY = 'moneymind_transactions_v2';
const CAT_IN_KEY = 'income_categories_v2';
const CAT_EX_KEY = 'expense_categories_v2';
const SETTINGS_KEY = 'moneymind_settings_v2';
const JARS_KEY = 'moneymind_jars_v2';

const DEFAULT_IN: Category[] = [
  { id: 'in_1', name: 'Lương', iconName: 'Briefcase', color: '#34D399', type: 'INCOME', isDefault: true },
  { id: 'in_2', name: 'Đầu tư', iconName: 'TrendingUp', color: '#2DD4BF', type: 'INCOME', isDefault: true },
  { id: 'in_3', name: 'Khác', iconName: 'MoreHorizontal', color: '#94A3B8', type: 'INCOME', isDefault: true }
];
const DEFAULT_EX: Category[] = [
  { id: 'ex_1', name: 'Ăn uống', iconName: 'Utensils', color: '#F87171', type: 'EXPENSE', isDefault: true },
  { id: 'ex_2', name: 'Mua sắm', iconName: 'ShoppingBag', color: '#FB923C', type: 'EXPENSE', isDefault: true },
  { id: 'ex_3', name: 'Hóa đơn', iconName: 'Receipt', color: '#60A5FA', type: 'EXPENSE', isDefault: true },
  { id: 'ex_4', name: 'Giải trí', iconName: 'Gamepad2', color: '#A78BFA', type: 'EXPENSE', isDefault: true },
  { id: 'ex_5', name: 'Khác', iconName: 'MoreHorizontal', color: '#94A3B8', type: 'EXPENSE', isDefault: true }
];

const DEFAULT_JARS: FinancialJar[] = [
  { id: '1', name: 'Thiết yếu', label: 'NEC', percentage: 55, color: '#6366f1', description: 'Chi phí sinh hoạt' },
  { id: '2', name: 'Giáo dục', label: 'EDU', percentage: 10, color: '#f59e0b', description: 'Học tập' },
  { id: '3', name: 'Tiết kiệm dài hạn', label: 'LTSS', percentage: 10, color: '#10b981', description: 'Mua sắm lớn' },
  { id: '4', name: 'Hưởng thụ', label: 'PLAY', percentage: 10, color: '#ec4899', description: 'Vui chơi' },
  { id: '5', name: 'Đầu tư', label: 'FFA', percentage: 10, color: '#06b6d4', description: 'Tự do tài chính' },
  { id: '6', name: 'Từ thiện', label: 'GIVE', percentage: 5, color: '#8b5cf6', description: 'Giúp đỡ' }
];

export const useFinanceStore = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [incomeCategories, setIncomeCategories] = useState<Category[]>([]);
  const [expenseCategories, setExpenseCategories] = useState<Category[]>([]);
  const [cycleStartDay, setCycleStartDay] = useState(1);
  const [isAutoLock, setIsAutoLock] = useState(false);
  const [jars, setJars] = useState<FinancialJar[]>(DEFAULT_JARS);

  useEffect(() => {
    try {
      const sT = localStorage.getItem(TX_KEY);
      const sI = localStorage.getItem(CAT_IN_KEY);
      const sE = localStorage.getItem(CAT_EX_KEY);
      const sS = localStorage.getItem(SETTINGS_KEY);
      const sJ = localStorage.getItem(JARS_KEY);

      const parsedT = JSON.parse(sT || '[]');
      const parsedI = JSON.parse(sI || JSON.stringify(DEFAULT_IN));
      const parsedE = JSON.parse(sE || JSON.stringify(DEFAULT_EX));
      const parsedS = JSON.parse(sS || '{"cycleStartDay":1,"isAutoLock":false}');
      const parsedJ = JSON.parse(sJ || JSON.stringify(DEFAULT_JARS));

      setTransactions(parsedT);
      setIncomeCategories(parsedI);
      setExpenseCategories(parsedE);
      setCycleStartDay(parsedS.cycleStartDay || 1);
      setIsAutoLock(!!parsedS.isAutoLock);
      setJars(parsedJ);
    } catch {
      setTransactions([]);
      setIncomeCategories(DEFAULT_IN);
      setExpenseCategories(DEFAULT_EX);
    }
  }, []);

  const save = (key: string, data: any) => localStorage.setItem(key, JSON.stringify(data));

  const addTransaction = (t: Transaction) => {
    setTransactions(prev => {
      const next = [t, ...prev];
      save(TX_KEY, next);
      return next;
    });
  };

  const updateTransaction = (t: Transaction) => {
    setTransactions(prev => {
      const next = prev.map(item => String(item.id) === String(t.id) ? t : item);
      save(TX_KEY, next);
      return next;
    });
  };

  const deleteTransaction = (id: string | number) => {
    setTransactions(prev => {
      const next = prev.filter(t => String(t.id) !== String(id));
      save(TX_KEY, next);
      return next;
    });
  };

  const addCategory = (name: string, iconName: string, color: string, type: TransactionType) => {
    const newCat: Category = {
      id: crypto.randomUUID(),
      name,
      iconName,
      color,
      type,
      isDefault: false
    };
    if (type === 'INCOME') {
      setIncomeCategories(prev => {
        const next = [...prev, newCat];
        save(CAT_IN_KEY, next);
        return next;
      });
    } else {
      setExpenseCategories(prev => {
        const next = [...prev, newCat];
        save(CAT_EX_KEY, next);
        return next;
      });
    }
  };

  const deleteCategory = (id: string, type: TransactionType) => {
    const currentCats = type === 'INCOME' ? incomeCategories : expenseCategories;
    const catToDelete = currentCats.find(c => c.id === id);
    if (!catToDelete || catToDelete.isDefault) return;

    const fallbackCat = currentCats.find(c => c.name === 'Khác' && c.isDefault) || currentCats[0];
    const updatedTransactions = transactions.map(t => t.categoryId === id ? { ...t, categoryId: fallbackCat.id } : t);

    setTransactions(updatedTransactions);
    save(TX_KEY, updatedTransactions);

    if (type === 'INCOME') {
      setIncomeCategories(prev => {
        const next = prev.filter(c => c.id !== id);
        save(CAT_IN_KEY, next);
        return next;
      });
    } else {
      setExpenseCategories(prev => {
        const next = prev.filter(c => c.id !== id);
        save(CAT_EX_KEY, next);
        return next;
      });
    }
  };

  const updateJarPercentage = (id: string, percentage: number) => {
    setJars(prev => {
      const next = prev.map(j => j.id === id ? { ...j, percentage } : j);
      save(JARS_KEY, next);
      return next;
    });
  };

  return {
    transactions,
    incomeCategories,
    expenseCategories,
    categories: [...incomeCategories, ...expenseCategories],
    jars,
    cycleStartDay,
    isAutoLock,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    addCategory,
    deleteCategory,
    saveSettings: (day: number, lock: boolean) => {
      setCycleStartDay(day);
      setIsAutoLock(lock);
      save(SETTINGS_KEY, { cycleStartDay: day, isAutoLock: lock });
    },
    updateJarPercentage,
    clearData: () => {
      localStorage.clear();
      window.location.reload();
    }
  };
};