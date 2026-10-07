import React from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

export interface AppLayoutProps {
  currentTab: string;
  onTabChange: (tabId: string) => void;
  title: string;
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  currentTab,
  onTabChange,
  title,
  children,
}) => {
  return (
    <div className="app-shell">
      <Sidebar currentTab={currentTab} onTabChange={onTabChange} />
      <div className="app-main-layout">
        <Header title={title} />
        <main className="page-container">{children}</main>
      </div>
    </div>
  );
};
