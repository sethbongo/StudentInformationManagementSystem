import React from "react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string | string[];
  helperText?: string;
  required?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  required,
  className = "",
  id,
  ...props
}) => {
  const inputId = id || props.name;
  const errorMessage = Array.isArray(error) ? error[0] : error;

  return (
    <div className="form-group">
      {label && (
        <label htmlFor={inputId} className="form-label">
          {label}
          {required && <span className="required-indicator">*</span>}
        </label>
      )}
      <input
        id={inputId}
        className={`form-input ${errorMessage ? "is-invalid" : ""} ${className}`.trim()}
        required={required}
        {...props}
      />
      {errorMessage && <span className="form-error">{errorMessage}</span>}
      {!errorMessage && helperText && <span className="text-muted text-xs">{helperText}</span>}
    </div>
  );
};
