/**
 * Unit Tests: Drive CRUD Operations
 * Tests GET and POST endpoints for drive management
 */

import { GET, POST } from '@/app/api/admin/drives/route';
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

jest.mock('@/lib/notifications', () => ({
  notifyNewDrive: jest.fn().mockResolvedValue(true),
}));

const { createAuditLog } = require('@/lib/audit');
const { notifyNewDrive } = require('@/lib/notifications');

describe('GET /api/admin/drives - Get All Drives', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Authorization Tests', () => {
    it('should return 401 if user is not authenticated', async () => {
      (getServerSession as jest.Mock).mockResolvedValue(null);

      const req = createMockRequest();
      const response = await GET(req as any);
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
      const response = await GET(req as any);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });
  });

  describe('Successful Retrieval', () => {
    const mockDrives = [
      {
        id: 'drive-1',
        companyId: 'company-1',
        title: 'Software Engineer - Azure',
        role: 'Software Engineer',
        ctc: 24.0,
        location: 'Bangalore',
        registrationStart: new Date('2025-11-01'),
        registrationEnd: new Date('2025-11-30'),
        isActive: true,
        createdAt: new Date('2025-11-01'),
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
      },
      {
        id: 'drive-2',
        companyId: 'company-2',
        title: 'SDE - Backend',
        role: 'SDE',
        ctc: 30.0,
        location: 'Hyderabad',
        registrationStart: new Date('2025-11-05'),
        registrationEnd: new Date('2025-11-25'),
        isActive: true,
        createdAt: new Date('2025-11-05'),
        company: {
          id: 'company-2',
          name: 'Google',
          logo: 'https://example.com/google.png',
        },
        applications: [],
      },
    ];

    it('should return all drives with stats', async () => {
      (getServerSession as jest.Mock).mockResolvedValue(mockAdminSession);
      prismaMock.drive.findMany.mockResolvedValue(mockDrives as any);
      prismaMock.drive.count.mockResolvedValue(2);

      const req = createMockRequest();
      const response = await GET(req as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.drives).toHaveLength(2);
      expect(data.drives[0].title).toBe('Software Engineer - Azure');
    });

    it('should calculate applications count correctly', async () => {
      (getServerSession as jest.Mock).mockResolvedValue(mockAdminSession);
      prismaMock.drive.findMany.mockResolvedValue(mockDrives as any);
      prismaMock.drive.count.mockResolvedValue(2);

      const req = createMockRequest();
      const response = await GET(req as any);
      const data = await response.json();

      expect(data.drives[0].applicationsCount).toBe(3); // Microsoft has 3 applications
      expect(data.drives[1].applicationsCount).toBe(0); // Google has 0 applications
    });

    it('should calculate shortlisted count correctly', async () => {
      (getServerSession as jest.Mock).mockResolvedValue(mockAdminSession);
      prismaMock.drive.findMany.mockResolvedValue(mockDrives as any);
      prismaMock.drive.count.mockResolvedValue(2);

      const req = createMockRequest();
      const response = await GET(req as any);
      const data = await response.json();

      expect(data.drives[0].shortlistedCount).toBe(1); // 1 SHORTLISTED
    });

    it('should calculate offers count correctly', async () => {
      (getServerSession as jest.Mock).mockResolvedValue(mockAdminSession);
      prismaMock.drive.findMany.mockResolvedValue(mockDrives as any);
      prismaMock.drive.count.mockResolvedValue(2);

      const req = createMockRequest();
      const response = await GET(req as any);
      const data = await response.json();

      expect(data.drives[0].offersCount).toBe(1); // 1 OFFER
      expect(data.drives[1].offersCount).toBe(0);
    });

    it('should return pagination metadata', async () => {
      (getServerSession as jest.Mock).mockResolvedValue(mockAdminSession);
      prismaMock.drive.findMany.mockResolvedValue(mockDrives as any);
      prismaMock.drive.count.mockResolvedValue(25);

      const req = createMockRequest();
      const response = await GET(req as any);
      const data = await response.json();

      expect(data.pagination).toBeDefined();
      expect(data.pagination.total).toBe(25);
      expect(data.pagination.page).toBe(1);
      expect(data.pagination.limit).toBe(20);
      expect(data.pagination.totalPages).toBe(2);
    });

    it('should order drives by createdAt descending', async () => {
      (getServerSession as jest.Mock).mockResolvedValue(mockAdminSession);
      prismaMock.drive.findMany.mockResolvedValue(mockDrives as any);
      prismaMock.drive.count.mockResolvedValue(2);

      const req = createMockRequest();
      await GET(req as any);

      expect(prismaMock.drive.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { createdAt: 'desc' },
        })
      );
    });
  });

  describe('Pagination Tests', () => {
    it('should handle page 1 with default limit', async () => {
      (getServerSession as jest.Mock).mockResolvedValue(mockAdminSession);
      prismaMock.drive.findMany.mockResolvedValue([]);
      prismaMock.drive.count.mockResolvedValue(0);

      const req = createMockRequest(null, null, { page: '1' });
      await GET(req as any);

      expect(prismaMock.drive.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 0,
          take: 20,
        })
      );
    });

    it('should handle page 2 with skip offset', async () => {
      (getServerSession as jest.Mock).mockResolvedValue(mockAdminSession);
      prismaMock.drive.findMany.mockResolvedValue([]);
      prismaMock.drive.count.mockResolvedValue(0);

      const req = createMockRequest(null, null, { page: '2' });
      await GET(req as any);

      expect(prismaMock.drive.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 20,
          take: 20,
        })
      );
    });

    it('should handle custom limit', async () => {
      (getServerSession as jest.Mock).mockResolvedValue(mockAdminSession);
      prismaMock.drive.findMany.mockResolvedValue([]);
      prismaMock.drive.count.mockResolvedValue(0);

      const req = createMockRequest(null, null, { page: '1', limit: '50' });
      await GET(req as any);

      expect(prismaMock.drive.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 0,
          take: 50,
        })
      );
    });
  });

  describe('Filter Tests', () => {
    beforeEach(() => {
      (getServerSession as jest.Mock).mockResolvedValue(mockAdminSession);
      prismaMock.drive.findMany.mockResolvedValue([]);
      prismaMock.drive.count.mockResolvedValue(0);
    });

    it('should filter by companyId', async () => {
      const req = createMockRequest(null, null, { companyId: 'company-1' });
      await GET(req as any);

      expect(prismaMock.drive.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            AND: [{ companyId: 'company-1' }],
          },
        })
      );
    });

    it('should filter by company name', async () => {
      const req = createMockRequest(null, null, { company: 'Microsoft' });
      await GET(req as any);

      expect(prismaMock.drive.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            AND: [{ company: { name: 'Microsoft' } }],
          },
        })
      );
    });

    it('should filter by isActive=true', async () => {
      const req = createMockRequest(null, null, { isActive: 'true' });
      await GET(req as any);

      expect(prismaMock.drive.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            AND: [{ isActive: true }],
          },
        })
      );
    });

    it('should filter by isActive=false', async () => {
      const req = createMockRequest(null, null, { isActive: 'false' });
      await GET(req as any);

      expect(prismaMock.drive.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            AND: [{ isActive: false }],
          },
        })
      );
    });

    it('should search by title', async () => {
      const req = createMockRequest(null, null, { search: 'Software Engineer' });
      await GET(req as any);

      expect(prismaMock.drive.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            AND: [
              {
                OR: [
                  { title: { contains: 'Software Engineer' } },
                  { role: { contains: 'Software Engineer' } },
                  { company: { name: { contains: 'Software Engineer' } } },
                ],
              },
            ],
          },
        })
      );
    });

    it('should combine multiple filters', async () => {
      const req = createMockRequest(null, null, {
        companyId: 'company-1',
        isActive: 'true',
        search: 'Backend',
      });
      await GET(req as any);

      expect(prismaMock.drive.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            AND: expect.arrayContaining([
              { companyId: 'company-1' },
              { isActive: true },
              expect.objectContaining({ OR: expect.any(Array) }),
            ]),
          },
        })
      );
    });
  });
});

describe('POST /api/admin/drives - Create Drive', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Authorization Tests', () => {
    it('should return 401 if user is not authenticated', async () => {
      (getServerSession as jest.Mock).mockResolvedValue(null);

      const req = createMockRequest({
        companyId: 'company-1',
        title: 'SDE',
        role: 'Software Engineer',
        jobDescription: 'Backend development',
        registrationStart: '2025-11-01T00:00:00Z',
        registrationEnd: '2025-11-30T00:00:00Z',
      });
      const response = await POST(req as any);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('should return 401 if user is not an admin', async () => {
      (getServerSession as jest.Mock).mockResolvedValue({
        user: { id: 'student-1', role: 'STUDENT', email: 'student@test.com' },
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      });

      const req = createMockRequest({
        companyId: 'company-1',
        title: 'SDE',
        role: 'Software Engineer',
        jobDescription: 'Backend development',
        registrationStart: '2025-11-01T00:00:00Z',
        registrationEnd: '2025-11-30T00:00:00Z',
      });
      const response = await POST(req as any);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });
  });

  describe('Validation Tests', () => {
    beforeEach(() => {
      (getServerSession as jest.Mock).mockResolvedValue(mockAdminSession);
    });

    it('should return 400 if companyId is missing', async () => {
      const req = createMockRequest({
        title: 'SDE',
        role: 'Software Engineer',
        jobDescription: 'Backend development',
        registrationStart: '2025-11-01T00:00:00Z',
        registrationEnd: '2025-11-30T00:00:00Z',
      });
      const response = await POST(req as any);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Validation error');
    });

    it('should return 400 if title is missing', async () => {
      const req = createMockRequest({
        companyId: 'company-1',
        role: 'Software Engineer',
        jobDescription: 'Backend development',
        registrationStart: '2025-11-01T00:00:00Z',
        registrationEnd: '2025-11-30T00:00:00Z',
      });
      const response = await POST(req as any);
      const data = await response.json();

      expect(response.status).toBe(400);
    });

    it('should return 400 if role is missing', async () => {
      const req = createMockRequest({
        companyId: 'company-1',
        title: 'SDE',
        jobDescription: 'Backend development',
        registrationStart: '2025-11-01T00:00:00Z',
        registrationEnd: '2025-11-30T00:00:00Z',
      });
      const response = await POST(req as any);
      const data = await response.json();

      expect(response.status).toBe(400);
    });

    it('should return 400 if jobDescription is missing', async () => {
      const req = createMockRequest({
        companyId: 'company-1',
        title: 'SDE',
        role: 'Software Engineer',
        registrationStart: '2025-11-01T00:00:00Z',
        registrationEnd: '2025-11-30T00:00:00Z',
      });
      const response = await POST(req as any);
      const data = await response.json();

      expect(response.status).toBe(400);
    });

    it('should return 400 if registrationStart is missing', async () => {
      const req = createMockRequest({
        companyId: 'company-1',
        title: 'SDE',
        role: 'Software Engineer',
        jobDescription: 'Backend development',
        registrationEnd: '2025-11-30T00:00:00Z',
      });
      const response = await POST(req as any);
      const data = await response.json();

      expect(response.status).toBe(400);
    });

    it('should return 400 if registrationEnd is missing', async () => {
      const req = createMockRequest({
        companyId: 'company-1',
        title: 'SDE',
        role: 'Software Engineer',
        jobDescription: 'Backend development',
        registrationStart: '2025-11-01T00:00:00Z',
      });
      const response = await POST(req as any);
      const data = await response.json();

      expect(response.status).toBe(400);
    });

    it('should return 400 if ctc is negative', async () => {
      prismaMock.company.findUnique.mockResolvedValue({ id: 'company-1' } as any);

      const req = createMockRequest({
        companyId: 'company-1',
        title: 'SDE',
        role: 'Software Engineer',
        jobDescription: 'Backend development',
        ctc: -5,
        registrationStart: '2025-11-01T00:00:00Z',
        registrationEnd: '2025-11-30T00:00:00Z',
      });
      const response = await POST(req as any);
      const data = await response.json();

      expect(response.status).toBe(400);
    });

    it('should return 400 if minCgpa is negative', async () => {
      prismaMock.company.findUnique.mockResolvedValue({ id: 'company-1' } as any);

      const req = createMockRequest({
        companyId: 'company-1',
        title: 'SDE',
        role: 'Software Engineer',
        jobDescription: 'Backend development',
        minCgpa: -1,
        registrationStart: '2025-11-01T00:00:00Z',
        registrationEnd: '2025-11-30T00:00:00Z',
      });
      const response = await POST(req as any);
      const data = await response.json();

      expect(response.status).toBe(400);
    });

    it('should return 400 if minCgpa exceeds 10', async () => {
      prismaMock.company.findUnique.mockResolvedValue({ id: 'company-1' } as any);

      const req = createMockRequest({
        companyId: 'company-1',
        title: 'SDE',
        role: 'Software Engineer',
        jobDescription: 'Backend development',
        minCgpa: 11,
        registrationStart: '2025-11-01T00:00:00Z',
        registrationEnd: '2025-11-30T00:00:00Z',
      });
      const response = await POST(req as any);
      const data = await response.json();

      expect(response.status).toBe(400);
    });

    it('should return 400 if maxBacklogs is negative', async () => {
      prismaMock.company.findUnique.mockResolvedValue({ id: 'company-1' } as any);

      const req = createMockRequest({
        companyId: 'company-1',
        title: 'SDE',
        role: 'Software Engineer',
        jobDescription: 'Backend development',
        maxBacklogs: -1,
        registrationStart: '2025-11-01T00:00:00Z',
        registrationEnd: '2025-11-30T00:00:00Z',
      });
      const response = await POST(req as any);
      const data = await response.json();

      expect(response.status).toBe(400);
    });
  });

  describe('Company Validation', () => {
    beforeEach(() => {
      (getServerSession as jest.Mock).mockResolvedValue(mockAdminSession);
    });

    it('should return 404 if company does not exist', async () => {
      prismaMock.company.findUnique.mockResolvedValue(null);

      const req = createMockRequest({
        companyId: 'nonexistent',
        title: 'SDE',
        role: 'Software Engineer',
        jobDescription: 'Backend development',
        registrationStart: '2025-11-01T00:00:00Z',
        registrationEnd: '2025-11-30T00:00:00Z',
      });
      const response = await POST(req as any);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Company not found');
    });
  });

  describe('Date Validation', () => {
    beforeEach(() => {
      (getServerSession as jest.Mock).mockResolvedValue(mockAdminSession);
      prismaMock.company.findUnique.mockResolvedValue({ id: 'company-1' } as any);
    });

    it('should return 400 if registration end is before start', async () => {
      const req = createMockRequest({
        companyId: 'company-1',
        title: 'SDE',
        role: 'Software Engineer',
        jobDescription: 'Backend development',
        registrationStart: '2025-11-30T00:00:00Z',
        registrationEnd: '2025-11-01T00:00:00Z',
      });
      const response = await POST(req as any);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Registration end date must be after start date');
    });

    it('should return 400 if registration end equals start', async () => {
      const req = createMockRequest({
        companyId: 'company-1',
        title: 'SDE',
        role: 'Software Engineer',
        jobDescription: 'Backend development',
        registrationStart: '2025-11-15T00:00:00Z',
        registrationEnd: '2025-11-15T00:00:00Z',
      });
      const response = await POST(req as any);
      const data = await response.json();

      expect(response.status).toBe(400);
    });
  });

  describe('Successful Drive Creation', () => {
    const mockCompany = {
      id: 'company-1',
      name: 'Microsoft',
    };

    const mockCreatedDrive = {
      id: 'drive-1',
      companyId: 'company-1',
      title: 'Software Engineer - Azure',
      role: 'Software Engineer',
      jobDescription: 'Backend development for Azure cloud',
      ctc: 24.0,
      ctcBreakup: null,
      location: 'Bangalore',
      bond: null,
      techStack: ['C#', 'Azure', 'Kubernetes'],
      minCgpa: 7.5,
      maxBacklogs: 0,
      allowedBranches: ['CSE', 'IT'],
      registrationStart: new Date('2025-11-01'),
      registrationEnd: new Date('2025-11-30'),
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    beforeEach(() => {
      (getServerSession as jest.Mock).mockResolvedValue(mockAdminSession);
      prismaMock.company.findUnique.mockResolvedValue(mockCompany as any);
      prismaMock.drive.create.mockResolvedValue(mockCreatedDrive as any);
    });

    it('should create drive with all fields', async () => {
      const req = createMockRequest({
        companyId: 'company-1',
        title: 'Software Engineer - Azure',
        role: 'Software Engineer',
        jobDescription: 'Backend development for Azure cloud',
        ctc: 24.0,
        location: 'Bangalore',
        techStack: ['C#', 'Azure', 'Kubernetes'],
        minCgpa: 7.5,
        maxBacklogs: 0,
        allowedBranches: ['CSE', 'IT'],
        registrationStart: '2025-11-01T00:00:00Z',
        registrationEnd: '2025-11-30T00:00:00Z',
      });
      const response = await POST(req as any);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.drive.id).toBe('drive-1');
      expect(data.drive.title).toBe('Software Engineer - Azure');
    });

    it('should set isActive to true by default', async () => {
      const req = createMockRequest({
        companyId: 'company-1',
        title: 'SDE',
        role: 'Software Engineer',
        jobDescription: 'Backend development',
        registrationStart: '2025-11-01T00:00:00Z',
        registrationEnd: '2025-11-30T00:00:00Z',
      });
      await POST(req as any);

      expect(prismaMock.drive.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          isActive: true,
        }),
      });
    });

    it('should create audit log for drive creation', async () => {
      const req = createMockRequest({
        companyId: 'company-1',
        title: 'SDE',
        role: 'Software Engineer',
        jobDescription: 'Backend development',
        registrationStart: '2025-11-01T00:00:00Z',
        registrationEnd: '2025-11-30T00:00:00Z',
      });
      await POST(req as any);

      expect(createAuditLog).toHaveBeenCalledWith({
        userId: mockAdminSession.user.id,
        userEmail: mockAdminSession.user.email,
        action: 'CREATE',
        target: 'Drive',
        targetId: 'drive-1',
        meta: expect.any(Object),
        req: expect.any(Object),
      });
    });

    it('should trigger notification to eligible students', async () => {
      const req = createMockRequest({
        companyId: 'company-1',
        title: 'SDE',
        role: 'Software Engineer',
        jobDescription: 'Backend development',
        registrationStart: '2025-11-01T00:00:00Z',
        registrationEnd: '2025-11-30T00:00:00Z',
      });
      await POST(req as any);

      expect(notifyNewDrive).toHaveBeenCalledWith('drive-1');
    });
  });

  describe('Real-World Scenarios', () => {
    beforeEach(() => {
      (getServerSession as jest.Mock).mockResolvedValue(mockAdminSession);
      prismaMock.company.findUnique.mockResolvedValue({ id: 'company-1' } as any);
      prismaMock.drive.create.mockResolvedValue({ id: 'drive-1', title: 'Test' } as any);
    });

    it('Scenario: Create high-paying Microsoft Azure drive', async () => {
      const req = createMockRequest({
        companyId: 'company-1',
        title: 'Software Engineer - Azure Cloud',
        role: 'SDE-2',
        jobDescription: 'Work on Azure cloud infrastructure',
        ctc: 24.0,
        location: 'Bangalore',
        techStack: ['C#', 'Azure', 'Kubernetes', 'Docker'],
        minCgpa: 8.0,
        maxBacklogs: 0,
        allowedBranches: ['CSE', 'IT'],
        registrationStart: '2025-11-01T00:00:00Z',
        registrationEnd: '2025-11-30T00:00:00Z',
      });
      const response = await POST(req as any);

      expect(response.status).toBe(201);
    });

    it('Scenario: Create startup drive with lenient criteria', async () => {
      const req = createMockRequest({
        companyId: 'company-1',
        title: 'Full Stack Developer',
        role: 'Developer',
        jobDescription: 'MERN stack development',
        ctc: 8.0,
        minCgpa: 6.5,
        maxBacklogs: 2,
        allowedBranches: ['CSE', 'IT', 'ECE', 'MECH'],
        registrationStart: '2025-11-10T00:00:00Z',
        registrationEnd: '2025-12-10T00:00:00Z',
      });
      const response = await POST(req as any);

      expect(response.status).toBe(201);
    });
  });
});
