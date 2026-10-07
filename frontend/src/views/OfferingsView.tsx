import React, { useEffect, useState, useCallback } from "react";
import { Calendar, Plus, Users, Search, BookOpen, Clock } from "lucide-react";
import { CourseOffering, Course, AcademicTerm } from "../types/entities";
import { offeringService } from "../services/offering.service";
import { courseService } from "../services/course.service";
import { termService } from "../services/term.service";
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

export const OfferingsView: React.FC = () => {
  const { showToast } = useToast();
  const { canManageAcademics } = useAuth();

  const [offerings, setOfferings] = useState<CourseOffering[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [terms, setTerms] = useState<AcademicTerm[]>([]);
  const [selectedTerm, setSelectedTerm] = useState("");
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

  // Roster Modal
  const [isRosterOpen, setIsRosterOpen] = useState(false);
  const [rosterData, setRosterData] = useState<any[]>([]);
  const [selectedOffering, setSelectedOffering] = useState<CourseOffering | null>(null);
  const [isRosterLoading, setIsRosterLoading] = useState(false);

  // Create Modal
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [formData, setFormData] = useState({
    courseId: "",
    termId: "",
    sectionCode: "SEC-A",
    room: "CL302",
    schedulePattern: "MWF 09:00AM - 10:30AM",
    maxCapacity: 40,
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    Promise.all([
      courseService.listCourses({ per_page: 100 }),
      termService.listTerms({ per_page: 50 }),
    ]).then(([cRes, tRes]) => {
      setCourses(cRes.data);
      setTerms(tRes.data);
      if (tRes.data.length > 0) {
        const activeTerm = tRes.data.find((t) => t.isCurrent) || tRes.data[0];
        setSelectedTerm(activeTerm.id);
      }
    }).catch(() => {});
  }, []);

  const fetchOfferings = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await offeringService.listOfferings({
        term_id: selectedTerm || undefined,
        page: currentPage,
        per_page: 10,
      });
      setOfferings(res.data);
      setPaginationMeta(res.meta);
    } catch (err: any) {
      setError(err.message || "Failed to load course offerings");
    } finally {
      setIsLoading(false);
    }
  }, [selectedTerm, currentPage]);

  useEffect(() => {
    fetchOfferings();
  }, [fetchOfferings]);

  const handleOpenRoster = async (offering: CourseOffering) => {
    setSelectedOffering(offering);
    setIsRosterOpen(true);
    setIsRosterLoading(true);
    setRosterData([]);
    try {
      const result = await offeringService.getRoster(offering.id);
      const list = Array.isArray(result) ? result : (result?.roster || []);
      setRosterData(list);
    } catch (err: any) {
      showToast(err.message || "Failed to load class roster", "error");
      setRosterData([]);
    } finally {
      setIsRosterLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setFormData({
      courseId: courses[0]?.id || "",
      termId: selectedTerm || terms[0]?.id || "",
      sectionCode: `SEC-${String.fromCharCode(65 + Math.floor(Math.random() * 5))}`,
      room: `RM-${Math.floor(200 + Math.random() * 300)}`,
      schedulePattern: "TTH 01:00PM - 02:30PM",
      maxCapacity: 40,
    });
    setFieldErrors({});
    setIsCreateOpen(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFieldErrors({});
    try {
      await offeringService.createOffering({
        courseId: formData.courseId,
        termId: formData.termId,
        sectionCode: formData.sectionCode,
        room: formData.room,
        schedulePattern: formData.schedulePattern,
        maxCapacity: Number(formData.maxCapacity),
      });
      showToast("Course offering opened successfully.", "success");
      setIsCreateOpen(false);
      fetchOfferings();
    } catch (err: any) {
      if (err instanceof ApiError && err.fieldErrors) {
        setFieldErrors(err.fieldErrors);
      } else {
        showToast(err.message || "Failed to open course offering", "error");
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
            <h2 style={{ fontSize: "1.35rem", fontWeight: 700, color: "#fff" }}>Course Offerings</h2>
            <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
              Active term class sections, assigned instructors, and room schedules
            </p>
          </div>

          {canManageAcademics && (
            <Button variant="primary" onClick={handleOpenCreate} icon={<Plus size={18} />}>
              Open New Offering
            </Button>
          )}
        </div>

        <div style={{ marginTop: "16px", maxWidth: "340px" }}>
          <Select
            label="Filter by Academic Term"
            options={[{ value: "", label: "All Academic Terms" }, ...terms.map((t) => ({ value: t.id, label: `${t.code} - ${t.name}` }))]}
            value={selectedTerm}
            onChange={(e) => {
              setSelectedTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
      </div>

      <div className="card">
        {error ? (
          <ErrorState message={error} onRetry={fetchOfferings} />
        ) : isLoading ? (
          <div style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>
            Loading course offerings...
          </div>
        ) : offerings.length === 0 ? (
          <EmptyState title="No Course Offerings" description="No course sections found for the chosen term." />
        ) : (
          <>
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Course Code</th>
                    <th>Course Title</th>
                    <th>Section</th>
                    <th>Instructor</th>
                    <th>Schedule</th>
                    <th>Room</th>
                    <th>Enrollment</th>
                    <th>Status</th>
                    <th style={{ textAlign: "right" }}>Class Roster</th>
                  </tr>
                </thead>
                <tbody>
                  {offerings.map((o) => {
                    const enrolledCount = o._count?.enrollments ?? 0;
                    return (
                      <tr key={o.id}>
                        <td style={{ fontWeight: 700, color: "var(--palette-amber)" }}>{o.course.code}</td>
                        <td style={{ color: "#fff", fontWeight: 500 }}>{o.course.title}</td>
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
                          {o.instructor?.user
                            ? `${o.instructor.user.firstName} ${o.instructor.user.lastName}`
                            : "TBA"}
                        </td>
                        <td style={{ fontSize: "0.82rem" }}>{o.schedulePattern || "TBA"}</td>
                        <td>{o.room || "TBA"}</td>
                        <td>
                          <span style={{ fontWeight: 600, color: enrolledCount >= o.maxCapacity ? "var(--palette-coral)" : "#4ade80" }}>
                            {enrolledCount}
                          </span>{" "}
                          / {o.maxCapacity}
                        </td>
                        <td>
                          <Badge variant={o.status === "OPEN" ? "active" : "neutral"}>{o.status}</Badge>
                        </td>
                        <td style={{ textAlign: "right" }}>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleOpenRoster(o)}
                            icon={<Users size={14} />}
                          >
                            View Roster
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <Pagination meta={paginationMeta} onPageChange={(p) => setCurrentPage(p)} />
          </>
        )}
      </div>

      {/* CLASS ROSTER MODAL */}
      <Modal
        isOpen={isRosterOpen}
        onClose={() => setIsRosterOpen(false)}
        title={`Class Roster: ${selectedOffering?.course.code || "Course"} (${selectedOffering?.sectionCode || "Section"})`}
        size="lg"
      >
        {isRosterLoading ? (
          <div style={{ padding: "40px 20px", textAlign: "center", color: "var(--text-muted)" }}>
            <div style={{ marginBottom: "12px", color: "var(--palette-amber)" }}>
              <Users size={28} style={{ animation: "pulse 1.5s infinite" }} />
            </div>
            <div>Loading enrolled students roster from REST API...</div>
          </div>
        ) : (
          <>
            {selectedOffering && (
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "12px",
                  padding: "12px 16px",
                  backgroundColor: "rgba(68, 23, 78, 0.35)",
                  borderRadius: "8px",
                  border: "1px solid var(--border-subtle)",
                  marginBottom: "20px",
                  fontSize: "0.85rem",
                }}
              >
                <div>
                  <span style={{ color: "var(--text-dim)" }}>Course: </span>
                  <strong style={{ color: "#fff" }}>
                    {selectedOffering.course?.title || selectedOffering.course?.code}
                  </strong>
                </div>
                <div>
                  <span style={{ color: "var(--text-dim)" }}>Schedule: </span>
                  <span style={{ color: "var(--palette-amber)" }}>
                    {selectedOffering.schedule || selectedOffering.schedulePattern || "TBA"}
                  </span>
                </div>
                <div>
                  <span style={{ color: "var(--text-dim)" }}>Room: </span>
                  <span style={{ color: "var(--palette-coral)" }}>
                    {selectedOffering.room || "TBA"}
                  </span>
                </div>
                <div>
                  <Badge variant="active">
                    Enrolled: {Array.isArray(rosterData) ? rosterData.length : 0} / {selectedOffering.maxCapacity}
                  </Badge>
                </div>
              </div>
            )}

            {!Array.isArray(rosterData) || rosterData.length === 0 ? (
              <EmptyState
                title="No Enrolled Students"
                description="No students have registered for this section yet."
              />
            ) : (
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Student Number</th>
                      <th>Full Name</th>
                      <th>Email</th>
                      <th>Program</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rosterData.map((item: any) => {
                      const student = item.student || item;
                      const user = student.user || {};
                      const studentNum = student.studentNumber || item.studentNumber || "N/A";
                      const fullName = user.lastName
                        ? `${user.lastName}, ${user.firstName}`
                        : item.lastName
                        ? `${item.lastName}, ${item.firstName}`
                        : "Unknown";
                      const email = user.email || item.email || "N/A";
                      const programCode = student.program?.code || item.programCode || "—";
                      const status = item.status || student.status || "ENROLLED";

                      return (
                        <tr key={item.id || studentNum}>
                          <td style={{ fontWeight: 600, color: "var(--palette-amber)" }}>
                            {studentNum}
                          </td>
                          <td style={{ color: "#fff", fontWeight: 500 }}>
                            {fullName}
                          </td>
                          <td style={{ color: "var(--text-secondary)" }}>{email}</td>
                          <td>
                            <Badge variant="neutral">{programCode}</Badge>
                          </td>
                          <td>
                            <Badge variant="active">{status}</Badge>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </Modal>

      {/* CREATE OFFERING MODAL */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Open New Course Offering"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleCreateSubmit} isLoading={isSubmitting}>
              Publish Section
            </Button>
          </>
        }
      >
        <form onSubmit={handleCreateSubmit}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
            <Select
              label="Course"
              required
              options={courses.map((c) => ({ value: c.id, label: `${c.code} - ${c.title}` }))}
              value={formData.courseId}
              error={fieldErrors.courseId}
              onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
            />
            <Select
              label="Academic Term"
              required
              options={terms.map((t) => ({ value: t.id, label: `${t.code} - ${t.name}` }))}
              value={formData.termId}
              error={fieldErrors.termId}
              onChange={(e) => setFormData({ ...formData, termId: e.target.value })}
            />
            <Input
              label="Section Code"
              required
              value={formData.sectionCode}
              error={fieldErrors.sectionCode}
              onChange={(e) => setFormData({ ...formData, sectionCode: e.target.value })}
            />
            <Input
              label="Maximum Capacity"
              type="number"
              required
              value={formData.maxCapacity}
              onChange={(e) => setFormData({ ...formData, maxCapacity: Number(e.target.value) })}
            />
            <Input
              label="Classroom / Laboratory"
              value={formData.room}
              onChange={(e) => setFormData({ ...formData, room: e.target.value })}
            />
            <Input
              label="Schedule Pattern"
              placeholder="e.g. MWF 09:00AM - 10:30AM"
              value={formData.schedulePattern}
              onChange={(e) => setFormData({ ...formData, schedulePattern: e.target.value })}
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};
