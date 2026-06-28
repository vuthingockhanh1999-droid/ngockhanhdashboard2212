import React, { useState, useRef, useEffect } from 'react';
import { Download, FileText, FileSpreadsheet, Image as ImageIcon, Presentation, ChevronDown, File } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { exportToPDF, exportToPNG, exportToExcel, exportToCSV, exportToPowerPoint } from '../utils/exportUtils';
import { showSuccess, showError, showLoading, dismissToast } from './ui/Toast';

const ExportMenu = ({ dashboardId, data, headers, fileName }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleExport = async (type) => {
    setIsOpen(false);
    const toastId = showLoading('Đang xuất file...', 'Vui lòng đợi trong giây lát.');
    const safeFileName = (fileName || 'export').replace(/\.[^/.]+$/, ""); // remove extension
    
    try {
      // Delay slightly to let loading toast render and UI update
      await new Promise(r => setTimeout(r, 100));

      switch (type) {
        case 'pdf':
          if (!dashboardId) throw new Error("Không tìm thấy khu vực cần xuất.");
          await exportToPDF(dashboardId, `${safeFileName}_report`);
          break;
        case 'png':
          if (!dashboardId) throw new Error("Không tìm thấy khu vực cần xuất.");
          await exportToPNG(dashboardId, `${safeFileName}_dashboard`);
          break;
        case 'excel':
          if (!data || !headers) throw new Error("Không có dữ liệu để xuất.");
          exportToExcel(data, headers, `${safeFileName}_data`);
          break;
        case 'csv':
          if (!data || !headers) throw new Error("Không có dữ liệu để xuất.");
          exportToCSV(data, headers, `${safeFileName}_data`);
          break;
        case 'pptx':
          if (!dashboardId) throw new Error("Cần Dashboard để xuất PPTX.");
          const canvas = await document.getElementById(dashboardId);
          // Simplified PPTX export for this demo
          exportToPowerPoint("Báo Cáo Phân Tích Dữ Liệu", [{ title: "Dashboard Tổng Quan", content: "Dữ liệu được chụp từ Dashboard." }], `${safeFileName}_presentation`);
          break;
      }
      dismissToast(toastId);
      showSuccess('Xuất file thành công!');
    } catch (error) {
      console.error(error);
      dismissToast(toastId);
      showError('Lỗi xuất file', error.message || 'Có lỗi xảy ra trong quá trình xuất file.');
    }
  };

  const exportOptions = [
    { id: 'pdf', label: 'Xuất PDF', icon: FileText, desc: 'Báo cáo đầy đủ' },
    { id: 'png', label: 'Chụp Dashboard (PNG)', icon: ImageIcon, desc: 'Hình ảnh chất lượng cao' },
    { id: 'excel', label: 'Xuất Excel', icon: FileSpreadsheet, desc: 'Dữ liệu thô (.xlsx)' },
    { id: 'csv', label: 'Xuất CSV', icon: File, desc: 'Dữ liệu thuần văn bản' },
    { id: 'pptx', label: 'Xuất PowerPoint', icon: Presentation, desc: 'Tạo slide báo cáo' },
  ];

  return (
    <div className="relative" ref={menuRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="glass-card hover:bg-white/80 dark:hover:bg-white/10 px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-medium transition-all text-slate-700 dark:text-slate-200 border-primary-500/20"
      >
        <Download size={16} className="text-primary-500" />
        Xuất Dữ Liệu
        <ChevronDown size={14} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-64 glass-card bg-white/90 dark:bg-slate-900/90 p-2 z-50 shadow-2xl border-slate-200 dark:border-white/10"
          >
            <div className="flex flex-col gap-1">
              {exportOptions.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => handleExport(opt.id)}
                  className="flex items-start gap-3 w-full p-3 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg transition-colors text-left group"
                >
                  <opt.icon size={18} className="text-slate-400 group-hover:text-primary-500 mt-0.5" />
                  <div>
                    <div className="text-sm font-medium text-slate-800 dark:text-slate-200">{opt.label}</div>
                    <div className="text-xs text-slate-500">{opt.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ExportMenu;
