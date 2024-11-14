// src/components/common/Input.jsx
import { useField } from 'formik';

export const Input = ({ label, type = 'text', ...props }) => {
  const [field, meta] = useField(props);

  const renderInput = () => {
    const baseProps = {
      ...field,
      ...props,
      id: props.name,
    };

    const baseClasses = `shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md ${
      meta.touched && meta.error ? 'border-red-300' : ''
    }`;

    switch (type) {
      case 'textarea':
        return (
          <textarea
            {...baseProps}
            className={baseClasses}
          />
        );
      case 'select':
        return (
          <select
            {...baseProps}
            className={`mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md ${
              meta.touched && meta.error ? 'border-red-300' : ''
            }`}
          >
            {props.children}
          </select>
        );
      default:
        return (
          <input
            {...baseProps}
            type={type}
            className={baseClasses}
          />
        );
    }
  };

  return (
    <div>
      {label && (
        <label 
          htmlFor={props.name} 
          className="block text-sm font-medium text-gray-700"
        >
          {label}
        </label>
      )}
      <div className="mt-1">
        {renderInput()}
      </div>
      {meta.touched && meta.error && (
        <p className="mt-2 text-sm text-red-600">{meta.error}</p>
      )}
    </div>
  );
};

export default Input;