import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface ToastProps {
  title: string;
  description: string;
  status: 'info' | 'success' | 'warning' | 'error';
  duration?: number;
  isClosable?: boolean;
}

// Toast context to manage toasts globally
export const ToastContext = React.createContext<{
  toast: (props: ToastProps) => void;
}>({
  toast: () => {},
});

// Toast component that displays a single toast
const Toast: React.FC<ToastProps & { onClose: () => void }> = ({
  title,
  description,
  status,
  isClosable = true,
  onClose,
}) => {
  // Map status to Tailwind/DaisyUI classes
  const alertClasses = {
    info: 'alert-info',
    success: 'alert-success',
    warning: 'alert-warning',
    error: 'alert-error',
  };

  return (
    <div className={`alert ${alertClasses[status]} shadow-lg mb-4`}>
      <div>
        {status === 'info' && (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current flex-shrink-0 w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        )}
        {status === 'success' && (
          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )}
        {status === 'warning' && (
          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        )}
        {status === 'error' && (
          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )}
        <div>
          <h3 className="font-bold">{title}</h3>
          <div className="text-xs">{description}</div>
        </div>
      </div>
      {isClosable && (
        <button className="btn btn-sm btn-ghost" onClick={onClose}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
};

// ToastContainer component that manages multiple toasts
export const ToastContainer: React.FC = () => {
  const [toasts, setToasts] = useState<(ToastProps & { id: string })[]>([]);
  
  // Function to add a new toast
  const toast = (props: ToastProps) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { ...props, id }]);
    
    // Auto-remove toast after duration
    if (props.duration !== 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
      }, props.duration || 5000);
    }
  };
  
  // Function to remove a toast
  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };
  
  // Don't render on server
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);
  
  if (!isMounted) return null;
  
  // Create portal to render toasts at the top level of the DOM
  return createPortal(
    <ToastContext.Provider value={{ toast }}>
      <div className="toast-container fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-md">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            {...toast}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>,
    document.body
  );
};

// Hook to use toast
export const useToast = () => {
  const context = React.useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context.toast;
};

// Default export for direct import
export default useToast;
