import React from 'react';
import { FileSpreadsheet } from 'lucide-react';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import { useAppContext, SET_ACTIVE_SHEET, SET_ANALYZED_DATA } from '../context/AppContext';
import { analyzeData } from '../utils/statistics';

const SheetSelector = () => {
  const { state, dispatch } = useAppContext();
  const { sheetNames, activeSheet, parsedData } = state;

  if (!sheetNames || sheetNames.length <= 1) return null;

  const handleSheetChange = (sheetName) => {
    if (sheetName === activeSheet) return;
    
    // Change active sheet
    dispatch({ type: SET_ACTIVE_SHEET, payload: sheetName });
    
    // Re-analyze data for new sheet
    const dataToAnalyze = parsedData[sheetName];
    if (dataToAnalyze) {
      const analyzed = analyzeData(
        dataToAnalyze.headers, 
        dataToAnalyze.rows, 
        dataToAnalyze.columnMeta
      );
      dispatch({ type: SET_ANALYZED_DATA, payload: analyzed });
    }
  };

  return (
    <div className="flex overflow-x-auto pb-2 mb-4 scrollbar-hide">
      <div className="flex gap-2 p-1 glass-card bg-slate-200/50 dark:bg-slate-800/50 rounded-xl">
        {sheetNames.map((sheet) => {
          const isActive = sheet === activeSheet;
          const rowCount = parsedData[sheet]?.rows?.length || 0;
          
          return (
            <button
              key={sheet}
              onClick={() => handleSheetChange(sheet)}
              className={clsx(
                "relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap",
                isActive 
                  ? "text-primary-700 dark:text-primary-300" 
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-white/5"
              )}
            >
              {isActive && (
                <motion.div 
                  layoutId="active-sheet-bg"
                  className="absolute inset-0 bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-200 dark:border-white/10"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-2">
                <FileSpreadsheet size={16} className={isActive ? "text-primary-500" : ""} />
                {sheet}
                <span className={clsx(
                  "ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold",
                  isActive ? "bg-primary-100 dark:bg-primary-900/50 text-primary-600 dark:text-primary-400" : "bg-slate-200 dark:bg-slate-700 text-slate-500"
                )}>
                  {rowCount}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default SheetSelector;
