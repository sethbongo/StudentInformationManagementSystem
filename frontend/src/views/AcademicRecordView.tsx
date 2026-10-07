import React, { useEffect, useState, useCallback } from "react";
import { Award, BookOpen, GraduationCap, CheckCircle2, AlertCircle, Search, RefreshCw } from "lucide-react";
import { AcademicRecord, Student } from "../types/entities";
import { studentService } from "../services/student.service";
import { useAuth } from "../context/AuthContext";
import { Button } from "../components/common/Button";
import { Badge } from "../components/common/Badge";
import { EmptyState } from "../components/common/EmptyState";
import { ErrorState } from "../components/common/ErrorState";

export interface AcademicRecordViewProps {
  initialStudentId?: string;
}

export const AcademicRecordView: React.FC<AcademicRecordViewProps> = ({ initialStudentId }) => {
  const { user, isStudent, canManageAcademics } = useAuth();
  const [record, setRecord] = useState<AcademicRecord | null>(null);
  const [selectedStudentId, setSelectedStudentId] = useState<string>(initialStudentId || "");
  const [studentsList, setStudentsList] = useState<Student[]>([]);
  const [studentSearch, setStudentSearch] = useState("");
  const [recordSearch, setRecordSearch] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If user is Admin/Registrar, load student list for quick dropdown selection
  useEffect(() => {
    if (canManageAcademics) {
      studentService
        .listStudents({ per_page: 100 })
        .then((res) => {
          setStudentsList(res.data);
          if (!selectedStudentId && res.data.length > 0) {
            setSelectedStudentId(res.data[0].id);
          }
        })
        .catch(() => {});
    } else if (isStudent && user?.studentId) {
      setSelectedStudentId(user.studentId);
    }
  }, [canManageAcademics, isStudent, user]);

  const loadRecord = useCallback(async (targetId: string) => {
    if (!targetId) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await studentService.getAcademicRecord(targetId);
      setRecord(data);
    } catch (err: any) {
      setError(err.message || "Failed to load academic record");
      setRecord(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedStudentId) {
      loadRecord(selectedStudentId);
    }
  }, [selectedStudentId, loadRecord]);

  const filteredStudents = studentsList.filter((s) => {
    if (!studentSearch.trim()) return true;
    const q = studentSearch.toLowerCase();
    return (
      s.studentNumber.toLowerCase().includes(q) ||
      s.user.lastName.toLowerCase().includes(q) ||
      s.user.firstName.toLowerCase().includes(q) ||
      s.program.code.toLowerCase().includes(q)
    );
  });

  const filteredTerms = record
    ? record.academicTerms
        .map((termGroup) => {
          const q = recordSearch.trim().toLowerCase();
          if (!q) return termGroup;

          const termMatches =
            termGroup.term.code.toLowerCase().includes(q) ||
            termGroup.term.name.toLowerCase().includes(q);

          if (termMatches) return termGroup;

          const matchedCourses = termGroup.courses.filter(
            (c) =>
              c.courseCode.toLowerCase().includes(q) ||
              c.courseTitle.toLowerCase().includes(q) ||
              (c.instructorName && c.instructorName.toLowerCase().includes(q)) ||
              c.sectionCode.toLowerCase().includes(q)
          );

          return {
            ...termGroup,
            courses: matchedCourses,
          };
        })
        .filter((termGroup) => termGroup.courses.length > 0)
    : [];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Selector Header for Admin/Registrar */}
      {canManageAcademics && (
        <div className="card">
          <div style={{ display: "flex", alignItems: "flex-end", gap: "16px", flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: "220px" }}>
              <label className="form-label">
                <Search size={14} /> Search Student
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="Type name, student #, or program..."
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
              />
            </div>

            <div style={{ flex: 2, minWidth: "260px" }}>
              <label className="form-label">Select Student Record ({filteredStudents.length} matches)</label>
              <select
                className="form-select"
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
              >
                {filteredStudents.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.studentNumber} - {s.user.lastName}, {s.user.firstName} ({s.program.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Button
                variant="outline"
                size="md"
                onClick={() => loadRecord(selectedStudentId)}
                icon={<RefreshCw size={15} />}
              >
                Refresh Transcript
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Record Content */}
      {error ? (
        <div className="card">
          <ErrorState message={error} onRetry={() => loadRecord(selectedStudentId)} />
        </div>
      ) : isLoading ? (
        <div className="card" style={{ padding: "48px", textAlign: "center", color: "var(--text-muted)" }}>
          Loading official academic record from REST API...
        </div>
      ) : !record ? (
        <div className="card">
          <EmptyState
            title="No Academic Record Selected"
            description="Please choose a student from the directory to review their transcript and GWA."
          />
        </div>
      ) : (
        <>
          {/* Student Header Card */}
          <div
            className="card"
            style={{
              background: "linear-gradient(135deg, var(--palette-plum) 0%, var(--palette-wine) 100%)",
              border: "1px solid var(--border-medium)",
              padding: "28px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
              <div>
                <span
                  style={{
                    fontSize: "0.72rem",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                    color: "var(--palette-amber)",
                  }}
                >
                  Official Academic Transcript
                </span>
                <h2 style={{ fontSize: "1.6rem", fontWeight: 700, color: "#fff", marginTop: "4px" }}>
                  {record.student.firstName} {record.student.lastName}
                </h2>
                <div style={{ display: "flex", gap: "16px", marginTop: "8px", color: "var(--text-secondary)", fontSize: "0.85rem" }}>
                  <span>
                    Student #: <strong style={{ color: "#fff" }}>{record.student.studentNumber}</strong>
                  </span>
                  <span>•</span>
                  <span>
                    Program: <strong style={{ color: "#fff" }}>{record.student.program.code} - {record.student.program.name}</strong>
                  </span>
                </div>
              </div>

              <div>
                <Badge variant="active" style={{ fontSize: "0.85rem", padding: "6px 14px" }}>
                  {record.academicProgress.academicStanding.replace(/_/g, " ")}
                </Badge>
              </div>
            </div>

            {/* Academic Progress KPIs */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                gap: "16px",
                marginTop: "24px",
                paddingTop: "20px",
                borderTop: "1px solid var(--border-subtle)",
              }}
            >
              <div>
                <div style={{ fontSize: "0.75rem", color: "var(--palette-amber)", textTransform: "uppercase" }}>
                  Cumulative GWA
                </div>
                <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "#fff" }}>
                  {record.academicProgress.cumulativeGwa !== null
                    ? record.academicProgress.cumulativeGwa.toFixed(2)
                    : "N/A"}
                </div>
              </div>

              <div>
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase" }}>
                  Units Attempted
                </div>
                <div style={{ fontSize: "1.8rem", fontWeight: 700, color: "#fff" }}>
                  {record.academicProgress.totalUnitsAttempted}
                </div>
              </div>

              <div>
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase" }}>
                  Units Earned
                </div>
                <div style={{ fontSize: "1.8rem", fontWeight: 700, color: "#4ade80" }}>
                  {record.academicProgress.totalUnitsEarned}
                </div>
              </div>

              <div>
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase" }}>
                  Remaining Units
                </div>
                <div style={{ fontSize: "1.8rem", fontWeight: 700, color: "var(--palette-coral)" }}>
                  {record.academicProgress.remainingUnits}
                </div>
              </div>
            </div>
          </div>

          {/* Search bar inside transcript */}
          <div className="card" style={{ padding: "16px 20px" }}>
            <div style={{ display: "flex", gap: "14px", alignItems: "center", flexWrap: "wrap" }}>
              <div style={{ flex: 1, minWidth: "260px", position: "relative" }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Search transcript by course code, title, instructor, or term..."
                  value={recordSearch}
                  onChange={(e) => setRecordSearch(e.target.value)}
                  style={{ paddingLeft: "38px" }}
                />
                <Search
                  size={16}
                  style={{
                    position: "absolute",
                    left: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "var(--text-muted)",
                    pointerEvents: "none",
                  }}
                />
              </div>
              {recordSearch && (
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => setRecordSearch("")}
                >
                  Clear Search
                </button>
              )}
            </div>
          </div>

          {/* Academic Terms Grouped Breakdown */}
          {filteredTerms.length === 0 ? (
            <div className="card">
              <EmptyState
                title={recordSearch ? "No Courses Found" : "No Term Records Found"}
                description={
                  recordSearch
                    ? `No courses or terms match '${recordSearch}'.`
                    : "This student has no finalized term grades recorded in the system yet."
                }
              />
            </div>
          ) : (
            filteredTerms.map((termGroup) => (
              <div key={termGroup.term.id} className="card">
                <div className="card-header">
                  <div>
                    <h3 className="card-title">
                      <GraduationCap size={20} color="var(--palette-amber)" />
                      {termGroup.term.code} - {termGroup.term.name}
                    </h3>
                  </div>
                  <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
                    <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                      Term GWA:{" "}
                      <strong style={{ color: "var(--palette-amber)", fontSize: "1.05rem" }}>
                        {termGroup.summary.termGwa !== null
                          ? termGroup.summary.termGwa.toFixed(2)
                          : "Pending"}
                      </strong>
                    </div>
                    <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                      Earned: {termGroup.summary.totalUnitsEarned} / {termGroup.summary.totalUnitsAttempted} Units
                    </div>
                  </div>
                </div>

                <div className="table-responsive">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Course Code</th>
                        <th>Course Title</th>
                        <th>Units</th>
                        <th>Section</th>
                        <th>Instructor</th>
                        <th>Grade</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {termGroup.courses.map((course) => (
                        <tr key={course.enrollmentId}>
                          <td style={{ fontWeight: 600, color: "var(--palette-amber)" }}>
                            {course.courseCode}
                          </td>
                          <td style={{ color: "#fff" }}>{course.courseTitle}</td>
                          <td>{course.units}</td>
                          <td>{course.sectionCode}</td>
                          <td>{course.instructorName || "TBA"}</td>
                          <td style={{ fontWeight: 700, color: "#fff" }}>
                            {course.numericGrade !== null
                              ? course.numericGrade.toFixed(2)
                              : course.letterGrade || "—"}
                          </td>
                          <td>
                            <Badge
                              variant={
                                course.remarks === "PASSED"
                                  ? "passed"
                                  : course.remarks === "FAILED"
                                  ? "failed"
                                  : "active"
                              }
                            >
                              {course.remarks || course.enrollmentStatus}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))
          )}
        </>
      )}
    </div>
  );
};
