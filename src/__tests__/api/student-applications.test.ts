/**
 * Unit Tests for Student Applications API
 * Tests: /api/student/applications (GET, POST, DELETE)
 * Critical: Application submission with eligibility checking
 */

import { POST, GET } from '@/app/api/student/applications/route';
import { prismaMock, mockStudentSession, mockAdminSession, createMockRequest } from '../utils/testUtils';
import { getServerSession } from 'next-auth';
import * as eligibility from '@/lib/eligibility';

jest.mock('next-auth', () => ({
  getServerSession: jest.fn(),
}));

jest.mock('@/lib/prisma', () => ({
  prisma: require('../utils/testUtils').prismaMock,
}));

jest.mock('@/lib/eligibility', () => ({
  checkEligibility: jest.fn(),
}));

describe('POST /api/student/applications - Apply to Drive', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Authorization', () => {
    it('should return 401 if user is not authenticated', async () => {
      (getServerSession as jest.Mock).mockResolvedValue(null);

      const req = createMockRequest({ driveId: 'drive-1' });
      const response = await POST(req as any);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('should return 401 if user is not a student', async () => {
      (getServerSession as jest.Mock).mockResolvedValue(mockAdminSession);

      const req = createMockRequest({ driveId: 'drive-1' });
      const response = await POST(req as any);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('should return 404 if student profile not found', async () => {
      (getServerSession as jest.Mock).mockResolvedValue(mockStudentSession);
      prismaMock.student.findUnique.mockResolvedValue(null);

      const req = createMockRequest({ driveId: 'drive-1' });
      const response = await POST(req as any);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Student profile not found');
    });
  });

  describe('Drive Validation', () => {
    beforeEach(() => {
      (getServerSession as jest.Mock).mockResolvedValue(mockStudentSession);
      prismaMock.student.findUnique.mockResolvedValue({
        id: 'student-1',
        userId: 'user-1',
        rollNo: 'CS001',
        firstName: 'Rahul',
        lastName: 'Kumar',
        branch: 'CSE',
        cgpa: 8.5,
        backlogs: 0,
        resume: null,
      } as any);
    });

    it('should return 404 if drive does not exist', async () => {
      prismaMock.drive.findUnique.mockResolvedValue(null);

      const req = createMockRequest({ driveId: 'non-existent-drive' });
      const response = await POST(req as any);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Drive not found');
    });

    it('should return 400 if registration not yet started', async () => {
      const futureDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days from now
      prismaMock.drive.findUnique.mockResolvedValue({
        id: 'drive-1',
        registrationStart: futureDate,
        registrationEnd: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        minCgpa: 7.5,
        maxBacklogs: 0,
        allowedBranches: 'CSE,IT',
      } as any);

      const req = createMockRequest({ driveId: 'drive-1' });
      const response = await POST(req as any);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Registration is not open for this drive');
    });

    it('should return 400 if registration has ended', async () => {
      const pastDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // 7 days ago
      prismaMock.drive.findUnique.mockResolvedValue({
        id: 'drive-1',
        registrationStart: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
        registrationEnd: pastDate,
        minCgpa: 7.5,
        maxBacklogs: 0,
        allowedBranches: 'CSE,IT',
      } as any);

      const req = createMockRequest({ driveId: 'drive-1' });
      const response = await POST(req as any);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Registration is not open for this drive');
    });
  });

  describe('Eligibility Checking', () => {
    beforeEach(() => {
      (getServerSession as jest.Mock).mockResolvedValue(mockStudentSession);
      prismaMock.student.findUnique.mockResolvedValue({
        id: 'student-1',
        userId: 'user-1',
        rollNo: 'CS001',
        firstName: 'Rahul',
        lastName: 'Kumar',
        branch: 'CSE',
        cgpa: 8.5,
        backlogs: 0,
        resume: null,
      } as any);

      prismaMock.drive.findUnique.mockResolvedValue({
        id: 'drive-1',
        registrationStart: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        registrationEnd: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        minCgpa: 7.5,
        maxBacklogs: 0,
        allowedBranches: 'CSE,IT',
      } as any);
    });

    it('should return 400 if student not eligible due to CGPA', async () => {
      (eligibility.checkEligibility as jest.Mock).mockReturnValue({
        isEligible: false,
        reasons: ['CGPA requirement not met (Required: 8.0, Your CGPA: 7.5)'],
      });

      const req = createMockRequest({ driveId: 'drive-1' });
      const response = await POST(req as any);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('NOT_ELIGIBLE');
      expect(data.message).toBe('You are not eligible for this drive');
      expect(data.reasons).toContain('CGPA requirement not met (Required: 8.0, Your CGPA: 7.5)');
    });

    it('should return 400 if student not eligible due to backlogs', async () => {
      (eligibility.checkEligibility as jest.Mock).mockReturnValue({
        isEligible: false,
        reasons: ['Backlogs exceed limit (Max: 0, Yours: 2)'],
      });

      const req = createMockRequest({ driveId: 'drive-1' });
      const response = await POST(req as any);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.reasons).toContain('Backlogs exceed limit (Max: 0, Yours: 2)');
    });

    it('should return 400 if student not eligible due to branch', async () => {
      (eligibility.checkEligibility as jest.Mock).mockReturnValue({
        isEligible: false,
        reasons: ['Branch not allowed (Allowed: CSE,IT, Yours: MECH)'],
      });

      const req = createMockRequest({ driveId: 'drive-1' });
      const response = await POST(req as any);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.reasons).toContain('Branch not allowed (Allowed: CSE,IT, Yours: MECH)');
    });

    it('should return 400 if multiple eligibility criteria fail', async () => {
      (eligibility.checkEligibility as jest.Mock).mockReturnValue({
        isEligible: false,
        reasons: [
          'CGPA requirement not met (Required: 8.0, Your CGPA: 7.0)',
          'Backlogs exceed limit (Max: 0, Yours: 2)',
        ],
      });

      const req = createMockRequest({ driveId: 'drive-1' });
      const response = await POST(req as any);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.reasons).toHaveLength(2);
    });
  });

  describe('Duplicate Application Prevention', () => {
    beforeEach(() => {
      (getServerSession as jest.Mock).mockResolvedValue(mockStudentSession);
      prismaMock.student.findUnique.mockResolvedValue({
        id: 'student-1',
        userId: 'user-1',
        rollNo: 'CS001',
        firstName: 'Rahul',
        lastName: 'Kumar',
        branch: 'CSE',
        cgpa: 8.5,
        backlogs: 0,
        resume: null,
      } as any);

      prismaMock.drive.findUnique.mockResolvedValue({
        id: 'drive-1',
        registrationStart: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        registrationEnd: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        minCgpa: 7.5,
        maxBacklogs: 0,
        allowedBranches: 'CSE,IT',
      } as any);

      (eligibility.checkEligibility as jest.Mock).mockReturnValue({
        isEligible: true,
        reasons: [],
      });
    });

    it('should return 400 if student has already applied', async () => {
      // Mock existing application
      prismaMock.application.findUnique.mockResolvedValue({
        id: 'app-1',
        studentId: 'student-1',
        driveId: 'drive-1',
        status: 'APPLIED',
      } as any);

      const req = createMockRequest({ driveId: 'drive-1' });
      const response = await POST(req as any);
      const data = await response.json();

      expect(response.status).toBe(409);
      expect(data.message).toBe('You have already applied to this drive');
    });
  });

  describe('Successful Application', () => {
    beforeEach(() => {
      (getServerSession as jest.Mock).mockResolvedValue(mockStudentSession);
      prismaMock.student.findUnique.mockResolvedValue({
        id: 'student-1',
        userId: 'user-1',
        rollNo: 'CS001',
        firstName: 'Rahul',
        lastName: 'Kumar',
        branch: 'CSE',
        cgpa: 8.5,
        backlogs: 0,
        resume: 'https://example.com/resume.pdf',
      } as any);

      prismaMock.drive.findUnique.mockResolvedValue({
        id: 'drive-1',
        registrationStart: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        registrationEnd: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        minCgpa: 7.5,
        maxBacklogs: 0,
        allowedBranches: 'CSE,IT',
      } as any);

      (eligibility.checkEligibility as jest.Mock).mockReturnValue({
        isEligible: true,
        reasons: [],
      });

      prismaMock.application.findUnique.mockResolvedValue(null); // Not applied yet
    });

    it('should successfully create application when all criteria met', async () => {
      prismaMock.application.create.mockResolvedValue({
        id: 'app-new',
        studentId: 'student-1',
        driveId: 'drive-1',
        status: 'APPLIED',
        resumeUrl: 'https://example.com/resume.pdf',
        appliedAt: new Date(),
      } as any);

      const req = createMockRequest({ driveId: 'drive-1' });
      const response = await POST(req as any);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.message).toBe('Application submitted successfully');
      expect(data.applicationId).toBe('app-new');
      expect(prismaMock.application.create).toHaveBeenCalled();
    });

    it('should use provided resume URL', async () => {
      prismaMock.application.create.mockResolvedValue({
        id: 'app-new',
        resumeUrl: 'https://custom-resume.com/resume.pdf',
      } as any);

      const req = createMockRequest({
        driveId: 'drive-1',
        resumeUrl: 'https://custom-resume.com/resume.pdf',
      });

      const response = await POST(req as any);

      expect(prismaMock.application.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            resumeUrl: 'https://custom-resume.com/resume.pdf',
          }),
        })
      );
    });

    it('should use student profile resume if not provided', async () => {
      prismaMock.application.create.mockResolvedValue({
        id: 'app-new',
        resumeUrl: 'https://example.com/resume.pdf',
      } as any);

      const req = createMockRequest({ driveId: 'drive-1' });
      await POST(req as any);

      expect(prismaMock.application.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            resumeUrl: 'https://example.com/resume.pdf', // From student profile
          }),
        })
      );
    });

    it('should set initial status as APPLIED', async () => {
      prismaMock.application.create.mockResolvedValue({
        id: 'app-new',
        status: 'APPLIED',
      } as any);

      const req = createMockRequest({ driveId: 'drive-1' });
      await POST(req as any);

      expect(prismaMock.application.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: 'APPLIED',
          }),
        })
      );
    });
  });

  describe('Edge Cases', () => {
    it('should handle registration deadline boundary (exact end time)', async () => {
      (getServerSession as jest.Mock).mockResolvedValue(mockStudentSession);
      prismaMock.student.findUnique.mockResolvedValue({
        id: 'student-1',
        cgpa: 8.5,
        backlogs: 0,
        branch: 'CSE',
      } as any);

      const now = new Date();
      prismaMock.drive.findUnique.mockResolvedValue({
        id: 'drive-1',
        registrationStart: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
        registrationEnd: new Date(now.getTime() - 1000), // 1 second ago
      } as any);

      const req = createMockRequest({ driveId: 'drive-1' });
      const response = await POST(req as any);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Registration is not open for this drive');
    });

    it('should handle student with exact minimum CGPA (boundary case)', async () => {
      (getServerSession as jest.Mock).mockResolvedValue(mockStudentSession);
      prismaMock.student.findUnique.mockResolvedValue({
        id: 'student-1',
        cgpa: 7.5,
        backlogs: 0,
        branch: 'CSE',
        resume: null,
      } as any);

      prismaMock.drive.findUnique.mockResolvedValue({
        id: 'drive-1',
        registrationStart: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        registrationEnd: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        minCgpa: 7.5, // Exact match
      } as any);

      (eligibility.checkEligibility as jest.Mock).mockReturnValue({
        isEligible: true,
        reasons: [],
      });

      prismaMock.application.findUnique.mockResolvedValue(null);
      prismaMock.application.create.mockResolvedValue({ id: 'app-1' } as any);

      const req = createMockRequest({ driveId: 'drive-1' });
      const response = await POST(req as any);

      expect(response.status).toBe(201);
    });
  });
});

describe('GET /api/student/applications - List Applications', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 401 if not authenticated', async () => {
    (getServerSession as jest.Mock).mockResolvedValue(null);

    const req = createMockRequest();
    const response = await GET(req as any);
    const data = await response.json();

    expect(response.status).toBe(401);
  });

  it('should return all applications for student', async () => {
    (getServerSession as jest.Mock).mockResolvedValue(mockStudentSession);
    prismaMock.student.findUnique.mockResolvedValue({
      id: 'student-1',
      userId: 'user-1',
    } as any);

    prismaMock.application.findMany.mockResolvedValue([
      {
        id: 'app-1',
        status: 'APPLIED',
        appliedAt: new Date(),
        drive: {
          id: 'drive-1',
          title: 'Software Engineer',
          role: 'SDE',
          ctc: 24,
          company: { name: 'Microsoft', logo: 'https://example.com/logo.png' },
        },
      },
      {
        id: 'app-2',
        status: 'SHORTLISTED',
        appliedAt: new Date(),
        drive: {
          id: 'drive-2',
          title: 'Full Stack Developer',
          role: 'FSD',
          ctc: 20,
          company: { name: 'Google', logo: 'https://example.com/logo.png' },
        },
      },
    ] as any);

    prismaMock.application.count.mockResolvedValue(2);

    const req = createMockRequest();
    const response = await GET(req as any);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.applications).toHaveLength(2);
    expect(data.pagination.total).toBe(2);
  });

  it('should filter applications by status', async () => {
    (getServerSession as jest.Mock).mockResolvedValue(mockStudentSession);
    prismaMock.student.findUnique.mockResolvedValue({ id: 'student-1' } as any);

    prismaMock.application.findMany.mockResolvedValue([
      {
        id: 'app-1',
        status: 'SHORTLISTED',
        drive: { company: { name: 'Microsoft' } },
      },
    ] as any);

    prismaMock.application.count.mockResolvedValue(1);

    const req = createMockRequest(null, null, { status: 'SHORTLISTED' });
    const response = await GET(req as any);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.applications).toHaveLength(1);
    expect(data.applications[0].status).toBe('SHORTLISTED');
  });
});
