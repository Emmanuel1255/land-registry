// src/components/common/LoadingStates.jsx
import Spinner from './Spinner';

export const ButtonSpinner = () => (
  <div className="flex items-center space-x-2">
    <Spinner size="sm" />
    <span>Loading...</span>
  </div>
);

export const CardLoader = () => (
  <div className="rounded-lg border border-gray-200 p-4 w-full">
    <div className="animate-pulse flex space-x-4">
      <div className="rounded-full bg-gray-200 h-10 w-10"></div>
      <div className="flex-1 space-y-4 py-1">
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        </div>
      </div>
    </div>
  </div>
);

export const TableLoader = () => (
  <div className="w-full">
    <div className="animate-pulse space-y-4">
      <div className="h-10 bg-gray-200 rounded w-full"></div>
      {[...Array(5)].map((_, i) => (
        <div key={i} className="h-8 bg-gray-200 rounded w-full"></div>
      ))}
    </div>
  </div>
);

export const InlineSpinner = ({ text = 'Loading...' }) => (
  <div className="inline-flex items-center space-x-2 text-gray-500">
    <Spinner size="sm" />
    <span>{text}</span>
  </div>
);