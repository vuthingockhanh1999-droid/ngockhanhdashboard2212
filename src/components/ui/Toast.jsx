import React from 'react';
import toast from 'react-hot-toast';
import { CheckCircle2, XCircle, Info, AlertTriangle, Loader2 } from 'lucide-react';

const ToastContent = ({ icon: Icon, title, message, colorClass }) => (
  <div className="flex items-start gap-3">
    <Icon className={`w-5 h-5 mt-0.5 shrink-0 ${colorClass}`} />
    <div>
      <p className="font-semibold text-slate-100">{title}</p>
      {message && <p className="text-sm text-slate-300 mt-1">{message}</p>}
    </div>
  </div>
);

export const showSuccess = (title, message = '') => {
  toast.custom((t) => (
    <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full glass-card bg-slate-900/90 dark:bg-slate-800/90 border-emerald-500/30 p-4 rounded-2xl shadow-lg pointer-events-auto`}>
      <ToastContent icon={CheckCircle2} title={title} message={message} colorClass="text-emerald-400" />
    </div>
  ));
};

export const showError = (title, message = '') => {
  toast.custom((t) => (
    <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full glass-card bg-slate-900/90 dark:bg-slate-800/90 border-rose-500/30 p-4 rounded-2xl shadow-lg pointer-events-auto`}>
      <ToastContent icon={XCircle} title={title} message={message} colorClass="text-rose-400" />
    </div>
  ));
};

export const showWarning = (title, message = '') => {
  toast.custom((t) => (
    <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full glass-card bg-slate-900/90 dark:bg-slate-800/90 border-amber-500/30 p-4 rounded-2xl shadow-lg pointer-events-auto`}>
      <ToastContent icon={AlertTriangle} title={title} message={message} colorClass="text-amber-400" />
    </div>
  ));
};

export const showInfo = (title, message = '') => {
  toast.custom((t) => (
    <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full glass-card bg-slate-900/90 dark:bg-slate-800/90 border-blue-500/30 p-4 rounded-2xl shadow-lg pointer-events-auto`}>
      <ToastContent icon={Info} title={title} message={message} colorClass="text-blue-400" />
    </div>
  ));
};

export const showLoading = (title, message = '') => {
  return toast.custom((t) => (
    <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full glass-card bg-slate-900/90 dark:bg-slate-800/90 border-primary-500/30 p-4 rounded-2xl shadow-lg pointer-events-auto`}>
      <ToastContent icon={Loader2} title={title} message={message} colorClass="text-primary-400 animate-spin" />
    </div>
  ), { duration: Infinity }); // Must dismiss manually
};

export const dismissToast = (toastId) => {
  toast.dismiss(toastId);
};
