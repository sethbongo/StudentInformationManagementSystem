import React from "react";
import {
  GraduationCap,
  LayoutDashboard,
  Users,
  BookOpen,
  Calendar,
  Layers,
  ClipboardList,
  Award,
  FileText,
  UserCheck,
  LogOut,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { Role } from "../../types/auth";

export interface NavItemConfig {
  id: string;
  label: string;
  icon: React.ReactNode;
  roles?: Role[];
}

export interface SidebarProps {
  currentTab: string;
  onTabChange: (tabId: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onTabChange }) => {
  const { user, logout, hasRole, isStudent, isInstructor } = useAuth();

  const navItems: NavItemConfig[] = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: <LayoutDashboard size={18} />,
    },
    {
      id: "students",
      label: "Students",
      icon: <Users size={18} />,
      roles: ["ADMINISTRATOR", "REGISTRAR"],
    },
    {
      id: "academic-record",
      label: isStudent ? "My Academic Record" : "Academic Records",
      icon: <FileText size={18} />,
      roles: ["ADMINISTRATOR", "REGISTRAR", "STUDENT"],
    },
    {
      id: "programs",
      label: "Programs",
      icon: <Layers size={18} />,
    },
    {
      id: "courses",
      label: "Courses",
      icon: <BookOpen size={18} />,
    },
    {
      id: "terms",
      label: "Academic Terms",
      icon: <Calendar size={18} />,
      roles: ["ADMINISTRATOR", "REGISTRAR"],
    },
    {
      id: "offerings",
      label: isInstructor ? "My Course Offerings" : "Course Offerings",
      icon: <Calendar size={18} />,
    },
    {
      id: "enrollments",
      label: isStudent ? "My Enrollments" : "Enrollments",
      icon: <ClipboardList size={18} />,
      roles: ["ADMINISTRATOR", "REGISTRAR", "STUDENT"],
    },
    {
      id: "grades",
      label: isStudent ? "My Grades" : isInstructor ? "Grade Submission" : "Grades",
      icon: <Award size={18} />,
      roles: ["ADMINISTRATOR", "REGISTRAR", "INSTRUCTOR", "STUDENT"],
    },
    {
      id: "profile",
      label: "My Profile",
      icon: <UserCheck size={18} />,
    },
  ];

  const visibleItems = navItems.filter((item) => {
    if (!item.roles) return true;
    return hasRole(item.roles);
  });

  return (
    <aside className="app-sidebar" aria-label="Main Navigation">
      <div className="sidebar-brand">
        <div className="brand-icon">
          <GraduationCap size={22} />
        </div>
        <div>
          <div className="brand-title">SIMS PORTAL</div>
          <span className="brand-subtitle">REST API Client</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        <span className="nav-section-title">Navigation</span>
        {visibleItems.map((item) => {
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              className={`nav-item ${isActive ? "active" : ""}`}
              onClick={() => onTabChange(item.id)}
            >
              <span className="nav-item-icon">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {user && (
        <div className="sidebar-footer">
          <div className="user-mini-profile">
            <div className="user-avatar-circle">
              {user.firstName[0]}
              {user.lastName[0]}
            </div>
            <div className="user-meta">
              <div className="user-meta-name" title={`${user.firstName} ${user.lastName}`}>
                {user.firstName} {user.lastName}
              </div>
              <div className="user-meta-role">{user.role}</div>
            </div>
          </div>
          <button
            className="btn-icon-logout"
            onClick={logout}
            title="Log out of session"
            aria-label="Logout"
          >
            <LogOut size={16} />
          </button>
        </div>
      )}
    </aside>
  );
};
