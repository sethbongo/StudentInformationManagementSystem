import React from "react";

export interface Option {
  value: string | number;
  label: string;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string | string[];
  options: Option[];
  placeholder?: string;
  required?: boolean;
}

export const Select: React.FC<SelectProps> = ({
  label,
  error,
  options,
  placeholder,
  required,
  className = "",
  id,
  children,
  ...props
}) => {
  const selectId = id || props.name;
  const errorMessage = Array.isArray(error) ? error[0] : error;

  return (
    <div className="form-group">
      {label && (
        <label htmlFor={selectId} className="form-label">
          {label}
          {required && <span className="required-indicator">*</span>}
        </label>
      )}
      <select
        id={selectId}
        className={`form-select ${errorMessage ? "is-invalid" : ""} ${className}`.trim()}
        required={required}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
        {children}
      </select>
      {errorMessage && <span className="form-error">{errorMessage}</span>}
    </div>
  );
};
