import React from 'react';
import { 
  LayoutDashboard, Upload, FileText, MessageSquare, 
  Settings, ChevronLeft, ChevronRight, Sparkles 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import { useAppContext, SET_CURRENT_VIEW, TOGGLE_SIDEBAR } from '../context/AppContext';

const Sidebar = () => {
  const { state, dispatch } = useAppContext();
  const { sidebarCollapsed, currentView, parsedData } = state;
  const hasData = Object.keys(parsedData).length > 0;

  const navItems = [
    { id: 'upload', label: 'Tải File', icon: Upload, alwaysActive: true },
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'report', label: 'Báo Cáo AI', icon: FileText },
    { id: 'chat', label: 'Chat AI', icon: MessageSquare },
    { id: 'settings', label: 'Cài Đặt', icon: Settings, alwaysActive: true },
  ];

  return (
    <motion.aside 
      initial={false}
      animate={{ width: sidebarCollapsed ? 80 : 280 }}
      className="h-full glass-card border-r border-t-0 border-b-0 border-l-0 rounded-none rounded-r-2xl flex flex-col relative z-50 shrink-0"
    >
      {/* Logo Area */}
      <div className="h-20 flex items-center px-6 border-b border-slate-200 dark:border-white/10 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center shadow-lg shadow-primary-500/25 shrink-0">
             <span className="text-white text-xl">📊</span>
          </div>
          <AnimatePresence>
            {!sidebarCollapsed && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="font-bold text-xl whitespace-nowrap"
              >
                <span className="gradient-text">AI Excel</span>
                <span className="text-slate-500 dark:text-slate-400"> Analyzer</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Nav Items */}
      <div className="flex-1 overflow-y-auto py-6 px-4 flex flex-col gap-2">
        {navItems.map((item) => {
          const disabled = !item.alwaysActive && !hasData;
          const isActive = currentView === item.id;
          const Icon = item.icon;

          return (
            <div
              key={item.id}
              onClick={() => {
                if (!disabled) dispatch({ type: SET_CURRENT_VIEW, payload: item.id });
              }}
              title={sidebarCollapsed ? item.label : undefined}
              className={clsx(
                'group relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300',
                isActive 
                  ? 'bg-primary-500/10 text-primary-600 dark:text-primary-400 font-semibold border-none' 
                  : 'text-slate-600 dark:text-slate-400 hover:bg-white/80 dark:hover:bg-white/10',
                disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
              )}
            >
              {isActive && (
                 <motion.div 
                   layoutId="active-indicator"
                   className="absolute left-0 top-1 bottom-1 w-1 rounded-r-full bg-primary-500" 
                 />
              )}
              
              <Icon size={22} className={clsx("shrink-0 transition-transform duration-300", isActive ? "scale-110" : "group-hover:scale-110")} />
              
              <AnimatePresence>
                {!sidebarCollapsed && (
                  <motion.span 
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    className="whitespace-nowrap"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* Toggle Button */}
      <div 
        className="absolute -right-3 top-24 w-6 h-6 rounded-full glass-card flex items-center justify-center cursor-pointer shadow-md text-slate-500 hover:text-primary-500 transition-colors"
        onClick={() => dispatch({ type: TOGGLE_SIDEBAR })}
      >
        {sidebarCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </div>

      {/* Footer Area */}
      <div className="p-4 border-t border-slate-200 dark:border-white/10 shrink-0">
        <AnimatePresence>
          {!sidebarCollapsed && hasData && (
             <motion.div 
               initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
               className="mb-4 p-3 rounded-xl bg-primary-500/5 border border-primary-500/10 flex flex-col gap-1"
             >
               <span className="text-xs font-semibold text-slate-500 uppercase">File hiện tại</span>
               <span className="text-sm truncate font-medium" title={state.fileName}>{state.fileName}</span>
             </motion.div>
          )}
        </AnimatePresence>
        
        <div className={clsx("flex items-center text-xs text-slate-500", sidebarCollapsed ? "justify-center" : "justify-between px-2")}>
           {!sidebarCollapsed && <span>v1.0.0</span>}
           <Sparkles size={14} className="text-amber-500" />
        </div>
      </div>
    </motion.aside>
  );
};

export default Sidebar;
