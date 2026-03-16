import React from 'react';

const FormInput = ({ label, type, value, onChange, placeholder, required, minLength, pattern, error }) => {
  return (
    <div className="flex flex-col space-y-1">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        minLength={minLength}
        pattern={pattern}
        className={`px-4 py-3 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all ${
          error ? 'border-red-500' : 'border-gray-200'
        }`}
      />
      {error && <span className="text-xs text-red-500 mt-1">{error}</span>}
    </div>
  );
};

export default FormInput;
