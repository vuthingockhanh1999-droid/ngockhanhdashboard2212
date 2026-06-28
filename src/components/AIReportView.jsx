import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Sparkles, RefreshCw, FileText, AlertTriangle, Key } from 'lucide-react';
import { useAppContext, SET_AI_REPORT, SET_AI_REPORT_LOADING, SET_CURRENT_VIEW } from '../context/AppContext';
import { generateAIReport, buildDataSummary } from '../services/geminiService';
import { showSuccess, showError, showWarning } from './ui/Toast';
import ExportMenu from './ExportMenu';

const AIReportView = () => {
  const { state, dispatch } = useAppContext();
  const { aiReport, aiReportLoading, settings, parsedData, analyzedData, activeSheet } = state;
  const [errorMsg, setErrorMsg] = useState(null);

  const handleGenerateReport = async () => {
    if (!settings.geminiApiKey) {
      showWarning('Chưa có API Key', 'Vui lòng thiết lập Gemini API Key trong phần Cài đặt.');
      dispatch({ type: SET_CURRENT_VIEW, payload: 'settings' });
      return;
    }

    if (!analyzedData) {
      showWarning('Chưa có dữ liệu', 'Vui lòng tải lên một file Excel trước.');
      dispatch({ type: SET_CURRENT_VIEW, payload: 'upload' });
      return;
    }

    setErrorMsg(null);
    dispatch({ type: SET_AI_REPORT_LOADING, payload: true });

    try {
      const summary = buildDataSummary(parsedData[activeSheet], analyzedData, settings.maskPersonalInfo);
      const result = await generateAIReport(summary, settings.geminiApiKey);

      if (typeof result === 'object' && result.error) {
        throw new Error(result.message);
      }

      dispatch({ type: SET_AI_REPORT, payload: result });
      showSuccess('Tạo báo cáo thành công', 'AI đã phân tích xong dữ liệu của bạn.');
    } catch (error) {
      console.error(error);
      setErrorMsg(error.message || 'Lỗi không xác định.');
      showError('Lỗi tạo báo cáo', error.message || 'Không thể kết nối với Gemini AI.');
    } finally {
      dispatch({ type: SET_AI_REPORT_LOADING, payload: false });
    }
  };

  const MarkdownComponents = {
    h1: ({node, ...props}) => <h1 className="text-3xl font-bold gradient-text mb-6 pb-2 border-b border-slate-200 dark:border-white/10" {...props} />,
    h2: ({node, ...props}) => <h2 className="text-2xl font-bold text-primary-600 dark:text-primary-400 mt-8 mb-4 flex items-center gap-2" {...props} />,
    h3: ({node, ...props}) => <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mt-6 mb-3" {...props} />,
    p: ({node, ...props}) => <p className="text-slate-600 dark:text-slate-300 mb-4 leading-relaxed text-[15px]" {...props} />,
    ul: ({node, ...props}) => <ul className="list-disc pl-6 mb-4 space-y-2 text-slate-600 dark:text-slate-300" {...props} />,
    ol: ({node, ...props}) => <ol className="list-decimal pl-6 mb-4 space-y-2 text-slate-600 dark:text-slate-300" {...props} />,
    li: ({node, ...props}) => <li className="pl-1" {...props} />,
    strong: ({node, ...props}) => <strong className="font-bold text-slate-900 dark:text-white" {...props} />,
    blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-primary-500 pl-4 py-1 italic bg-primary-500/5 rounded-r-lg my-4 text-slate-700 dark:text-slate-300" {...props} />,
    table: ({node, ...props}) => <div className="overflow-x-auto mb-6"><table className="w-full text-sm text-left border-collapse" {...props} /></div>,
    th: ({node, ...props}) => <th className="px-4 py-2 bg-slate-100 dark:bg-slate-800 font-semibold border border-slate-200 dark:border-slate-700" {...props} />,
    td: ({node, ...props}) => <td className="px-4 py-2 border border-slate-200 dark:border-slate-700" {...props} />,
    code: ({node, inline, ...props}) => inline 
      ? <code className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-white/10 text-primary-600 dark:text-primary-400 font-mono text-sm" {...props} />
      : <pre className="p-4 rounded-xl bg-slate-900 text-slate-300 overflow-x-auto mb-4 text-sm font-mono"><code {...props} /></pre>
  };

  return (
    <div className="max-w-5xl mx-auto w-full flex flex-col h-full relative" id="report-content">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Sparkles className="text-amber-500" /> Báo Cáo Thông Minh AI
          </h1>
          <p className="text-slate-500 text-sm mt-1">Được tạo tự động dựa trên dữ liệu hiện tại</p>
        </div>
        
        <div className="flex items-center gap-3">
          {aiReport && (
            <ExportMenu dashboardId="report-document" fileName="AI_Report" />
          )}
          <button 
            onClick={handleGenerateReport}
            disabled={aiReportLoading}
            className="btn-primary flex items-center gap-2 shadow-primary-500/30"
          >
            {aiReportLoading ? <RefreshCw className="animate-spin" size={18} /> : (aiReport ? <RefreshCw size={18} /> : <Sparkles size={18} />)}
            {aiReportLoading ? 'Đang phân tích...' : (aiReport ? 'Tạo Lại Báo Cáo' : 'Tạo Báo Cáo')}
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 relative min-h-[400px]">
        <AnimatePresence mode="wait">
          
          {/* Missing API Key State */}
          {!settings.geminiApiKey && !aiReportLoading && !aiReport && (
             <motion.div 
               key="no-api"
               initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
               className="absolute inset-0 flex items-center justify-center"
             >
               <div className="glass-card p-10 max-w-md text-center">
                 <div className="w-16 h-16 rounded-full bg-rose-500/10 text-rose-500 mx-auto flex items-center justify-center mb-4">
                   <Key size={32} />
                 </div>
                 <h2 className="text-xl font-bold mb-2">Chưa cấu hình API Key</h2>
                 <p className="text-slate-500 mb-6">Bạn cần cung cấp Google Gemini API Key để AI có thể phân tích và tạo báo cáo.</p>
                 <button onClick={() => dispatch({ type: SET_CURRENT_VIEW, payload: 'settings' })} className="btn-primary w-full">
                   Đi đến Cài Đặt
                 </button>
               </div>
             </motion.div>
          )}

          {/* Loading State */}
          {aiReportLoading && (
            <motion.div 
              key="loading"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="glass-card p-8 min-h-[500px]"
            >
              <div className="max-w-3xl mx-auto space-y-6 animate-pulse">
                <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded w-3/4 mb-10"></div>
                
                {[1, 2, 3].map(section => (
                  <div key={section} className="space-y-4">
                    <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-1/3"></div>
                    <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-full"></div>
                    <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-5/6"></div>
                    <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-4/6"></div>
                  </div>
                ))}
              </div>
              
              <div className="absolute inset-0 flex items-center justify-center bg-white/20 dark:bg-slate-900/20 backdrop-blur-sm rounded-2xl">
                <div className="flex flex-col items-center gap-4 p-6 glass-card shadow-2xl">
                  <div className="w-12 h-12 relative text-primary-500">
                    <div className="absolute inset-0 border-4 border-primary-500/30 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                  <div className="text-lg font-bold gradient-text">Gemini AI Đang Làm Việc...</div>
                  <div className="text-sm text-slate-500 text-center max-w-[250px]">
                    Đang tổng hợp dữ liệu, tìm kiếm insight và tạo báo cáo cho bạn.
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Error State */}
          {!aiReportLoading && errorMsg && (
            <motion.div 
              key="error"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center"
            >
               <div className="glass-card p-10 max-w-md text-center border-rose-500/30">
                 <div className="w-16 h-16 rounded-full bg-rose-500/10 text-rose-500 mx-auto flex items-center justify-center mb-4">
                   <AlertTriangle size={32} />
                 </div>
                 <h2 className="text-xl font-bold mb-2 text-slate-800 dark:text-white">Không thể tạo báo cáo</h2>
                 <p className="text-rose-500 mb-6 bg-rose-500/10 p-3 rounded-lg text-sm">{errorMsg}</p>
                 <button onClick={handleGenerateReport} className="btn-primary w-full flex justify-center items-center gap-2">
                   <RefreshCw size={16} /> Thử Lại
                 </button>
               </div>
            </motion.div>
          )}

          {/* Report Content */}
          {!aiReportLoading && aiReport && !errorMsg && (
            <motion.div 
              key="report"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="glass-card p-6 md:p-10 mb-10 overflow-hidden"
              id="report-document"
            >
              <div className="prose prose-slate dark:prose-invert max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]} components={MarkdownComponents}>
                  {aiReport}
                </ReactMarkdown>
              </div>
              
              <div className="mt-12 pt-6 border-t border-slate-200 dark:border-white/10 flex items-center justify-between text-sm text-slate-500">
                <div className="flex items-center gap-2">
                  <FileText size={16} /> Báo cáo sinh tự động bởi Gemini AI
                </div>
                <div>{new Date().toLocaleString('vi-VN')}</div>
              </div>
            </motion.div>
          )}

          {/* Empty State */}
          {!aiReportLoading && !aiReport && settings.geminiApiKey && !errorMsg && (
             <motion.div 
               key="empty"
               initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
               className="absolute inset-0 flex items-center justify-center"
             >
               <div className="text-center opacity-60">
                 <div className="w-24 h-24 mx-auto mb-6 bg-slate-200 dark:bg-slate-800 rounded-full flex items-center justify-center">
                   <FileText size={40} className="text-slate-400" />
                 </div>
                 <h3 className="text-lg font-medium">Báo cáo chưa được tạo</h3>
                 <p className="mt-2 text-sm max-w-sm mx-auto">Nhấn nút "Tạo Báo Cáo" ở trên để AI bắt đầu phân tích dữ liệu của bạn.</p>
               </div>
             </motion.div>
          )}
          
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AIReportView;
