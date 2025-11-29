'use client';

import { ConnectionState } from '@/types';

interface ConnectionStatusProps {
  status: ConnectionState;
}

export default function ConnectionStatus({ status }: ConnectionStatusProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'connecting':
        return {
          text: 'Connecting...',
          color: 'text-yellow-400',
          bgColor: 'bg-yellow-900 bg-opacity-30',
          borderColor: 'border-yellow-500',
          icon: (
            <svg
              className="animate-spin h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          ),
        };
      case 'connected':
        return {
          text: 'Connected',
          color: 'text-green-400',
          bgColor: 'bg-green-900 bg-opacity-30',
          borderColor: 'border-green-500',
          icon: (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
          ),
        };
      case 'disconnected':
        return {
          text: 'Disconnected',
          color: 'text-red-400',
          bgColor: 'bg-red-900 bg-opacity-30',
          borderColor: 'border-red-500',
          icon: (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
          ),
        };
    }
  };

  const config = getStatusConfig();

  return (
    <div
      className={`flex items-center gap-2 px-4 py-2 rounded-lg border-l-4 ${config.bgColor} ${config.borderColor}`}
    >
      <div className={config.color}>{config.icon}</div>
      <span className={`text-sm font-medium ${config.color}`}>{config.text}</span>
    </div>
  );
}
