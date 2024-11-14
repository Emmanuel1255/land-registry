// src/components/common/Select.jsx
import { useField } from 'formik'

export const Select = ({ label, options, ...props }) => {
  const [field, meta] = useField(props)
  
  return (
    <div>
      <label 
        htmlFor={props.name} 
        className="block text-sm font-medium text-gray-700"
      >
        {label}
      </label>
      <select
        {...field}
        {...props}
        className={`mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md ${
          meta.touched && meta.error ? 'border-red-300' : ''
        }`}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {meta.touched && meta.error && (
        <p className="mt-2 text-sm text-red-600">{meta.error}</p>
      )}
    </div>
  )
}