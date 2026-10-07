import React from "react";
import { UserCheck, Shield, Mail, Key, Database, CheckCircle2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { Badge } from "../components/common/Badge";
import { apiClient } from "../services/api-client";

export const ProfileView: React.FC = () => {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", maxWidth: "900px" }}>
      <div className="card">
        <div style={{ display: "flex", alignItems: "center", gap: "20px", flexWrap: "wrap" }}>
          <div
            className="user-avatar-circle"
            style={{
              width: "72px",
              height: "72px",
              fontSize: "1.6rem",
              border: "3px solid var(--palette-amber)",
            }}
          >
            {user.firstName[0]}
            {user.lastName[0]}
          </div>

          <div>
            <h2 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#fff" }}>
              {user.firstName} {user.lastName}
            </h2>
            <div style={{ display: "flex", gap: "10px", alignItems: "center", marginTop: "4px" }}>
              <Badge variant="role">{user.role}</Badge>
              <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
                User ID: <code>{user.id}</code>
              </span>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <Mail size={18} color="var(--palette-amber)" /> Account Identity
            </h3>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "14px", fontSize: "0.88rem" }}>
            <div>
              <span className="text-muted" style={{ fontSize: "0.75rem" }}>Email Address</span>
              <p style={{ color: "#fff", fontWeight: 500 }}>{user.email}</p>
            </div>
            <div>
              <span className="text-muted" style={{ fontSize: "0.75rem" }}>Account Status</span>
              <p style={{ color: user.isActive ? "#4ade80" : "var(--palette-coral)" }}>
                {user.isActive ? "Active Verified Account" : "Inactive"}
              </p>
            </div>
            {user.studentNumber && (
              <div>
                <span className="text-muted" style={{ fontSize: "0.75rem" }}>Student Number</span>
                <p style={{ color: "var(--palette-amber)", fontWeight: 600 }}>{user.studentNumber}</p>
              </div>
            )}
            {user.studentId && (
              <div>
                <span className="text-muted" style={{ fontSize: "0.75rem" }}>Student Record ID</span>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.8rem" }}>{user.studentId}</p>
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <Shield size={18} color="var(--palette-amber)" /> Role & Security Boundary
            </h3>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "0.85rem" }}>
            <p style={{ color: "var(--text-secondary)" }}>
              Authorization is enforced server-side by the REST API for all HTTP requests:
            </p>

            <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#fff" }}>
              <CheckCircle2 size={16} color="#4ade80" />
              <span>JWT Bearer Token Authentication</span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#fff" }}>
              <CheckCircle2 size={16} color="#4ade80" />
              <span>Role-Based Access Control: <strong>{user.role}</strong></span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#fff" }}>
              <CheckCircle2 size={16} color="#4ade80" />
              <span>Object-Level Student Privacy Enforcement</span>
            </div>

            <div
              style={{
                marginTop: "10px",
                padding: "10px 14px",
                borderRadius: "var(--radius-md)",
                backgroundColor: "rgba(68, 23, 78, 0.4)",
                border: "1px solid var(--border-subtle)",
                fontSize: "0.76rem",
                color: "var(--palette-coral)",
              }}
            >
              Configured API Endpoint: <code>{apiClient.getBaseUrl()}</code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
