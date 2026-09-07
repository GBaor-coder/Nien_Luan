import React from 'react';
import type { IconType } from 'react-icons';
import { AlertCircle } from 'lucide-react';

interface InputFieldProps {
  id: string;
  label: string;
  type?: string;
  placeholder: string;
  icon: IconType;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  rightElement?: React.ReactNode;
  required?: boolean;
}

const InputField: React.FC<InputFieldProps> = ({
  id,
  label,
  type = 'text',
  placeholder,
  icon: Icon,
  value,
  onChange,
  error,
  rightElement,
  required = false,
}) => {
  return (
    <div className="mb-5">
      <label htmlFor={id} className="label-field">
        {label}
        {required && <span className="text-danger ml-1">*</span>}
      </label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
          <Icon className={`h-5 w-5 ${error ? 'text-danger' : 'text-slate-400 dark:text-slate-500'}`} />
        </div>
        <input
          id={id}
          name={id}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className={`input-field pl-11 ${rightElement ? 'pr-11' : ''} ${error ? 'input-error' : ''}`}
        />
        {rightElement && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">{rightElement}</div>
        )}
      </div>
      {error && (
        <p className="mt-2 text-[13px] text-danger-600 dark:text-red-400 flex items-center gap-1.5">
          <AlertCircle size={14} className="flex-shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
};

export default InputField;
