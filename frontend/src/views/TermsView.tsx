import React, { useEffect, useState, useCallback } from "react";
import { Calendar, Plus, Edit, Trash2, CheckCircle2, Search, BookOpen, Users, Layers, Info } from "lucide-react";
import { AcademicTerm, CourseOffering } from "../types/entities";
import { termService } from "../services/term.service";
import { offeringService } from "../services/offering.service";
import { Button } from "../components/common/Button";
import { Input } from "../components/common/Input";
import { Select } from "../components/common/Select";
import { Modal } from "../components/common/Modal";
import { ConfirmDialog } from "../components/common/ConfirmDialog";
import { Badge } from "../components/common/Badge";
import { EmptyState } from "../components/common/EmptyState";
import { ErrorState } from "../components/common/ErrorState";
import { useToast } from "../context/ToastContext";
import { useAuth } from "../context/AuthContext";
import { ApiError } from "../services/api-client";

export const TermsView: React.FC = () => {
  const { showToast } = useToast();
  const { canManageAcademics, isAdmin } = useAuth();

  const [terms, setTerms] = useState<AcademicTerm[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedTerm, setSelectedTerm] = useState<AcademicTerm | null>(null);

  // Term Details Modal (Connected Data)
  const [detailTerm, setDetailTerm] = useState<AcademicTerm | null>(null);
  const [termOfferings, setTermOfferings] = useState<CourseOffering[]>([]);
  const [isLoadingOfferings, setIsLoadingOfferings] = useState(false);

  const [formData, setFormData] = useState({
    code: "",
    name: "",
    academicYear: "2026-2027",
    semester: "1st Semester",
    startDate: "2026-08-15",
    endDate: "2026-12-20",
    isCurrent: false,
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchTerms = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await termService.listTerms({ per_page: 50 });
      setTerms(res.data);
    } catch (err: any) {
      setError(err.message || "Failed to load academic terms");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleRowClick = async (term: AcademicTerm) => {
    setDetailTerm(term);
    setIsLoadingOfferings(true);
    try {
      const res = await offeringService.listOfferings({ term_id: term.id, per_page: 100 });
      setTermOfferings(res.data);
    } catch {
      setTermOfferings([]);
    } finally {
      setIsLoadingOfferings(false);
    }
  };

  useEffect(() => {
    fetchTerms();
  }, [fetchTerms]);

  const handleOpenCreate = () => {
    setFormData({
      code: "AY2026-2027-2S",
      name: "Academic Year 2026-2027 Second Semester",
      academicYear: "2026-2027",
      semester: "2nd Semester",
      startDate: "2027-01-10",
      endDate: "2027-05-25",
      isCurrent: false,
    });
    setFieldErrors({});
    setIsCreateOpen(true);
  };

  const handleOpenEdit = (t: AcademicTerm) => {
    setSelectedTerm(t);
    setFormData({
      code: t.code,
      name: t.name,
      academicYear: t.academicYear,
      semester: t.semester,
      startDate: t.startDate.slice(0, 10),
      endDate: t.endDate.slice(0, 10),
      isCurrent: t.isCurrent,
    });
    setFieldErrors({});
    setIsEditOpen(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFieldErrors({});
    try {
      await termService.createTerm(formData);
      showToast("Academic term created successfully.", "success");
      setIsCreateOpen(false);
      fetchTerms();
    } catch (err: any) {
      if (err instanceof ApiError && err.fieldErrors) {
        setFieldErrors(err.fieldErrors);
      } else {
        showToast(err.message || "Failed to create academic term", "error");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTerm) return;
    setIsSubmitting(true);
    setFieldErrors({});
    try {
      await termService.updateTerm(selectedTerm.id, {
        name: formData.name,
        startDate: formData.startDate,
        endDate: formData.endDate,
        isCurrent: formData.isCurrent,
      });
      showToast("Academic term updated successfully.", "success");
      setIsEditOpen(false);
      fetchTerms();
    } catch (err: any) {
      if (err instanceof ApiError && err.fieldErrors) {
        setFieldErrors(err.fieldErrors);
      } else {
        showToast(err.message || "Failed to update academic term", "error");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedTerm) return;
    setIsSubmitting(true);
    try {
      await termService.deleteTerm(selectedTerm.id);
      showToast("Academic term deleted successfully.", "success");
      setIsDeleteOpen(false);
      fetchTerms();
    } catch (err: any) {
      showToast(err.message || "Failed to delete academic term", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredTerms = terms.filter((t) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      t.code.toLowerCase().includes(q) ||
      t.name.toLowerCase().includes(q) ||
      t.academicYear.toLowerCase().includes(q) ||
      t.semester.toLowerCase().includes(q)
    );
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <h2 style={{ fontSize: "1.35rem", fontWeight: 700, color: "#fff" }}>Academic Terms</h2>
            <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
              Academic calendars, semesters, and active registration windows
            </p>
          </div>

          {canManageAcademics && (
            <Button variant="primary" onClick={handleOpenCreate} icon={<Plus size={18} />}>
              Add Academic Term
            </Button>
          )}
        </div>

        <div style={{ marginTop: "18px", maxWidth: "420px" }}>
          <Input
            placeholder="Search terms by code, name, year, semester..."
            icon={<Search size={16} />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="card">
        <div style={{ marginBottom: "12px", display: "flex", alignItems: "center", gap: "6px", fontSize: "0.8rem", color: "var(--palette-amber)" }}>
          <Info size={14} /> Tip: Click on any academic term row to inspect its connected course offerings and statistics.
        </div>

        {error ? (
          <ErrorState message={error} onRetry={fetchTerms} />
        ) : isLoading ? (
          <div style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>
            Loading academic terms...
          </div>
        ) : filteredTerms.length === 0 ? (
          <EmptyState
            title={searchQuery ? "No Matching Terms" : "No Academic Terms Found"}
            description={searchQuery ? `No academic terms match '${searchQuery}'.` : undefined}
          />
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Term Code</th>
                  <th>Term Name</th>
                  <th>Academic Year</th>
                  <th>Semester</th>
                  <th>Duration</th>
                  <th>Active Period</th>
                  {canManageAcademics && <th style={{ textAlign: "right" }}>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {filteredTerms.map((t) => (
                  <tr
                    key={t.id}
                    onClick={() => handleRowClick(t)}
                    style={{ cursor: "pointer" }}
                    title="Click row to view connected details"
                  >
                    <td style={{ fontWeight: 700, color: "var(--palette-amber)" }}>{t.code}</td>
                    <td style={{ color: "#fff", fontWeight: 500 }}>{t.name}</td>
                    <td>{t.academicYear}</td>
                    <td>{t.semester}</td>
                    <td>
                      {new Date(t.startDate).toLocaleDateString()} — {new Date(t.endDate).toLocaleDateString()}
                    </td>
                    <td>
                      {t.isCurrent ? (
                        <Badge variant="active">Current Term</Badge>
                      ) : (
                        <Badge variant="neutral">Archived</Badge>
                      )}
                    </td>
                    {canManageAcademics && (
                      <td onClick={(e) => e.stopPropagation()}>
                        <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
                          <button
                            className="btn btn-sm btn-secondary"
                            onClick={() => handleOpenEdit(t)}
                            title="Edit Term"
                          >
                            <Edit size={14} />
                          </button>
                          {isAdmin && (
                            <button
                              className="btn btn-sm btn-danger"
                              onClick={() => {
                                setSelectedTerm(t);
                                setIsDeleteOpen(true);
                              }}
                              title="Delete Term"
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
        )}
      </div>

      {/* CREATE MODAL */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Add Academic Term"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleCreateSubmit} isLoading={isSubmitting}>
              Create Term
            </Button>
          </>
        }
      >
        <form onSubmit={handleCreateSubmit}>
          <Input
            label="Term Code"
            required
            value={formData.code}
            error={fieldErrors.code}
            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
          />
          <Input
            label="Term Name"
            required
            value={formData.name}
            error={fieldErrors.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <Input
              label="Academic Year"
              required
              value={formData.academicYear}
              onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
            />
            <Input
              label="Semester"
              required
              value={formData.semester}
              onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
            />
            <Input
              label="Start Date"
              type="date"
              required
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
            />
            <Input
              label="End Date"
              type="date"
              required
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
            />
          </div>
        </form>
      </Modal>

      {/* EDIT MODAL */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title={`Edit Term: ${selectedTerm?.code}`}
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
          <Input
            label="Term Name"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <Input
              label="Start Date"
              type="date"
              required
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
            />
            <Input
              label="End Date"
              type="date"
              required
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
            />
          </div>
        </form>
      </Modal>

      {/* DELETE CONFIRM */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Confirm Term Deletion"
        message={`Are you sure you want to delete '${selectedTerm?.code}' (${selectedTerm?.name})?`}
        isLoading={isSubmitting}
      />

      {/* CONNECTED TERM DETAILS MODAL */}
      <Modal
        isOpen={!!detailTerm}
        onClose={() => setDetailTerm(null)}
        title={`Academic Term Details: ${detailTerm?.code || ""}`}
        size="lg"
        footer={
          <Button variant="secondary" onClick={() => setDetailTerm(null)}>
            Close
          </Button>
        }
      >
        {detailTerm && (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {/* Term Summary Header Card */}
            <div
              style={{
                background: "linear-gradient(135deg, rgba(68, 23, 78, 0.45) 0%, rgba(102, 34, 73, 0.3) 100%)",
                border: "1px solid var(--border-medium)",
                borderRadius: "var(--radius-md)",
                padding: "20px",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
                <div>
                  <div style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "1px", color: "var(--palette-amber)", fontWeight: 600 }}>
                    Official Academic Term Calendar
                  </div>
                  <h3 style={{ fontSize: "1.3rem", fontWeight: 700, color: "#fff", marginTop: "2px" }}>
                    {detailTerm.name}
                  </h3>
                  <div style={{ display: "flex", gap: "16px", marginTop: "6px", color: "var(--text-secondary)", fontSize: "0.85rem", flexWrap: "wrap" }}>
                    <span>Academic Year: <strong style={{ color: "#fff" }}>{detailTerm.academicYear}</strong></span>
                    <span>•</span>
                    <span>Semester: <strong style={{ color: "#fff" }}>{detailTerm.semester}</strong></span>
                    <span>•</span>
                    <span>
                      Duration: <strong style={{ color: "#fff" }}>{new Date(detailTerm.startDate).toLocaleDateString()} — {new Date(detailTerm.endDate).toLocaleDateString()}</strong>
                    </span>
                  </div>
                </div>

                <div>
                  {detailTerm.isCurrent ? (
                    <Badge variant="active" style={{ fontSize: "0.85rem", padding: "6px 14px" }}>
                      Current Active Term
                    </Badge>
                  ) : (
                    <Badge variant="neutral" style={{ fontSize: "0.85rem", padding: "6px 14px" }}>
                      Archived Term
                    </Badge>
                  )}
                </div>
              </div>

              {/* Statistics Grid */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
                  gap: "12px",
                  marginTop: "16px",
                  paddingTop: "14px",
                  borderTop: "1px solid var(--border-subtle)",
                }}
              >
                <div>
                  <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", textTransform: "uppercase" }}>
                    Total Offerings
                  </div>
                  <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "#fff" }}>
                    {termOfferings.length}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", textTransform: "uppercase" }}>
                    Enrolled Students
                  </div>
                  <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "var(--palette-amber)" }}>
                    {termOfferings.reduce((sum, o) => sum + (o.enrolledCount || 0), 0)}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", textTransform: "uppercase" }}>
                    Total Capacity
                  </div>
                  <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "#fff" }}>
                    {termOfferings.reduce((sum, o) => sum + (o.maxCapacity || 0), 0)}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", textTransform: "uppercase" }}>
                    Capacity Filled
                  </div>
                  <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "#4ade80" }}>
                    {(() => {
                      const enrolled = termOfferings.reduce((sum, o) => sum + (o.enrolledCount || 0), 0);
                      const cap = termOfferings.reduce((sum, o) => sum + (o.maxCapacity || 0), 0);
                      return cap > 0 ? `${Math.round((enrolled / cap) * 100)}%` : "0%";
                    })()}
                  </div>
                </div>
              </div>
            </div>

            {/* Connected Course Offerings Section */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <h4 style={{ fontSize: "1.05rem", fontWeight: 600, color: "#fff", display: "flex", alignItems: "center", gap: "8px" }}>
                  <Layers size={18} color="var(--palette-coral)" /> Connected Course Offerings
                </h4>
                <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                  {termOfferings.length} section{termOfferings.length !== 1 ? "s" : ""} scheduled
                </span>
              </div>

              {isLoadingOfferings ? (
                <div style={{ padding: "30px", textAlign: "center", color: "var(--text-muted)" }}>
                  Loading connected course offerings...
                </div>
              ) : termOfferings.length === 0 ? (
                <EmptyState
                  title="No Course Offerings"
                  description="No course offerings have been created or assigned to this academic term yet."
                />
              ) : (
                <div className="table-responsive">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Course Code</th>
                        <th>Course Title</th>
                        <th>Section</th>
                        <th>Instructor</th>
                        <th>Schedule</th>
                        <th>Capacity</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {termOfferings.map((o) => (
                        <tr key={o.id}>
                          <td style={{ fontWeight: 700, color: "var(--palette-amber)" }}>
                            {o.course.code}
                          </td>
                          <td style={{ color: "#fff" }}>{o.course.title}</td>
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
                              {o.sectionCode}
                            </span>
                          </td>
                          <td>
                            {o.instructor
                              ? `${o.instructor.user.lastName}, ${o.instructor.user.firstName}`
                              : "Unassigned"}
                          </td>
                          <td style={{ fontSize: "0.8rem" }}>{o.schedulePattern || "TBA"}</td>
                          <td>
                            <span style={{ fontWeight: 600, color: "#fff" }}>
                              {o.enrolledCount ?? o._count?.enrollments ?? 0}
                            </span>{" "}
                            / {o.maxCapacity}
                          </td>
                          <td>
                            <Badge variant={o.status === "OPEN" ? "active" : o.status === "CLOSED" ? "failed" : "neutral"}>
                              {o.status}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
