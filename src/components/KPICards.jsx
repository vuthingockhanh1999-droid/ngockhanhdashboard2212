import React from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, DollarSign, Users, BarChart3, 
  Hash, Percent, Calendar, Target, Activity 
} from 'lucide-react';
import clsx from 'clsx';

const iconMap = {
  TrendingUp, DollarSign, Users, BarChart3, Hash, Percent, Calendar, Target, Activity
};

const colorMap = {
  primary: { bg: 'bg-primary-500/10 dark:bg-primary-500/20', text: 'text-primary-600 dark:text-primary-400', border: 'border-primary-500/20' },
  accent: { bg: 'bg-accent-500/10 dark:bg-accent-500/20', text: 'text-accent-600 dark:text-accent-400', border: 'border-accent-500/20' },
  emerald: { bg: 'bg-emerald-500/10 dark:bg-emerald-500/20', text: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-500/20' },
  amber: { bg: 'bg-amber-500/10 dark:bg-amber-500/20', text: 'text-amber-600 dark:text-amber-400', border: 'border-amber-500/20' },
  rose: { bg: 'bg-rose-500/10 dark:bg-rose-500/20', text: 'text-rose-600 dark:text-rose-400', border: 'border-rose-500/20' },
  blue: { bg: 'bg-blue-500/10 dark:bg-blue-500/20', text: 'text-blue-600 dark:text-blue-400', border: 'border-blue-500/20' },
  purple: { bg: 'bg-purple-500/10 dark:bg-purple-500/20', text: 'text-purple-600 dark:text-purple-400', border: 'border-purple-500/20' },
  pink: { bg: 'bg-pink-500/10 dark:bg-pink-500/20', text: 'text-pink-600 dark:text-pink-400', border: 'border-pink-500/20' },
};

const KPICards = ({ cards }) => {
  if (!cards || cards.length === 0) {
    return (
      <div className="glass-card p-6 text-center text-slate-500">
        Không tìm thấy cột dữ liệu dạng số nào để tạo chỉ số KPI.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
      {cards.map((card, index) => {
        const Icon = iconMap[card.icon] || Activity;
        const colorClass = colorMap[card.color] || colorMap.primary;

        return (
          <motion.div
            key={card.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.4 }}
            className="glass-card-hover p-5 h-full flex flex-col justify-between group overflow-hidden relative"
          >
            {/* Background decoration */}
            <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full ${colorClass.bg} blur-2xl opacity-50 group-hover:opacity-100 transition-opacity duration-500`} />
            
            <div className="flex justify-between items-start relative z-10">
              <div className={`w-12 h-12 rounded-2xl ${colorClass.bg} flex items-center justify-center shadow-sm`}>
                <Icon className={`w-6 h-6 ${colorClass.text}`} />
              </div>
              {/* Optional trend pill here */}
            </div>
            
            <div className="mt-4 relative z-10">
              <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1 line-clamp-1" title={card.title}>
                {card.title}
              </h3>
              <div className="text-2xl lg:text-3xl font-bold text-slate-800 dark:text-white truncate" title={card.formattedValue}>
                {card.formattedValue}
              </div>
              <p className="text-xs text-slate-400 mt-2">
                {card.subtitle}
              </p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default KPICards;
