import React from 'react';

/**
 * LoadingSpinner component
 * @param {string} size - Size variant: 'sm', 'md', 'lg'
 * @param {string} color - Color variant: 'primary', 'white', 'gray'
 * @param {string} text - Optional loading text
 */
const LoadingSpinner = ({ size = 'md', color = 'primary', text = '' }) => {
  const sizes = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  };

  const colors = {
    primary: 'border-blue-600 border-t-transparent',
    white: 'border-white border-t-transparent',
    gray: 'border-gray-400 border-t-transparent',
  };

  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div
        className={`${sizes[size]} ${colors[color]} rounded-full animate-spin`}
        role="status"
        aria-label="Loading"
      />
      {text && <div className={`${textSizes[size]} text-gray-600 font-medium`}>{text}</div>}
    </div>
  );
};

export default LoadingSpinner;
