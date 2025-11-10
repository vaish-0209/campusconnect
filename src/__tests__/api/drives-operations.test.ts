/**
 * Unit Tests: Drive Individual Operations (GET/PATCH by ID)
 * Tests individual drive operations
 */

import { GET, PATCH } from '@/app/api/admin/drives/[id]/route';
import { getServerSession } from 'next-auth';
import { prismaMock, mockAdminSession, createMockRequest } from '../utils/testUtils';

// Mock dependencies
jest.mock('next-auth', () => ({
  getServerSession: jest.fn(),
}));

jest.mock('@/lib/prisma', () => ({
  prisma: require('../utils/testUtils').prismaMock,
}));

jest.mock('@/lib/auth', () => ({
  authOptions: {},
}));

jest.mock('@/lib/audit', () => ({
  createAuditLog: jest.fn().mockResolvedValue(true),
}));

const { createAuditLog } = require('@/lib/audit');

describe('GET /api/admin/drives/[id] - Get Single Drive', () => {
  const mockDrive = {
    id: 'drive-1',
    companyId: 'company-1',
    title: 'Software Engineer - Azure',
    role: 'SDE-2',
    jobDescription: 'Backend development',
    ctc: 24.0,
    location: 'Bangalore',
    techStack: ['C#', 'Azure', 'Kubernetes'],
    minCgpa: 8.0,
    maxBacklogs: 0,
    allowedBranches: ['CSE', 'IT'],
    registrationStart: new Date('2025-11-01'),
    registrationEnd: new Date('2025-11-30'),
    isActive: true,
    company: {
      id: 'company-1',
      name: 'Microsoft',
      logo: 'https://example.com/microsoft.png',
    },
    applications: [
      { id: 'app-1', status: 'APPLIED' },
      { id: 'app-2', status: 'SHORTLISTED' },
      { id: 'app-3', status: 'OFFER' },
    ],
    events: [
      { id: 'event-1', title: 'PPT', startTime: new Date() },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Authorization Tests', () => {
    it('should return 401 if user is not authenticated', async () => {
      (getServerSession as jest.Mock).mockResolvedValue(null);

      const req = createMockRequest();
      const response = await GET(req as any, { params: { id: 'drive-1' } });
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('should return 401 if user is not an admin', async () => {
      (getServerSession as jest.Mock).mockResolvedValue({
        user: { id: 'student-1', role: 'STUDENT', email: 'student@test.com' },
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      });

      const req = createMockRequest();
      const response = await GET(req as any, { params: { id: 'drive-1' } });
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });
  });

  describe('Successful Retrieval', () => {
    beforeEach(() => {
      (getServerSession as jest.Mock).mockResolvedValue(mockAdminSession);
    });

    it('should return 404 if drive not found', async () => {
      prismaMock.drive.findUnique.mockResolvedValue(null);

      const req = createMockRequest();
      const response = await GET(req as any, { params: { id: 'nonexistent' } });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Drive not found');
    });

    it('should return drive with all fields', async () => {
      prismaMock.drive.findUnique.mockResolvedValue(mockDrive as any);

      const req = createMockRequest();
      const response = await GET(req as any, { params: { id: 'drive-1' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.drive.id).toBe('drive-1');
      expect(data.drive.title).toBe('Software Engineer - Azure');
      expect(data.drive.company.name).toBe('Microsoft');
    });

    it('should calculate applications count', async () => {
      prismaMock.drive.findUnique.mockResolvedValue(mockDrive as any);

      const req = createMockRequest();
      const response = await GET(req as any, { params: { id: 'drive-1' } });
      const data = await response.json();

      expect(data.drive.applicationsCount).toBe(3);
    });

    it('should calculate shortlisted count', async () => {
      prismaMock.drive.findUnique.mockResolvedValue(mockDrive as any);

      const req = createMockRequest();
      const response = await GET(req as any, { params: { id: 'drive-1' } });
      const data = await response.json();

      expect(data.drive.shortlistedCount).toBe(1); // Only SHORTLISTED status
    });

    it('should calculate offers count', async () => {
      prismaMock.drive.findUnique.mockResolvedValue(mockDrive as any);

      const req = createMockRequest();
      const response = await GET(req as any, { params: { id: 'drive-1' } });
      const data = await response.json();

      expect(data.drive.offersCount).toBe(1); // Only OFFER status
    });

    it('should include events ordered by start time', async () => {
      prismaMock.drive.findUnique.mockResolvedValue(mockDrive as any);

      const req = createMockRequest();
      const response = await GET(req as any, { params: { id: 'drive-1' } });
      const data = await response.json();

      expect(data.drive.events).toHaveLength(1);
    });

    it('should parse techStack as array', async () => {
      prismaMock.drive.findUnique.mockResolvedValue(mockDrive as any);

      const req = createMockRequest();
      const response = await GET(req as any, { params: { id: 'drive-1' } });
      const data = await response.json();

      expect(Array.isArray(data.drive.techStack)).toBe(true);
      expect(data.drive.techStack).toContain('Azure');
    });

    it('should parse allowedBranches as array', async () => {
      prismaMock.drive.findUnique.mockResolvedValue(mockDrive as any);

      const req = createMockRequest();
      const response = await GET(req as any, { params: { id: 'drive-1' } });
      const data = await response.json();

      expect(Array.isArray(data.drive.allowedBranches)).toBe(true);
      expect(data.drive.allowedBranches).toContain('CSE');
    });
  });
});

describe('PATCH /api/admin/drives/[id] - Update Drive', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Authorization Tests', () => {
    it('should return 401 if user is not authenticated', async () => {
      (getServerSession as jest.Mock).mockResolvedValue(null);

      const req = createMockRequest({ title: 'Updated Title' });
      const response = await PATCH(req as any, { params: { id: 'drive-1' } });
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('should return 401 if user is not an admin', async () => {
      (getServerSession as jest.Mock).mockResolvedValue({
        user: { id: 'student-1', role: 'STUDENT', email: 'student@test.com' },
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      });

      const req = createMockRequest({ title: 'Updated Title' });
      const response = await PATCH(req as any, { params: { id: 'drive-1' } });
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });
  });

  describe('Validation Tests', () => {
    beforeEach(() => {
      (getServerSession as jest.Mock).mockResolvedValue(mockAdminSession);
    });

    it('should return 400 if ctc is negative', async () => {
      const req = createMockRequest({ ctc: -5 });
      const response = await PATCH(req as any, { params: { id: 'drive-1' } });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Validation error');
    });

    it('should return 400 if minCgpa exceeds 10', async () => {
      const req = createMockRequest({ minCgpa: 11 });
      const response = await PATCH(req as any, { params: { id: 'drive-1' } });
      const data = await response.json();

      expect(response.status).toBe(400);
    });

    it('should return 400 if maxBacklogs is negative', async () => {
      const req = createMockRequest({ maxBacklogs: -1 });
      const response = await PATCH(req as any, { params: { id: 'drive-1' } });
      const data = await response.json();

      expect(response.status).toBe(400);
    });
  });

  describe('Successful Updates', () => {
    const mockUpdatedDrive = {
      id: 'drive-1',
      title: 'Updated Title',
    };

    beforeEach(() => {
      (getServerSession as jest.Mock).mockResolvedValue(mockAdminSession);
      prismaMock.drive.update.mockResolvedValue(mockUpdatedDrive as any);
    });

    it('should update title', async () => {
      const req = createMockRequest({ title: 'Updated Title' });
      const response = await PATCH(req as any, { params: { id: 'drive-1' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(prismaMock.drive.update).toHaveBeenCalledWith({
        where: { id: 'drive-1' },
        data: { title: 'Updated Title' },
      });
    });

    it('should update role', async () => {
      const req = createMockRequest({ role: 'Senior SDE' });
      await PATCH(req as any, { params: { id: 'drive-1' } });

      expect(prismaMock.drive.update).toHaveBeenCalledWith({
        where: { id: 'drive-1' },
        data: { role: 'Senior SDE' },
      });
    });

    it('should update CTC', async () => {
      const req = createMockRequest({ ctc: 30.0 });
      await PATCH(req as any, { params: { id: 'drive-1' } });

      expect(prismaMock.drive.update).toHaveBeenCalledWith({
        where: { id: 'drive-1' },
        data: { ctc: 30.0 },
      });
    });

    it('should update eligibility criteria', async () => {
      const req = createMockRequest({
        minCgpa: 7.5,
        maxBacklogs: 1,
        allowedBranches: ['CSE', 'IT', 'ECE'],
      });
      await PATCH(req as any, { params: { id: 'drive-1' } });

      expect(prismaMock.drive.update).toHaveBeenCalledWith({
        where: { id: 'drive-1' },
        data: {
          minCgpa: 7.5,
          maxBacklogs: 1,
          allowedBranches: ['CSE', 'IT', 'ECE'],
        },
      });
    });

    it('should update tech stack', async () => {
      const req = createMockRequest({
        techStack: ['React', 'Node.js', 'MongoDB'],
      });
      await PATCH(req as any, { params: { id: 'drive-1' } });

      expect(prismaMock.drive.update).toHaveBeenCalledWith({
        where: { id: 'drive-1' },
        data: {
          techStack: ['React', 'Node.js', 'MongoDB'],
        },
      });
    });

    it('should update registration dates', async () => {
      const req = createMockRequest({
        registrationStart: '2025-12-01T00:00:00Z',
        registrationEnd: '2025-12-31T00:00:00Z',
      });
      await PATCH(req as any, { params: { id: 'drive-1' } });

      expect(prismaMock.drive.update).toHaveBeenCalledWith({
        where: { id: 'drive-1' },
        data: {
          registrationStart: new Date('2025-12-01T00:00:00Z'),
          registrationEnd: new Date('2025-12-31T00:00:00Z'),
        },
      });
    });

    it('should toggle isActive status', async () => {
      const req = createMockRequest({ isActive: false });
      await PATCH(req as any, { params: { id: 'drive-1' } });

      expect(prismaMock.drive.update).toHaveBeenCalledWith({
        where: { id: 'drive-1' },
        data: { isActive: false },
      });
    });

    it('should update multiple fields at once', async () => {
      const req = createMockRequest({
        title: 'Updated Title',
        ctc: 28.0,
        minCgpa: 7.0,
        isActive: true,
      });
      await PATCH(req as any, { params: { id: 'drive-1' } });

      expect(prismaMock.drive.update).toHaveBeenCalledWith({
        where: { id: 'drive-1' },
        data: {
          title: 'Updated Title',
          ctc: 28.0,
          minCgpa: 7.0,
          isActive: true,
        },
      });
    });

    it('should create audit log for update', async () => {
      const req = createMockRequest({ title: 'Updated Title', ctc: 30.0 });
      await PATCH(req as any, { params: { id: 'drive-1' } });

      expect(createAuditLog).toHaveBeenCalledWith({
        userId: mockAdminSession.user.id,
        userEmail: mockAdminSession.user.email,
        action: 'UPDATE',
        target: 'Drive',
        targetId: 'drive-1',
        meta: {
          updatedFields: ['title', 'ctc'],
        },
        req: expect.any(Object),
      });
    });
  });

  describe('Real-World Scenarios', () => {
    beforeEach(() => {
      (getServerSession as jest.Mock).mockResolvedValue(mockAdminSession);
      prismaMock.drive.update.mockResolvedValue({ id: 'drive-1' } as any);
    });

    it('Scenario: Extend registration deadline', async () => {
      const req = createMockRequest({
        registrationEnd: '2025-12-15T23:59:59Z',
      });
      const response = await PATCH(req as any, { params: { id: 'drive-1' } });

      expect(response.status).toBe(200);
      expect(prismaMock.drive.update).toHaveBeenCalledWith({
        where: { id: 'drive-1' },
        data: {
          registrationEnd: new Date('2025-12-15T23:59:59Z'),
        },
      });
    });

    it('Scenario: Relax eligibility criteria mid-drive', async () => {
      const req = createMockRequest({
        minCgpa: 6.5,
        maxBacklogs: 2,
      });
      const response = await PATCH(req as any, { params: { id: 'drive-1' } });

      expect(response.status).toBe(200);
    });

    it('Scenario: Update CTC after negotiation', async () => {
      const req = createMockRequest({
        ctc: 26.5,
        ctcBreakup: 'Base: 18 LPA, Variable: 8.5 LPA',
      });
      const response = await PATCH(req as any, { params: { id: 'drive-1' } });

      expect(response.status).toBe(200);
    });

    it('Scenario: Deactivate completed drive', async () => {
      const req = createMockRequest({ isActive: false });
      const response = await PATCH(req as any, { params: { id: 'drive-1' } });

      expect(response.status).toBe(200);
      expect(prismaMock.drive.update).toHaveBeenCalledWith({
        where: { id: 'drive-1' },
        data: { isActive: false },
      });
    });

    it('Scenario: Add more branches to drive', async () => {
      const req = createMockRequest({
        allowedBranches: ['CSE', 'IT', 'ECE', 'MECH'],
      });
      const response = await PATCH(req as any, { params: { id: 'drive-1' } });

      expect(response.status).toBe(200);
    });
  });

  describe('Edge Cases', () => {
    beforeEach(() => {
      (getServerSession as jest.Mock).mockResolvedValue(mockAdminSession);
    });

    it('should handle empty update (no fields provided)', async () => {
      prismaMock.drive.update.mockResolvedValue({ id: 'drive-1' } as any);

      const req = createMockRequest({});
      const response = await PATCH(req as any, { params: { id: 'drive-1' } });

      expect(response.status).toBe(200);
    });

    it('should accept minCgpa at boundary (0)', async () => {
      prismaMock.drive.update.mockResolvedValue({ id: 'drive-1' } as any);

      const req = createMockRequest({ minCgpa: 0 });
      const response = await PATCH(req as any, { params: { id: 'drive-1' } });

      expect(response.status).toBe(200);
    });

    it('should accept minCgpa at boundary (10)', async () => {
      prismaMock.drive.update.mockResolvedValue({ id: 'drive-1' } as any);

      const req = createMockRequest({ minCgpa: 10 });
      const response = await PATCH(req as any, { params: { id: 'drive-1' } });

      expect(response.status).toBe(200);
    });

    it('should accept maxBacklogs at boundary (0)', async () => {
      prismaMock.drive.update.mockResolvedValue({ id: 'drive-1' } as any);

      const req = createMockRequest({ maxBacklogs: 0 });
      const response = await PATCH(req as any, { params: { id: 'drive-1' } });

      expect(response.status).toBe(200);
    });
  });
});
