import React, { useState } from "react";
import { useAuth } from "./context/AuthContext";
import { AppLayout } from "./components/layout/AppLayout";
import { LoginView } from "./views/LoginView";
import { DashboardView } from "./views/DashboardView";
import { StudentsView } from "./views/StudentsView";
import { ProgramsView } from "./views/ProgramsView";
import { CoursesView } from "./views/CoursesView";
import { TermsView } from "./views/TermsView";
import { OfferingsView } from "./views/OfferingsView";
import { EnrollmentsView } from "./views/EnrollmentsView";
import { GradesView } from "./views/GradesView";
import { AcademicRecordView } from "./views/AcademicRecordView";
import { ProfileView } from "./views/ProfileView";
import { AccessDeniedView } from "./views/AccessDeniedView";
import { GraduationCap, Loader2 } from "lucide-react";

export const App: React.FC = () => {
  const { isAuthenticated, isLoading, user, hasRole, isStudent } = useAuth();
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [targetStudentId, setTargetStudentId] = useState<string>("");

  if (isLoading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "var(--palette-deep-dark)",
          gap: "16px",
        }}
      >
        <div
          style={{
            width: "56px",
            height: "56px",
            borderRadius: "16px",
            background: "linear-gradient(135deg, var(--palette-rose), var(--palette-amber))",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            boxShadow: "0 0 24px rgba(163, 64, 84, 0.4)",
          }}
        >
          <GraduationCap size={32} />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "var(--palette-coral)" }}>
          <Loader2 size={18} className="animate-spin" />
          <span style={{ fontSize: "0.9rem", fontWeight: 500 }}>Connecting to REST API session...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginView />;
  }

  const handleNavigate = (tabId: string) => {
    setActiveTab(tabId);
  };

  const handleViewStudentRecord = (studentId: string) => {
    setTargetStudentId(studentId);
    setActiveTab("academic-record");
  };

  // Tab Title & Authorization Guard
  let viewContent: React.ReactNode = null;
  let viewTitle = "Dashboard";

  switch (activeTab) {
    case "dashboard":
      viewTitle = "Overview Dashboard";
      viewContent = <DashboardView onNavigate={handleNavigate} />;
      break;

    case "students":
      viewTitle = "Student Directory";
      if (!hasRole(["ADMINISTRATOR", "REGISTRAR"])) {
        viewContent = <AccessDeniedView onBack={() => setActiveTab("dashboard")} />;
      } else {
        viewContent = <StudentsView onViewRecord={handleViewStudentRecord} />;
      }
      break;

    case "programs":
      viewTitle = "Degree Programs";
      viewContent = <ProgramsView />;
      break;

    case "courses":
      viewTitle = "Course Catalog & Curricula";
      viewContent = <CoursesView />;
      break;

    case "terms":
      viewTitle = "Academic Terms";
      if (!hasRole(["ADMINISTRATOR", "REGISTRAR"])) {
        viewContent = <AccessDeniedView onBack={() => setActiveTab("dashboard")} />;
      } else {
        viewContent = <TermsView />;
      }
      break;

    case "offerings":
      viewTitle = "Course Offerings";
      viewContent = <OfferingsView />;
      break;

    case "enrollments":
      viewTitle = isStudent ? "My Registered Courses" : "Student Course Enrollments";
      viewContent = <EnrollmentsView />;
      break;

    case "grades":
      viewTitle = isStudent ? "My Academic Grades" : "Grade Management";
      viewContent = <GradesView />;
      break;

    case "academic-record":
      viewTitle = isStudent ? "My Academic Record & GWA" : "Student Academic Record";
      viewContent = <AcademicRecordView initialStudentId={targetStudentId} />;
      break;

    case "profile":
      viewTitle = "User Account Profile";
      viewContent = <ProfileView />;
      break;

    default:
      viewTitle = "Dashboard";
      viewContent = <DashboardView onNavigate={handleNavigate} />;
  }

  return (
    <AppLayout
      currentTab={activeTab}
      onTabChange={handleNavigate}
      title={viewTitle}
    >
      {viewContent}
    </AppLayout>
  );
};
