import React, { useEffect, useState } from "react";
import {
  Users,
  Layers,
  BookOpen,
  ClipboardList,
  GraduationCap,
  Calendar,
  Award,
  ArrowRight,
  Database,
  CheckCircle2,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { studentService } from "../services/student.service";
import { programService } from "../services/program.service";
import { offeringService } from "../services/offering.service";
import { enrollmentService } from "../services/enrollment.service";
import { Button } from "../components/common/Button";
import { ErrorState } from "../components/common/ErrorState";

export interface DashboardViewProps {
  onNavigate: (tabId: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate }) => {
  const { user, isStudent, isInstructor, canManageAcademics } = useAuth();
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalPrograms: 0,
    totalOfferings: 0,
    totalEnrollments: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDashboardData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Fire parallel queries to live REST API endpoints
      const [programsRes, offeringsRes] = await Promise.all([
        programService.listPrograms({ per_page: 1 }),
        offeringService.listOfferings({ per_page: 1 }),
      ]);

      let studentsTotal = 0;
      let enrollmentsTotal = 0;

      if (canManageAcademics) {
        const [studentsRes, enrollmentsRes] = await Promise.all([
          studentService.listStudents({ per_page: 1 }),
          enrollmentService.listEnrollments({ per_page: 1 }),
        ]);
        studentsTotal = studentsRes.meta.total;
        enrollmentsTotal = enrollmentsRes.meta.total;
      } else if (isStudent) {
        const enrollmentsRes = await enrollmentService.listEnrollments({ per_page: 10 });
        enrollmentsTotal = enrollmentsRes.meta.total;
      }

      setStats({
        totalStudents: studentsTotal,
        totalPrograms: programsRes.meta.total,
        totalOfferings: offeringsRes.meta.total,
        totalEnrollments: enrollmentsTotal,
      });
    } catch (err: any) {
      setError(err.message || "Failed to load dashboard statistics from backend.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  if (error) {
    return <ErrorState message={error} onRetry={loadDashboardData} />;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
      {/* Welcome Banner */}
      <div
        className="card"
        style={{
          background: "linear-gradient(135deg, var(--palette-plum) 0%, var(--palette-wine) 60%, var(--palette-rose) 140%)",
          border: "1px solid var(--border-medium)",
          padding: "32px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "20px",
        }}
      >
        <div>
          <span
            style={{
              fontSize: "0.75rem",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "1.2px",
              color: "var(--palette-amber)",
            }}
          >
            Academic Information Management Portal
          </span>
          <h2 style={{ fontSize: "1.8rem", fontWeight: 700, color: "#fff", marginTop: "4px" }}>
            Welcome back, {user?.firstName} {user?.lastName}!
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.92rem", marginTop: "6px", maxWidth: "600px" }}>
            You are logged in under role <strong style={{ color: "var(--palette-coral)" }}>{user?.role}</strong>.
            All actions and data displays are synchronized directly with the PostgreSQL REST API.
          </p>
        </div>

        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          {isStudent && (
            <Button
              variant="primary"
              onClick={() => onNavigate("academic-record")}
              icon={<Award size={18} />}
            >
              View My Transcript
            </Button>
          )}
          {canManageAcademics && (
            <Button
              variant="primary"
              onClick={() => onNavigate("students")}
              icon={<Users size={18} />}
            >
              Manage Students
            </Button>
          )}
          {isInstructor && (
            <Button
              variant="primary"
              onClick={() => onNavigate("grades")}
              icon={<Award size={18} />}
            >
              Submit Grades
            </Button>
          )}
        </div>
      </div>

      {/* Metric Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: "20px",
        }}
      >
        {canManageAcademics && (
          <div className="card" style={{ display: "flex", alignItems: "center", gap: "18px" }}>
            <div
              style={{
                width: "52px",
                height: "52px",
                borderRadius: "14px",
                backgroundColor: "rgba(163, 64, 84, 0.25)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--palette-rose)",
                border: "1px solid var(--border-medium)",
              }}
            >
              <Users size={26} />
            </div>
            <div>
              <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 500 }}>
                Total Active Students
              </div>
              <div style={{ fontSize: "1.75rem", fontWeight: 700, color: "#fff" }}>
                {isLoading ? "..." : stats.totalStudents}
              </div>
            </div>
          </div>
        )}

        <div className="card" style={{ display: "flex", alignItems: "center", gap: "18px" }}>
          <div
            style={{
              width: "52px",
              height: "52px",
              borderRadius: "14px",
              backgroundColor: "rgba(237, 158, 89, 0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--palette-amber)",
              border: "1px solid rgba(237, 158, 89, 0.35)",
            }}
          >
            <Layers size={26} />
          </div>
          <div>
            <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 500 }}>
              Academic Programs
            </div>
            <div style={{ fontSize: "1.75rem", fontWeight: 700, color: "#fff" }}>
              {isLoading ? "..." : stats.totalPrograms}
            </div>
          </div>
        </div>

        <div className="card" style={{ display: "flex", alignItems: "center", gap: "18px" }}>
          <div
            style={{
              width: "52px",
              height: "52px",
              borderRadius: "14px",
              backgroundColor: "rgba(68, 23, 78, 0.6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--palette-coral)",
              border: "1px solid var(--border-subtle)",
            }}
          >
            <Calendar size={26} />
          </div>
          <div>
            <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 500 }}>
              Course Offerings
            </div>
            <div style={{ fontSize: "1.75rem", fontWeight: 700, color: "#fff" }}>
              {isLoading ? "..." : stats.totalOfferings}
            </div>
          </div>
        </div>

        <div className="card" style={{ display: "flex", alignItems: "center", gap: "18px" }}>
          <div
            style={{
              width: "52px",
              height: "52px",
              borderRadius: "14px",
              backgroundColor: "rgba(102, 34, 73, 0.4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#E98C89",
              border: "1px solid var(--border-medium)",
            }}
          >
            <ClipboardList size={26} />
          </div>
          <div>
            <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 500 }}>
              {isStudent ? "My Enrollments" : "Total Course Registrations"}
            </div>
            <div style={{ fontSize: "1.75rem", fontWeight: 700, color: "#fff" }}>
              {isLoading ? "..." : stats.totalEnrollments}
            </div>
          </div>
        </div>
      </div>

      {/* Module Shortcuts Grid */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">
            <GraduationCap size={20} color="var(--palette-amber)" /> System Quick Access
          </h3>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "16px",
          }}
        >
          {canManageAcademics && (
            <div
              style={{
                padding: "20px",
                borderRadius: "var(--radius-md)",
                backgroundColor: "rgba(22, 20, 38, 0.6)",
                border: "1px solid var(--border-subtle)",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
              onClick={() => onNavigate("students")}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontWeight: 600, color: "#fff" }}>Student Directory</span>
                <ArrowRight size={16} color="var(--palette-amber)" />
              </div>
              <p style={{ color: "var(--text-muted)", fontSize: "0.82rem", marginTop: "6px" }}>
                Browse, search by Dela, filter by program/year level, and enroll new students.
              </p>
            </div>
          )}

          <div
            style={{
              padding: "20px",
              borderRadius: "var(--radius-md)",
              backgroundColor: "rgba(22, 20, 38, 0.6)",
              border: "1px solid var(--border-subtle)",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
            onClick={() => onNavigate("programs")}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontWeight: 600, color: "#fff" }}>Degree Programs</span>
              <ArrowRight size={16} color="var(--palette-amber)" />
            </div>
            <p style={{ color: "var(--text-muted)", fontSize: "0.82rem", marginTop: "6px" }}>
              Curriculum programs: Computer Science, Information Technology, and Information Systems.
            </p>
          </div>

          <div
            style={{
              padding: "20px",
              borderRadius: "var(--radius-md)",
              backgroundColor: "rgba(22, 20, 38, 0.6)",
              border: "1px solid var(--border-subtle)",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
            onClick={() => onNavigate("courses")}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontWeight: 600, color: "#fff" }}>Course Catalog</span>
              <ArrowRight size={16} color="var(--palette-amber)" />
            </div>
            <p style={{ color: "var(--text-muted)", fontSize: "0.82rem", marginTop: "6px" }}>
              Course definitions, prerequisite trees, units, and curriculum specifications.
            </p>
          </div>

          <div
            style={{
              padding: "20px",
              borderRadius: "var(--radius-md)",
              backgroundColor: "rgba(22, 20, 38, 0.6)",
              border: "1px solid var(--border-subtle)",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
            onClick={() => onNavigate("offerings")}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontWeight: 600, color: "#fff" }}>Course Offerings</span>
              <ArrowRight size={16} color="var(--palette-amber)" />
            </div>
            <p style={{ color: "var(--text-muted)", fontSize: "0.82rem", marginTop: "6px" }}>
              Schedules, room assignments, instructor rosters, and max capacity limits.
            </p>
          </div>

          {(canManageAcademics || isStudent) && (
            <div
              style={{
                padding: "20px",
                borderRadius: "var(--radius-md)",
                backgroundColor: "rgba(22, 20, 38, 0.6)",
                border: "1px solid var(--border-subtle)",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
              onClick={() => onNavigate("academic-record")}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontWeight: 600, color: "#fff" }}>Official Transcript & GWA</span>
                <ArrowRight size={16} color="var(--palette-amber)" />
              </div>
              <p style={{ color: "var(--text-muted)", fontSize: "0.82rem", marginTop: "6px" }}>
                Cumulative Grade Weighted Average (GWA), term breakdowns, and earned units.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
