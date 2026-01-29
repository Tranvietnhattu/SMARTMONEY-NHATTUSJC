
/**
 * MoneyMind Economic Intelligence Layer
 * Các hàm tính toán kinh tế học thuần túy
 */

/**
 * Tính chi phí cơ hội (Opportunity Cost)
 * Giả định lãi suất tiết kiệm/đầu tư cơ bản là 6%/năm (0.06)
 */
export const calculateOpportunityCost = (amount: number, years: number = 5): number => {
  const annualRate = 0.06;
  // Công thức lãi kép: A = P * (1 + r)^t
  return Math.round(amount * Math.pow(1 + annualRate, years));
};

/**
 * Tính tác động của lạm phát (Inflation Impact)
 * Giả định lạm phát trung bình là 4%/năm (0.04)
 */
export const calculateInflationImpact = (amount: number, years: number = 5): number => {
  const inflationRate = 0.04;
  // Giá trị thực tế: Value = Amount / (1 + i)^t
  return Math.round(amount / Math.pow(1 + inflationRate, years));
};

/**
 * Phân tích hữu dụng biên (Marginal Utility Analysis)
 * Đưa ra cảnh báo nếu chi tiêu cho một hạng mục vượt ngưỡng hiệu quả
 */
export const analyzeMarginalUtility = (
  categoryName: string, 
  currentSpend: number, 
  totalIncome: number,
  jarPercentage: number = 10
): { status: 'OPTIMAL' | 'DIMINISHING' | 'CRITICAL'; message: string } => {
  if (totalIncome <= 0) return { status: 'OPTIMAL', message: 'Chưa đủ dữ liệu thu nhập để phân tích.' };

  const idealSpend = (totalIncome * jarPercentage) / 100;
  const ratio = currentSpend / idealSpend;

  if (ratio > 1.5) {
    return { 
      status: 'CRITICAL', 
      message: `Hữu dụng biên của mục ${categoryName} đang giảm mạnh. Mỗi đồng chi thêm đang làm hại kế hoạch tự do tài chính của bạn.` 
    };
  } else if (ratio > 1.1) {
    return { 
      status: 'DIMINISHING', 
      message: `Chi tiêu cho ${categoryName} đang chạm ngưỡng bão hòa. Hãy cân nhắc lợi ích thực sự của lần mua sắm tiếp theo.` 
    };
  }
  
  return { status: 'OPTIMAL', message: 'Mức chi tiêu hiện tại đang nằm trong vùng tối ưu hóa lợi ích.' };
};
