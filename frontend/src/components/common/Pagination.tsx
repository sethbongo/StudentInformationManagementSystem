import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./Button";
import { PaginationMeta } from "../../types/api";

export interface PaginationProps {
  meta: PaginationMeta;
  onPageChange: (newPage: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({ meta, onPageChange }) => {
  const { page, totalPages, total, limit } = meta;

  const startRecord = total === 0 ? 0 : (page - 1) * limit + 1;
  const endRecord = Math.min(page * limit, total);

  return (
    <div className="pagination-bar">
      <div>
        Showing <strong style={{ color: "#fff" }}>{startRecord}</strong> to{" "}
        <strong style={{ color: "#fff" }}>{endRecord}</strong> of{" "}
        <strong style={{ color: "#fff" }}>{total}</strong> records
      </div>

      <div className="pagination-controls">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          icon={<ChevronLeft size={16} />}
        >
          Previous
        </Button>

        <span style={{ padding: "0 10px", fontSize: "0.85rem", color: "var(--text-secondary)" }}>
          Page <strong style={{ color: "#fff" }}>{page}</strong> of{" "}
          <strong style={{ color: "#fff" }}>{totalPages || 1}</strong>
        </span>

        <Button
          variant="secondary"
          size="sm"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          icon={<ChevronRight size={16} />}
        >
          Next
        </Button>
      </div>
    </div>
  );
};
