import React, { useEffect, useState, useCallback } from "react";
import { BookOpen, Plus, Edit, Trash2, Search, GitBranch } from "lucide-react";
import { Course, Program } from "../types/entities";
import { courseService } from "../services/course.service";
import { programService } from "../services/program.service";
import { Button } from "../components/common/Button";
import { Input } from "../components/common/Input";
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

export const CoursesView: React.FC = () => {
  const { showToast } = useToast();
  const { canManageAcademics, isAdmin } = useAuth();

  const [courses, setCourses] = useState<Course[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [search, setSearch] = useState("");
  const [selectedProgram, setSelectedProgram] = useState("");
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
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isPrereqOpen, setIsPrereqOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  // Forms
  const [formData, setFormData] = useState({
    code: "",
    title: "",
    description: "",
    units: 3,
    lectureHours: 3,
    labHours: 0,
    programId: "",
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    programService.listPrograms({ per_page: 50 }).then((res) => setPrograms(res.data)).catch(() => {});
  }, []);

  const fetchCourses = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await courseService.listCourses({
        search: search || undefined,
        program_id: selectedProgram || undefined,
        page: currentPage,
        per_page: 10,
      });
      setCourses(res.data);
      setPaginationMeta(res.meta);
    } catch (err: any) {
      setError(err.message || "Failed to load courses");
    } finally {
      setIsLoading(false);
    }
  }, [search, selectedProgram, currentPage]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const handleOpenCreate = () => {
    setFormData({
      code: "",
      title: "",
      description: "",
      units: 3,
      lectureHours: 3,
      labHours: 0,
      programId: programs[0]?.id || "",
    });
    setFieldErrors({});
    setIsCreateOpen(true);
  };

  const handleOpenEdit = (c: Course) => {
    setSelectedCourse(c);
    setFormData({
      code: c.code,
      title: c.title,
      description: c.description || "",
      units: c.units,
      lectureHours: c.lectureHours,
      labHours: c.labHours,
      programId: c.programId || "",
    });
    setFieldErrors({});
    setIsEditOpen(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFieldErrors({});
    try {
      await courseService.createCourse({
        code: formData.code,
        title: formData.title,
        description: formData.description,
        units: Number(formData.units),
        lectureHours: Number(formData.lectureHours),
        labHours: Number(formData.labHours),
        programId: formData.programId || undefined,
      });
      showToast("Course created successfully.", "success");
      setIsCreateOpen(false);
      fetchCourses();
    } catch (err: any) {
      if (err instanceof ApiError && err.fieldErrors) {
        setFieldErrors(err.fieldErrors);
      } else {
        showToast(err.message || "Failed to create course", "error");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourse) return;
    setIsSubmitting(true);
    setFieldErrors({});
    try {
      await courseService.updateCourse(selectedCourse.id, {
        title: formData.title,
        description: formData.description,
        units: Number(formData.units),
        lectureHours: Number(formData.lectureHours),
        labHours: Number(formData.labHours),
        programId: formData.programId || undefined,
      });
      showToast("Course updated successfully.", "success");
      setIsEditOpen(false);
      fetchCourses();
    } catch (err: any) {
      if (err instanceof ApiError && err.fieldErrors) {
        setFieldErrors(err.fieldErrors);
      } else {
        showToast(err.message || "Failed to update course", "error");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedCourse) return;
    setIsSubmitting(true);
    try {
      await courseService.deleteCourse(selectedCourse.id);
      showToast("Course deleted successfully.", "success");
      setIsDeleteOpen(false);
      fetchCourses();
    } catch (err: any) {
      showToast(err.message || "Failed to delete course", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <h2 style={{ fontSize: "1.35rem", fontWeight: 700, color: "#fff" }}>Course Catalog</h2>
            <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
              Standard curriculum courses, credit units, and prerequisite dependencies
            </p>
          </div>

          {canManageAcademics && (
            <Button variant="primary" onClick={handleOpenCreate} icon={<Plus size={18} />}>
              Add Course
            </Button>
          )}
        </div>

        <div style={{ display: "flex", gap: "12px", marginTop: "16px", flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: "240px" }}>
            <Input
              placeholder="Search course code or title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div style={{ minWidth: "220px" }}>
            <Select
              options={[{ value: "", label: "All Degree Programs" }, ...programs.map((p) => ({ value: p.id, label: p.code }))]}
              value={selectedProgram}
              onChange={(e) => setSelectedProgram(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="card">
        {error ? (
          <ErrorState message={error} onRetry={fetchCourses} />
        ) : isLoading ? (
          <div style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>
            Loading course catalog...
          </div>
        ) : courses.length === 0 ? (
          <EmptyState title="No courses found" description="No courses match your active search or program filter." />
        ) : (
          <>
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Course Code</th>
                    <th>Course Title</th>
                    <th>Units</th>
                    <th>Hours (Lec / Lab)</th>
                    <th>Program</th>
                    <th>Prerequisites</th>
                    <th>Status</th>
                    {canManageAcademics && <th style={{ textAlign: "right" }}>Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {courses.map((c) => (
                    <tr key={c.id}>
                      <td style={{ fontWeight: 700, color: "var(--palette-amber)" }}>{c.code}</td>
                      <td style={{ color: "#fff", fontWeight: 500 }}>{c.title}</td>
                      <td>{c.units} Units</td>
                      <td>{c.lectureHours} hrs / {c.labHours} hrs</td>
                      <td>{c.program?.code || "Core"}</td>
                      <td>
                        {c.prerequisites && c.prerequisites.length > 0 ? (
                          <button
                            className="btn btn-sm btn-outline"
                            onClick={() => {
                              setSelectedCourse(c);
                              setIsPrereqOpen(true);
                            }}
                            title="View Prerequisites"
                          >
                            <GitBranch size={13} /> {c.prerequisites.length} Req(s)
                          </button>
                        ) : (
                          <span style={{ color: "var(--text-dim)", fontSize: "0.75rem" }}>None</span>
                        )}
                      </td>
                      <td>
                        <Badge variant={c.status === "ACTIVE" ? "active" : "neutral"}>{c.status}</Badge>
                      </td>
                      {canManageAcademics && (
                        <td>
                          <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
                            <button
                              className="btn btn-sm btn-secondary"
                              onClick={() => handleOpenEdit(c)}
                              title="Edit Course"
                            >
                              <Edit size={14} />
                            </button>
                            {isAdmin && (
                              <button
                                className="btn btn-sm btn-danger"
                                onClick={() => {
                                  setSelectedCourse(c);
                                  setIsDeleteOpen(true);
                                }}
                                title="Delete Course"
                              >
                                <Trash2 size={14} />
                              </button>
                            )}
                          </div>
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

      {/* CREATE MODAL */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Add New Course"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleCreateSubmit} isLoading={isSubmitting}>
              Create Course
            </Button>
          </>
        }
      >
        <form onSubmit={handleCreateSubmit}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
            <Input
              label="Course Code"
              required
              placeholder="e.g. CS101"
              value={formData.code}
              error={fieldErrors.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
            />
            <Input
              label="Course Title"
              required
              placeholder="e.g. Introduction to Programming"
              value={formData.title}
              error={fieldErrors.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
            <Input
              label="Credit Units"
              type="number"
              required
              value={formData.units}
              error={fieldErrors.units}
              onChange={(e) => setFormData({ ...formData, units: Number(e.target.value) })}
            />
            <Select
              label="Degree Program"
              options={[{ value: "", label: "General Core" }, ...programs.map((p) => ({ value: p.id, label: p.code }))]}
              value={formData.programId}
              onChange={(e) => setFormData({ ...formData, programId: e.target.value })}
            />
            <Input
              label="Lecture Hours/Week"
              type="number"
              value={formData.lectureHours}
              onChange={(e) => setFormData({ ...formData, lectureHours: Number(e.target.value) })}
            />
            <Input
              label="Laboratory Hours/Week"
              type="number"
              value={formData.labHours}
              onChange={(e) => setFormData({ ...formData, labHours: Number(e.target.value) })}
            />
          </div>
          <div className="form-group" style={{ marginTop: "14px" }}>
            <label className="form-label">Course Description</label>
            <textarea
              className="form-textarea"
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
        </form>
      </Modal>

      {/* EDIT MODAL */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title={`Edit Course: ${selectedCourse?.code}`}
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsEditOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleEditSubmit} isLoading={isSubmitting}>
              Save Changes
            </Button>
          </>
        }
      >
        <form onSubmit={handleEditSubmit}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
            <Input
              label="Course Title"
              required
              value={formData.title}
              error={fieldErrors.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
            <Input
              label="Credit Units"
              type="number"
              required
              value={formData.units}
              error={fieldErrors.units}
              onChange={(e) => setFormData({ ...formData, units: Number(e.target.value) })}
            />
            <Input
              label="Lecture Hours/Week"
              type="number"
              value={formData.lectureHours}
              onChange={(e) => setFormData({ ...formData, lectureHours: Number(e.target.value) })}
            />
            <Input
              label="Laboratory Hours/Week"
              type="number"
              value={formData.labHours}
              onChange={(e) => setFormData({ ...formData, labHours: Number(e.target.value) })}
            />
          </div>
          <div className="form-group" style={{ marginTop: "14px" }}>
            <label className="form-label">Course Description</label>
            <textarea
              className="form-textarea"
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
        </form>
      </Modal>

      {/* PREREQUISITES MODAL */}
      <Modal
        isOpen={isPrereqOpen}
        onClose={() => setIsPrereqOpen(false)}
        title={`Prerequisites for ${selectedCourse?.code}`}
      >
        {selectedCourse?.prerequisites && selectedCourse.prerequisites.length > 0 ? (
          <div>
            <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: "16px" }}>
              Students must complete and pass the following prerequisite courses before registering:
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {selectedCourse.prerequisites.map((req: any) => {
                const pCourse = req.prerequisite || req.prerequisiteCourse || {};
                return (
                  <div
                    key={req.prerequisiteId || pCourse.id || req.id}
                    style={{
                      padding: "12px 16px",
                      borderRadius: "var(--radius-md)",
                      backgroundColor: "rgba(68, 23, 78, 0.4)",
                      border: "1px solid var(--border-subtle)",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div>
                      <strong style={{ color: "var(--palette-amber)" }}>{pCourse.code || "Course"}</strong>
                      <div style={{ color: "#fff", fontSize: "0.88rem" }}>{pCourse.title || "Prerequisite Course"}</div>
                    </div>
                    <Badge variant="role">{pCourse.units || 3} Units</Badge>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <EmptyState title="No Prerequisites" description="This course has no prerequisite requirements." />
        )}
      </Modal>

      {/* CONFIRM DELETE */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Confirm Course Deletion"
        message={`Are you sure you want to delete '${selectedCourse?.code}' (${selectedCourse?.title})?`}
        isLoading={isSubmitting}
      />
    </div>
  );
};
