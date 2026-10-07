import React, { useEffect, useState, useCallback } from "react";
import {
  Users,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Eye,
  FileText,
  RotateCcw,
  ArrowUpDown,
  GraduationCap,
} from "lucide-react";
import { Student, Program } from "../types/entities";
import { studentService, CreateStudentPayload } from "../services/student.service";
import { programService } from "../services/program.service";
import { Button } from "../components/common/Button";
import { Input } from "../components/common/Input";
import { Select } from "../components/common/Select";
import { Badge } from "../components/common/Badge";
import { Modal } from "../components/common/Modal";
import { ConfirmDialog } from "../components/common/ConfirmDialog";
import { Pagination } from "../components/common/Pagination";
import { EmptyState } from "../components/common/EmptyState";
import { ErrorState } from "../components/common/ErrorState";
import { useToast } from "../context/ToastContext";
import { ApiError } from "../services/api-client";
import { useAuth } from "../context/AuthContext";

export interface StudentsViewProps {
  onViewRecord?: (studentId: string) => void;
}

export const StudentsView: React.FC<StudentsViewProps> = ({ onViewRecord }) => {
  const { showToast } = useToast();
  const { isAdmin } = useAuth();

  // Query states
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedProgram, setSelectedProgram] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [sortBy, setSortBy] = useState("lastName");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);

  // Data states
  const [students, setStudents] = useState<Student[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
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

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  // Form states
  const [formData, setFormData] = useState<CreateStudentPayload>({
    studentNumber: "",
    firstName: "",
    lastName: "",
    email: "",
    programId: "",
    yearLevel: 1,
    status: "ACTIVE",
    middleName: "",
    suffix: "",
    contactNumber: "",
    address: "",
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setCurrentPage(1);
    }, 350);
    return () => clearTimeout(handler);
  }, [search]);

  // Load programs for dropdown
  useEffect(() => {
    programService
      .listPrograms({ per_page: 50 })
      .then((res) => setPrograms(res.data))
      .catch(() => {});
  }, []);

  // Fetch Students
  const fetchStudents = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await studentService.listStudents({
        page: currentPage,
        per_page: pageSize,
        search: debouncedSearch || undefined,
        program_id: selectedProgram || undefined,
        year_level: selectedYear ? Number(selectedYear) : undefined,
        status: selectedStatus || undefined,
        sortBy,
        sortOrder,
      });
      setStudents(res.data);
      setPaginationMeta(res.meta);
    } catch (err: any) {
      setError(err.message || "Failed to retrieve student records");
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, pageSize, debouncedSearch, selectedProgram, selectedYear, selectedStatus, sortBy, sortOrder]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const handleResetFilters = () => {
    setSearch("");
    setDebouncedSearch("");
    setSelectedProgram("");
    setSelectedYear("");
    setSelectedStatus("");
    setCurrentPage(1);
    setSortBy("lastName");
    setSortOrder("asc");
  };

  const handleSortToggle = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  // Open Create
  const handleOpenCreate = () => {
    setFormData({
      studentNumber: `2026-${Math.floor(10000 + Math.random() * 90000)}`,
      firstName: "",
      lastName: "",
      email: "",
      programId: programs[0]?.id || "",
      yearLevel: 1,
      status: "ACTIVE",
      middleName: "",
      suffix: "",
      contactNumber: "",
      address: "",
    });
    setFieldErrors({});
    setIsCreateOpen(true);
  };

  // Open Edit
  const handleOpenEdit = (student: Student) => {
    setSelectedStudent(student);
    setFormData({
      studentNumber: student.studentNumber,
      firstName: student.user.firstName,
      lastName: student.user.lastName,
      email: student.user.email,
      programId: student.programId,
      yearLevel: student.yearLevel,
      status: student.status,
      middleName: student.middleName || "",
      suffix: student.suffix || "",
      contactNumber: student.contactNumber || "",
      address: student.address || "",
    });
    setFieldErrors({});
    setIsEditOpen(true);
  };

  // Submit Create
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFieldErrors({});

    try {
      await studentService.createStudent(formData);
      showToast("Student created successfully with auto-provisioned user account.", "success");
      setIsCreateOpen(false);
      fetchStudents();
    } catch (err: any) {
      if (err instanceof ApiError && err.fieldErrors) {
        setFieldErrors(err.fieldErrors);
        showToast("Validation failed. Please correct the highlighted fields.", "error");
      } else {
        showToast(err.message || "Failed to create student", "error");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Edit
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;
    setIsSubmitting(true);
    setFieldErrors({});

    try {
      await studentService.updateStudent(selectedStudent.id, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        programId: formData.programId,
        yearLevel: Number(formData.yearLevel),
        status: formData.status,
        middleName: formData.middleName,
        suffix: formData.suffix,
        contactNumber: formData.contactNumber,
        address: formData.address,
      });
      showToast("Student profile updated successfully.", "success");
      setIsEditOpen(false);
      fetchStudents();
    } catch (err: any) {
      if (err instanceof ApiError && err.fieldErrors) {
        setFieldErrors(err.fieldErrors);
        showToast("Validation failed. Please correct the highlighted fields.", "error");
      } else {
        showToast(err.message || "Failed to update student", "error");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Confirm Delete
  const handleDeleteConfirm = async () => {
    if (!selectedStudent) return;
    setIsSubmitting(true);
    try {
      await studentService.deleteStudent(selectedStudent.id);
      showToast("Student record removed successfully.", "success");
      setIsDeleteOpen(false);
      fetchStudents();
    } catch (err: any) {
      showToast(err.message || "Failed to delete student", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Action Bar & Filters */}
      <div className="card">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "16px",
            marginBottom: "20px",
          }}
        >
          <div>
            <h2 style={{ fontSize: "1.35rem", fontWeight: 700, color: "#fff" }}>
              Student Information Management
            </h2>
            <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
              Browse and maintain official student master records
            </p>
          </div>

          <Button variant="primary" onClick={handleOpenCreate} icon={<Plus size={18} />}>
            Register New Student
          </Button>
        </div>

        {/* Filter Toolbar */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "12px",
            alignItems: "end",
          }}
        >
          {/* Search (e.g. dela) */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">
              <Search size={14} /> Search (Name / Student #)
            </label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. dela, 2026-00001..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Program Filter */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Degree Program</label>
            <select
              className="form-select"
              value={selectedProgram}
              onChange={(e) => {
                setSelectedProgram(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="">All Degree Programs</option>
              {programs.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.code} - {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Year Level Filter */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Year Level</label>
            <select
              className="form-select"
              value={selectedYear}
              onChange={(e) => {
                setSelectedYear(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="">All Year Levels</option>
              <option value="1">1st Year</option>
              <option value="2">2nd Year</option>
              <option value="3">3rd Year</option>
              <option value="4">4th Year</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Enrollment Status</label>
            <select
              className="form-select"
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="">All Statuses</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="INACTIVE">INACTIVE</option>
              <option value="PROBATION">PROBATION</option>
              <option value="GRADUATED">GRADUATED</option>
              <option value="DROPPED_OUT">DROPPED_OUT</option>
            </select>
          </div>

          {/* Reset Filters */}
          <div>
            <Button
              variant="outline"
              size="md"
              style={{ width: "100%" }}
              onClick={handleResetFilters}
              icon={<RotateCcw size={16} />}
            >
              Reset Filters
            </Button>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="card">
        {error ? (
          <ErrorState message={error} onRetry={fetchStudents} />
        ) : isLoading ? (
          <div style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>
            Loading students from REST API...
          </div>
        ) : students.length === 0 ? (
          <EmptyState
            title="No students match criteria"
            description="Try adjusting your search keywords, selected program, or year level."
            action={
              <Button variant="outline" size="sm" onClick={handleResetFilters}>
                Clear Active Filters
              </Button>
            }
          />
        ) : (
          <>
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th
                      style={{ cursor: "pointer" }}
                      onClick={() => handleSortToggle("studentNumber")}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        Student # <ArrowUpDown size={14} />
                      </div>
                    </th>
                    <th
                      style={{ cursor: "pointer" }}
                      onClick={() => handleSortToggle("lastName")}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        Full Name <ArrowUpDown size={14} />
                      </div>
                    </th>
                    <th>Email Address</th>
                    <th>Program</th>
                    <th>Year Level</th>
                    <th>Status</th>
                    <th style={{ textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student) => (
                    <tr key={student.id}>
                      <td style={{ fontWeight: 600, color: "var(--palette-amber)" }}>
                        {student.studentNumber}
                      </td>
                      <td style={{ color: "#fff", fontWeight: 500 }}>
                        {student.user.lastName}, {student.user.firstName}
                        {student.middleName ? ` ${student.middleName}` : ""}
                        {student.suffix ? ` ${student.suffix}` : ""}
                      </td>
                      <td>{student.user.email}</td>
                      <td>
                        <span
                          style={{
                            fontWeight: 600,
                            padding: "3px 8px",
                            backgroundColor: "rgba(68, 23, 78, 0.5)",
                            borderRadius: "6px",
                            color: "var(--palette-coral)",
                          }}
                        >
                          {student.program.code}
                        </span>
                      </td>
                      <td>Year {student.yearLevel}</td>
                      <td>
                        <Badge
                          variant={
                            student.status === "ACTIVE"
                              ? "active"
                              : student.status === "GRADUATED"
                              ? "passed"
                              : "failed"
                          }
                        >
                          {student.status}
                        </Badge>
                      </td>
                      <td>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "flex-end",
                            gap: "8px",
                          }}
                        >
                          {onViewRecord && (
                            <button
                              className="btn btn-sm btn-outline"
                              onClick={() => onViewRecord(student.id)}
                              title="View Academic Transcript"
                            >
                              <FileText size={14} />
                            </button>
                          )}
                          <button
                            className="btn btn-sm btn-secondary"
                            onClick={() => {
                              setSelectedStudent(student);
                              setIsDetailOpen(true);
                            }}
                            title="View Details"
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            className="btn btn-sm btn-secondary"
                            onClick={() => handleOpenEdit(student)}
                            title="Edit Student"
                          >
                            <Edit size={14} />
                          </button>
                          {isAdmin && (
                            <button
                              className="btn btn-sm btn-danger"
                              onClick={() => {
                                setSelectedStudent(student);
                                setIsDeleteOpen(true);
                              }}
                              title="Delete Record"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </td>
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
        title="Register New Student"
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleCreateSubmit}
              isLoading={isSubmitting}
            >
              Create Student Record
            </Button>
          </>
        }
      >
        <form onSubmit={handleCreateSubmit}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <Input
              label="Student Number"
              required
              value={formData.studentNumber}
              error={fieldErrors.studentNumber}
              onChange={(e) => setFormData({ ...formData, studentNumber: e.target.value })}
            />
            <Input
              label="Institutional Email"
              type="email"
              required
              placeholder="student@sims.edu"
              value={formData.email}
              error={fieldErrors.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
            <Input
              label="First Name"
              required
              value={formData.firstName}
              error={fieldErrors.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
            />
            <Input
              label="Last Name"
              required
              value={formData.lastName}
              error={fieldErrors.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
            />
            <Input
              label="Middle Name (Optional)"
              value={formData.middleName || ""}
              onChange={(e) => setFormData({ ...formData, middleName: e.target.value })}
            />
            <Input
              label="Suffix (e.g. Jr, III)"
              value={formData.suffix || ""}
              onChange={(e) => setFormData({ ...formData, suffix: e.target.value })}
            />
            <Select
              label="Degree Program"
              required
              value={formData.programId}
              error={fieldErrors.programId}
              onChange={(e) => setFormData({ ...formData, programId: e.target.value })}
              options={programs.map((p) => ({ value: p.id, label: `${p.code} - ${p.name}` }))}
            />
            <Select
              label="Year Level"
              required
              value={formData.yearLevel}
              onChange={(e) => setFormData({ ...formData, yearLevel: Number(e.target.value) })}
              options={[
                { value: 1, label: "1st Year" },
                { value: 2, label: "2nd Year" },
                { value: 3, label: "3rd Year" },
                { value: 4, label: "4th Year" },
              ]}
            />
            <Input
              label="Contact Number"
              value={formData.contactNumber || ""}
              onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
            />
            <Input
              label="Residential Address"
              value={formData.address || ""}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
          </div>
        </form>
      </Modal>

      {/* EDIT MODAL */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title={`Edit Student: ${selectedStudent?.studentNumber}`}
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsEditOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleEditSubmit} isLoading={isSubmitting}>
              Save Changes
            </Button>
          </>
        }
      >
        <form onSubmit={handleEditSubmit}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <Input
              label="First Name"
              required
              value={formData.firstName}
              error={fieldErrors.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
            />
            <Input
              label="Last Name"
              required
              value={formData.lastName}
              error={fieldErrors.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
            />
            <Input
              label="Middle Name"
              value={formData.middleName || ""}
              onChange={(e) => setFormData({ ...formData, middleName: e.target.value })}
            />
            <Input
              label="Suffix"
              value={formData.suffix || ""}
              onChange={(e) => setFormData({ ...formData, suffix: e.target.value })}
            />
            <Select
              label="Degree Program"
              required
              value={formData.programId}
              onChange={(e) => setFormData({ ...formData, programId: e.target.value })}
              options={programs.map((p) => ({ value: p.id, label: `${p.code} - ${p.name}` }))}
            />
            <Select
              label="Year Level"
              required
              value={formData.yearLevel}
              onChange={(e) => setFormData({ ...formData, yearLevel: Number(e.target.value) })}
              options={[
                { value: 1, label: "1st Year" },
                { value: 2, label: "2nd Year" },
                { value: 3, label: "3rd Year" },
                { value: 4, label: "4th Year" },
              ]}
            />
            <Select
              label="Academic Status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              options={[
                { value: "ACTIVE", label: "ACTIVE" },
                { value: "INACTIVE", label: "INACTIVE" },
                { value: "PROBATION", label: "PROBATION" },
                { value: "GRADUATED", label: "GRADUATED" },
                { value: "DROPPED_OUT", label: "DROPPED_OUT" },
              ]}
            />
            <Input
              label="Contact Number"
              value={formData.contactNumber || ""}
              onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
            />
          </div>
        </form>
      </Modal>

      {/* DETAIL MODAL */}
      <Modal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        title="Student Profile Overview"
      >
        {selectedStudent && (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <div className="user-avatar-circle" style={{ width: "54px", height: "54px", fontSize: "1.2rem" }}>
                {selectedStudent.user.firstName[0]}
                {selectedStudent.user.lastName[0]}
              </div>
              <div>
                <h3 style={{ fontSize: "1.2rem", color: "#fff" }}>
                  {selectedStudent.user.firstName} {selectedStudent.middleName} {selectedStudent.user.lastName} {selectedStudent.suffix}
                </h3>
                <span style={{ color: "var(--palette-amber)", fontSize: "0.85rem", fontWeight: 600 }}>
                  {selectedStudent.studentNumber}
                </span>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginTop: "12px" }}>
              <div>
                <span className="text-muted" style={{ fontSize: "0.75rem" }}>Institutional Email</span>
                <p style={{ color: "#fff" }}>{selectedStudent.user.email}</p>
              </div>
              <div>
                <span className="text-muted" style={{ fontSize: "0.75rem" }}>Degree Program</span>
                <p style={{ color: "#fff" }}>{selectedStudent.program.code} - {selectedStudent.program.name}</p>
              </div>
              <div>
                <span className="text-muted" style={{ fontSize: "0.75rem" }}>Year Level</span>
                <p style={{ color: "#fff" }}>Year {selectedStudent.yearLevel}</p>
              </div>
              <div>
                <span className="text-muted" style={{ fontSize: "0.75rem" }}>Academic Status</span>
                <p style={{ color: "#fff" }}>{selectedStudent.status}</p>
              </div>
              <div>
                <span className="text-muted" style={{ fontSize: "0.75rem" }}>Contact Number</span>
                <p style={{ color: "#fff" }}>{selectedStudent.contactNumber || "N/A"}</p>
              </div>
              <div>
                <span className="text-muted" style={{ fontSize: "0.75rem" }}>Address</span>
                <p style={{ color: "#fff" }}>{selectedStudent.address || "N/A"}</p>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* CONFIRM DELETE DIALOG */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Confirm Student Deactivation"
        message={`Are you sure you want to deactivate or remove student '${selectedStudent?.studentNumber}' (${selectedStudent?.user.firstName} ${selectedStudent?.user.lastName})?`}
        confirmText="Delete Record"
        isLoading={isSubmitting}
      />
    </div>
  );
};
