
import { Transaction } from '../types';

export const formatCurrency = (amount: number): string => {
  // Sử dụng locale 'en-US' để có dấu phẩy (,) phân cách hàng nghìn
  // Không dùng style 'currency' để chỉ lấy phần số
  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 0,
  }).format(amount);
};

export const getTransactionsByMonth = (transactions: Transaction[], year: number, month: number) => {
  return transactions.filter(t => {
    const d = new Date(t.date);
    return d.getFullYear() === year && d.getMonth() === month;
  });
};

export const calculateMonthlySummary = (monthlyTransactions: Transaction[]) => {
  return monthlyTransactions.reduce(
    (acc, t) => {
      if (t.type === 'INCOME') acc.income += t.amount;
      else acc.expense += t.amount;
      acc.balance = acc.income - acc.expense;
      return acc;
    },
    { income: 0, expense: 0, balance: 0 }
  );
};

/**
 * Chuyển đổi số thành chữ tiếng Việt chuẩn (MoneyMind Economic Core)
 */
export const toVietnameseWords = (n: number): string => {
  if (n === 0) return "Không đồng";
  if (n < 0) return "Số âm";

  const units = ["không", "một", "hai", "ba", "bốn", "năm", "sáu", "bảy", "tám", "chín"];
  
  const readThreeDigits = (num: number, showZeroHundred: boolean): string => {
    let hundred = Math.floor(num / 100);
    let ten = Math.floor((num % 100) / 10);
    let unit = num % 10;
    let res = "";

    if (hundred > 0 || showZeroHundred) {
      res += units[hundred] + " trăm ";
    }

    if (ten > 0 && ten > 1) {
      res += units[ten] + " mươi ";
    } else if (ten === 1) {
      res += "mười ";
    } else if (showZeroHundred && unit > 0) {
      res += "lẻ ";
    }

    if (unit > 0) {
      if (unit === 1 && ten > 1) {
        res += "mốt";
      } else if (unit === 5 && ten > 0) {
        res += "lăm";
      } else if (unit === 4 && ten > 1) {
        res += "tư";
      } else {
        res += units[unit];
      }
    }

    return res.trim();
  };

  let res = "";
  const unitGroups = ["", " nghìn", " triệu", " tỷ"];
  let temp = n;
  let groups = [];
  
  while (temp > 0) {
    groups.push(temp % 1000);
    temp = Math.floor(temp / 1000);
  }

  for (let j = groups.length - 1; j >= 0; j--) {
    let groupValue = groups[j];
    if (groupValue > 0) {
      let showZeroHundred = j < groups.length - 1;
      res += readThreeDigits(groupValue, showZeroHundred) + unitGroups[j % 4] + " ";
    } else if (j > 0 && j % 4 === 0 && res !== "") {
        // Xử lý trường hợp hàng tỷ nhưng các nhóm giữa bằng 0
        res += "tỷ ";
    }
  }

  res = res.trim();
  if (!res) return "Không đồng";
  
  // Viết hoa chữ cái đầu và thêm "đồng"
  return res.charAt(0).toUpperCase() + res.slice(1) + " đồng";
};
