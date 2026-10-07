import React from "react";
import { AlertCircle, RefreshCw, WifiOff } from "lucide-react";
import { Button } from "./Button";

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  isNetworkError?: boolean;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title,
  message = "An unexpected error occurred while communicating with the API.",
  onRetry,
  isNetworkError = false,
}) => {
  const displayTitle = title || (isNetworkError ? "Backend Connection Failed" : "Request Error");

  return (
    <div className="error-state-box">
      <div
        className="state-icon-circle"
        style={{
          backgroundColor: "rgba(163, 64, 84, 0.3)",
          color: "var(--palette-coral)",
        }}
      >
        {isNetworkError ? <WifiOff size={28} /> : <AlertCircle size={28} />}
      </div>
      <h4 className="state-title">{displayTitle}</h4>
      <p className="state-desc">{message}</p>
      {onRetry && (
        <div style={{ marginTop: "16px" }}>
          <Button variant="outline" size="sm" onClick={onRetry} icon={<RefreshCw size={15} />}>
            Retry Connection
          </Button>
        </div>
      )}
    </div>
  );
};
