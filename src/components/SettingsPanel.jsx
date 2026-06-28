import React, { useState } from 'react';
import { Key, Shield, Eye, EyeOff, Palette, Save, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAppContext, UPDATE_SETTINGS, RESET_ALL } from '../context/AppContext';
import { showSuccess } from './ui/Toast';

const SettingsPanel = () => {
  const { state, dispatch } = useAppContext();
  const [apiKey, setApiKey] = useState(state.settings.geminiApiKey || '');
  const [showKey, setShowKey] = useState(false);
  
  const handleSaveApi = () => {
    dispatch({ type: UPDATE_SETTINGS, payload: { geminiApiKey: apiKey } });
    showSuccess('Đã lưu cấu hình', 'API Key đã được cập nhật thành công.');
  };

  const handleToggleMask = () => {
    dispatch({ 
      type: UPDATE_SETTINGS, 
      payload: { maskPersonalInfo: !state.settings.maskPersonalInfo } 
    });
  };

  const handleToggleTheme = () => {
    dispatch({ 
      type: UPDATE_SETTINGS, 
      payload: { darkMode: !state.settings.darkMode } 
    });
  };

  const handleClearData = () => {
    if (confirm('Bạn có chắc chắn muốn xóa toàn bộ dữ liệu hiện tại không?')) {
      dispatch({ type: RESET_ALL });
      showSuccess('Thành công', 'Dữ liệu đã được xóa khỏi bộ nhớ tạm.');
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="max-w-4xl mx-auto w-full pb-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold gradient-text mb-2">Cài đặt hệ thống</h1>
        <p className="text-slate-500 dark:text-slate-400">Cấu hình API, bảo mật và giao diện hiển thị.</p>
      </div>

      <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
        
        {/* API Settings */}
        <motion.div variants={itemVariants} className="glass-card p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
              <Key size={20} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Cấu hình AI (Google Gemini)</h2>
              <p className="text-sm text-slate-500">Bắt buộc để sử dụng tính năng Báo cáo & Chat AI</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Gemini API Key
                <span className="ml-2 inline-flex items-center gap-1 text-xs text-blue-500">
                  <span className={`w-2 h-2 rounded-full ${state.settings.geminiApiKey ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                  {state.settings.geminiApiKey ? 'Đã thiết lập' : 'Chưa thiết lập'}
                </span>
              </label>
              <div className="relative">
                <input 
                  type={showKey ? "text" : "password"}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="AIzaSy..."
                  className="input-field pr-12 font-mono text-sm"
                />
                <button 
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  {showKey ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-2">
              <a 
                href="https://aistudio.google.com/app/apikey" 
                target="_blank" rel="noreferrer"
                className="text-sm text-primary-500 hover:underline"
              >
                Nhận API Key miễn phí tại Google AI Studio
              </a>
              <button onClick={handleSaveApi} className="btn-primary flex items-center gap-2 py-2 px-5 w-full sm:w-auto justify-center">
                <Save size={16} /> Lưu API Key
              </button>
            </div>
          </div>
        </motion.div>

        {/* Privacy Settings */}
        <motion.div variants={itemVariants} className="glass-card p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
              <Shield size={20} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Bảo mật & Quyền riêng tư</h2>
              <p className="text-sm text-slate-500">Bảo vệ thông tin nhạy cảm khi gửi dữ liệu cho AI</p>
            </div>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10">
            <div className="pr-4">
              <h3 className="font-medium text-slate-800 dark:text-slate-200">Ẩn Thông tin cá nhân (Data Masking)</h3>
              <p className="text-sm text-slate-500 mt-1">
                Tự động mã hóa tên, email, SĐT, số CCCD thành các ký tự * trước khi gửi dữ liệu đến máy chủ AI để phân tích.
              </p>
            </div>
            
            {/* Toggle Switch */}
            <button 
              onClick={handleToggleMask}
              className={`relative inline-flex h-7 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 ${state.settings.maskPersonalInfo ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'}`}
            >
              <span className="sr-only">Toggle mask</span>
              <span className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${state.settings.maskPersonalInfo ? 'translate-x-7' : 'translate-x-0'}`} />
            </button>
          </div>
        </motion.div>

        {/* Appearance Settings */}
        <motion.div variants={itemVariants} className="glass-card p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-500">
              <Palette size={20} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Giao diện</h2>
              <p className="text-sm text-slate-500">Tùy chỉnh trải nghiệm hiển thị</p>
            </div>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10">
            <div>
              <h3 className="font-medium text-slate-800 dark:text-slate-200">Chế độ tối (Dark Mode)</h3>
              <p className="text-sm text-slate-500 mt-1">Giao diện tối giúp bảo vệ mắt khi làm việc buổi tối.</p>
            </div>
            
            <button 
              onClick={handleToggleTheme}
              className={`relative inline-flex h-7 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 ${state.settings.darkMode ? 'bg-primary-500' : 'bg-slate-300 dark:bg-slate-700'}`}
            >
              <span className="sr-only">Toggle theme</span>
              <span className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${state.settings.darkMode ? 'translate-x-7' : 'translate-x-0'}`} />
            </button>
          </div>
        </motion.div>

        {/* Data Management */}
        <motion.div variants={itemVariants} className="glass-card p-6">
          <div className="flex items-center justify-between">
             <div>
                <h2 className="text-lg font-semibold text-rose-500">Quản lý Dữ liệu</h2>
                <p className="text-sm text-slate-500 mt-1">Xóa file đang mở và làm trống bộ nhớ RAM</p>
             </div>
             <button onClick={handleClearData} className="px-4 py-2 rounded-lg border border-rose-500/30 text-rose-500 hover:bg-rose-500/10 transition-colors flex items-center gap-2 font-medium">
               <Trash2 size={16} /> Xóa Dữ Liệu Hiện Tại
             </button>
          </div>
        </motion.div>

      </motion.div>
    </div>
  );
};

export default SettingsPanel;
