/**
 * Smart Drive Recommendation Engine
 * Uses multiple factors to recommend best-fit drives for students
 */

interface Student {
  cgpa: number;
  branch: string;
  backlogs: number;
  skills?: string | null;
}

interface Drive {
  id: string;
  title: string;
  role: string;
  company: {
    name: string;
    sector: string;
  };
  minCgpa?: number | null;
  maxBacklogs: number;
  allowedBranches?: string | null;
  techStack?: string | null;
  ctc?: number | null;
}

interface RecommendedDrive extends Drive {
  matchScore: number;
  matchReasons: string[];
  eligibility: {
    isEligible: boolean;
    reasons: string[];
  };
}

export function recommendDrives(
  student: Student,
  availableDrives: Drive[],
  limit: number = 10
): RecommendedDrive[] {
  const scoredDrives = availableDrives.map((drive) => {
    const { matchScore, matchReasons } = calculateMatchScore(student, drive);
    const eligibility = checkDriveEligibility(student, drive);

    return {
      ...drive,
      matchScore,
      matchReasons,
      eligibility,
    };
  });

  // Sort by match score (highest first)
  const sorted = scoredDrives.sort((a, b) => b.matchScore - a.matchScore);

  // Return top N recommendations
  return sorted.slice(0, limit);
}

function calculateMatchScore(
  student: Student,
  drive: Drive
): { matchScore: number; matchReasons: string[] } {
  let score = 0;
  const reasons: string[] = [];

  // 1. Eligibility Check (40 points)
  const eligibility = checkDriveEligibility(student, drive);
  if (eligibility.isEligible) {
    score += 40;
    reasons.push("✓ You meet all eligibility criteria");
  } else {
    // Partial points if close to eligibility
    if (drive.minCgpa && student.cgpa >= drive.minCgpa - 0.3) {
      score += 20;
      reasons.push("~ CGPA is close to requirement");
    }
  }

  // 2. Branch Match (20 points)
  if (drive.allowedBranches) {
    const allowedBranchList = drive.allowedBranches
      .split(",")
      .map((b) => b.trim().toUpperCase());

    if (allowedBranchList.includes(student.branch.toUpperCase()) ||
        allowedBranchList.includes("ALL")) {
      score += 20;
      reasons.push("✓ Your branch is preferred for this role");
    }
  } else {
    score += 15; // No branch restriction = some points
  }

  // 3. Skills Match (25 points)
  if (drive.techStack && student.skills) {
    const driveSkills = drive.techStack
      .toLowerCase()
      .split(",")
      .map((s) => s.trim());
    const studentSkills = student.skills
      .toLowerCase()
      .split(",")
      .map((s) => s.trim());

    const matchingSkills = driveSkills.filter((ds) =>
      studentSkills.some((ss) => ss.includes(ds) || ds.includes(ss))
    );

    const skillMatchPercentage = (matchingSkills.length / driveSkills.length) * 100;

    if (skillMatchPercentage >= 80) {
      score += 25;
      reasons.push(`✓ ${matchingSkills.length}/${driveSkills.length} required skills matched`);
    } else if (skillMatchPercentage >= 50) {
      score += 15;
      reasons.push(`~ ${matchingSkills.length}/${driveSkills.length} required skills matched`);
    } else if (skillMatchPercentage >= 25) {
      score += 8;
      reasons.push(`⚠ Some skill overlap (${matchingSkills.length}/${driveSkills.length})`);
    }
  }

  // 4. Academic Excellence Bonus (10 points)
  if (student.cgpa >= 9.0) {
    score += 10;
    reasons.push("✓ Outstanding CGPA gives you an edge");
  } else if (student.cgpa >= 8.5) {
    score += 7;
    reasons.push("✓ Excellent CGPA");
  } else if (student.cgpa >= 8.0) {
    score += 5;
    reasons.push("✓ Good CGPA");
  }

  // 5. CTC-based scoring (5 points)
  // Higher CTC drives get bonus points for high performers
  if (drive.ctc && student.cgpa >= 8.5) {
    if (drive.ctc >= 10) {
      score += 5;
      reasons.push("✓ High-value opportunity matching your profile");
    } else if (drive.ctc >= 7) {
      score += 3;
    }
  }

  return {
    matchScore: Math.min(Math.round(score), 100),
    matchReasons: reasons,
  };
}

function checkDriveEligibility(
  student: Student,
  drive: Drive
): { isEligible: boolean; reasons: string[] } {
  const reasons: string[] = [];
  let isEligible = true;

  // Check CGPA
  if (drive.minCgpa && student.cgpa < drive.minCgpa) {
    isEligible = false;
    reasons.push(`CGPA requirement: ${drive.minCgpa} (You have: ${student.cgpa})`);
  }

  // Check backlogs
  if (student.backlogs > drive.maxBacklogs) {
    isEligible = false;
    reasons.push(
      `Maximum ${drive.maxBacklogs} backlogs allowed (You have: ${student.backlogs})`
    );
  }

  // Check branch
  if (drive.allowedBranches) {
    const allowedBranchList = drive.allowedBranches
      .split(",")
      .map((b) => b.trim().toUpperCase());

    if (
      !allowedBranchList.includes(student.branch.toUpperCase()) &&
      !allowedBranchList.includes("ALL")
    ) {
      isEligible = false;
      reasons.push(`Branch requirement: ${drive.allowedBranches}`);
    }
  }

  if (isEligible) {
    reasons.push("You meet all eligibility criteria!");
  }

  return { isEligible, reasons };
}

/**
 * Get personalized insights for a student based on all drives
 */
export function getStudentInsights(
  student: Student,
  allDrives: Drive[]
): {
  eligibleCount: number;
  topSectors: string[];
  skillGaps: string[];
  suggestions: string[];
} {
  const eligibleDrives = allDrives.filter(
    (drive) => checkDriveEligibility(student, drive).isEligible
  );

  // Find top sectors
  const sectorCount: Record<string, number> = {};
  eligibleDrives.forEach((drive) => {
    sectorCount[drive.company.sector] = (sectorCount[drive.company.sector] || 0) + 1;
  });
  const topSectors = Object.entries(sectorCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([sector]) => sector);

  // Find skill gaps
  const requiredSkills = new Set<string>();
  allDrives.forEach((drive) => {
    if (drive.techStack) {
      drive.techStack.split(",").forEach((skill) => {
        requiredSkills.add(skill.trim().toLowerCase());
      });
    }
  });

  const studentSkillsSet = new Set(
    student.skills?.toLowerCase().split(",").map((s) => s.trim()) || []
  );

  const skillGaps = Array.from(requiredSkills)
    .filter((skill) => !studentSkillsSet.has(skill))
    .slice(0, 5);

  // Generate suggestions
  const suggestions: string[] = [];

  if (student.cgpa < 8.0) {
    suggestions.push("Focus on improving your CGPA to unlock more opportunities");
  }

  if (student.backlogs > 0) {
    suggestions.push("Clear your backlogs to become eligible for more drives");
  }

  if (skillGaps.length > 0) {
    suggestions.push(
      `Learn these in-demand skills: ${skillGaps.slice(0, 3).join(", ")}`
    );
  }

  if (eligibleDrives.length < allDrives.length * 0.3) {
    suggestions.push("Consider expanding your skill set to match more job requirements");
  }

  if (eligibleDrives.length > 0 && student.cgpa >= 8.5) {
    suggestions.push("You're a strong candidate! Apply to Dream companies");
  }

  return {
    eligibleCount: eligibleDrives.length,
    topSectors,
    skillGaps,
    suggestions,
  };
}
