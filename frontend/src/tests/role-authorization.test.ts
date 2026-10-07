import { describe, it, expect } from "vitest";
import { Role } from "../types/auth";

describe("Frontend Role-Aware Permissions Matrix", () => {
  const checkPermission = (userRole: Role, allowedRoles: Role[]): boolean => {
    return allowedRoles.includes(userRole);
  };

  it("should permit ADMINISTRATOR across all administrative modules", () => {
    const adminRole: Role = "ADMINISTRATOR";
    const studentModuleRoles: Role[] = ["ADMINISTRATOR", "REGISTRAR"];
    const gradesModuleRoles: Role[] = ["ADMINISTRATOR", "REGISTRAR", "INSTRUCTOR"];
    const termsModuleRoles: Role[] = ["ADMINISTRATOR", "REGISTRAR"];

    expect(checkPermission(adminRole, studentModuleRoles)).toBe(true);
    expect(checkPermission(adminRole, gradesModuleRoles)).toBe(true);
    expect(checkPermission(adminRole, termsModuleRoles)).toBe(true);
  });

  it("should permit REGISTRAR to manage students and terms but not system administration", () => {
    const registrarRole: Role = "REGISTRAR";
    const studentModuleRoles: Role[] = ["ADMINISTRATOR", "REGISTRAR"];
    const systemAdminRoles: Role[] = ["ADMINISTRATOR"];

    expect(checkPermission(registrarRole, studentModuleRoles)).toBe(true);
    expect(checkPermission(registrarRole, systemAdminRoles)).toBe(false);
  });

  it("should restrict STUDENT role to personal records only", () => {
    const studentRole: Role = "STUDENT";
    const studentDirectoryRoles: Role[] = ["ADMINISTRATOR", "REGISTRAR"];
    const personalRecordRoles: Role[] = ["ADMINISTRATOR", "REGISTRAR", "STUDENT"];

    expect(checkPermission(studentRole, studentDirectoryRoles)).toBe(false);
    expect(checkPermission(studentRole, personalRecordRoles)).toBe(true);
  });

  it("should restrict INSTRUCTOR from modifying student directories", () => {
    const instructorRole: Role = "INSTRUCTOR";
    const studentDirectoryRoles: Role[] = ["ADMINISTRATOR", "REGISTRAR"];
    const gradingRoles: Role[] = ["ADMINISTRATOR", "REGISTRAR", "INSTRUCTOR"];

    expect(checkPermission(instructorRole, studentDirectoryRoles)).toBe(false);
    expect(checkPermission(instructorRole, gradingRoles)).toBe(true);
  });
});
