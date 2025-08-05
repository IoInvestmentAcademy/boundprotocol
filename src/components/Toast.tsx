import { useEffect } from 'react';

interface ToastProps {
  message: string;
  type?: 'error' | 'success';
  onClose: () => void;
}

export function Toast({ message, type = 'error', onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000); // Auto close after 5 seconds

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed top-4 right-4 z-50 animate-fade-in">
      <div className={`rounded-lg shadow-lg p-4 ${
        type === 'error' ? 'bg-red-500' : 'bg-green-500'
      } text-white max-w-md`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <span className="text-sm font-medium">{message}</span>
          </div>
          <button
            onClick={onClose}
            className="ml-4 text-white hover:text-gray-100"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  );
} 