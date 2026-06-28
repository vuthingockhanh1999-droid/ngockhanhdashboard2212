import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileSpreadsheet, File, AlertCircle, FileText, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import { useAppContext, SET_FILE_DATA, SET_ANALYZED_DATA } from '../context/AppContext';
import { parseExcelFile } from '../utils/excelParser';
import { analyzeData } from '../utils/statistics';
import { showSuccess, showError } from './ui/Toast';

const UploadZone = () => {
  const { dispatch } = useAppContext();
  const [uploading, setUploading] = [false, () => {}]; // using local state for animation
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  const processFile = async (file) => {
    setIsProcessing(true);
    setProgress(10);
    
    try {
      // Step 1: Read & Parse
      setProgress(30);
      const parsed = await parseExcelFile(file);
      
      if (parsed.sheetNames.length === 0) {
        throw new Error("File Excel không có dữ liệu hoặc trang tính trống.");
      }
      
      setProgress(70);
      
      // Step 2: Analyze first sheet
      const firstSheet = parsed.sheetNames[0];
      const dataToAnalyze = parsed.parsedData[firstSheet];
      
      const analyzed = analyzeData(
        dataToAnalyze.headers, 
        dataToAnalyze.rows, 
        dataToAnalyze.columnMeta
      );
      
      setProgress(90);

      // Step 3: Save to context
      dispatch({
        type: SET_FILE_DATA,
        payload: {
          workbook: parsed.workbook,
          sheetNames: parsed.sheetNames,
          parsedData: parsed.parsedData,
          fileName: file.name,
          fileSize: file.size
        }
      });
      
      dispatch({
        type: SET_ANALYZED_DATA,
        payload: analyzed
      });
      
      // Save to history
      const historyStr = localStorage.getItem('ai-excel-history');
      let history = historyStr ? JSON.parse(historyStr) : [];
      history.unshift({
        fileName: file.name,
        sheetNames: parsed.sheetNames,
        timestamp: Date.now()
      });
      localStorage.setItem('ai-excel-history', JSON.stringify(history.slice(0, 5)));
      
      setProgress(100);
      showSuccess('Tải file thành công!', `Đã đọc ${analyzed.totalRows} dòng từ sheet ${firstSheet}`);
      
      // Note: SET_FILE_DATA already changes view to 'dashboard'

    } catch (error) {
      console.error(error);
      showError('Lỗi đọc file', error.message || 'Không thể xử lý định dạng file này.');
      setIsProcessing(false);
      setProgress(0);
    }
  };

  const onDrop = useCallback(acceptedFiles => {
    if (acceptedFiles?.length > 0) {
      processFile(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({ 
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'text/csv': ['.csv']
    },
    maxSize: 50 * 1024 * 1024, // 50MB
    multiple: false
  });

  // Get history
  const historyStr = localStorage.getItem('ai-excel-history');
  const recentFiles = historyStr ? JSON.parse(historyStr) : [];

  return (
    <div className="h-full flex flex-col justify-center items-center max-w-4xl mx-auto w-full">
      <div className="text-center mb-10 w-full">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.5 }}>
          <div className="inline-flex items-center justify-center p-4 bg-primary-500/10 rounded-2xl mb-4 text-primary-500">
             <FileSpreadsheet size={48} strokeWidth={1.5} />
          </div>
        </motion.div>
        <motion.h1 
          initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}
          className="text-4xl md:text-5xl font-bold mb-4 tracking-tight"
        >
          Phân tích dữ liệu với <span className="gradient-text">AI</span>
        </motion.h1>
        <motion.p 
          initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}
          className="text-slate-500 dark:text-slate-400 text-lg max-w-2xl mx-auto"
        >
          Kéo thả file Excel của bạn vào đây. Hệ thống sẽ tự động đọc cấu trúc, tính toán KPI, vẽ biểu đồ và tạo báo cáo AI chi tiết.
        </motion.p>
      </div>

      <motion.div 
        initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}
        className="w-full relative"
      >
        <div 
          {...getRootProps()} 
          className={clsx(
            "relative overflow-hidden w-full min-h-[320px] glass-card border-2 border-dashed rounded-3xl p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300",
            isDragActive && !isDragReject ? "border-primary-500 bg-primary-500/5 scale-[1.02] shadow-2xl shadow-primary-500/20" : "border-slate-300 dark:border-slate-700 hover:border-primary-400 hover:bg-slate-100/50 dark:hover:bg-white/5",
            isDragReject && "border-rose-500 bg-rose-500/5",
            isProcessing && "pointer-events-none opacity-90"
          )}
        >
          <input {...getInputProps()} />
          
          <AnimatePresence mode="wait">
            {isProcessing ? (
              <motion.div 
                key="processing"
                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                className="flex flex-col items-center w-full max-w-md"
              >
                <div className="w-16 h-16 mb-6 text-primary-500 relative">
                  <div className="absolute inset-0 border-4 border-primary-500/20 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                  <FileText className="absolute inset-0 m-auto w-6 h-6 animate-pulse" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Đang xử lý dữ liệu...</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 text-center">
                  Hệ thống đang đọc cấu trúc file và tính toán các chỉ số thống kê. Vui lòng đợi trong giây lát.
                </p>
                <div className="w-full h-3 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden relative">
                  <motion.div 
                    className="absolute top-0 left-0 bottom-0 gradient-bg"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ ease: "easeOut" }}
                  />
                </div>
                <div className="mt-2 text-right w-full text-xs font-semibold text-primary-500">{progress}%</div>
              </motion.div>
            ) : (
              <motion.div 
                key="upload"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="flex flex-col items-center"
              >
                <div className="w-20 h-20 mb-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center relative group-hover:scale-110 transition-transform duration-500">
                  {isDragReject ? (
                    <AlertCircle className="w-10 h-10 text-rose-500" />
                  ) : (
                    <Upload className={clsx("w-10 h-10 transition-colors", isDragActive ? "text-primary-500 animate-bounce" : "text-slate-400")} />
                  )}
                  
                  {/* Decorative orbital rings */}
                  <div className="absolute -inset-4 border border-slate-200 dark:border-slate-700 rounded-full animate-[spin_10s_linear_infinite] opacity-50"></div>
                  <div className="absolute -inset-8 border border-slate-200 dark:border-slate-700 rounded-full animate-[spin_15s_linear_infinite_reverse] opacity-30"></div>
                </div>
                
                <h3 className="text-2xl font-semibold mb-3">
                  {isDragReject ? "Định dạng không hỗ trợ" : (isDragActive ? "Thả file vào đây" : "Kéo & Thả file Excel")}
                </h3>
                
                <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-sm">
                  {isDragReject ? "Chỉ hỗ trợ file .xlsx, .xls, và .csv" : "Hoặc click vào nút bên dưới để chọn file từ máy tính của bạn"}
                </p>
                
                <button className="btn-primary flex items-center gap-2 pointer-events-none">
                  <File className="w-4 h-4" />
                  Chọn File Mới
                </button>
                
                <div className="mt-8 flex items-center gap-6 text-xs text-slate-400 font-medium uppercase tracking-wider">
                  <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-emerald-500" /> .XLSX</span>
                  <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-emerald-500" /> .CSV</span>
                  <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-emerald-500" /> Max 50MB</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Recent Files (Optional visual element) */}
      {recentFiles.length > 0 && !isProcessing && (
         <motion.div 
           initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
           className="mt-12 w-full text-center"
         >
           <p className="text-sm text-slate-500 mb-4 uppercase tracking-wider font-semibold">Gần đây</p>
           <div className="flex flex-wrap justify-center gap-3">
              {recentFiles.map((file, idx) => (
                <div key={idx} className="px-4 py-2 rounded-full glass-card border border-slate-200 dark:border-white/5 flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                  <FileText className="w-3 h-3 text-primary-500" />
                  <span className="truncate max-w-[150px]" title={file.fileName}>{file.fileName}</span>
                </div>
              ))}
           </div>
         </motion.div>
      )}
    </div>
  );
};

export default UploadZone;
