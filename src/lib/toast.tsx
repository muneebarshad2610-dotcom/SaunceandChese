import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle, XCircle, AlertTriangle, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: number;
  type: ToastType;
  message: string;
}

interface ToastCtx {
  toast: (type: ToastType, message: string) => void;
}

const Ctx = createContext<ToastCtx>({ toast: () => {} });

let nextId = 1;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((type: ToastType, message: string) => {
    const id = nextId++;
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const remove = (id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const iconMap: Record<ToastType, ReactNode> = {
    success: <CheckCircle className="w-5 h-5 text-green-500" />,
    error: <XCircle className="w-5 h-5 text-red-500" />,
    info: <AlertTriangle className="w-5 h-5 text-[#FFB81C]" />,
  };

  const borderMap: Record<ToastType, string> = {
    success: 'border-green-400',
    error: 'border-red-400',
    info: 'border-[#FFB81C]',
  };

  return (
    <Ctx.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 pointer-events-none">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, x: 80, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 80, scale: 0.9 }}
              className={`pointer-events-auto bg-[#FDF5E6] border-2 ${borderMap[t.type]} rounded-2xl px-4 py-3 shadow-xl flex items-center gap-3 max-w-xs`}
            >
              {iconMap[t.type]}
              <p className="text-xs font-bold text-[#1A1A1A] flex-1">{t.message}</p>
              <button onClick={() => remove(t.id)} className="text-[#C41E3A]/40 hover:text-[#C41E3A] cursor-pointer">
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </Ctx.Provider>
  );
}

export function useToast() {
  return useContext(Ctx);
}
