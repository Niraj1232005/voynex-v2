'use client';
import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TbCheck, TbInfoCircle, TbAlertTriangle, TbX } from 'react-icons/tb';

export type ToastType = 'success' | 'info' | 'error';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    const id = Date.now().toString() + Math.random().toString();
    setToasts(prev => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 5000);
  }, []);

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
        <AnimatePresence>
          {toasts.map(toast => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
              className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border backdrop-blur-xl min-w-[300px] ${
                toast.type === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-500' :
                toast.type === 'error' ? 'bg-red-500/10 border-red-500/20 text-red-500' :
                'bg-blue-500/10 border-blue-500/20 text-blue-500'
              }`}
            >
              {toast.type === 'success' && <TbCheck size={20} className="flex-shrink-0" />}
              {toast.type === 'error' && <TbAlertTriangle size={20} className="flex-shrink-0" />}
              {toast.type === 'info' && <TbInfoCircle size={20} className="flex-shrink-0" />}
              
              <span className="flex-1 font-semibold text-sm text-foreground">{toast.message}</span>
              
              <button 
                onClick={() => removeToast(toast.id)}
                className="p-1 rounded-md hover:bg-black/10 transition-colors"
              >
                <TbX size={16} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
