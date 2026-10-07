import React, { useState } from "react";
import { GraduationCap, Lock, Mail, Eye, EyeOff, AlertCircle, Sparkles } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { Button } from "../components/common/Button";
import { apiClient, ApiError } from "../services/api-client";

export const LoginView: React.FC = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMessage("Please enter both email and password.");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      await login({ email, password });
    } catch (err: any) {
      if (err instanceof ApiError) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage("An unexpected authentication error occurred.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickFill = (roleEmail: string) => {
    setEmail(roleEmail);
    setPassword("Password123!");
    setErrorMessage(null);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "var(--palette-deep-dark)",
        padding: "24px",
        background: "radial-gradient(circle at 50% 30%, #44174E 0%, #1B1931 75%)",
      }}
    >
      <div
        className="card"
        style={{
          width: "100%",
          maxWidth: "460px",
          padding: "36px 32px",
          backgroundColor: "rgba(27, 25, 49, 0.88)",
          boxShadow: "0 20px 50px rgba(0, 0, 0, 0.6), 0 0 30px rgba(163, 64, 84, 0.2)",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <div
            style={{
              width: "56px",
              height: "56px",
              margin: "0 auto 16px",
              background: "linear-gradient(135deg, var(--palette-rose), var(--palette-amber))",
              borderRadius: "16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              boxShadow: "0 8px 24px rgba(163, 64, 84, 0.45)",
            }}
          >
            <GraduationCap size={32} />
          </div>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#fff" }}>
            Student Information System
          </h2>
          <p style={{ color: "var(--palette-coral)", fontSize: "0.85rem", marginTop: "4px" }}>
            Sign in to access your academic portal
          </p>
          <div
            style={{
              marginTop: "8px",
              fontSize: "0.72rem",
              color: "var(--text-muted)",
              background: "rgba(68, 23, 78, 0.5)",
              padding: "4px 8px",
              borderRadius: "6px",
              display: "inline-block",
            }}
          >
            Target API: <code>{apiClient.getBaseUrl()}</code>
          </div>
        </div>

        {errorMessage && (
          <div
            style={{
              padding: "12px 14px",
              backgroundColor: "rgba(163, 64, 84, 0.25)",
              border: "1px solid var(--palette-coral)",
              borderRadius: "8px",
              color: "#FF9EAA",
              fontSize: "0.84rem",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              marginBottom: "20px",
            }}
          >
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="login-email">
              <Mail size={14} /> Email Address
            </label>
            <input
              id="login-email"
              type="email"
              className="form-input"
              placeholder="name@sims.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="login-password">
              <Lock size={14} /> Password
            </label>
            <div style={{ position: "relative" }}>
              <input
                id="login-password"
                type={showPassword ? "text" : "password"}
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ paddingRight: "40px" }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  right: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "transparent",
                  border: "none",
                  color: "var(--text-muted)",
                  cursor: "pointer",
                }}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            style={{ width: "100%", marginTop: "12px", height: "46px" }}
            isLoading={isLoading}
          >
            Sign In to Portal
          </Button>
        </form>

        <div style={{ marginTop: "28px", borderTop: "1px solid var(--border-subtle)", paddingTop: "20px" }}>
          <div
            style={{
              fontSize: "0.76rem",
              color: "var(--palette-amber)",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.8px",
              marginBottom: "10px",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <Sparkles size={14} /> Demo Quick Fill Credentials
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleQuickFill("admin@sims.edu")}
            >
              Administrator
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleQuickFill("registrar@sims.edu")}
            >
              Registrar
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleQuickFill("faculty@sims.edu")}
            >
              Instructor
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleQuickFill("student@sims.edu")}
            >
              Student
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
