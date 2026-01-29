
import { Transaction, Category } from "../types";
import { generateInternalReport, AnalyticReport } from "./internalAnalyticEngine";

/**
 * AI Analytic Service (Client-Side Only)
 * Giả lập quá trình phân tích thông minh bằng Rule-based Engine.
 * Không gọi mạng, không sử dụng API Key.
 */
export const analyzeSpendingWithGemini = async (
  transactions: Transaction[],
  categories: Category[],
  summary: any,
  period: string,
  cycleStartDay: number = 1
): Promise<AnalyticReport> => {
  // Giả lập độ trễ của AI để tạo cảm giác "Thinking" cho UI
  await new Promise(resolve => setTimeout(resolve, 1200));

  // Sử dụng Internal Engine để tính toán các chỉ số kinh tế
  const report = generateInternalReport(transactions, categories, cycleStartDay);

  // Bổ sung các gợi ý mang tính "cá nhân hóa" dựa trên dữ liệu cụ thể
  const personalizedTips = [];
  const ratio = report.overview.expense_to_income_ratio_percent;
  
  if (ratio > 90) {
    personalizedTips.push("Mức chi tiêu đang ở ngưỡng báo động đỏ (trên 90%). Hãy tạm dừng mọi khoản mua sắm không thiết yếu ngay lập tức.");
  } else if (ratio > 70) {
    personalizedTips.push("Dòng tiền đang bắt đầu thắt chặt. Hãy áp dụng quy tắc 24h: Đợi 1 ngày trước khi mua bất kỳ món đồ nào trên 200k.");
  }

  if (report.spending_analysis.structure.fixed_ratio_percent < 30) {
    personalizedTips.push("Chi phí linh hoạt của bạn quá cao. Đây là dấu hiệu của việc chi tiêu ngẫu hứng (Impulse buying).");
  }

  return {
    ...report,
    recommendations: [...personalizedTips, ...report.recommendations].slice(0, 4)
  };
};

export type { AnalyticReport as AIAnalyticReport };
