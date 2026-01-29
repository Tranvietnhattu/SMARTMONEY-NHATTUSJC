import { Transaction, Category, FinancialJar } from '../types';
import { startOfDay, endOfDay, subMonths, startOfMonth, format, endOfMonth, differenceInCalendarDays } from 'date-fns';

/**
 * Lấy dải thời gian của chu kỳ hiện tại dựa trên ngày bắt đầu
 */
export const getCycleRange = (date: Date, cycleStartDay: number) => {
  const year = date.getFullYear();
  const month = date.getMonth();
  
  // Nếu ngày hiện tại nhỏ hơn ngày bắt đầu chu kỳ, chu kỳ bắt đầu từ tháng trước
  let start = new Date(year, month, cycleStartDay);
  if (date.getDate() < cycleStartDay) {
    start = subMonths(start, 1);
  }
  
  // Ngày kết thúc là ngày trước ngày bắt đầu của chu kỳ tiếp theo
  const end = new Date(start.getFullYear(), start.getMonth() + 1, cycleStartDay);
  end.setDate(end.getDate() - 1);
  
  return {
    start: startOfDay(start),
    end: endOfDay(end)
  };
};

/**
 * Tính toán thu nhập, chi tiêu và số dư cho một khoảng thời gian
 */
export const calculateSummary = (transactions: Transaction[], range: { start: Date, end: Date }) => {
  let income = 0;
  let expense = 0;
  
  transactions.forEach(t => {
    const d = new Date(t.date);
    if (d >= range.start && d <= range.end) {
      if (t.type === 'INCOME') income += t.amount;
      else expense += t.amount;
    }
  });
  
  return {
    income,
    expense,
    balance: income - expense
  };
};

/**
 * Tính toán điểm sức khỏe tài chính (0-100)
 */
export const calculateFinancialScore = (transactions: Transaction[], cycleStartDay: number): number => {
  const range = getCycleRange(new Date(), cycleStartDay);
  const { income, expense, balance } = calculateSummary(transactions, range);
  
  if (income === 0) return expense > 0 ? 20 : 50;
  
  const savingsRate = balance / income;
  let score = 60; // Điểm cơ bản
  
  if (savingsRate > 0.4) score += 30;
  else if (savingsRate > 0.2) score += 20;
  else if (savingsRate > 0) score += 10;
  else score -= 30; // Số dư âm
  
  // Thưởng theo mức độ sử dụng ứng dụng
  const txCount = transactions.filter(t => {
    const d = new Date(t.date);
    return d >= range.start && d <= range.end;
  }).length;
  score += Math.min(txCount, 10);
  
  return Math.max(0, Math.min(100, score));
};

/**
 * Phân tích dữ liệu ROI và biểu đồ cho Overview
 */
export const analyzeProfessionalROI = (transactions: Transaction[], categories: Category[]) => {
  const chartData = [];
  const now = new Date();
  
  for (let i = 5; i >= 0; i--) {
    const monthDate = subMonths(now, i);
    const mStart = startOfMonth(monthDate);
    const mEnd = endOfMonth(monthDate);
    
    const monthlyTxs = transactions.filter(t => {
      const d = new Date(t.date);
      return d >= mStart && d <= mEnd;
    });
    
    const income = monthlyTxs
      .filter(t => t.type === 'INCOME')
      .reduce((sum, t) => sum + t.amount, 0);
      
    const investment = monthlyTxs
      .filter(t => {
        const cat = categories.find(c => c.id === t.categoryId);
        const name = (cat?.name || '').toLowerCase();
        return name.includes('đầu tư') || 
               name.includes('tự do') ||
               name.includes('tiết kiệm');
      })
      .reduce((sum, t) => sum + t.amount, 0);
      
    chartData.push({
      month: format(monthDate, 'MM/yy'),
      income,
      investment
    });
  }
  
  return { chartData };
};

/**
 * Tính toán tốc độ chi tiêu trung bình ngày trong chu kỳ hiện tại
 */
export const calculateDailyBurnRate = (transactions: Transaction[], cutoffDay: number): number => {
  const period = getCycleRange(new Date(), cutoffDay);
  const daysElapsed = Math.max(1, differenceInCalendarDays(new Date(), period.start));
  const totalExpense = transactions
    .filter(t => {
      const d = new Date(t.date);
      return t.type === 'EXPENSE' && d >= period.start && d <= new Date();
    })
    .reduce((sum, t) => sum + t.amount, 0);
  
  return Math.round(totalExpense / daysElapsed);
};

/**
 * Dự báo ngày sẽ hết tiền dựa trên số dư và tốc độ chi tiêu
 */
export const predictExhaustionDate = (balance: number, dailyBurnRate: number): Date | null => {
  if (dailyBurnRate <= 0 || balance <= 0) return null;
  const daysLeft = Math.floor(balance / dailyBurnRate);
  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + daysLeft);
  return targetDate;
};

/**
 * Phân tích các khoản chi phí nhỏ lặp lại (Rò rỉ)
 */
export const analyzeSpendingLeaks = (transactions: Transaction[], cutoffDay: number) => {
  const period = getCycleRange(new Date(), cutoffDay);
  const keywords = ['cafe', 'trà sữa', 'snack', 'ăn vặt', 'shopee', 'grab', 'be', 'gojek'];
  
  const leaks = transactions.filter(t => {
    const d = new Date(t.date);
    if (t.type !== 'EXPENSE' || d < period.start || d > period.end) return false;
    const note = (t.note || '').toLowerCase();
    return keywords.some(kw => note.includes(kw)) || t.amount < 50000;
  });

  const total = leaks.reduce((sum, t) => sum + t.amount, 0);
  return {
    total,
    count: leaks.length,
    transactions: leaks.slice(0, 5)
  };
};

/**
 * Phân tích hiệu năng sử dụng hũ
 */
export const analyzeJarEfficiency = (transactions: Transaction[], categories: Category[], jars: FinancialJar[], income: number) => {
  if (income <= 0) return [];
  
  const totals: Record<string, number> = {};
  transactions.forEach(t => {
    if (t.type === 'EXPENSE') {
      const cat = categories.find(c => c.id === t.categoryId);
      let label = 'NEC';
      const name = cat?.name.toLowerCase() || '';
      
      if (name.includes('giải trí') || name.includes('mua sắm')) label = 'PLAY';
      else if (name.includes('học')) label = 'EDU';
      else if (name.includes('đầu tư')) label = 'FFA';
      else if (name.includes('tiết kiệm')) label = 'LTSS';
      else if (name.includes('từ thiện')) label = 'GIVE';
      
      totals[label] = (totals[label] || 0) + t.amount;
    }
  });

  return jars.map(jar => {
    const spent = totals[jar.label] || 0;
    const budget = (income * jar.percentage) / 100;
    const ratio = budget > 0 ? (spent / budget) : 0;
    return {
      ...jar,
      spent,
      budget,
      ratio,
      status: ratio > 1 ? 'OVER' : (ratio > 0.8 ? 'WARNING' : 'GOOD')
    };
  });
};