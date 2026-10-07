import React, { useEffect, useState, useCallback } from "react";
import { ClipboardList, Plus, Trash2, CheckCircle2, AlertCircle, Search } from "lucide-react";
import { Enrollment, CourseOffering, Student } from "../types/entities";
import { enrollmentService } from "../services/enrollment.service";
import { offeringService } from "../services/offering.service";
import { studentService } from "../services/student.service";
import { Button } from "../components/common/Button";
import { Select } from "../components/common/Select";
import { Modal } from "../components/common/Modal";
import { ConfirmDialog } from "../components/common/ConfirmDialog";
import { Badge } from "../components/common/Badge";
import { Pagination } from "../components/common/Pagination";
import { EmptyState } from "../components/common/EmptyState";
import { ErrorState } from "../components/common/ErrorState";
import { useToast } from "../context/ToastContext";
import { useAuth } from "../context/AuthContext";
import { ApiError } from "../services/api-client";

export const EnrollmentsView: React.FC = () => {
  const { showToast } = useToast();
  const { user, isStudent, canManageAcademics } = useAuth();

  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [offerings, setOfferings] = useState<CourseOffering[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [paginationMeta, setPaginationMeta] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modals
  const [isEnrollOpen, setIsEnrollOpen] = useState(false);
  const [isDropOpen, setIsDropOpen] = useState(false);
  const [selectedEnrollment, setSelectedEnrollment] = useState<Enrollment | null>(null);

  // Form
  const [enrollStudentId, setEnrollStudentId] = useState("");
  const [enrollOfferingId, setEnrollOfferingId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  useEffect(() => {
    offeringService.listOfferings({ per_page: 50 }).then((res) => setOfferings(res.data)).catch(() => {});
    if (canManageAcademics) {
      studentService.listStudents({ per_page: 100 }).then((res) => setStudents(res.data)).catch(() => {});
    }
  }, [canManageAcademics]);

  const fetchEnrollments = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await enrollmentService.listEnrollments({
        status: selectedStatus || undefined,
        page: currentPage,
        per_page: 10,
      });
      setEnrollments(res.data);
      setPaginationMeta(res.meta);
    } catch (err: any) {
      setError(err.message || "Failed to load enrollments");
    } finally {
      setIsLoading(false);
    }
  }, [selectedStatus, currentPage]);

  useEffect(() => {
    fetchEnrollments();
  }, [fetchEnrollments]);

  const handleOpenEnroll = () => {
    setEnrollStudentId(isStudent ? (user?.studentId || "") : (students[0]?.id || ""));
    setEnrollOfferingId(offerings[0]?.id || "");
    setServerError(null);
    setIsEnrollOpen(true);
  };

  const handleEnrollSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!enrollOfferingId) return;

    setIsSubmitting(true);
    setServerError(null);

    try {
      await enrollmentService.enrollStudent({
        studentId: isStudent ? undefined : enrollStudentId,
        courseOfferingId: enrollOfferingId,
      });
      showToast("Student registered successfully into course offering.", "success");
      setIsEnrollOpen(false);
      fetchEnrollments();
    } catch (err: any) {
      // Handles 409 Conflict (duplicate enrollment, prerequisite failure, capacity reached)
      const msg = err.message || "Failed to register enrollment.";
      setServerError(msg);
      showToast(msg, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDropConfirm = async () => {
    if (!selectedEnrollment) return;
    setIsSubmitting(true);
    try {
      await enrollmentService.dropEnrollment(selectedEnrollment.id);
      showToast("Enrollment status updated to DROPPED.", "success");
      setIsDropOpen(false);
      fetchEnrollments();
    } catch (err: any) {
      showToast(err.message || "Failed to drop enrollment", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <h2 style={{ fontSize: "1.35rem", fontWeight: 700, color: "#fff" }}>
              {isStudent ? "My Registered Courses" : "Student Course Enrollments"}
            </h2>
            <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
              Official course registrations, sections, and enrollment statuses
            </p>
          </div>

          <Button variant="primary" onClick={handleOpenEnroll} icon={<Plus size={18} />}>
            {isStudent ? "Register for Course" : "Enroll Student"}
          </Button>
        </div>

        <div style={{ marginTop: "16px", maxWidth: "260px" }}>
          <Select
            label="Filter by Status"
            options={[
              { value: "", label: "All Registration Statuses" },
              { value: "ENROLLED", label: "ENROLLED" },
              { value: "DROPPED", label: "DROPPED" },
              { value: "COMPLETED", label: "COMPLETED" },
            ]}
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
      </div>

      <div className="card">
        {error ? (
          <ErrorState message={error} onRetry={fetchEnrollments} />
        ) : isLoading ? (
          <div style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>
            Loading course enrollments...
          </div>
        ) : enrollments.length === 0 ? (
          <EmptyState
            title="No Enrollments Found"
            description={isStudent ? "You have not enrolled in any courses for this term yet." : "No enrollment records match criteria."}
          />
        ) : (
          <>
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    {!isStudent && <th>Student Number</th>}
                    {!isStudent && <th>Student Name</th>}
                    <th>Course</th>
                    <th>Section</th>
                    <th>Term</th>
                    <th>Schedule</th>
                    <th>Registration Date</th>
                    <th>Status</th>
                    {canManageAcademics && <th style={{ textAlign: "right" }}>Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {enrollments.map((enr) => (
                    <tr key={enr.id}>
                      {!isStudent && (
                        <td style={{ fontWeight: 600, color: "var(--palette-amber)" }}>
                          {enr.student.studentNumber}
                        </td>
                      )}
                      {!isStudent && (
                        <td style={{ color: "#fff", fontWeight: 500 }}>
                          {enr.student.user.lastName}, {enr.student.user.firstName}
                        </td>
                      )}
                      <td>
                        <strong style={{ color: "var(--palette-amber)" }}>{enr.courseOffering.course.code}</strong>
                        <div style={{ color: "#fff", fontSize: "0.82rem" }}>{enr.courseOffering.course.title}</div>
                      </td>
                      <td>
                        <span
                          style={{
                            padding: "2px 8px",
                            backgroundColor: "rgba(68, 23, 78, 0.5)",
                            borderRadius: "4px",
                            fontWeight: 600,
                            color: "var(--palette-coral)",
                          }}
                        >
                          {enr.courseOffering.sectionCode}
                        </span>
                      </td>
                      <td>{enr.courseOffering.term.code}</td>
                      <td style={{ fontSize: "0.82rem" }}>{enr.courseOffering.schedulePattern || "TBA"}</td>
                      <td style={{ fontSize: "0.82rem" }}>
                        {new Date(enr.enrollmentDate).toLocaleDateString()}
                      </td>
                      <td>
                        <Badge
                          variant={
                            enr.status === "ENROLLED"
                              ? "active"
                              : enr.status === "COMPLETED"
                              ? "passed"
                              : "failed"
                          }
                        >
                          {enr.status}
                        </Badge>
                      </td>
                      {canManageAcademics && (
                        <td style={{ textAlign: "right" }}>
                          {enr.status === "ENROLLED" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedEnrollment(enr);
                                setIsDropOpen(true);
                              }}
                            >
                              Drop
                            </Button>
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Pagination meta={paginationMeta} onPageChange={(p) => setCurrentPage(p)} />
          </>
        )}
      </div>

      {/* ENROLL MODAL */}
      <Modal
        isOpen={isEnrollOpen}
        onClose={() => setIsEnrollOpen(false)}
        title={isStudent ? "Register Course Offering" : "Enroll Student in Course"}
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsEnrollOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleEnrollSubmit} isLoading={isSubmitting}>
              Confirm Registration
            </Button>
          </>
        }
      >
        <form onSubmit={handleEnrollSubmit}>
          {serverError && (
            <div
              style={{
                padding: "12px",
                backgroundColor: "rgba(163, 64, 84, 0.3)",
                border: "1px solid var(--palette-coral)",
                borderRadius: "8px",
                color: "#FF9EAA",
                fontSize: "0.84rem",
                display: "flex",
                gap: "8px",
                alignItems: "center",
                marginBottom: "16px",
              }}
            >
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <span>{serverError}</span>
            </div>
          )}

          {!isStudent && (
            <Select
              label="Student"
              required
              options={students.map((s) => ({
                value: s.id,
                label: `${s.studentNumber} - ${s.user.lastName}, ${s.user.firstName} (${s.program.code})`,
              }))}
              value={enrollStudentId}
              onChange={(e) => setEnrollStudentId(e.target.value)}
            />
          )}

          <Select
            label="Course Offering Section"
            required
            options={offerings.map((o) => ({
              value: o.id,
              label: `${o.course.code} (${o.sectionCode}) - ${o.term.code} [Cap: ${o._count?.enrollments || 0}/${o.maxCapacity}]`,
            }))}
            value={enrollOfferingId}
            onChange={(e) => setEnrollOfferingId(e.target.value)}
          />

          <p style={{ color: "var(--text-muted)", fontSize: "0.8rem", marginTop: "12px" }}>
            The backend REST API automatically validates course prerequisites, prevents duplicate registration,
            and enforces section capacity limits.
          </p>
        </form>
      </Modal>

      {/* DROP CONFIRM */}
      <ConfirmDialog
        isOpen={isDropOpen}
        onClose={() => setIsDropOpen(false)}
        onConfirm={handleDropConfirm}
        title="Confirm Course Drop"
        message={`Are you sure you want to mark enrollment for ${selectedEnrollment?.student.user.firstName} in ${selectedEnrollment?.courseOffering.course.code} as DROPPED?`}
        confirmText="Confirm Drop"
        isLoading={isSubmitting}
      />
    </div>
  );
};
