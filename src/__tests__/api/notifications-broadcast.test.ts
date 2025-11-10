/**
 * Unit Tests: Notifications Broadcast
 * Tests POST endpoint for broadcasting notifications to multiple users
 */

import { POST } from '@/app/api/admin/notifications/broadcast/route';
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

jest.mock('@/lib/email', () => ({
  sendBulkNotificationEmails: jest.fn().mockResolvedValue({ sent: 10, failed: 0 }),
}));

const { sendBulkNotificationEmails } = require('@/lib/email');

describe('POST /api/admin/notifications/broadcast - Broadcast Notifications', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Authorization Tests', () => {
    it('should return 401 if user is not authenticated', async () => {
      (getServerSession as jest.Mock).mockResolvedValue(null);

      const req = createMockRequest({
        title: 'Test',
        message: 'Message',
        target: 'all',
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
        title: 'Test',
        message: 'Message',
        target: 'all',
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

    it('should return 400 if title is missing', async () => {
      const req = createMockRequest({
        message: 'Message',
        target: 'all',
      });
      const response = await POST(req as any);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Validation error');
    });

    it('should return 400 if message is missing', async () => {
      const req = createMockRequest({
        title: 'Title',
        target: 'all',
      });
      const response = await POST(req as any);
      const data = await response.json();

      expect(response.status).toBe(400);
    });

    it('should return 400 if target is invalid', async () => {
      const req = createMockRequest({
        title: 'Title',
        message: 'Message',
        target: 'invalid',
      });
      const response = await POST(req as any);
      const data = await response.json();

      expect(response.status).toBe(400);
    });

    it('should return 400 if branch target without targetValue', async () => {
      prismaMock.student.findMany.mockResolvedValue([]);

      const req = createMockRequest({
        title: 'Title',
        message: 'Message',
        target: 'branch',
      });
      const response = await POST(req as any);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Branch name is required for branch target');
    });

    it('should return 400 if drive target without targetValue', async () => {
      prismaMock.application.findMany.mockResolvedValue([]);

      const req = createMockRequest({
        title: 'Title',
        message: 'Message',
        target: 'drive',
      });
      const response = await POST(req as any);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Drive ID is required for drive target');
    });
  });

  describe('Broadcast to All Students', () => {
    const mockUsers = [
      { id: 'user-1' },
      { id: 'user-2' },
      { id: 'user-3' },
    ];

    beforeEach(() => {
      (getServerSession as jest.Mock).mockResolvedValue(mockAdminSession);
      prismaMock.user.findMany.mockResolvedValue(mockUsers as any);
      prismaMock.notification.createMany.mockResolvedValue({ count: 3 });
    });

    it('should broadcast to all active students', async () => {
      const req = createMockRequest({
        title: 'Important Announcement',
        message: 'All students must attend tomorrow',
        target: 'all',
        type: 'ANNOUNCEMENT',
      });
      const response = await POST(req as any);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.count).toBe(3);
      expect(data.message).toContain('3 users');
    });

    it('should query only active students', async () => {
      const req = createMockRequest({
        title: 'Test',
        message: 'Message',
        target: 'all',
      });
      await POST(req as any);

      expect(prismaMock.user.findMany).toHaveBeenCalledWith({
        where: {
          role: 'STUDENT',
          isActive: true,
        },
        select: { id: true },
      });
    });

    it('should create notifications for all users', async () => {
      const req = createMockRequest({
        title: 'Title',
        message: 'Message',
        target: 'all',
      });
      await POST(req as any);

      expect(prismaMock.notification.createMany).toHaveBeenCalledWith({
        data: [
          {
            userId: 'user-1',
            title: 'Title',
            message: 'Message',
            type: 'ANNOUNCEMENT',
            link: null,
          },
          {
            userId: 'user-2',
            title: 'Title',
            message: 'Message',
            type: 'ANNOUNCEMENT',
            link: null,
          },
          {
            userId: 'user-3',
            title: 'Title',
            message: 'Message',
            type: 'ANNOUNCEMENT',
            link: null,
          },
        ],
      });
    });

    it('should include optional link if provided', async () => {
      const req = createMockRequest({
        title: 'Title',
        message: 'Message',
        target: 'all',
        link: '/student/drives',
      });
      await POST(req as any);

      expect(prismaMock.notification.createMany).toHaveBeenCalledWith({
        data: expect.arrayContaining([
          expect.objectContaining({ link: '/student/drives' }),
        ]),
      });
    });
  });

  describe('Broadcast to Branch', () => {
    const mockStudents = [
      { userId: 'user-1' },
      { userId: 'user-2' },
    ];

    beforeEach(() => {
      (getServerSession as jest.Mock).mockResolvedValue(mockAdminSession);
      prismaMock.student.findMany.mockResolvedValue(mockStudents as any);
      prismaMock.notification.createMany.mockResolvedValue({ count: 2 });
    });

    it('should broadcast to specific branch', async () => {
      const req = createMockRequest({
        title: 'CSE Department Notice',
        message: 'Important for CSE students',
        target: 'branch',
        targetValue: 'CSE',
      });
      const response = await POST(req as any);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.count).toBe(2);
    });

    it('should query students from specific branch', async () => {
      const req = createMockRequest({
        title: 'Test',
        message: 'Message',
        target: 'branch',
        targetValue: 'IT',
      });
      await POST(req as any);

      expect(prismaMock.student.findMany).toHaveBeenCalledWith({
        where: {
          branch: 'IT',
          user: { isActive: true },
        },
        select: { userId: true },
      });
    });
  });

  describe('Broadcast to Drive Applicants', () => {
    const mockApplications = [
      {
        id: 'app-1',
        student: { userId: 'user-1', user: { isActive: true } },
      },
      {
        id: 'app-2',
        student: { userId: 'user-2', user: { isActive: true } },
      },
      {
        id: 'app-3',
        student: { userId: 'user-3', user: { isActive: false } }, // Inactive user
      },
    ];

    beforeEach(() => {
      (getServerSession as jest.Mock).mockResolvedValue(mockAdminSession);
      prismaMock.application.findMany.mockResolvedValue(mockApplications as any);
      prismaMock.notification.createMany.mockResolvedValue({ count: 2 });
    });

    it('should broadcast to drive applicants', async () => {
      const req = createMockRequest({
        title: 'Microsoft Drive Update',
        message: 'Interview scheduled for tomorrow',
        target: 'drive',
        targetValue: 'drive-1',
      });
      const response = await POST(req as any);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.count).toBe(2); // Only 2 active users
    });

    it('should query applications for specific drive', async () => {
      const req = createMockRequest({
        title: 'Test',
        message: 'Message',
        target: 'drive',
        targetValue: 'drive-123',
      });
      await POST(req as any);

      expect(prismaMock.application.findMany).toHaveBeenCalledWith({
        where: { driveId: 'drive-123' },
        include: {
          student: {
            select: {
              userId: true,
              user: { select: { isActive: true } },
            },
          },
        },
      });
    });

    it('should filter out inactive users', async () => {
      const req = createMockRequest({
        title: 'Test',
        message: 'Message',
        target: 'drive',
        targetValue: 'drive-1',
      });
      await POST(req as any);

      // Should create only 2 notifications (not 3) because 1 user is inactive
      expect(prismaMock.notification.createMany).toHaveBeenCalledWith({
        data: expect.arrayContaining([
          expect.objectContaining({ userId: 'user-1' }),
          expect.objectContaining({ userId: 'user-2' }),
        ]),
      });

      const calls = prismaMock.notification.createMany.mock.calls[0][0];
      expect(calls.data).toHaveLength(2);
    });
  });

  describe('Email Notifications', () => {
    const mockUsers = [
      { id: 'user-1' },
      { id: 'user-2' },
    ];

    const mockUsersWithEmails = [
      { email: 'rahul@test.com', student: { firstName: 'Rahul' } },
      { email: 'priya@test.com', student: { firstName: 'Priya' } },
    ];

    beforeEach(() => {
      (getServerSession as jest.Mock).mockResolvedValue(mockAdminSession);
      prismaMock.user.findMany
        .mockResolvedValueOnce(mockUsers as any)
        .mockResolvedValueOnce(mockUsersWithEmails as any);
      prismaMock.notification.createMany.mockResolvedValue({ count: 2 });
    });

    it('should send emails when sendEmail is true', async () => {
      const req = createMockRequest({
        title: 'Important Notice',
        message: 'Please read this carefully',
        target: 'all',
        sendEmail: true,
      });
      await POST(req as any);

      expect(sendBulkNotificationEmails).toHaveBeenCalledWith({
        recipients: [
          { email: 'rahul@test.com', name: 'Rahul' },
          { email: 'priya@test.com', name: 'Priya' },
        ],
        subject: 'Important Notice',
        message: 'Please read this carefully',
        link: undefined,
      });
    });

    it('should not send emails when sendEmail is false', async () => {
      prismaMock.user.findMany.mockResolvedValue(mockUsers as any);

      const req = createMockRequest({
        title: 'Test',
        message: 'Message',
        target: 'all',
        sendEmail: false,
      });
      await POST(req as any);

      expect(sendBulkNotificationEmails).not.toHaveBeenCalled();
    });

    it('should return email statistics', async () => {
      (sendBulkNotificationEmails as jest.Mock).mockResolvedValue({
        sent: 8,
        failed: 2,
      });

      const req = createMockRequest({
        title: 'Test',
        message: 'Message',
        target: 'all',
        sendEmail: true,
      });
      const response = await POST(req as any);
      const data = await response.json();

      expect(data.emailsSent).toBe(8);
      expect(data.emailsFailed).toBe(2);
    });

    it('should default emailsSent to 0 if sendEmail is false', async () => {
      prismaMock.user.findMany.mockResolvedValue(mockUsers as any);

      const req = createMockRequest({
        title: 'Test',
        message: 'Message',
        target: 'all',
        sendEmail: false,
      });
      const response = await POST(req as any);
      const data = await response.json();

      expect(data.emailsSent).toBe(0);
      expect(data.emailsFailed).toBe(0);
    });
  });

  describe('Edge Cases', () => {
    beforeEach(() => {
      (getServerSession as jest.Mock).mockResolvedValue(mockAdminSession);
    });

    it('should return error if no users match criteria', async () => {
      prismaMock.user.findMany.mockResolvedValue([]);

      const req = createMockRequest({
        title: 'Test',
        message: 'Message',
        target: 'all',
      });
      const response = await POST(req as any);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('No users found matching the target criteria');
    });

    it('should handle empty branch (no students)', async () => {
      prismaMock.student.findMany.mockResolvedValue([]);

      const req = createMockRequest({
        title: 'Test',
        message: 'Message',
        target: 'branch',
        targetValue: 'MECH',
      });
      const response = await POST(req as any);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('No users found matching the target criteria');
    });

    it('should handle drive with no applications', async () => {
      prismaMock.application.findMany.mockResolvedValue([]);

      const req = createMockRequest({
        title: 'Test',
        message: 'Message',
        target: 'drive',
        targetValue: 'drive-999',
      });
      const response = await POST(req as any);
      const data = await response.json();

      expect(response.status).toBe(400);
    });

    it('should use default type ANNOUNCEMENT if not provided', async () => {
      prismaMock.user.findMany.mockResolvedValue([{ id: 'user-1' }] as any);
      prismaMock.notification.createMany.mockResolvedValue({ count: 1 });

      const req = createMockRequest({
        title: 'Test',
        message: 'Message',
        target: 'all',
      });
      await POST(req as any);

      expect(prismaMock.notification.createMany).toHaveBeenCalledWith({
        data: [
          expect.objectContaining({ type: 'ANNOUNCEMENT' }),
        ],
      });
    });
  });

  describe('Real-World Scenarios', () => {
    beforeEach(() => {
      (getServerSession as jest.Mock).mockResolvedValue(mockAdminSession);
    });

    it('Scenario: Announce placement drive to all students', async () => {
      prismaMock.user.findMany
        .mockResolvedValueOnce([{ id: 'u1' }, { id: 'u2' }] as any)
        .mockResolvedValueOnce([
          { email: 's1@test.com', student: { firstName: 'S1' } },
          { email: 's2@test.com', student: { firstName: 'S2' } },
        ] as any);
      prismaMock.notification.createMany.mockResolvedValue({ count: 2 });

      const req = createMockRequest({
        title: 'New Placement Drive - Microsoft',
        message: 'Microsoft is hiring for SDE roles. Register now!',
        target: 'all',
        type: 'DRIVE_ANNOUNCEMENT',
        link: '/student/drives/drive-1',
        sendEmail: true,
      });
      const response = await POST(req as any);

      expect(response.status).toBe(201);
    });

    it('Scenario: Notify CSE students about workshop', async () => {
      prismaMock.student.findMany.mockResolvedValue([{ userId: 'u1' }] as any);
      prismaMock.notification.createMany.mockResolvedValue({ count: 1 });

      const req = createMockRequest({
        title: 'AI/ML Workshop',
        message: 'Exclusive workshop for CSE students this Saturday',
        target: 'branch',
        targetValue: 'CSE',
        link: '/student/events/workshop-1',
      });
      const response = await POST(req as any);

      expect(response.status).toBe(201);
    });

    it('Scenario: Notify Microsoft drive applicants about interview', async () => {
      prismaMock.application.findMany.mockResolvedValue([
        { id: 'app-1', student: { userId: 'u1', user: { isActive: true } } },
        { id: 'app-2', student: { userId: 'u2', user: { isActive: true } } },
      ] as any);
      prismaMock.notification.createMany.mockResolvedValue({ count: 2 });
      prismaMock.user.findMany.mockResolvedValueOnce([
        { email: 's1@test.com', student: { firstName: 'Rahul' } },
        { email: 's2@test.com', student: { firstName: 'Priya' } },
      ] as any);

      const req = createMockRequest({
        title: 'Microsoft Interview Schedule',
        message: 'Your interview is scheduled for tomorrow at 10 AM',
        target: 'drive',
        targetValue: 'drive-1',
        type: 'INTERVIEW_UPDATE',
        sendEmail: true,
      });
      const response = await POST(req as any);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.count).toBe(2);
      expect(sendBulkNotificationEmails).toHaveBeenCalled();
    });
  });
});
