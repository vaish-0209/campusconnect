import { Student, Drive } from "@prisma/client";

export interface EligibilityResult {
  isEligible: boolean;
  reasons: string[];
}

export function checkEligibility(
  student: Student,
  drive: Drive
): EligibilityResult {
  const reasons: string[] = [];

  // Check CGPA
  if (drive.minCgpa && student.cgpa < drive.minCgpa) {
    reasons.push(
      `CGPA below minimum requirement (need ${drive.minCgpa}, have ${student.cgpa})`
    );
  }

  // Check backlogs
  if (student.backlogs > drive.maxBacklogs) {
    reasons.push(
      `Too many backlogs (max ${drive.maxBacklogs}, have ${student.backlogs})`
    );
  }

  // Check branch - allowedBranches is a string, convert to array
  if (drive.allowedBranches) {
    const allowedBranchesArray = typeof drive.allowedBranches === 'string'
      ? drive.allowedBranches.split(',').map(b => b.trim())
      : drive.allowedBranches;

    if (
      allowedBranchesArray.length > 0 &&
      !allowedBranchesArray.includes(student.branch)
    ) {
      reasons.push(
        `Branch not allowed (only ${allowedBranchesArray.join(", ")} allowed)`
      );
    }
  }

  return {
    isEligible: reasons.length === 0,
    reasons,
  };
}
