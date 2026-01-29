
import React from 'react';
import { Quote, Sparkles, Target, Zap } from 'lucide-react';

interface DailyInsightProps {
  quote: string;
  author: string;
  action: string;
}

const DailyInsight: React.FC<DailyInsightProps> = ({ quote, author, action }) => {
  return (
    <div className="w-full premium-content-fade stagger-1">
      <div className="relative overflow-hidden bg-slate-900 rounded-[2.5rem] shadow-2xl border border-white/5">
        {/* Background Decorative Elements */}
        <div className="absolute top-0 right-0 p-8 opacity-10 -rotate-12 translate-x-4 -translate-y-4">
          <Sparkles size={120} className="text-indigo-400" />
        </div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-500/10 blur-[80px] rounded-full"></div>

        <div className="relative z-10 p-6 sm:p-8 space-y-6">
          {/* Header Tag */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-full w-fit">
            <Zap size={12} className="text-amber-400 fill-amber-400" />
            <span className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em]">Triết lý tài chính</span>
          </div>

          {/* Quote Section */}
          <div className="relative">
            <Quote size={40} className="text-indigo-500/20 absolute -left-4 -top-6 -z-0" />
            <div className="relative z-10 space-y-3">
              <p className="text-base sm:text-lg font-bold text-white leading-relaxed tracking-tight italic">
                "{quote}"
              </p>
              <div className="flex items-center gap-2 justify-end">
                <div className="h-px w-6 bg-indigo-500/30"></div>
                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">
                  {author}
                </p>
              </div>
            </div>
          </div>

          {/* Action Box - High Contrast */}
          <div className="bg-white/5 backdrop-blur-md rounded-3xl p-5 border border-white/10 space-y-3 group hover:bg-white/10 transition-colors duration-500">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-amber-400 text-slate-900 rounded-lg group-hover:scale-110 transition-transform">
                <Target size={14} strokeWidth={3} />
              </div>
              <h3 className="text-[10px] font-black text-amber-400 uppercase tracking-[0.2em]">Hành động ngay</h3>
            </div>
            <p className="text-xs font-medium text-slate-300 leading-relaxed">
              {action}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailyInsight;
