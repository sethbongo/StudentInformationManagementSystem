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
  section: string;
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
      section: "Overview",
    },
    {
      id: "students",
      label: "Students",
      icon: <Users size={18} />,
      roles: ["ADMINISTRATOR", "REGISTRAR"],
      section: "Academics",
    },
    {
      id: "academic-record",
      label: isStudent ? "My Academic Record" : "Academic Records",
      icon: <FileText size={18} />,
      roles: ["ADMINISTRATOR", "REGISTRAR", "STUDENT"],
      section: "Academics",
    },
    {
      id: "programs",
      label: "Programs",
      icon: <Layers size={18} />,
      section: "Academics",
    },
    {
      id: "courses",
      label: "Courses",
      icon: <BookOpen size={18} />,
      section: "Academics",
    },
    {
      id: "terms",
      label: "Academic Terms",
      icon: <Calendar size={18} />,
      roles: ["ADMINISTRATOR", "REGISTRAR"],
      section: "Academics",
    },
    {
      id: "offerings",
      label: isInstructor ? "My Course Offerings" : "Course Offerings",
      icon: <Calendar size={18} />,
      section: "Classes & Grades",
    },
    {
      id: "enrollments",
      label: isStudent ? "My Enrollments" : "Enrollments",
      icon: <ClipboardList size={18} />,
      roles: ["ADMINISTRATOR", "REGISTRAR", "STUDENT"],
      section: "Classes & Grades",
    },
    {
      id: "grades",
      label: isStudent ? "My Grades" : isInstructor ? "Grade Submission" : "Grades",
      icon: <Award size={18} />,
      roles: ["ADMINISTRATOR", "REGISTRAR", "INSTRUCTOR", "STUDENT"],
      section: "Classes & Grades",
    },
    {
      id: "profile",
      label: "My Profile",
      icon: <UserCheck size={18} />,
      section: "Account",
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
        {visibleItems.map((item, index) => {
          const isActive = currentTab === item.id;
          const showSection = index === 0 || item.section !== visibleItems[index - 1].section;
          return (
            <React.Fragment key={item.id}>
              {showSection && (
                <span className="nav-section-title">{item.section}</span>
              )}
              <button
                type="button"
                className={`nav-item ${isActive ? "active" : ""}`}
                onClick={() => onTabChange(item.id)}
              >
                <span className="nav-item-icon">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            </React.Fragment>
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
