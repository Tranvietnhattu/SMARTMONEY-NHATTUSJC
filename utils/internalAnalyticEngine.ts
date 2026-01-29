import { Transaction, Category } from '../types';
import { getCycleRange, calculateSummary } from './financeLogic';
import { format } from 'date-fns';

export interface AnalyticReport {
  overview: {
    total_income: number;
    total_expense: number;
    net_balance: number;
    expense_to_income_ratio_percent: number;
  };
  spending_analysis: {
    top_3_categories: Array<{ name: string; amount: number; percentage: number }>;
    abnormal_high_spending: Array<{ category: string; amount: number; reason: string }>;
    structure: {
      fixed_expenses: number;
      flexible_expenses: number;
      fixed_ratio_percent: number;
    };
  };
  cash_flow: {
    peak_expense_day: string;
    peak_income_day: string;
    flow_trend: 'STABLE' | 'UPWARD_EXPENSE' | 'EFFICIENT_SAVING';
  };
  behavior: {
    habits: string[];
    recurring_spending: string[];
    anomalies: string[];
  };
  alerts: Array<{ level: 'CRITICAL' | 'WARNING'; message: string }>;
  recommendations: string[];
}

/**
 * MoneyMind Internal Analytic Engine
 * Phân tích dữ liệu thuần túy từ Local State
 */
export const generateInternalReport = (
  transactions: Transaction[],
  categories: Category[],
  cycleStartDay: number
): AnalyticReport => {
  const range = getCycleRange(new Date(), cycleStartDay);
  const currentTxs = transactions.filter(t => {
    const d = new Date(t.date);
    return d >= range.start && d <= range.end;
  });

  const summary = calculateSummary(transactions, range);
  
  // 1. Phân tích Danh mục & Tỷ trọng
  const catTotals: Record<string, number> = {};
  currentTxs.forEach(t => {
    if (t.type === 'EXPENSE') {
      catTotals[t.categoryId] = (catTotals[t.categoryId] || 0) + t.amount;
    }
  });

  const sortedCats = Object.entries(catTotals)
    .map(([id, amount]) => ({
      name: categories.find(c => c.id === id)?.name || 'Khác',
      amount,
      percentage: summary.expense > 0 ? Math.round((amount / summary.expense) * 100) : 0
    }))
    .sort((a, b) => b.amount - a.amount);

  const top3 = sortedCats.slice(0, 3);

  // Phân tách Cố định vs Linh hoạt
  let fixed = 0;
  let flexible = 0;
  currentTxs.forEach(t => {
    if (t.type === 'EXPENSE') {
      const cat = categories.find(c => c.id === t.categoryId);
      const name = (cat?.name || '').toLowerCase();
      // Heuristic: Các mục thiết yếu thường là cố định
      if (name.includes('hóa đơn') || name.includes('nhà') || name.includes('điện') || name.includes('nước') || name.includes('internet') || name.includes('cố định')) {
        fixed += t.amount;
      } else {
        flexible += t.amount;
      }
    }
  });

  // 2. Dòng tiền & Xu hướng
  const dailyExp: Record<string, number> = {};
  const dailyInc: Record<string, number> = {};
  currentTxs.forEach(t => {
    const day = format(new Date(t.date), 'yyyy-MM-dd');
    if (t.type === 'EXPENSE') dailyExp[day] = (dailyExp[day] || 0) + t.amount;
    else dailyInc[day] = (dailyInc[day] || 0) + t.amount;
  });

  const peakExpDay = Object.entries(dailyExp).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';
  const peakIncDay = Object.entries(dailyInc).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

  // 3. Hệ thống Cảnh báo
  const alerts: Array<{ level: 'CRITICAL' | 'WARNING'; message: string }> = [];
  const ratio = summary.income > 0 ? (summary.expense / summary.income) : 0;
  
  if (ratio > 0.8) alerts.push({ level: 'CRITICAL', message: `Cảnh báo: Tỷ lệ chi tiêu đã chiếm ${(ratio * 100).toFixed(0)}% thu nhập, vượt ngưỡng an toàn (80%).` });
  if (summary.balance < 0) alerts.push({ level: 'CRITICAL', message: 'Cảnh báo âm quỹ: Tổng chi tiêu đang vượt quá tổng thu nhập trong chu kỳ này.' });
  
  top3.forEach(c => {
    if (c.percentage > 50) alerts.push({ level: 'WARNING', message: `Danh mục "${c.name}" đang ngốn quá nửa ngân sách chi tiêu của bạn (${c.percentage}%).` });
  });

  // 4. Phân tích Hành vi
  const habits = [];
  if (currentTxs.filter(t => t.type === 'EXPENSE').length > 20) habits.push("Tần suất chi tiêu cao: Bạn có hơn 20 giao dịch trong chu kỳ, dễ dẫn đến rò rỉ tài chính.");
  if (fixed > flexible) habits.push("Lối sống ổn định: Chi phí cố định chiếm ưu thế.");
  else habits.push("Lối sống linh hoạt: Các khoản chi ngẫu hứng và dịch vụ chiếm tỷ trọng cao.");
  
  const recurring = Array.from(new Set(currentTxs
    .filter(t => t.type === 'EXPENSE')
    .map(t => t.note.toLowerCase().trim())
    .filter(note => note.length > 2 && currentTxs.filter(tx => tx.note.toLowerCase().trim() === note).length > 1)
  ));

  const anomalies = currentTxs
    .filter(t => t.amount > (summary.income * 0.2))
    .map(t => `Giao dịch đột biến: ${t.amount.toLocaleString()}đ vào ngày ${format(new Date(t.date), 'dd/MM')}`);

  return {
    overview: {
      total_income: summary.income,
      total_expense: summary.expense,
      net_balance: summary.balance,
      expense_to_income_ratio_percent: Math.round(ratio * 100)
    },
    spending_analysis: {
      top_3_categories: top3,
      abnormal_high_spending: sortedCats.filter(c => c.percentage > 40).map(c => ({
        category: c.name,
        amount: c.amount,
        reason: "Chi tiêu tập trung quá lớn vào một mục duy nhất."
      })),
      structure: {
        fixed_expenses: fixed,
        flexible_expenses: flexible,
        fixed_ratio_percent: summary.expense > 0 ? Math.round((fixed / summary.expense) * 100) : 0
      }
    },
    cash_flow: {
      peak_expense_day: peakExpDay,
      peak_income_day: peakIncDay,
      flow_trend: ratio > 0.9 ? 'UPWARD_EXPENSE' : (ratio < 0.6 ? 'EFFICIENT_SAVING' : 'STABLE')
    },
    behavior: {
      habits: habits,
      recurring_spending: recurring.slice(0, 3),
      anomalies: anomalies.slice(0, 2)
    },
    alerts: alerts,
    recommendations: [
      ratio > 0.8 ? "Cắt giảm ngay 15% chi phí linh hoạt để đưa tỷ lệ chi về mức an toàn." : "Bạn đang quản lý tốt, hãy trích thêm 5% thu nhập vào quỹ dự phòng.",
      "Kiểm tra lại các giao dịch lặp lại để xem có dịch vụ nào không còn sử dụng nhưng vẫn trả phí không.",
      "Đặt giới hạn chi tiêu cho danh mục đứng đầu để tối ưu hóa dòng tiền."
    ]
  };
};