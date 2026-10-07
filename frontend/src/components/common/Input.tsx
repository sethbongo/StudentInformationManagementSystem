import React from "react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string | string[];
  helperText?: string;
  required?: boolean;
  icon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  required,
  icon,
  className = "",
  id,
  style,
  ...props
}) => {
  const inputId = id || props.name;
  const errorMessage = Array.isArray(error) ? error[0] : error;

  return (
    <div className="form-group" style={style}>
      {label && (
        <label htmlFor={inputId} className="form-label">
          {label}
          {required && <span className="required-indicator">*</span>}
        </label>
      )}
      <div style={{ position: "relative" }}>
        {icon && (
          <span
            style={{
              position: "absolute",
              left: "12px",
              top: "50%",
              transform: "translateY(-50%)",
              color: "var(--text-muted)",
              pointerEvents: "none",
              display: "flex",
              alignItems: "center",
              zIndex: 1,
            }}
          >
            {icon}
          </span>
        )}
        <input
          id={inputId}
          className={`form-input ${errorMessage ? "is-invalid" : ""} ${className}`.trim()}
          style={icon ? { paddingLeft: "38px" } : undefined}
          required={required}
          {...props}
        />
      </div>
      {errorMessage && <span className="form-error">{errorMessage}</span>}
      {!errorMessage && helperText && <span className="text-muted text-xs">{helperText}</span>}
    </div>
  );
};
