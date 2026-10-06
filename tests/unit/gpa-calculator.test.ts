import { describe, it, expect } from "vitest";
import { calculateGwa, GradedCourseItem } from "@/common/utils/gpa-calculator";

describe("GPA / GWA Calculator Engine", () => {
  it("should correctly compute Term GWA and Units Earned for passing grades", () => {
    const courses: GradedCourseItem[] = [
      {
        courseCode: "CS101",
        courseTitle: "Intro to CS",
        units: 3,
        numericGrade: 1.25,
        remarks: "PASSED",
      },
      {
        courseCode: "CS102",
        courseTitle: "Data Structures",
        units: 3,
        numericGrade: 1.5,
        remarks: "PASSED",
      },
      {
        courseCode: "MATH101",
        courseTitle: "Calculus",
        units: 4,
        numericGrade: 1.75,
        remarks: "PASSED",
      },
    ];

    // Calculation: (3 * 1.25 + 3 * 1.50 + 4 * 1.75) / (3 + 3 + 4)
    // = (3.75 + 4.50 + 7.00) / 10 = 15.25 / 10 = 1.53
    const result = calculateGwa(courses);

    expect(result.totalUnitsAttempted).toBe(10);
    expect(result.totalUnitsEarned).toBe(10);
    expect(result.gwa).toBe(1.53);
    expect(result.academicStanding).toBe("Dean's Lister (Honors)");
  });

  it("should award President's Lister honors for GWA <= 1.45", () => {
    const courses: GradedCourseItem[] = [
      {
        courseCode: "CS101",
        courseTitle: "Intro to CS",
        units: 3,
        numericGrade: 1.0,
        remarks: "PASSED",
      },
      {
        courseCode: "CS102",
        courseTitle: "Data Structures",
        units: 3,
        numericGrade: 1.25,
        remarks: "PASSED",
      },
    ];

    const result = calculateGwa(courses);
    expect(result.gwa).toBe(1.13);
    expect(result.academicStanding).toBe("President's Lister (Highest Honors)");
  });

  it("should exclude DROPPED courses from GWA calculation and earned units", () => {
    const courses: GradedCourseItem[] = [
      {
        courseCode: "CS101",
        courseTitle: "Intro to CS",
        units: 3,
        numericGrade: 1.0,
        remarks: "PASSED",
      },
      {
        courseCode: "CS102",
        courseTitle: "Data Structures",
        units: 3,
        numericGrade: null,
        remarks: "DROPPED",
      },
    ];

    const result = calculateGwa(courses);
    expect(result.totalUnitsAttempted).toBe(6);
    expect(result.totalUnitsEarned).toBe(3);
    expect(result.gwa).toBe(1.0);
  });

  it("should flag Academic Probation if GWA exceeds 3.50", () => {
    const courses: GradedCourseItem[] = [
      {
        courseCode: "CS101",
        courseTitle: "Intro to CS",
        units: 3,
        numericGrade: 5.0,
        remarks: "FAILED",
      },
      {
        courseCode: "MATH101",
        courseTitle: "Calculus",
        units: 3,
        numericGrade: 4.0,
        remarks: "FAILED",
      },
    ];

    const result = calculateGwa(courses);
    expect(result.totalUnitsAttempted).toBe(6);
    expect(result.totalUnitsEarned).toBe(0);
    expect(result.gwa).toBe(4.5);
    expect(result.academicStanding).toBe("Academic Probation");
  });

  it("should return null GWA when there are no graded courses", () => {
    const result = calculateGwa([]);
    expect(result.totalUnitsAttempted).toBe(0);
    expect(result.totalUnitsEarned).toBe(0);
    expect(result.gwa).toBeNull();
    expect(result.academicStanding).toBe("Good Standing");
  });
});
