import React, { useEffect, useState, useCallback } from "react";
import { Calendar, Plus, Edit, Trash2, CheckCircle2 } from "lucide-react";
import { AcademicTerm } from "../types/entities";
import { termService } from "../services/term.service";
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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedTerm, setSelectedTerm] = useState<AcademicTerm | null>(null);

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
      </div>

      <div className="card">
        {error ? (
          <ErrorState message={error} onRetry={fetchTerms} />
        ) : isLoading ? (
          <div style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>
            Loading academic terms...
          </div>
        ) : terms.length === 0 ? (
          <EmptyState title="No Academic Terms Found" />
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
                {terms.map((t) => (
                  <tr key={t.id}>
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
                      <td>
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
    </div>
  );
};
