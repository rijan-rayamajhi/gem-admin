'use client';

import React from 'react';

interface FormFieldProps {
  label: string;
  children: React.ReactNode;
  error?: string;
  required?: boolean;
  help?: string;
}

function FormField({ label, children, error, required, help }: FormFieldProps) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {children}
      {help && <p className="text-xs text-gray-500">{help}</p>}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}

interface MobileInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  help?: string;
}

function MobileInput({ label, error, help, className = '', ...props }: MobileInputProps) {
  return (
    <FormField label={label} error={error} help={help} required={props.required}>
      <input
        {...props}
        className={`
          w-full px-4 py-3 text-base border border-gray-300 rounded-lg
          focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          disabled:bg-gray-50 disabled:text-gray-500
          transition-colors duration-200
          ${error ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''}
          ${className}
        `}
      />
    </FormField>
  );
}

interface MobileTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
  help?: string;
}

function MobileTextarea({ label, error, help, className = '', ...props }: MobileTextareaProps) {
  return (
    <FormField label={label} error={error} help={help} required={props.required}>
      <textarea
        {...props}
        className={`
          w-full px-4 py-3 text-base border border-gray-300 rounded-lg
          focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          disabled:bg-gray-50 disabled:text-gray-500
          transition-colors duration-200 resize-none
          ${error ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''}
          ${className}
        `}
      />
    </FormField>
  );
}

interface MobileSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
  help?: string;
  options: { value: string; label: string; disabled?: boolean }[];
  placeholder?: string;
}

function MobileSelect({ label, error, help, options, placeholder, className = '', ...props }: MobileSelectProps) {
  return (
    <FormField label={label} error={error} help={help} required={props.required}>
      <select
        {...props}
        className={`
          w-full px-4 py-3 text-base border border-gray-300 rounded-lg
          focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          disabled:bg-gray-50 disabled:text-gray-500
          transition-colors duration-200 bg-white
          ${error ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''}
          ${className}
        `}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value} disabled={option.disabled}>
            {option.label}
          </option>
        ))}
      </select>
    </FormField>
  );
}

interface MobileButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  fullWidth?: boolean;
}

function MobileButton({ 
  variant = 'primary', 
  size = 'md', 
  loading = false, 
  fullWidth = false, 
  children, 
  className = '', 
  disabled,
  ...props 
}: MobileButtonProps) {
  const baseClasses = `
    inline-flex items-center justify-center font-medium rounded-lg
    transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
    ${fullWidth ? 'w-full' : ''}
  `;

  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    ghost: 'bg-transparent text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-gray-500',
  };

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm min-h-[36px]',
    md: 'px-4 py-3 text-base min-h-[44px]',
    lg: 'px-6 py-4 text-lg min-h-[52px]',
  };

  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
    >
      {loading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      )}
      {children}
    </button>
  );
}

interface MobileFormContainerProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  className?: string;
}

function MobileFormContainer({ children, title, description, className = '' }: MobileFormContainerProps) {
  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
      {(title || description) && (
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          {title && <h3 className="text-lg font-medium text-gray-900">{title}</h3>}
          {description && <p className="mt-1 text-sm text-gray-500">{description}</p>}
        </div>
      )}
      <div className="px-4 py-5 sm:px-6 space-y-6">
        {children}
      </div>
    </div>
  );
}

// Form grid for responsive layouts
interface MobileFormGridProps {
  children: React.ReactNode;
  columns?: 1 | 2;
  className?: string;
}

function MobileFormGrid({ children, columns = 1, className = '' }: MobileFormGridProps) {
  const gridClasses = {
    1: 'grid grid-cols-1 gap-6',
    2: 'grid grid-cols-1 md:grid-cols-2 gap-6',
  };

  return (
    <div className={`${gridClasses[columns]} ${className}`}>
      {children}
    </div>
  );
}

export {
  FormField,
  MobileInput,
  MobileTextarea,
  MobileSelect,
  MobileButton,
  MobileFormContainer,
  MobileFormGrid,
}; 