import React from 'react';
import { Search, Bell, Moon, Sun, Menu } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppContext, UPDATE_SETTINGS, TOGGLE_SIDEBAR } from '../context/AppContext';

const Header = () => {
  const { state, dispatch } = useAppContext();
  
  const getBreadcrumb = () => {
    switch (state.currentView) {
      case 'upload': return 'Tải File';
      case 'dashboard': return 'Dashboard';
      case 'report': return 'Báo Cáo AI';
      case 'chat': return 'Chat với Dữ Liệu';
      case 'settings': return 'Cài Đặt';
      default: return 'Trang chủ';
    }
  };

  const toggleDarkMode = () => {
    dispatch({ 
      type: UPDATE_SETTINGS, 
      payload: { darkMode: !state.settings.darkMode } 
    });
  };

  return (
    <header className="h-16 px-4 md:px-6 glass-card border-t-0 border-r-0 border-l-0 rounded-none flex items-center justify-between shrink-0 z-40 sticky top-0">
      
      {/* Left Area: Breadcrumb & Mobile Menu */}
      <div className="flex items-center gap-3">
        <button 
          className="md:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10"
          onClick={() => dispatch({ type: TOGGLE_SIDEBAR })}
        >
          <Menu size={20} />
        </button>
        <div className="flex items-center text-sm font-medium">
          <span className="text-slate-400 hidden sm:inline-block">Trang chủ </span>
          <span className="text-slate-400 mx-2 hidden sm:inline-block">/</span>
          <span className="text-primary-600 dark:text-primary-400">{getBreadcrumb()}</span>
        </div>
      </div>

      {/* Center Area: Search */}
      <div className="hidden md:flex flex-1 max-w-md mx-4 relative">
         <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
         <input 
           type="text" 
           placeholder="Tìm kiếm nhanh..." 
           className="w-full bg-slate-100 dark:bg-white/5 border-none rounded-full py-1.5 pl-9 pr-4 text-sm focus:ring-2 focus:ring-primary-500/30 outline-none text-slate-700 dark:text-slate-200 transition-all"
         />
      </div>

      {/* Right Area: Actions */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Theme Toggle */}
        <button 
          onClick={toggleDarkMode}
          className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 transition-colors"
          title={state.settings.darkMode ? "Chế độ sáng" : "Chế độ tối"}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={state.settings.darkMode ? 'dark' : 'light'}
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {state.settings.darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </motion.div>
          </AnimatePresence>
        </button>

        {/* Notifications */}
        <button className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 transition-colors relative">
          <Bell size={20} />
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500"></span>
        </button>

        {/* Avatar */}
        <div className="h-8 w-8 rounded-full gradient-bg flex items-center justify-center text-white font-bold text-sm shadow-md cursor-pointer border-2 border-white dark:border-slate-800 ml-1">
          AI
        </div>
      </div>
      
    </header>
  );
};

export default Header;
