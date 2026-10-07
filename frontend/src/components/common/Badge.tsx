import React from "react";

export interface BadgeProps {
  children: React.ReactNode;
  variant?: "active" | "passed" | "failed" | "role" | "neutral";
  className?: string;
  style?: React.CSSProperties;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = "neutral",
  className = "",
  style,
}) => {
  const variantClass = `badge-${variant}`;
  return (
    <span className={`badge ${variantClass} ${className}`.trim()} style={style}>
      {children}
    </span>
  );
};
