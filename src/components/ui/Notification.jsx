import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { clearNotification } from '../../store/slices/uiSlice';
import { CheckCircleIcon, XCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';

const Notification = () => {
  const dispatch = useDispatch();
  const { notification } = useSelector((state) => state.ui);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        dispatch(clearNotification());
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [notification, dispatch]);

  if (!notification) return null;

  const { type, message } = notification;

  const bgColor = type === 'success' ? 'bg-green-50' : 'bg-red-50';
  const borderColor = type === 'success' ? 'border-green-200' : 'border-red-200';
  const textColor = type === 'success' ? 'text-green-800' : 'text-red-800';
  const Icon = type === 'success' ? CheckCircleIcon : XCircleIcon;

  return (
    <div className={`fixed top-4 right-4 z-50 max-w-sm w-full ${bgColor} border ${borderColor} rounded-lg shadow-lg`}>
      <div className="flex items-start p-4">
        <div className="flex-shrink-0">
          <Icon className={`h-5 w-5 ${textColor}`} />
        </div>
        <div className="ml-3 flex-1">
          <p className={`text-sm font-medium ${textColor}`}>{message}</p>
        </div>
        <div className="ml-4 flex-shrink-0">
          <button
            onClick={() => dispatch(clearNotification())}
            className={`inline-flex ${textColor} hover:${type === 'success' ? 'text-green-600' : 'text-red-600'} focus:outline-none`}
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Notification;

