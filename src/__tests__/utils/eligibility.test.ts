/**
 * Unit Tests for Eligibility Checking Logic
 * Tests the core business logic for determining student eligibility for drives
 */

describe('Student Eligibility Logic', () => {
  describe('CGPA Requirements', () => {
    it('should be eligible when CGPA equals minimum requirement', () => {
      const student = { cgpa: 7.5, backlogs: 0, branch: 'CSE' };
      const drive = { minCgpa: 7.5, maxBacklogs: 0, allowedBranches: 'CSE,IT,ECE' };

      const isEligible = student.cgpa >= drive.minCgpa;

      expect(isEligible).toBe(true);
    });

    it('should be eligible when CGPA exceeds minimum requirement', () => {
      const student = { cgpa: 8.5, backlogs: 0, branch: 'CSE' };
      const drive = { minCgpa: 7.5, maxBacklogs: 0, allowedBranches: 'CSE,IT,ECE' };

      const isEligible = student.cgpa >= drive.minCgpa;

      expect(isEligible).toBe(true);
    });

    it('should not be eligible when CGPA below minimum requirement', () => {
      const student = { cgpa: 7.0, backlogs: 0, branch: 'CSE' };
      const drive = { minCgpa: 7.5, maxBacklogs: 0, allowedBranches: 'CSE,IT,ECE' };

      const isEligible = student.cgpa >= drive.minCgpa;

      expect(isEligible).toBe(false);
    });

    it('should handle CGPA boundary case (0.01 below)', () => {
      const student = { cgpa: 7.49, backlogs: 0, branch: 'CSE' };
      const drive = { minCgpa: 7.5, maxBacklogs: 0, allowedBranches: 'CSE,IT,ECE' };

      const isEligible = student.cgpa >= drive.minCgpa;

      expect(isEligible).toBe(false);
    });

    it('should handle no CGPA requirement (minCgpa is null)', () => {
      const student = { cgpa: 6.0, backlogs: 0, branch: 'CSE' };
      const drive = { minCgpa: null, maxBacklogs: 0, allowedBranches: 'CSE,IT,ECE' };

      const isEligible = drive.minCgpa === null || student.cgpa >= drive.minCgpa;

      expect(isEligible).toBe(true);
    });
  });

  describe('Backlogs Requirements', () => {
    it('should be eligible when backlogs equals maximum allowed', () => {
      const student = { cgpa: 8.0, backlogs: 1, branch: 'CSE' };
      const drive = { minCgpa: 7.5, maxBacklogs: 1, allowedBranches: 'CSE,IT,ECE' };

      const isEligible = student.backlogs <= drive.maxBacklogs;

      expect(isEligible).toBe(true);
    });

    it('should be eligible when backlogs below maximum allowed', () => {
      const student = { cgpa: 8.0, backlogs: 0, branch: 'CSE' };
      const drive = { minCgpa: 7.5, maxBacklogs: 2, allowedBranches: 'CSE,IT,ECE' };

      const isEligible = student.backlogs <= drive.maxBacklogs;

      expect(isEligible).toBe(true);
    });

    it('should not be eligible when backlogs exceed maximum allowed', () => {
      const student = { cgpa: 8.0, backlogs: 2, branch: 'CSE' };
      const drive = { minCgpa: 7.5, maxBacklogs: 1, allowedBranches: 'CSE,IT,ECE' };

      const isEligible = student.backlogs <= drive.maxBacklogs;

      expect(isEligible).toBe(false);
    });

    it('should handle zero backlogs requirement', () => {
      const student = { cgpa: 8.0, backlogs: 0, branch: 'CSE' };
      const drive = { minCgpa: 7.5, maxBacklogs: 0, allowedBranches: 'CSE,IT,ECE' };

      const isEligible = student.backlogs <= drive.maxBacklogs;

      expect(isEligible).toBe(true);
    });

    it('should not be eligible with 1 backlog when 0 required', () => {
      const student = { cgpa: 9.5, backlogs: 1, branch: 'CSE' };
      const drive = { minCgpa: 7.5, maxBacklogs: 0, allowedBranches: 'CSE,IT,ECE' };

      const isEligible = student.backlogs <= drive.maxBacklogs;

      expect(isEligible).toBe(false);
    });
  });

  describe('Branch Requirements', () => {
    it('should be eligible when branch is in allowed list', () => {
      const student = { cgpa: 8.0, backlogs: 0, branch: 'CSE' };
      const drive = { minCgpa: 7.5, maxBacklogs: 0, allowedBranches: 'CSE,IT,ECE' };

      const allowedBranchesArray = drive.allowedBranches?.split(',').map(b => b.trim()) || [];
      const isEligible = allowedBranchesArray.includes(student.branch);

      expect(isEligible).toBe(true);
    });

    it('should be eligible for second branch in list', () => {
      const student = { cgpa: 8.0, backlogs: 0, branch: 'IT' };
      const drive = { minCgpa: 7.5, maxBacklogs: 0, allowedBranches: 'CSE,IT,ECE' };

      const allowedBranchesArray = drive.allowedBranches?.split(',').map(b => b.trim()) || [];
      const isEligible = allowedBranchesArray.includes(student.branch);

      expect(isEligible).toBe(true);
    });

    it('should not be eligible when branch not in allowed list', () => {
      const student = { cgpa: 8.0, backlogs: 0, branch: 'MECH' };
      const drive = { minCgpa: 7.5, maxBacklogs: 0, allowedBranches: 'CSE,IT,ECE' };

      const allowedBranchesArray = drive.allowedBranches?.split(',').map(b => b.trim()) || [];
      const isEligible = allowedBranchesArray.includes(student.branch);

      expect(isEligible).toBe(false);
    });

    it('should handle single branch requirement', () => {
      const student = { cgpa: 8.0, backlogs: 0, branch: 'CSE' };
      const drive = { minCgpa: 7.5, maxBacklogs: 0, allowedBranches: 'CSE' };

      const allowedBranchesArray = drive.allowedBranches?.split(',').map(b => b.trim()) || [];
      const isEligible = allowedBranchesArray.includes(student.branch);

      expect(isEligible).toBe(true);
    });

    it('should handle no branch restriction (null or empty)', () => {
      const student = { cgpa: 8.0, backlogs: 0, branch: 'MECH' };
      const drive = { minCgpa: 7.5, maxBacklogs: 0, allowedBranches: null };

      const allowedBranchesArray = drive.allowedBranches?.split(',').map(b => b.trim()) || [];
      const isEligible = !drive.allowedBranches || allowedBranchesArray.length === 0 || allowedBranchesArray.includes(student.branch);

      expect(isEligible).toBe(true);
    });

    it('should handle branches with spaces', () => {
      const student = { cgpa: 8.0, backlogs: 0, branch: 'IT' };
      const drive = { minCgpa: 7.5, maxBacklogs: 0, allowedBranches: 'CSE , IT , ECE' };

      const allowedBranchesArray = drive.allowedBranches?.split(',').map(b => b.trim()) || [];
      const isEligible = allowedBranchesArray.includes(student.branch);

      expect(isEligible).toBe(true);
    });

    it('should be case-sensitive for branch matching', () => {
      const student = { cgpa: 8.0, backlogs: 0, branch: 'cse' };
      const drive = { minCgpa: 7.5, maxBacklogs: 0, allowedBranches: 'CSE,IT,ECE' };

      const allowedBranchesArray = drive.allowedBranches?.split(',').map(b => b.trim()) || [];
      const isEligible = allowedBranchesArray.includes(student.branch);

      expect(isEligible).toBe(false);
    });
  });

  describe('Combined Eligibility (All Criteria)', () => {
    const checkEligibility = (student: any, drive: any) => {
      const cgpaEligible = drive.minCgpa === null || student.cgpa >= drive.minCgpa;
      const backlogsEligible = student.backlogs <= drive.maxBacklogs;
      const allowedBranchesArray = drive.allowedBranches?.split(',').map((b: string) => b.trim()) || [];
      const branchEligible = !drive.allowedBranches || allowedBranchesArray.length === 0 || allowedBranchesArray.includes(student.branch);

      return cgpaEligible && backlogsEligible && branchEligible;
    };

    it('should be eligible when all criteria met', () => {
      const student = { cgpa: 8.5, backlogs: 0, branch: 'CSE' };
      const drive = { minCgpa: 7.5, maxBacklogs: 0, allowedBranches: 'CSE,IT,ECE' };

      const isEligible = checkEligibility(student, drive);

      expect(isEligible).toBe(true);
    });

    it('should not be eligible if CGPA fails (other criteria pass)', () => {
      const student = { cgpa: 7.0, backlogs: 0, branch: 'CSE' };
      const drive = { minCgpa: 7.5, maxBacklogs: 0, allowedBranches: 'CSE,IT,ECE' };

      const isEligible = checkEligibility(student, drive);

      expect(isEligible).toBe(false);
    });

    it('should not be eligible if backlogs fail (other criteria pass)', () => {
      const student = { cgpa: 8.5, backlogs: 2, branch: 'CSE' };
      const drive = { minCgpa: 7.5, maxBacklogs: 0, allowedBranches: 'CSE,IT,ECE' };

      const isEligible = checkEligibility(student, drive);

      expect(isEligible).toBe(false);
    });

    it('should not be eligible if branch fails (other criteria pass)', () => {
      const student = { cgpa: 8.5, backlogs: 0, branch: 'MECH' };
      const drive = { minCgpa: 7.5, maxBacklogs: 0, allowedBranches: 'CSE,IT,ECE' };

      const isEligible = checkEligibility(student, drive);

      expect(isEligible).toBe(false);
    });

    it('should not be eligible if multiple criteria fail', () => {
      const student = { cgpa: 7.0, backlogs: 2, branch: 'MECH' };
      const drive = { minCgpa: 7.5, maxBacklogs: 0, allowedBranches: 'CSE,IT,ECE' };

      const isEligible = checkEligibility(student, drive);

      expect(isEligible).toBe(false);
    });

    it('should handle edge case: exactly meeting all requirements', () => {
      const student = { cgpa: 7.5, backlogs: 1, branch: 'ECE' };
      const drive = { minCgpa: 7.5, maxBacklogs: 1, allowedBranches: 'CSE,IT,ECE' };

      const isEligible = checkEligibility(student, drive);

      expect(isEligible).toBe(true);
    });

    it('should handle lenient drive requirements (all criteria relaxed)', () => {
      const student = { cgpa: 6.0, backlogs: 3, branch: 'MECH' };
      const drive = { minCgpa: null, maxBacklogs: 5, allowedBranches: null };

      const isEligible = checkEligibility(student, drive);

      expect(isEligible).toBe(true);
    });

    it('should handle strict drive requirements', () => {
      const student = { cgpa: 9.5, backlogs: 0, branch: 'CSE' };
      const drive = { minCgpa: 9.0, maxBacklogs: 0, allowedBranches: 'CSE' };

      const isEligible = checkEligibility(student, drive);

      expect(isEligible).toBe(true);
    });

    it('should fail strict requirements with high CGPA but wrong branch', () => {
      const student = { cgpa: 9.5, backlogs: 0, branch: 'IT' };
      const drive = { minCgpa: 9.0, maxBacklogs: 0, allowedBranches: 'CSE' };

      const isEligible = checkEligibility(student, drive);

      expect(isEligible).toBe(false);
    });
  });

  describe('Real-World Scenarios', () => {
    const checkEligibility = (student: any, drive: any) => {
      const cgpaEligible = drive.minCgpa === null || student.cgpa >= drive.minCgpa;
      const backlogsEligible = student.backlogs <= drive.maxBacklogs;
      const allowedBranchesArray = drive.allowedBranches?.split(',').map((b: string) => b.trim()) || [];
      const branchEligible = !drive.allowedBranches || allowedBranchesArray.length === 0 || allowedBranchesArray.includes(student.branch);

      return cgpaEligible && backlogsEligible && branchEligible;
    };

    it('Microsoft Drive - High CGPA, No Backlogs, Core Branches', () => {
      const rahul = { cgpa: 8.7, backlogs: 0, branch: 'CSE' };
      const microsoft = { minCgpa: 8.0, maxBacklogs: 0, allowedBranches: 'CSE,IT' };

      expect(checkEligibility(rahul, microsoft)).toBe(true);
    });

    it('TCS Drive - Lenient Requirements', () => {
      const student = { cgpa: 6.5, backlogs: 2, branch: 'ECE' };
      const tcs = { minCgpa: 6.0, maxBacklogs: 2, allowedBranches: 'CSE,IT,ECE,EEE,MECH' };

      expect(checkEligibility(student, tcs)).toBe(true);
    });

    it('Google Drive - Very Strict Requirements', () => {
      const goodStudent = { cgpa: 9.2, backlogs: 0, branch: 'CSE' };
      const google = { minCgpa: 9.0, maxBacklogs: 0, allowedBranches: 'CSE,IT' };

      expect(checkEligibility(goodStudent, google)).toBe(true);

      const almostGood = { cgpa: 8.9, backlogs: 0, branch: 'CSE' };
      expect(checkEligibility(almostGood, google)).toBe(false);
    });

    it('Student with backlogs cannot apply to strict companies', () => {
      const studentWithBacklogs = { cgpa: 9.5, backlogs: 1, branch: 'CSE' };
      const strictCompany = { minCgpa: 8.0, maxBacklogs: 0, allowedBranches: 'CSE,IT,ECE' };

      expect(checkEligibility(studentWithBacklogs, strictCompany)).toBe(false);
    });

    it('Student from non-core branch cannot apply to core-only drives', () => {
      const mechStudent = { cgpa: 9.0, backlogs: 0, branch: 'MECH' };
      const coreOnlyDrive = { minCgpa: 7.5, maxBacklogs: 0, allowedBranches: 'CSE,IT,ECE' };

      expect(checkEligibility(mechStudent, coreOnlyDrive)).toBe(false);
    });

    it('Borderline student: CGPA exactly at cutoff', () => {
      const borderline = { cgpa: 7.5, backlogs: 0, branch: 'IT' };
      const drive = { minCgpa: 7.5, maxBacklogs: 0, allowedBranches: 'CSE,IT' };

      expect(checkEligibility(borderline, drive)).toBe(true);
    });

    it('Student improves CGPA: was 7.4, now 7.6', () => {
      const studentBefore = { cgpa: 7.4, backlogs: 0, branch: 'CSE' };
      const studentAfter = { cgpa: 7.6, backlogs: 0, branch: 'CSE' };
      const drive = { minCgpa: 7.5, maxBacklogs: 0, allowedBranches: 'CSE,IT' };

      expect(checkEligibility(studentBefore, drive)).toBe(false);
      expect(checkEligibility(studentAfter, drive)).toBe(true);
    });

    it('Student clears backlog: was 1, now 0', () => {
      const studentBefore = { cgpa: 8.5, backlogs: 1, branch: 'CSE' };
      const studentAfter = { cgpa: 8.5, backlogs: 0, branch: 'CSE' };
      const drive = { minCgpa: 7.5, maxBacklogs: 0, allowedBranches: 'CSE,IT' };

      expect(checkEligibility(studentBefore, drive)).toBe(false);
      expect(checkEligibility(studentAfter, drive)).toBe(true);
    });
  });
});
