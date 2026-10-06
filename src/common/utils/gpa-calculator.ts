export interface GradedCourseItem {
  courseCode: string;
  courseTitle: string;
  units: number;
  numericGrade: number | null;
  letterGrade?: string | null;
  remarks: "PASSED" | "FAILED" | "INCOMPLETE" | "DROPPED";
}

export interface GpaCalculationResult {
  totalUnitsAttempted: number;
  totalUnitsEarned: number;
  gwa: number | null; // null if no graded units
  academicStanding: string;
}

export function calculateGwa(courses: GradedCourseItem[]): GpaCalculationResult {
  let totalUnitsAttempted = 0;
  let totalUnitsEarned = 0;
  let totalWeightedGrades = 0;
  let gradedUnits = 0;

  for (const item of courses) {
    totalUnitsAttempted += item.units;

    if (item.remarks === "PASSED") {
      totalUnitsEarned += item.units;
    }

    // Only consider numeric grades for GWA calculation
    if (item.numericGrade !== null && item.remarks !== "DROPPED" && item.remarks !== "INCOMPLETE") {
      totalWeightedGrades += item.numericGrade * item.units;
      gradedUnits += item.units;
    }
  }

  const gwa =
    gradedUnits > 0
      ? Math.round((totalWeightedGrades / gradedUnits) * 100) / 100
      : null;

  let academicStanding = "Good Standing";
  if (gwa !== null) {
    if (gwa <= 1.45) {
      academicStanding = "President's Lister (Highest Honors)";
    } else if (gwa <= 1.75) {
      academicStanding = "Dean's Lister (Honors)";
    } else if (gwa <= 3.0) {
      academicStanding = "Good Standing";
    } else if (gwa <= 3.5) {
      academicStanding = "Academic Warning";
    } else {
      academicStanding = "Academic Probation";
    }
  }

  return {
    totalUnitsAttempted,
    totalUnitsEarned,
    gwa,
    academicStanding,
  };
}
