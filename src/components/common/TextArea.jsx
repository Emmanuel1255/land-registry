// src/components/common/TextArea.jsx
import { useField } from 'formik'

export const TextArea = ({ label, ...props }) => {
  const [field, meta] = useField(props)
  
  return (
    <div>
      <label 
        htmlFor={props.name} 
        className="block text-sm font-medium text-gray-700"
      >
        {label}
      </label>
      <textarea
        {...field}
        {...props}
        className={`mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md ${
          meta.touched && meta.error
            ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
            : 'focus:ring-primary-500 focus:border-primary-500'
        }`}
      />
      {meta.touched && meta.error && (
        <p className="mt-2 text-sm text-red-600">{meta.error}</p>
      )}
    </div>
  )
}