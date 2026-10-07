import React from "react";
import { useAuth } from "../../context/AuthContext";
import { Badge } from "../common/Badge";

export interface HeaderProps {
  title: string;
}

export const Header: React.FC<HeaderProps> = ({ title }) => {
  const { user } = useAuth();

  return (
    <header className="app-header">
      <div className="header-title-box">
        <h1 className="header-page-title">{title}</h1>
      </div>

      <div className="header-right-actions">
        <div className="api-badge" title="Connected to Backend REST API">
          <span className="api-badge-dot"></span>
          <span>REST API v1 Connected</span>
        </div>

        {user && (
          <Badge variant="role">
            {user.role}
          </Badge>
        )}
      </div>
    </header>
  );
};
