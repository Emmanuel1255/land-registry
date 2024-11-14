// src/components/common/Spinner.jsx
import React from 'react';

const Spinner = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16'
  };

  return (
    <div className="flex items-center justify-center">
      <div
        className={`
          animate-spin
          rounded-full
          border-4
          border-gray-200
          border-t-primary-600
          ${sizeClasses[size]}
          ${className}
        `}
      />
    </div>
  );
};

// Full page loading spinner with overlay
export const FullPageSpinner = () => {
  return (
    <div className="fixed inset-0 bg-gray-100/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-white p-4 rounded-lg shadow-lg flex flex-col items-center">
        <Spinner size="lg" />
        <p className="mt-4 text-gray-600 font-medium">Loading...</p>
      </div>
    </div>
  );
};

export default Spinner;