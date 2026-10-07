import React from "react";
import { ShieldAlert, ArrowLeft } from "lucide-react";
import { Button } from "../components/common/Button";

export interface AccessDeniedViewProps {
  onBack: () => void;
}

export const AccessDeniedView: React.FC<AccessDeniedViewProps> = ({ onBack }) => {
  return (
    <div className="card" style={{ textAlign: "center", padding: "64px 24px", maxWidth: "560px", margin: "40px auto" }}>
      <div
        className="state-icon-circle"
        style={{
          width: "68px",
          height: "68px",
          backgroundColor: "rgba(163, 64, 84, 0.35)",
          color: "var(--palette-coral)",
          margin: "0 auto 16px",
        }}
      >
        <ShieldAlert size={36} />
      </div>
      <h2 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#fff" }}>403 - Access Denied</h2>
      <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", margin: "12px 0 24px" }}>
        Your account role does not have authorization to view or manipulate this resource.
        Access permissions are governed server-side by the REST API security layer.
      </p>
      <div>
        <Button variant="primary" onClick={onBack} icon={<ArrowLeft size={16} />}>
          Return to Dashboard
        </Button>
      </div>
    </div>
  );
};
