import React from "react";
import { FolderOpen } from "lucide-react";

export interface EmptyStateProps {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = "No records found",
  description = "There is currently no data matching your query.",
  action,
  icon = <FolderOpen size={28} />,
}) => {
  return (
    <div className="empty-state-box">
      <div className="state-icon-circle">{icon}</div>
      <h4 className="state-title">{title}</h4>
      <p className="state-desc">{description}</p>
      {action && <div style={{ marginTop: "12px" }}>{action}</div>}
    </div>
  );
};
