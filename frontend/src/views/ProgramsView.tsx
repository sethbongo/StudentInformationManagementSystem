import React, { useEffect, useState, useCallback } from "react";
import { Layers, Plus, Edit, Trash2, Search, BookOpen, Users } from "lucide-react";
import { Program } from "../types/entities";
import { programService } from "../services/program.service";
import { Button } from "../components/common/Button";
import { Input } from "../components/common/Input";
import { Modal } from "../components/common/Modal";
import { ConfirmDialog } from "../components/common/ConfirmDialog";
import { Badge } from "../components/common/Badge";
import { EmptyState } from "../components/common/EmptyState";
import { ErrorState } from "../components/common/ErrorState";
import { useToast } from "../context/ToastContext";
import { useAuth } from "../context/AuthContext";
import { ApiError } from "../services/api-client";

export const ProgramsView: React.FC = () => {
  const { showToast } = useToast();
  const { canManageAcademics, isAdmin } = useAuth();

  const [programs, setPrograms] = useState<Program[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);

  // Forms
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    description: "",
    totalUnitsRequired: 140,
    status: "ACTIVE",
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchPrograms = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await programService.listPrograms({ search: search || undefined, per_page: 50 });
      setPrograms(res.data);
    } catch (err: any) {
      setError(err.message || "Failed to load academic programs");
    } finally {
      setIsLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchPrograms();
  }, [fetchPrograms]);

  const handleOpenCreate = () => {
    setFormData({ code: "", name: "", description: "", totalUnitsRequired: 140, status: "ACTIVE" });
    setFieldErrors({});
    setIsCreateOpen(true);
  };

  const handleOpenEdit = (p: Program) => {
    setSelectedProgram(p);
    setFormData({
      code: p.code,
      name: p.name,
      description: p.description || "",
      totalUnitsRequired: p.totalUnitsRequired || 140,
      status: p.status,
    });
    setFieldErrors({});
    setIsEditOpen(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFieldErrors({});
    try {
      await programService.createProgram({
        code: formData.code,
        name: formData.name,
        description: formData.description,
        totalUnitsRequired: Number(formData.totalUnitsRequired),
      });
      showToast("Program created successfully.", "success");
      setIsCreateOpen(false);
      fetchPrograms();
    } catch (err: any) {
      if (err instanceof ApiError && err.fieldErrors) {
        setFieldErrors(err.fieldErrors);
      } else {
        showToast(err.message || "Failed to create program", "error");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProgram) return;
    setIsSubmitting(true);
    setFieldErrors({});
    try {
      await programService.updateProgram(selectedProgram.id, {
        name: formData.name,
        description: formData.description,
        totalUnitsRequired: Number(formData.totalUnitsRequired),
        status: formData.status as any,
      });
      showToast("Program updated successfully.", "success");
      setIsEditOpen(false);
      fetchPrograms();
    } catch (err: any) {
      if (err instanceof ApiError && err.fieldErrors) {
        setFieldErrors(err.fieldErrors);
      } else {
        showToast(err.message || "Failed to update program", "error");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedProgram) return;
    setIsSubmitting(true);
    try {
      await programService.deleteProgram(selectedProgram.id);
      showToast("Program deleted successfully.", "success");
      setIsDeleteOpen(false);
      fetchPrograms();
    } catch (err: any) {
      showToast(err.message || "Failed to delete program", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <h2 style={{ fontSize: "1.35rem", fontWeight: 700, color: "#fff" }}>Degree Programs</h2>
            <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
              Academic curricula, required degree units, and program statuses
            </p>
          </div>

          {canManageAcademics && (
            <Button variant="primary" onClick={handleOpenCreate} icon={<Plus size={18} />}>
              Add Program
            </Button>
          )}
        </div>

        <div style={{ marginTop: "16px", maxWidth: "340px" }}>
          <Input
            placeholder="Search programs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="card">
        {error ? (
          <ErrorState message={error} onRetry={fetchPrograms} />
        ) : isLoading ? (
          <div style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>
            Loading degree programs...
          </div>
        ) : programs.length === 0 ? (
          <EmptyState title="No programs found" description="No academic degree programs match your query." />
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Program Title</th>
                  <th>Description</th>
                  <th>Total Units</th>
                  <th>Status</th>
                  {canManageAcademics && <th style={{ textAlign: "right" }}>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {programs.map((p) => (
                  <tr key={p.id}>
                    <td style={{ fontWeight: 700, color: "var(--palette-amber)" }}>{p.code}</td>
                    <td style={{ color: "#fff", fontWeight: 500 }}>{p.name}</td>
                    <td style={{ color: "var(--text-muted)", maxWidth: "360px" }}>{p.description || "—"}</td>
                    <td>{p.totalUnitsRequired} Units</td>
                    <td>
                      <Badge variant={p.status === "ACTIVE" ? "active" : "neutral"}>
                        {p.status}
                      </Badge>
                    </td>
                    {canManageAcademics && (
                      <td>
                        <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
                          <button
                            className="btn btn-sm btn-secondary"
                            onClick={() => handleOpenEdit(p)}
                            title="Edit Program"
                          >
                            <Edit size={14} />
                          </button>
                          {isAdmin && (
                            <button
                              className="btn btn-sm btn-danger"
                              onClick={() => {
                                setSelectedProgram(p);
                                setIsDeleteOpen(true);
                              }}
                              title="Delete Program"
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
        title="Add Degree Program"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleCreateSubmit} isLoading={isSubmitting}>
              Create Program
            </Button>
          </>
        }
      >
        <form onSubmit={handleCreateSubmit}>
          <Input
            label="Program Code (e.g. BSCS)"
            required
            value={formData.code}
            error={fieldErrors.code}
            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
          />
          <Input
            label="Program Name"
            required
            value={formData.name}
            error={fieldErrors.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <Input
            label="Required Graduation Units"
            type="number"
            required
            value={formData.totalUnitsRequired}
            error={fieldErrors.totalUnitsRequired}
            onChange={(e) => setFormData({ ...formData, totalUnitsRequired: Number(e.target.value) })}
          />
          <div className="form-group">
            <label className="form-label">Description</label>
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
        title={`Edit Program: ${selectedProgram?.code}`}
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
            label="Program Name"
            required
            value={formData.name}
            error={fieldErrors.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <Input
            label="Required Graduation Units"
            type="number"
            required
            value={formData.totalUnitsRequired}
            error={fieldErrors.totalUnitsRequired}
            onChange={(e) => setFormData({ ...formData, totalUnitsRequired: Number(e.target.value) })}
          />
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="form-textarea"
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
        </form>
      </Modal>

      {/* DELETE CONFIRM */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Confirm Program Deletion"
        message={`Are you sure you want to delete '${selectedProgram?.code}' (${selectedProgram?.name})?`}
        isLoading={isSubmitting}
      />
    </div>
  );
};
