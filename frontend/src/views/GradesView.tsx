import React, { useEffect, useState, useCallback } from "react";
import { Award, Plus, Edit, CheckCircle, Search, Filter } from "lucide-react";
import { Grade, Enrollment, Course } from "../types/entities";
import { gradeService } from "../services/grade.service";
import { enrollmentService } from "../services/enrollment.service";
import { courseService } from "../services/course.service";
import { Button } from "../components/common/Button";
import { Input } from "../components/common/Input";
import { Select } from "../components/common/Select";
import { Modal } from "../components/common/Modal";
import { Badge } from "../components/common/Badge";
import { Pagination } from "../components/common/Pagination";
import { EmptyState } from "../components/common/EmptyState";
import { ErrorState } from "../components/common/ErrorState";
import { useToast } from "../context/ToastContext";
import { useAuth } from "../context/AuthContext";
import { ApiError } from "../services/api-client";

export const GradesView: React.FC = () => {
  const { showToast } = useToast();
  const { user, isStudent, isInstructor, canManageAcademics } = useAuth();

  const [grades, setGrades] = useState<Grade[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
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
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState<Grade | null>(null);

  // Form
  const [formData, setFormData] = useState({
    enrollmentId: "",
    numericGrade: 1.5,
    midtermGrade: 1.5,
    finalGrade: 1.5,
    remarks: "PASSED",
    isFinalized: true,
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canEncodeGrades = canManageAcademics || isInstructor;

  const fetchGrades = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await gradeService.listGrades({
        student_id: isStudent ? (user?.studentId || undefined) : undefined,
        course_id: selectedCourse || undefined,
        search: searchQuery.trim() || undefined,
        page: currentPage,
        per_page: 10,
      });
      setGrades(res.data);
      setPaginationMeta(res.meta);
    } catch (err: any) {
      setError(err.message || "Failed to load grade records");
    } finally {
      setIsLoading(false);
    }
  }, [isStudent, user, selectedCourse, searchQuery, currentPage]);

  useEffect(() => {
    courseService.listCourses({ per_page: 100 }).then((res) => setCourses(res.data)).catch(() => {});
  }, []);

  useEffect(() => {
    fetchGrades();
    if (canEncodeGrades) {
      enrollmentService.listEnrollments({ status: "ENROLLED", per_page: 100 })
        .then((res) => setEnrollments(res.data))
        .catch(() => {});
    }
  }, [fetchGrades, canEncodeGrades]);

  const handleOpenSubmit = () => {
    setFormData({
      enrollmentId: enrollments[0]?.id || "",
      numericGrade: 1.75,
      midtermGrade: 1.75,
      finalGrade: 1.75,
      remarks: "PASSED",
      isFinalized: true,
    });
    setFieldErrors({});
    setIsSubmitOpen(true);
  };

  const handleOpenEdit = (g: Grade) => {
    setSelectedGrade(g);
    setFormData({
      enrollmentId: g.enrollmentId,
      numericGrade: g.numericGrade || 1.75,
      midtermGrade: g.midtermGrade || 1.75,
      finalGrade: g.finalGrade || 1.75,
      remarks: g.remarks,
      isFinalized: g.isFinalized,
    });
    setFieldErrors({});
    setIsEditOpen(true);
  };

  const handleSubmitGrade = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFieldErrors({});
    try {
      await gradeService.submitGrade({
        enrollmentId: formData.enrollmentId,
        numericGrade: Number(formData.numericGrade),
        midtermGrade: Number(formData.midtermGrade),
        finalGrade: Number(formData.finalGrade),
        remarks: formData.remarks,
        isFinalized: formData.isFinalized,
      });
      showToast("Grade encoded and posted successfully.", "success");
      setIsSubmitOpen(false);
      fetchGrades();
    } catch (err: any) {
      if (err instanceof ApiError && err.fieldErrors) {
        setFieldErrors(err.fieldErrors);
      } else {
        showToast(err.message || "Failed to submit grade", "error");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateGrade = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGrade) return;
    setIsSubmitting(true);
    setFieldErrors({});
    try {
      await gradeService.updateGrade(selectedGrade.id, {
        numericGrade: Number(formData.numericGrade),
        midtermGrade: Number(formData.midtermGrade),
        finalGrade: Number(formData.finalGrade),
        remarks: formData.remarks,
        isFinalized: formData.isFinalized,
      });
      showToast("Grade updated successfully.", "success");
      setIsEditOpen(false);
      fetchGrades();
    } catch (err: any) {
      if (err instanceof ApiError && err.fieldErrors) {
        setFieldErrors(err.fieldErrors);
      } else {
        showToast(err.message || "Failed to update grade", "error");
      }
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
              {isStudent ? "My Academic Grades" : "Grade Management & Encoding"}
            </h2>
            <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
              Official Philippine grading scale (1.00 - 5.00), midterm ratings, and final evaluation remarks
            </p>
          </div>

          {canEncodeGrades && (
            <Button variant="primary" onClick={handleOpenSubmit} icon={<Plus size={18} />}>
              Encode Grade
            </Button>
          )}
        </div>

        <div style={{ marginTop: "20px", display: "flex", gap: "16px", flexWrap: "wrap", alignItems: "flex-end" }}>
          <div style={{ flex: 1, minWidth: "240px" }}>
            <Input
              label="Search Grades"
              placeholder={isStudent ? "Search by course code, title, remarks..." : "Search student #, name, course code, remarks..."}
              icon={<Search size={16} />}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>

          <div style={{ minWidth: "240px", flex: 1 }}>
            <Select
              label="Filter by Course"
              options={[
                { value: "", label: "All Courses" },
                ...courses.map((c) => ({ value: c.id, label: `${c.code} - ${c.title}` })),
              ]}
              value={selectedCourse}
              onChange={(e) => {
                setSelectedCourse(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
        </div>
      </div>

      <div className="card">
        {error ? (
          <ErrorState message={error} onRetry={fetchGrades} />
        ) : isLoading ? (
          <div style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>
            Loading grade records...
          </div>
        ) : grades.length === 0 ? (
          <EmptyState
            title="No Grades Found"
            description={isStudent ? "You have no finalized grades posted yet." : "No grade submissions recorded."}
          />
        ) : (
          <>
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    {!isStudent && <th>Student #</th>}
                    {!isStudent && <th>Student Name</th>}
                    <th>Course Code</th>
                    {isStudent && <th>Course Title</th>}
                    {isStudent && <th>Section</th>}
                    {isStudent && <th>Units</th>}
                    <th>Midterm</th>
                    <th>Final</th>
                    <th>Rating</th>
                    <th>Remarks</th>
                    <th>Status</th>
                    {canEncodeGrades && <th style={{ textAlign: "right" }}>Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {grades.map((g) => (
                    <tr key={g.id}>
                      {!isStudent && (
                        <td style={{ fontWeight: 600, color: "var(--palette-amber)" }}>
                          {g.enrollment.student.studentNumber}
                        </td>
                      )}
                      {!isStudent && (
                        <td style={{ color: "#fff", fontWeight: 500 }}>
                          {g.enrollment.student.user.lastName}, {g.enrollment.student.user.firstName}
                        </td>
                      )}
                      <td>
                        <strong style={{ color: "var(--palette-amber)" }}>{g.enrollment.courseOffering.course.code}</strong>
                        {!isStudent && (
                          <div style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>
                            Sec {g.enrollment.courseOffering.sectionCode}
                          </div>
                        )}
                      </td>
                      {isStudent && (
                        <td style={{ color: "#fff", fontWeight: 500 }}>
                          {g.enrollment.courseOffering.course.title}
                        </td>
                      )}
                      {isStudent && (
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
                            {g.enrollment.courseOffering.sectionCode}
                          </span>
                        </td>
                      )}
                      {isStudent && (
                        <td style={{ fontWeight: 600, color: "#fff" }}>
                          {g.enrollment.courseOffering.course.units}
                        </td>
                      )}
                      <td>{g.midtermGrade !== null ? Number(g.midtermGrade).toFixed(2) : "—"}</td>
                      <td>{g.finalGrade !== null ? Number(g.finalGrade).toFixed(2) : "—"}</td>
                      <td style={{ fontWeight: 800, fontSize: "0.95rem", color: "#fff" }}>
                        {g.numericGrade !== null ? Number(g.numericGrade).toFixed(2) : g.letterGrade || "—"}
                      </td>
                      <td>
                        <Badge
                          variant={
                            g.remarks === "PASSED"
                              ? "passed"
                              : g.remarks === "FAILED"
                              ? "failed"
                              : "active"
                          }
                        >
                          {g.remarks}
                        </Badge>
                      </td>
                      <td>
                        {g.isFinalized ? (
                          <span style={{ fontSize: "0.78rem", color: "#4ade80", display: "flex", alignItems: "center", gap: "4px" }}>
                            <CheckCircle size={14} /> Finalized
                          </span>
                        ) : (
                          <span style={{ fontSize: "0.78rem", color: "var(--palette-amber)" }}>Draft</span>
                        )}
                      </td>
                      {canEncodeGrades && (
                        <td style={{ textAlign: "right" }}>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleOpenEdit(g)}
                            icon={<Edit size={14} />}
                          >
                            Update
                          </Button>
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

      {/* SUBMIT GRADE MODAL */}
      <Modal
        isOpen={isSubmitOpen}
        onClose={() => setIsSubmitOpen(false)}
        title="Encode Student Grade"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsSubmitOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleSubmitGrade} isLoading={isSubmitting}>
              Submit Grade
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmitGrade}>
          <Select
            label="Enrolled Student Section"
            required
            options={enrollments.map((enr) => ({
              value: enr.id,
              label: `${enr.student.studentNumber} - ${enr.student.user.lastName} (${enr.courseOffering.course.code} ${enr.courseOffering.sectionCode})`,
            }))}
            value={formData.enrollmentId}
            onChange={(e) => setFormData({ ...formData, enrollmentId: e.target.value })}
          />

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginTop: "14px" }}>
            <Input
              label="Midterm Grade (1.00 - 5.00)"
              type="number"
              step="0.25"
              min="1.0"
              max="5.0"
              required
              value={formData.midtermGrade}
              onChange={(e) => setFormData({ ...formData, midtermGrade: Number(e.target.value) })}
            />
            <Input
              label="Final Grade (1.00 - 5.00)"
              type="number"
              step="0.25"
              min="1.0"
              max="5.0"
              required
              value={formData.finalGrade}
              onChange={(e) => setFormData({ ...formData, finalGrade: Number(e.target.value), numericGrade: Number(e.target.value) })}
            />
            <Select
              label="Remarks"
              options={[
                { value: "PASSED", label: "PASSED" },
                { value: "FAILED", label: "FAILED" },
                { value: "INCOMPLETE", label: "INCOMPLETE" },
                { value: "DROPPED", label: "DROPPED" },
              ]}
              value={formData.remarks}
              onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
            />
          </div>
        </form>
      </Modal>

      {/* EDIT GRADE MODAL */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Update Student Grade"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsEditOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleUpdateGrade} isLoading={isSubmitting}>
              Save Grade
            </Button>
          </>
        }
      >
        <form onSubmit={handleUpdateGrade}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
            <Input
              label="Midterm Grade"
              type="number"
              step="0.25"
              min="1.0"
              max="5.0"
              required
              value={formData.midtermGrade}
              onChange={(e) => setFormData({ ...formData, midtermGrade: Number(e.target.value) })}
            />
            <Input
              label="Final Grade"
              type="number"
              step="0.25"
              min="1.0"
              max="5.0"
              required
              value={formData.finalGrade}
              onChange={(e) => setFormData({ ...formData, finalGrade: Number(e.target.value), numericGrade: Number(e.target.value) })}
            />
            <Select
              label="Remarks"
              options={[
                { value: "PASSED", label: "PASSED" },
                { value: "FAILED", label: "FAILED" },
                { value: "INCOMPLETE", label: "INCOMPLETE" },
                { value: "DROPPED", label: "DROPPED" },
              ]}
              value={formData.remarks}
              onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};
