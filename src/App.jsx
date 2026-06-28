import React, { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAppContext } from './context/AppContext';
import MainLayout from './layouts/MainLayout';
import UploadZone from './components/UploadZone';
import DashboardView from './components/DashboardView';
import AIReportView from './components/AIReportView';
import AIChatView from './components/AIChatView';
import SettingsPanel from './components/SettingsPanel';

const App = () => {
  const { state } = useAppContext();

  // Apply dark mode based on settings
  useEffect(() => {
    if (state.settings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [state.settings.darkMode]);

  const renderView = () => {
    switch (state.currentView) {
      case 'upload':
        return <UploadZone />;
      case 'dashboard':
        return <DashboardView />;
      case 'report':
        return <AIReportView />;
      case 'chat':
        return <AIChatView />;
      case 'settings':
        return <SettingsPanel />;
      default:
        return <UploadZone />;
    }
  };

  const variants = {
    initial: { opacity: 0, y: 15, scale: 0.98 },
    enter: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } 
    },
    exit: { 
      opacity: 0, 
      y: -15, 
      scale: 0.98,
      transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] } 
    }
  };

  return (
    <MainLayout>
      <AnimatePresence mode="wait">
        <motion.div
          key={state.currentView}
          initial="initial"
          animate="enter"
          exit="exit"
          variants={variants}
          className="h-full"
        >
          {renderView()}
        </motion.div>
      </AnimatePresence>
    </MainLayout>
  );
};

export default App;
