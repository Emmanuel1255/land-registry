// src/components/common/Switch.jsx
import React from 'react'

export const Switch = ({ checked, onChange, name }) => {
    return (
        <label className="inline-flex items-center cursor-pointer">
            <input
                type="checkbox"
                className="sr-only"
                checked={checked}
                onChange={onChange}
                name={name}
            />
            <div
                className={`w-10 h-6 bg-gray-200 rounded-full shadow-inner transition duration-300 ease-in-out ${
                    checked ? 'bg-primary-600' : 'bg-gray-300'
                }`}
            >
                <div
                    className={`w-4 h-4 bg-white rounded-full shadow-md transform transition duration-300 ease-in-out ${
                        checked ? 'translate-x-4' : 'translate-x-0'
                    }`}
                />
            </div>
        </label>
    )
}


