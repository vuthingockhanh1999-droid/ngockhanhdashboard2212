import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { useAppContext } from '../context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';

const MainLayout = ({ children }) => {
  const { state } = useAppContext();
  
  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950 transition-colors duration-300 text-slate-900 dark:text-white relative">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden relative z-10 w-full">
        <Header />
        <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8 scroll-smooth relative">
          <AnimatePresence mode="wait">
             {children}
          </AnimatePresence>
        </main>
      </div>
      
      {/* Background decoration elements */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary-500/5 blur-[100px] pointer-events-none -z-10" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-accent-500/5 blur-[100px] pointer-events-none -z-10" />
    </div>
  );
};

export default MainLayout;
