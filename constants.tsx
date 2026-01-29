
import React from 'react';
import { 
  Utensils, ShoppingBag, Receipt, Gamepad2, MoreHorizontal, Wallet, 
  CreditCard, Landmark, TrendingUp, Gift, Briefcase, Home, Car, 
  Plane, Heart, Coffee, Tv, Music, Zap, Book, Brush, Dumbbell
} from 'lucide-react';
import { PaymentSource, Wisdom } from './types';

export const WISDOM_DATABASE: Wisdom[] = [
  {
    quote: "Đừng tiết kiệm những gì còn lại sau khi chi tiêu, mà hãy chi tiêu những gì còn lại sau khi tiết kiệm.",
    author: "Warren Buffett",
    actionItem: "Hãy trích ngay 10% thu nhập hôm nay vào quỹ dự phòng trước khi thanh toán bất kỳ hóa đơn nào."
  },
  {
    quote: "Kẻ mua những thứ mình không cần, sớm muộn gì cũng phải bán những thứ mình cần.",
    author: "Benjamin Franklin",
    actionItem: "Trước khi bấm 'Mua ngay', hãy để món hàng trong giỏ 24 giờ để xem bạn có thực sự cần nó không."
  },
  {
    quote: "Sai lầm lớn nhất của con người là làm việc vì tiền chứ không phải để tiền làm việc cho mình.",
    author: "Robert Kiyosaki",
    actionItem: "Tìm hiểu về một quỹ chỉ số (Index Fund) hoặc kênh đầu tư ít rủi ro trong 15 phút hôm nay."
  },
  {
    quote: "Sự giàu có không nằm ở việc sở hữu nhiều tài sản, mà ở việc có ít ham muốn.",
    author: "Epictetus (Chủ nghĩa Khắc kỷ)",
    actionItem: "Liệt kê 3 thứ bạn định mua và gạch bỏ 1 thứ bạn thấy là do cảm xúc nhất thời."
  },
  {
    quote: "Giá trị là những gì bạn nhận được, giá cả là những gì bạn trả ra.",
    author: "Charlie Munger",
    actionItem: "So sánh chất lượng thay vì chỉ nhìn vào nhãn giá khi mua đồ dùng hàng ngày hôm nay."
  },
  {
    quote: "Hãy sợ hãi khi người khác tham lam và hãy tham lam khi người khác sợ hãi.",
    author: "Warren Buffett",
    actionItem: "Kiểm tra lại danh mục đầu tư và giữ vững tâm lý nếu thị trường có biến động."
  },
  {
    quote: "Đừng bỏ tất cả trứng vào một giỏ.",
    author: "Ngạn ngữ tài chính",
    actionItem: "Xem xét đa dạng hóa nguồn tiền: Tiền mặt, Ngân hàng và Ví điện tử theo tỷ lệ an toàn."
  }
];

export const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  'Ăn uống': <Utensils size={18} />,
  'Mua sắm': <ShoppingBag size={18} />,
  'Hóa đơn': <Receipt size={18} />,
  'Giải trí': <Gamepad2 size={18} />,
  'Khác': <MoreHorizontal size={18} />,
  'Lương': <Briefcase size={18} />,
  'Thưởng': <Gift size={18} />,
  'Đầu tư': <TrendingUp size={18} />,
  'Utensils': <Utensils size={18} />,
  'ShoppingBag': <ShoppingBag size={18} />,
  'Receipt': <Receipt size={18} />,
  'Gamepad2': <Gamepad2 size={18} />,
  'Briefcase': <Briefcase size={18} />,
  'Gift': <Gift size={18} />,
  'Home': <Home size={18} />,
  'Car': <Car size={18} />,
  'Plane': <Plane size={18} />,
  'Heart': <Heart size={18} />,
  'Coffee': <Coffee size={18} />,
  'Tv': <Tv size={18} />,
  'Music': <Music size={18} />,
  'Zap': <Zap size={18} />,
  'Book': <Book size={18} />,
  'Brush': <Brush size={18} />,
  'Dumbbell': <Dumbbell size={18} />,
  'TrendingUp': <TrendingUp size={18} />,
  'MoreHorizontal': <MoreHorizontal size={18} />
};

export const AVAILABLE_ICONS = [
  'Utensils', 'ShoppingBag', 'Receipt', 'Gamepad2', 'Briefcase', 'Gift', 
  'Home', 'Car', 'Plane', 'Heart', 'Coffee', 'Tv', 'Music', 'Zap', 
  'Book', 'Brush', 'Dumbbell', 'TrendingUp', 'MoreHorizontal'
];

export const AVAILABLE_COLORS = [
  '#F87171', '#FB923C', '#FBBF24', '#34D399', '#2DD4BF', '#60A5FA', '#A78BFA', '#F472B6', '#94A3B8', '#475569'
];

export const SOURCE_ICONS: Record<PaymentSource, React.ReactNode> = {
  'Tiền mặt': <Wallet size={18} />,
  'Ví điện tử': <CreditCard size={18} />,
  'Ngân hàng': <Landmark size={18} />,
};

export const CATEGORY_COLORS: Record<string, string> = {
  'Ăn uống': '#F87171',
  'Mua sắm': '#FB923C',
  'Hóa đơn': '#60A5FA',
  'Giải trí': '#A78BFA',
  'Khác': '#94A3B8',
  'Lương': '#34D399',
  'Thưởng': '#FBBF24',
  'Đầu tư': '#2DD4BF',
};
