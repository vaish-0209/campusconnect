/**
 * Unit Tests: Analytics API
 * Tests GET endpoint for placement analytics and statistics
 */

import { GET } from '@/app/api/admin/analytics/route';
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

describe('GET /api/admin/analytics - Get Analytics', () => {
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

  describe('Overview Statistics', () => {
    const mockOfferApplications = [
      {
        id: 'app-1',
        student: { id: 'student-1', branch: 'CSE' },
        drive: { ctc: 24.0, company: { name: 'Microsoft' } },
      },
      {
        id: 'app-2',
        student: { id: 'student-2', branch: 'CSE' },
        drive: { ctc: 30.0, company: { name: 'Google' } },
      },
      {
        id: 'app-3',
        student: { id: 'student-1', branch: 'CSE' }, // Same student, different offer
        drive: { ctc: 20.0, company: { name: 'Amazon' } },
      },
    ];

    beforeEach(() => {
      (getServerSession as jest.Mock).mockResolvedValue(mockAdminSession);
      prismaMock.student.count.mockResolvedValue(100);
      prismaMock.drive.count.mockResolvedValue(15);
      prismaMock.application.count.mockResolvedValue(250);
      prismaMock.application.findMany.mockResolvedValue(mockOfferApplications as any);
      prismaMock.student.groupBy.mockResolvedValue([
        { branch: 'CSE', _count: { id: 50 } },
        { branch: 'IT', _count: { id: 30 } },
        { branch: 'ECE', _count: { id: 20 } },
      ] as any);
      prismaMock.application.groupBy.mockResolvedValue([
        { status: 'APPLIED', _count: { id: 150 } },
        { status: 'SHORTLISTED', _count: { id: 50 } },
        { status: 'OFFER', _count: { id: 30 } },
        { status: 'REJECTED', _count: { id: 20 } },
      ] as any);
    });

    it('should return total students count', async () => {
      const req = createMockRequest();
      const response = await GET(req as any);
      const data = await response.json();

      expect(data.overview.totalStudents).toBe(100);
    });

    it('should return total drives count', async () => {
      const req = createMockRequest();
      const response = await GET(req as any);
      const data = await response.json();

      expect(data.overview.totalDrives).toBe(15);
    });

    it('should return total applications count', async () => {
      const req = createMockRequest();
      const response = await GET(req as any);
      const data = await response.json();

      expect(data.overview.totalApplications).toBe(250);
    });

    it('should calculate unique placed students correctly', async () => {
      const req = createMockRequest();
      const response = await GET(req as any);
      const data = await response.json();

      // 3 offers but only 2 unique students
      expect(data.overview.placedStudents).toBe(2);
      expect(data.overview.totalOffers).toBe(3);
    });

    it('should calculate placement percentage correctly', async () => {
      const req = createMockRequest();
      const response = await GET(req as any);
      const data = await response.json();

      // 2 placed students out of 100 total = 2%
      expect(data.overview.placementPercentage).toBe(2);
    });
  });

  describe('CTC Statistics', () => {
    beforeEach(() => {
      (getServerSession as jest.Mock).mockResolvedValue(mockAdminSession);
      prismaMock.student.count.mockResolvedValue(100);
      prismaMock.drive.count.mockResolvedValue(10);
      prismaMock.application.count.mockResolvedValue(200);
      prismaMock.student.groupBy.mockResolvedValue([{ branch: 'CSE', _count: { id: 100 } }] as any);
      prismaMock.application.groupBy.mockResolvedValue([
        { status: 'OFFER', _count: { id: 5 } },
      ] as any);
    });

    it('should calculate average CTC correctly', async () => {
      const mockOffers = [
        {
          id: 'app-1',
          student: { id: 'student-1', branch: 'CSE' },
          drive: { ctc: 10.0, company: { name: 'Company A' } },
        },
        {
          id: 'app-2',
          student: { id: 'student-2', branch: 'CSE' },
          drive: { ctc: 20.0, company: { name: 'Company B' } },
        },
        {
          id: 'app-3',
          student: { id: 'student-3', branch: 'CSE' },
          drive: { ctc: 30.0, company: { name: 'Company C' } },
        },
      ];

      prismaMock.application.findMany.mockResolvedValue(mockOffers as any);

      const req = createMockRequest();
      const response = await GET(req as any);
      const data = await response.json();

      // Average of 10, 20, 30 = 20
      expect(data.ctcStatistics.averageCTC).toBe(20);
    });

    it('should calculate median CTC for odd number of offers', async () => {
      const mockOffers = [
        { id: 'app-1', student: { id: 's1', branch: 'CSE' }, drive: { ctc: 10.0, company: { name: 'A' } } },
        { id: 'app-2', student: { id: 's2', branch: 'CSE' }, drive: { ctc: 20.0, company: { name: 'B' } } },
        { id: 'app-3', student: { id: 's3', branch: 'CSE' }, drive: { ctc: 30.0, company: { name: 'C' } } },
      ];

      prismaMock.application.findMany.mockResolvedValue(mockOffers as any);

      const req = createMockRequest();
      const response = await GET(req as any);
      const data = await response.json();

      // Median of [10, 20, 30] = 20
      expect(data.ctcStatistics.medianCTC).toBe(20);
    });

    it('should calculate median CTC for even number of offers', async () => {
      const mockOffers = [
        { id: 'app-1', student: { id: 's1', branch: 'CSE' }, drive: { ctc: 10.0, company: { name: 'A' } } },
        { id: 'app-2', student: { id: 's2', branch: 'CSE' }, drive: { ctc: 20.0, company: { name: 'B' } } },
        { id: 'app-3', student: { id: 's3', branch: 'CSE' }, drive: { ctc: 25.0, company: { name: 'C' } } },
        { id: 'app-4', student: { id: 's4', branch: 'CSE' }, drive: { ctc: 30.0, company: { name: 'D' } } },
      ];

      prismaMock.application.findMany.mockResolvedValue(mockOffers as any);

      const req = createMockRequest();
      const response = await GET(req as any);
      const data = await response.json();

      // Median of [10, 20, 25, 30] = (20 + 25) / 2 = 22.5
      expect(data.ctcStatistics.medianCTC).toBe(22.5);
    });

    it('should find highest CTC correctly', async () => {
      const mockOffers = [
        { id: 'app-1', student: { id: 's1', branch: 'CSE' }, drive: { ctc: 10.0, company: { name: 'A' } } },
        { id: 'app-2', student: { id: 's2', branch: 'CSE' }, drive: { ctc: 45.0, company: { name: 'B' } } },
        { id: 'app-3', student: { id: 's3', branch: 'CSE' }, drive: { ctc: 20.0, company: { name: 'C' } } },
      ];

      prismaMock.application.findMany.mockResolvedValue(mockOffers as any);

      const req = createMockRequest();
      const response = await GET(req as any);
      const data = await response.json();

      expect(data.ctcStatistics.highestCTC).toBe(45.0);
    });

    it('should find lowest CTC correctly', async () => {
      const mockOffers = [
        { id: 'app-1', student: { id: 's1', branch: 'CSE' }, drive: { ctc: 12.0, company: { name: 'A' } } },
        { id: 'app-2', student: { id: 's2', branch: 'CSE' }, drive: { ctc: 5.0, company: { name: 'B' } } },
        { id: 'app-3', student: { id: 's3', branch: 'CSE' }, drive: { ctc: 20.0, company: { name: 'C' } } },
      ];

      prismaMock.application.findMany.mockResolvedValue(mockOffers as any);

      const req = createMockRequest();
      const response = await GET(req as any);
      const data = await response.json();

      expect(data.ctcStatistics.lowestCTC).toBe(5.0);
    });

    it('should handle null CTC values', async () => {
      const mockOffers = [
        { id: 'app-1', student: { id: 's1', branch: 'CSE' }, drive: { ctc: 10.0, company: { name: 'A' } } },
        { id: 'app-2', student: { id: 's2', branch: 'CSE' }, drive: { ctc: null, company: { name: 'B' } } },
        { id: 'app-3', student: { id: 's3', branch: 'CSE' }, drive: { ctc: 20.0, company: { name: 'C' } } },
      ];

      prismaMock.application.findMany.mockResolvedValue(mockOffers as any);

      const req = createMockRequest();
      const response = await GET(req as any);
      const data = await response.json();

      // Average of only 10 and 20 = 15 (null is filtered out)
      expect(data.ctcStatistics.averageCTC).toBe(15);
    });

    it('should handle zero offers gracefully', async () => {
      prismaMock.application.findMany.mockResolvedValue([]);

      const req = createMockRequest();
      const response = await GET(req as any);
      const data = await response.json();

      expect(data.ctcStatistics.averageCTC).toBe(0);
      expect(data.ctcStatistics.medianCTC).toBe(0);
      expect(data.ctcStatistics.highestCTC).toBe(0);
      expect(data.ctcStatistics.lowestCTC).toBe(0);
    });
  });

  describe('Branch-wise Statistics', () => {
    beforeEach(() => {
      (getServerSession as jest.Mock).mockResolvedValue(mockAdminSession);
      prismaMock.student.count.mockResolvedValue(100);
      prismaMock.drive.count.mockResolvedValue(10);
      prismaMock.application.count.mockResolvedValue(200);
      prismaMock.application.groupBy.mockResolvedValue([{ status: 'OFFER', _count: { id: 10 } }] as any);
    });

    it('should calculate branch-wise placement statistics', async () => {
      prismaMock.student.groupBy.mockResolvedValue([
        { branch: 'CSE', _count: { id: 50 } },
        { branch: 'IT', _count: { id: 30 } },
      ] as any);

      const mockOffers = [
        { id: 'app-1', student: { id: 's1', branch: 'CSE' }, drive: { ctc: 20.0, company: { name: 'Microsoft' } } },
        { id: 'app-2', student: { id: 's2', branch: 'CSE' }, drive: { ctc: 30.0, company: { name: 'Google' } } },
        { id: 'app-3', student: { id: 's3', branch: 'IT' }, drive: { ctc: 15.0, company: { name: 'Amazon' } } },
      ];

      prismaMock.application.findMany.mockResolvedValue(mockOffers as any);

      const req = createMockRequest();
      const response = await GET(req as any);
      const data = await response.json();

      expect(data.branchWise).toHaveLength(2);

      const cseStats = data.branchWise.find((b: any) => b.branch === 'CSE');
      expect(cseStats.totalStudents).toBe(50);
      expect(cseStats.placedStudents).toBe(2);
      expect(cseStats.placementPercentage).toBe(4); // 2/50 * 100
      expect(cseStats.averageCTC).toBe(25); // (20 + 30) / 2
      expect(cseStats.offersCount).toBe(2);

      const itStats = data.branchWise.find((b: any) => b.branch === 'IT');
      expect(itStats.totalStudents).toBe(30);
      expect(itStats.placedStudents).toBe(1);
      expect(itStats.offersCount).toBe(1);
    });
  });

  describe('Top Recruiters', () => {
    beforeEach(() => {
      (getServerSession as jest.Mock).mockResolvedValue(mockAdminSession);
      prismaMock.student.count.mockResolvedValue(100);
      prismaMock.drive.count.mockResolvedValue(10);
      prismaMock.application.count.mockResolvedValue(200);
      prismaMock.student.groupBy.mockResolvedValue([{ branch: 'CSE', _count: { id: 100 } }] as any);
      prismaMock.application.groupBy.mockResolvedValue([{ status: 'OFFER', _count: { id: 10 } }] as any);
    });

    it('should rank recruiters by offers count', async () => {
      const mockOffers = [
        { id: 'app-1', student: { id: 's1', branch: 'CSE' }, drive: { ctc: 24.0, company: { name: 'Microsoft' } } },
        { id: 'app-2', student: { id: 's2', branch: 'CSE' }, drive: { ctc: 25.0, company: { name: 'Microsoft' } } },
        { id: 'app-3', student: { id: 's3', branch: 'CSE' }, drive: { ctc: 26.0, company: { name: 'Microsoft' } } },
        { id: 'app-4', student: { id: 's4', branch: 'CSE' }, drive: { ctc: 30.0, company: { name: 'Google' } } },
        { id: 'app-5', student: { id: 's5', branch: 'CSE' }, drive: { ctc: 32.0, company: { name: 'Google' } } },
        { id: 'app-6', student: { id: 's6', branch: 'CSE' }, drive: { ctc: 20.0, company: { name: 'Amazon' } } },
      ];

      prismaMock.application.findMany.mockResolvedValue(mockOffers as any);

      const req = createMockRequest();
      const response = await GET(req as any);
      const data = await response.json();

      expect(data.topRecruiters).toHaveLength(3);
      expect(data.topRecruiters[0].companyName).toBe('Microsoft'); // 3 offers
      expect(data.topRecruiters[0].offersCount).toBe(3);
      expect(data.topRecruiters[1].companyName).toBe('Google'); // 2 offers
      expect(data.topRecruiters[2].companyName).toBe('Amazon'); // 1 offer
    });

    it('should calculate average CTC per recruiter', async () => {
      const mockOffers = [
        { id: 'app-1', student: { id: 's1', branch: 'CSE' }, drive: { ctc: 20.0, company: { name: 'Microsoft' } } },
        { id: 'app-2', student: { id: 's2', branch: 'CSE' }, drive: { ctc: 30.0, company: { name: 'Microsoft' } } },
      ];

      prismaMock.application.findMany.mockResolvedValue(mockOffers as any);

      const req = createMockRequest();
      const response = await GET(req as any);
      const data = await response.json();

      expect(data.topRecruiters[0].averageCTC).toBe(25); // (20 + 30) / 2
    });

    it('should limit to top 10 recruiters', async () => {
      const mockOffers = Array.from({ length: 15 }, (_, i) => ({
        id: `app-${i}`,
        student: { id: `s${i}`, branch: 'CSE' },
        drive: { ctc: 20.0, company: { name: `Company${i}` } },
      }));

      prismaMock.application.findMany.mockResolvedValue(mockOffers as any);

      const req = createMockRequest();
      const response = await GET(req as any);
      const data = await response.json();

      expect(data.topRecruiters).toHaveLength(10);
    });
  });

  describe('Status Distribution', () => {
    beforeEach(() => {
      (getServerSession as jest.Mock).mockResolvedValue(mockAdminSession);
      prismaMock.student.count.mockResolvedValue(100);
      prismaMock.drive.count.mockResolvedValue(10);
      prismaMock.application.count.mockResolvedValue(100);
      prismaMock.application.findMany.mockResolvedValue([]);
      prismaMock.student.groupBy.mockResolvedValue([{ branch: 'CSE', _count: { id: 100 } }] as any);
    });

    it('should calculate status distribution percentages', async () => {
      prismaMock.application.groupBy.mockResolvedValue([
        { status: 'APPLIED', _count: { id: 50 } },
        { status: 'SHORTLISTED', _count: { id: 25 } },
        { status: 'OFFER', _count: { id: 15 } },
        { status: 'REJECTED', _count: { id: 10 } },
      ] as any);

      const req = createMockRequest();
      const response = await GET(req as any);
      const data = await response.json();

      expect(data.statusDistribution).toHaveLength(4);

      const appliedStat = data.statusDistribution.find((s: any) => s.status === 'APPLIED');
      expect(appliedStat.count).toBe(50);
      expect(appliedStat.percentage).toBe(50); // 50/100

      const shortlistedStat = data.statusDistribution.find((s: any) => s.status === 'SHORTLISTED');
      expect(shortlistedStat.percentage).toBe(25); // 25/100
    });
  });

  describe('Filtering', () => {
    beforeEach(() => {
      (getServerSession as jest.Mock).mockResolvedValue(mockAdminSession);
      prismaMock.drive.count.mockResolvedValue(10);
      prismaMock.application.findMany.mockResolvedValue([]);
      prismaMock.application.groupBy.mockResolvedValue([]);
    });

    it('should filter by branch', async () => {
      prismaMock.student.count.mockResolvedValue(50);
      prismaMock.application.count.mockResolvedValue(100);
      prismaMock.student.groupBy.mockResolvedValue([{ branch: 'CSE', _count: { id: 50 } }] as any);

      const req = createMockRequest(null, null, { branch: 'CSE' });
      await GET(req as any);

      expect(prismaMock.student.count).toHaveBeenCalledWith({ where: { branch: 'CSE' } });
      expect(prismaMock.student.groupBy).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { branch: 'CSE' },
        })
      );
    });

    it('should filter by date range', async () => {
      prismaMock.student.count.mockResolvedValue(100);
      prismaMock.application.count.mockResolvedValue(50);
      prismaMock.student.groupBy.mockResolvedValue([{ branch: 'CSE', _count: { id: 100 } }] as any);

      const req = createMockRequest(null, null, {
        startDate: '2025-01-01',
        endDate: '2025-12-31',
      });
      await GET(req as any);

      expect(prismaMock.application.count).toHaveBeenCalledWith({
        where: {
          appliedAt: {
            gte: new Date('2025-01-01'),
            lte: new Date('2025-12-31'),
          },
        },
      });
    });
  });

  describe('Audit Logging', () => {
    beforeEach(() => {
      (getServerSession as jest.Mock).mockResolvedValue(mockAdminSession);
      prismaMock.student.count.mockResolvedValue(100);
      prismaMock.drive.count.mockResolvedValue(10);
      prismaMock.application.count.mockResolvedValue(200);
      prismaMock.application.findMany.mockResolvedValue([]);
      prismaMock.student.groupBy.mockResolvedValue([{ branch: 'CSE', _count: { id: 100 } }] as any);
      prismaMock.application.groupBy.mockResolvedValue([{ status: 'OFFER', _count: { id: 10 } }] as any);
    });

    it('should create audit log for analytics view', async () => {
      const req = createMockRequest();
      await GET(req as any);

      expect(createAuditLog).toHaveBeenCalledWith({
        userId: mockAdminSession.user.id,
        userEmail: mockAdminSession.user.email,
        action: 'CREATE',
        target: 'Analytics',
        meta: expect.objectContaining({
          filters: expect.any(Object),
        }),
        req: expect.any(Object),
      });
    });
  });

  describe('Edge Cases', () => {
    beforeEach(() => {
      (getServerSession as jest.Mock).mockResolvedValue(mockAdminSession);
    });

    it('should handle zero students gracefully', async () => {
      prismaMock.student.count.mockResolvedValue(0);
      prismaMock.drive.count.mockResolvedValue(0);
      prismaMock.application.count.mockResolvedValue(0);
      prismaMock.application.findMany.mockResolvedValue([]);
      prismaMock.student.groupBy.mockResolvedValue([]);
      prismaMock.application.groupBy.mockResolvedValue([]);

      const req = createMockRequest();
      const response = await GET(req as any);
      const data = await response.json();

      expect(data.overview.totalStudents).toBe(0);
      expect(data.overview.placementPercentage).toBe(0);
      expect(data.branchWise).toEqual([]);
    });

    it('should round percentages to 2 decimal places', async () => {
      prismaMock.student.count.mockResolvedValue(3);
      prismaMock.drive.count.mockResolvedValue(1);
      prismaMock.application.count.mockResolvedValue(1);
      prismaMock.application.findMany.mockResolvedValue([
        { id: 'app-1', student: { id: 's1', branch: 'CSE' }, drive: { ctc: 20.0, company: { name: 'A' } } },
      ] as any);
      prismaMock.student.groupBy.mockResolvedValue([{ branch: 'CSE', _count: { id: 3 } }] as any);
      prismaMock.application.groupBy.mockResolvedValue([{ status: 'OFFER', _count: { id: 1 } }] as any);

      const req = createMockRequest();
      const response = await GET(req as any);
      const data = await response.json();

      // 1/3 * 100 = 33.333... should be rounded to 33.33
      expect(data.overview.placementPercentage).toBe(33.33);
    });
  });
});
