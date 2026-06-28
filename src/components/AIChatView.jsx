import React, { useState, useRef, useEffect } from 'react';
import { Send, MessageSquare, Bot, User, Loader2, Trash2, Key } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useAppContext, ADD_CHAT_MESSAGE, SET_CHAT_LOADING, SET_CURRENT_VIEW, RESET_ALL } from '../context/AppContext';
import { chatWithData, buildDataSummary } from '../services/geminiService';
import { showWarning, showError } from './ui/Toast';

const AIChatView = () => {
  const { state, dispatch } = useAppContext();
  const { chatHistory, chatLoading, settings, parsedData, analyzedData, activeSheet } = state;
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory, chatLoading]);

  const handleSend = async (text = input) => {
    if (!text.trim()) return;
    
    if (!settings.geminiApiKey) {
      showWarning('Chưa có API Key', 'Vui lòng thiết lập Gemini API Key trong phần Cài đặt.');
      return;
    }

    if (!analyzedData) {
      showWarning('Chưa có dữ liệu', 'Vui lòng tải lên một file Excel trước.');
      return;
    }

    const question = text.trim();
    setInput('');
    
    // Add user message
    const userMsg = { id: Date.now(), role: 'user', content: question, timestamp: Date.now() };
    dispatch({ type: ADD_CHAT_MESSAGE, payload: userMsg });
    
    dispatch({ type: SET_CHAT_LOADING, payload: true });

    try {
      const summary = buildDataSummary(parsedData[activeSheet], analyzedData, settings.maskPersonalInfo);
      const result = await chatWithData(question, summary, chatHistory, settings.geminiApiKey);

      if (typeof result === 'object' && result.error) {
        throw new Error(result.message);
      }

      // Add AI response
      const aiMsg = { id: Date.now() + 1, role: 'assistant', content: result, timestamp: Date.now() };
      dispatch({ type: ADD_CHAT_MESSAGE, payload: aiMsg });
      
    } catch (error) {
      console.error(error);
      const errorMsg = { id: Date.now() + 1, role: 'assistant', content: `**Lỗi:** ${error.message}`, isError: true, timestamp: Date.now() };
      dispatch({ type: ADD_CHAT_MESSAGE, payload: errorMsg });
    } finally {
      dispatch({ type: SET_CHAT_LOADING, payload: false });
    }
  };

  const handleClearChat = () => {
    if (confirm('Xóa toàn bộ lịch sử trò chuyện?')) {
      localStorage.removeItem('ai-excel-chat');
      // Hacky way to clear just chat without full reset
      // In a real app we'd have a CLEAR_CHAT action
      window.location.reload(); 
    }
  };

  const suggestions = [
    "Tóm tắt ngắn gọn dữ liệu này",
    "Có những điểm bất thường nào không?",
    "Liệt kê Top 3 chỉ số quan trọng nhất",
    "Xu hướng chính đang thay đổi thế nào?"
  ];

  if (!settings.geminiApiKey) {
    return (
      <div className="h-full flex items-center justify-center pb-20">
        <div className="glass-card p-10 max-w-md text-center">
          <div className="w-16 h-16 rounded-full bg-rose-500/10 text-rose-500 mx-auto flex items-center justify-center mb-4">
            <Key size={32} />
          </div>
          <h2 className="text-xl font-bold mb-2">Chưa cấu hình API Key</h2>
          <p className="text-slate-500 mb-6">Tính năng Chat cần có API Key để kết nối với AI.</p>
          <button onClick={() => dispatch({ type: SET_CURRENT_VIEW, payload: 'settings' })} className="btn-primary w-full">
            Thiết Lập Ngay
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] w-full max-w-5xl mx-auto glass-card overflow-hidden">
      
      {/* Chat Header */}
      <div className="h-16 px-6 border-b border-slate-200 dark:border-white/10 flex items-center justify-between shrink-0 bg-slate-50/50 dark:bg-white/5">
        <div className="flex items-center gap-3">
           <div className="w-8 h-8 rounded-full gradient-bg flex items-center justify-center text-white">
             <Bot size={18} />
           </div>
           <div>
             <h2 className="font-semibold">AI Assistant</h2>
             <div className="text-xs text-emerald-500 flex items-center gap-1">
               <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Online
             </div>
           </div>
        </div>
        
        {chatHistory.length > 0 && (
          <button onClick={handleClearChat} className="p-2 text-slate-400 hover:text-rose-500 transition-colors" title="Xóa lịch sử chat">
            <Trash2 size={18} />
          </button>
        )}
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 scroll-smooth bg-white/20 dark:bg-slate-900/20">
        {chatHistory.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center opacity-80">
            <div className="w-20 h-20 bg-slate-200 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
              <MessageSquare size={32} className="text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Chat với Dữ Liệu</h3>
            <p className="text-slate-500 max-w-sm text-center mb-8">
              Hãy hỏi bất cứ điều gì về dữ liệu hiện tại, AI sẽ phân tích và trả lời bạn ngay lập tức.
            </p>
            
            <div className="flex flex-wrap justify-center gap-2 max-w-2xl">
              {suggestions.map((sg, idx) => (
                <button 
                  key={idx} 
                  onClick={() => handleSend(sg)}
                  className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-primary-500 hover:text-primary-500 rounded-full text-sm transition-colors text-slate-600 dark:text-slate-300"
                >
                  {sg}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-6 pb-4">
            <AnimatePresence initial={false}>
              {chatHistory.map((msg) => {
                const isUser = msg.role === 'user';
                return (
                  <motion.div 
                    key={msg.id}
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    className={`flex ${isUser ? 'justify-end' : 'justify-start'} w-full gap-3`}
                  >
                    {!isUser && (
                      <div className="w-8 h-8 shrink-0 rounded-full gradient-bg flex items-center justify-center text-white mt-1 shadow-md">
                        <Bot size={16} />
                      </div>
                    )}
                    
                    <div className={`max-w-[85%] md:max-w-[75%] flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                      <div className={`px-4 py-3 rounded-2xl ${
                        isUser 
                          ? 'gradient-bg text-white rounded-tr-none shadow-lg shadow-primary-500/20' 
                          : msg.isError 
                            ? 'bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 rounded-tl-none'
                            : 'glass-card bg-white/90 dark:bg-slate-800/90 rounded-tl-none'
                      }`}>
                        {isUser ? (
                          <div className="text-sm whitespace-pre-wrap">{msg.content}</div>
                        ) : (
                          <div className="prose prose-sm prose-slate dark:prose-invert max-w-none text-[15px]">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                          </div>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 mt-1 px-1">
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    {isUser && (
                      <div className="w-8 h-8 shrink-0 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 mt-1 shadow-inner">
                        <User size={16} />
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
            
            {chatLoading && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="flex justify-start w-full gap-3"
              >
                <div className="w-8 h-8 shrink-0 rounded-full gradient-bg flex items-center justify-center text-white mt-1 shadow-md">
                  <Bot size={16} />
                </div>
                <div className="px-4 py-3 rounded-2xl rounded-tl-none glass-card bg-white/90 dark:bg-slate-800/90 flex items-center gap-2">
                   <div className="flex gap-1">
                     <span className="w-2 h-2 rounded-full bg-primary-500 animate-bounce" style={{ animationDelay: '0ms' }}></span>
                     <span className="w-2 h-2 rounded-full bg-primary-500 animate-bounce" style={{ animationDelay: '150ms' }}></span>
                     <span className="w-2 h-2 rounded-full bg-primary-500 animate-bounce" style={{ animationDelay: '300ms' }}></span>
                   </div>
                   <span className="text-sm text-slate-500 ml-2">Đang suy nghĩ...</span>
                </div>
              </motion.div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md border-t border-slate-200 dark:border-white/10">
        <form 
          onSubmit={(e) => { e.preventDefault(); handleSend(); }}
          className="relative flex items-center"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={chatLoading}
            placeholder="Hỏi về dữ liệu của bạn..."
            className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-full py-3 pl-5 pr-14 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 disabled:opacity-50 text-slate-900 dark:text-white"
          />
          <button
            type="submit"
            disabled={!input.trim() || chatLoading}
            className="absolute right-1.5 p-2 rounded-full gradient-bg text-white disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-primary-500/30 transition-all active:scale-95"
          >
            {chatLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} className="ml-0.5" />}
          </button>
        </form>
      </div>

    </div>
  );
};

export default AIChatView;
