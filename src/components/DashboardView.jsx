import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Table as TableIcon, Database } from 'lucide-react';
import clsx from 'clsx';
import { useAppContext, SET_CURRENT_VIEW } from '../context/AppContext';
import SheetSelector from './SheetSelector';
import KPICards from './KPICards';
import DynamicCharts from '../charts/DynamicCharts';
import DataTable from './DataTable';
import ExportMenu from './ExportMenu';
import DashboardSkeleton from './ui/LoadingSkeleton';

const DashboardView = () => {
  const { state, dispatch } = useAppContext();
  const { parsedData, analyzedData, activeSheet } = state;
  const [activeTab, setActiveTab] = useState('charts'); // 'charts' | 'table'

  if (!parsedData || Object.keys(parsedData).length === 0) {
    // Should not happen as layout handles it, but just in case
    setTimeout(() => dispatch({ type: SET_CURRENT_VIEW, payload: 'upload' }), 0);
    return null;
  }

  if (!analyzedData) {
    return <DashboardSkeleton />;
  }

  const currentSheetData = parsedData[activeSheet];
  const { headers, rows, columnMeta } = currentSheetData;
  const { totalRows, totalColumns, kpiCards, chartSuggestions } = analyzedData;

  const typeCounts = columnMeta.reduce((acc, col) => {
    acc[col.type] = (acc[col.type] || 0) + 1;
    return acc;
  }, {});

  const typeMap = {
    'number': 'Số', 'text': 'Văn bản', 'currency': 'Tiền tệ', 
    'percentage': 'Phần trăm', 'date': 'Ngày tháng', 'boolean': 'Logic'
  };

  return (
    <div className="w-full flex flex-col gap-6" id="dashboard-content">
      
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <SheetSelector />
        <div className="ml-auto">
           <ExportMenu 
             dashboardId="dashboard-content" 
             data={rows} 
             headers={headers} 
             fileName={`${state.fileName.split('.')[0]}_${activeSheet}`} 
           />
        </div>
      </div>

      {/* Summary Banner */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="glass-card p-4 flex flex-wrap gap-x-8 gap-y-4 items-center bg-white/40 dark:bg-slate-900/40"
      >
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
            <Database size={16} />
          </div>
          <div>
            <div className="text-xs text-slate-500">Tổng dữ liệu</div>
            <div className="font-semibold text-slate-800 dark:text-slate-200">
              {new Intl.NumberFormat('vi-VN').format(totalRows)} dòng × {totalColumns} cột
            </div>
          </div>
        </div>

        <div className="h-8 w-px bg-slate-200 dark:bg-white/10 hidden md:block"></div>

        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-xs text-slate-500 mr-2">Cấu trúc:</span>
          {Object.entries(typeCounts).map(([type, count]) => (
            <span key={type} className="badge bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300">
              {typeMap[type] || type}: {count}
            </span>
          ))}
        </div>
      </motion.div>

      {/* KPI Cards */}
      <div className="mt-2">
         <div className="flex items-center gap-2 mb-4">
           <h2 className="text-xl font-bold">Chỉ số nổi bật (KPI)</h2>
           <div className="h-px flex-1 bg-gradient-to-r from-slate-200 to-transparent dark:from-white/10 ml-4"></div>
         </div>
         <KPICards cards={kpiCards} />
      </div>

      {/* Tabs */}
      <div className="mt-6 flex items-center gap-1 p-1 bg-slate-200/50 dark:bg-slate-800/50 rounded-xl w-max">
        <button
          onClick={() => setActiveTab('charts')}
          className={clsx(
            "flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all",
            activeTab === 'charts' 
              ? "bg-white dark:bg-slate-900 text-primary-600 dark:text-primary-400 shadow-sm" 
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
          )}
        >
          <BarChart3 size={16} /> Biểu đồ Phân tích
        </button>
        <button
          onClick={() => setActiveTab('table')}
          className={clsx(
            "flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all",
            activeTab === 'table' 
              ? "bg-white dark:bg-slate-900 text-primary-600 dark:text-primary-400 shadow-sm" 
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
          )}
        >
          <TableIcon size={16} /> Bảng Dữ liệu Thô
        </button>
      </div>

      {/* Content Area based on Tab */}
      <div className="mt-2 min-h-[500px]">
         {activeTab === 'charts' ? (
            <DynamicCharts chartSuggestions={chartSuggestions} />
         ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full">
              <DataTable headers={headers} rows={rows} columnMeta={columnMeta} />
            </motion.div>
         )}
      </div>

    </div>
  );
};

export default DashboardView;
