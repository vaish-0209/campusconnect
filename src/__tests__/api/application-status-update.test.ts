/**
 * Unit Tests: Application Status Bulk Update
 * Tests POST endpoint for bulk updating application statuses via CSV
 */

import { POST } from '@/app/api/admin/applications/bulk-update/route';
import { getServerSession } from 'next-auth';
import { prismaMock, mockAdminSession } from '../utils/testUtils';

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
  sendApplicationStatusEmail: jest.fn().mockResolvedValue(true),
}));

const { sendApplicationStatusEmail } = require('@/lib/email');

// Helper to create FormData with CSV file
function createFormDataWithCSV(csvContent: string) {
  // Create a mock file object with text() method
  const mockFile = {
    name: 'updates.csv',
    type: 'text/csv',
    size: csvContent.length,
    text: () => Promise.resolve(csvContent),
    arrayBuffer: () => {
      const buf = new ArrayBuffer(csvContent.length);
      const view = new Uint8Array(buf);
      for (let i = 0; i < csvContent.length; i++) {
        view[i] = csvContent.charCodeAt(i);
      }
      return Promise.resolve(buf);
    },
  };

  // Create a mock FormData that returns our mock file
  const mockFormData = {
    get: (key: string) => (key === 'file' ? mockFile : null),
    has: (key: string) => key === 'file',
    append: () => {},
    delete: () => {},
    entries: () => [['file', mockFile]],
  };

  return {
    formData: () => Promise.resolve(mockFormData),
  };
}

describe('POST /api/admin/applications/bulk-update - Bulk Update Application Status', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Authorization Tests', () => {
    it('should return 401 if user is not authenticated', async () => {
      (getServerSession as jest.Mock).mockResolvedValue(null);

      const req = createFormDataWithCSV('rollNo,status\nCS001,SHORTLISTED');
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

      const req = createFormDataWithCSV('rollNo,status\nCS001,SHORTLISTED');
      const response = await POST(req as any);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });
  });

  describe('File Validation Tests', () => {
    beforeEach(() => {
      (getServerSession as jest.Mock).mockResolvedValue(mockAdminSession);
    });

    it('should return 400 if no file uploaded', async () => {
      const formData = new FormData();
      const req = {
        formData: () => Promise.resolve(formData),
      };

      const response = await POST(req as any);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('No file uploaded');
    });

    it('should return 400 if CSV file is empty', async () => {
      const req = createFormDataWithCSV('');
      const response = await POST(req as any);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Empty CSV file');
    });

    it('should return 400 if CSV missing rollNo column', async () => {
      const req = createFormDataWithCSV('status\nSHORTLISTED');
      const response = await POST(req as any);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("CSV must contain 'rollNo' and 'status' columns");
    });

    it('should return 400 if CSV missing status column', async () => {
      const req = createFormDataWithCSV('rollNo\nCS001');
      const response = await POST(req as any);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("CSV must contain 'rollNo' and 'status' columns");
    });
  });

  describe('Status Validation Tests', () => {
    beforeEach(() => {
      (getServerSession as jest.Mock).mockResolvedValue(mockAdminSession);
    });

    it('should reject invalid status', async () => {
      const req = createFormDataWithCSV('rollNo,status\nCS001,INVALID_STATUS');
      const response = await POST(req as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(0);
      expect(data.failed).toBe(1);
      expect(data.errors[0]).toContain("Invalid status 'INVALID_STATUS'");
    });

    it('should accept APPLIED status', async () => {
      const mockStudent = {
        id: 'student-1',
        rollNo: 'CS001',
        firstName: 'Rahul',
        lastName: 'Kumar',
        userId: 'user-1',
        user: { email: 'rahul@test.com' },
      };

      const mockApplication = {
        id: 'app-1',
        studentId: 'student-1',
        status: 'APPLIED',
        drive: {
          company: { name: 'Microsoft' },
          role: 'SDE',
        },
      };

      prismaMock.student.findUnique.mockResolvedValue(mockStudent as any);
      prismaMock.application.findFirst.mockResolvedValue(mockApplication as any);
      prismaMock.application.update.mockResolvedValue(mockApplication as any);
      prismaMock.notification.create.mockResolvedValue({} as any);

      const req = createFormDataWithCSV('rollNo,status\nCS001,APPLIED');
      const response = await POST(req as any);
      const data = await response.json();

      expect(data.success).toBe(1);
    });

    it('should accept SHORTLISTED status', async () => {
      const mockStudent = {
        id: 'student-1',
        rollNo: 'CS001',
        firstName: 'Rahul',
        lastName: 'Kumar',
        userId: 'user-1',
        user: { email: 'rahul@test.com' },
      };

      const mockApplication = {
        id: 'app-1',
        studentId: 'student-1',
        status: 'APPLIED',
        drive: {
          company: { name: 'Microsoft' },
          role: 'SDE',
        },
      };

      prismaMock.student.findUnique.mockResolvedValue(mockStudent as any);
      prismaMock.application.findFirst.mockResolvedValue(mockApplication as any);
      prismaMock.application.update.mockResolvedValue(mockApplication as any);
      prismaMock.notification.create.mockResolvedValue({} as any);

      const req = createFormDataWithCSV('rollNo,status\nCS001,SHORTLISTED');
      const response = await POST(req as any);
      const data = await response.json();

      expect(data.success).toBe(1);
    });

    it('should accept all valid statuses', async () => {
      const validStatuses = [
        'APPLIED',
        'SHORTLISTED',
        'TEST_CLEARED',
        'INTERVIEW_CLEARED',
        'OFFER',
        'REJECTED',
      ];

      for (const status of validStatuses) {
        const mockStudent = {
          id: 'student-1',
          rollNo: 'CS001',
          firstName: 'Rahul',
          lastName: 'Kumar',
          userId: 'user-1',
          user: { email: 'rahul@test.com' },
        };

        const mockApplication = {
          id: 'app-1',
          studentId: 'student-1',
          status: 'APPLIED',
          drive: {
            company: { name: 'Microsoft' },
            role: 'SDE',
          },
        };

        prismaMock.student.findUnique.mockResolvedValue(mockStudent as any);
        prismaMock.application.findFirst.mockResolvedValue(mockApplication as any);
        prismaMock.application.update.mockResolvedValue(mockApplication as any);
        prismaMock.notification.create.mockResolvedValue({} as any);

        const req = createFormDataWithCSV(`rollNo,status\nCS001,${status}`);
        const response = await POST(req as any);
        const data = await response.json();

        expect(data.success).toBe(1);
      }
    });
  });

  describe('Student Validation Tests', () => {
    beforeEach(() => {
      (getServerSession as jest.Mock).mockResolvedValue(mockAdminSession);
    });

    it('should return error if student not found', async () => {
      prismaMock.student.findUnique.mockResolvedValue(null);

      const req = createFormDataWithCSV('rollNo,status\nCS999,SHORTLISTED');
      const response = await POST(req as any);
      const data = await response.json();

      expect(data.success).toBe(0);
      expect(data.failed).toBe(1);
      expect(data.errors[0]).toContain("Student with roll number 'CS999' not found");
    });

    it('should return error if student has no applications', async () => {
      const mockStudent = {
        id: 'student-1',
        rollNo: 'CS001',
        userId: 'user-1',
        user: { email: 'rahul@test.com' },
      };

      prismaMock.student.findUnique.mockResolvedValue(mockStudent as any);
      prismaMock.application.findFirst.mockResolvedValue(null);

      const req = createFormDataWithCSV('rollNo,status\nCS001,SHORTLISTED');
      const response = await POST(req as any);
      const data = await response.json();

      expect(data.success).toBe(0);
      expect(data.failed).toBe(1);
      expect(data.errors[0]).toContain("No applications found for student 'CS001'");
    });
  });

  describe('Successful Status Update', () => {
    const mockStudent = {
      id: 'student-1',
      rollNo: 'CS001',
      firstName: 'Rahul',
      lastName: 'Kumar',
      userId: 'user-1',
      user: { email: 'rahul@test.com' },
    };

    const mockApplication = {
      id: 'app-1',
      studentId: 'student-1',
      status: 'APPLIED',
      drive: {
        id: 'drive-1',
        company: { id: 'company-1', name: 'Microsoft' },
        role: 'Software Engineer',
      },
    };

    beforeEach(() => {
      (getServerSession as jest.Mock).mockResolvedValue(mockAdminSession);
      prismaMock.student.findUnique.mockResolvedValue(mockStudent as any);
      prismaMock.application.findFirst.mockResolvedValue(mockApplication as any);
      prismaMock.application.update.mockResolvedValue(mockApplication as any);
      prismaMock.notification.create.mockResolvedValue({} as any);
    });

    it('should update application status', async () => {
      const req = createFormDataWithCSV('rollNo,status\nCS001,SHORTLISTED');
      const response = await POST(req as any);
      const data = await response.json();

      expect(data.success).toBe(1);
      expect(data.failed).toBe(0);
      expect(prismaMock.application.update).toHaveBeenCalledWith({
        where: { id: 'app-1' },
        data: {
          status: 'SHORTLISTED',
        },
      });
    });

    it('should update status with remarks', async () => {
      const req = createFormDataWithCSV(
        'rollNo,status,remarks\nCS001,REJECTED,Not a good fit'
      );
      const response = await POST(req as any);
      const data = await response.json();

      expect(data.success).toBe(1);
      expect(prismaMock.application.update).toHaveBeenCalledWith({
        where: { id: 'app-1' },
        data: {
          status: 'REJECTED',
          remarks: 'Not a good fit',
        },
      });
    });

    it('should create notification for student', async () => {
      const req = createFormDataWithCSV('rollNo,status\nCS001,OFFER');
      await POST(req as any);

      expect(prismaMock.notification.create).toHaveBeenCalledWith({
        data: {
          userId: 'user-1',
          title: 'Application Status Updated',
          message: expect.stringContaining('Microsoft'),
          type: 'APPLICATION_UPDATE',
          link: '/student/applications',
        },
      });
    });

    it('should send email notification', async () => {
      const req = createFormDataWithCSV('rollNo,status\nCS001,OFFER');
      await POST(req as any);

      expect(sendApplicationStatusEmail).toHaveBeenCalledWith({
        to: 'rahul@test.com',
        studentName: 'Rahul Kumar',
        companyName: 'Microsoft',
        role: 'Software Engineer',
        status: 'OFFER',
        remarks: undefined,
      });
    });

    it('should include remarks in notification message', async () => {
      const req = createFormDataWithCSV(
        'rollNo,status,remarks\nCS001,SHORTLISTED,Great technical skills'
      );
      await POST(req as any);

      expect(prismaMock.notification.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          message: expect.stringContaining('Remarks: Great technical skills'),
        }),
      });
    });

    it('should include remarks in email', async () => {
      const req = createFormDataWithCSV(
        'rollNo,status,remarks\nCS001,OFFER,Excellent performance'
      );
      await POST(req as any);

      expect(sendApplicationStatusEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          remarks: 'Excellent performance',
        })
      );
    });
  });

  describe('Bulk Update Tests', () => {
    beforeEach(() => {
      (getServerSession as jest.Mock).mockResolvedValue(mockAdminSession);
    });

    it('should process multiple students successfully', async () => {
      const student1 = {
        id: 'student-1',
        rollNo: 'CS001',
        firstName: 'Rahul',
        lastName: 'Kumar',
        userId: 'user-1',
        user: { email: 'rahul@test.com' },
      };

      const student2 = {
        id: 'student-2',
        rollNo: 'CS002',
        firstName: 'Priya',
        lastName: 'Sharma',
        userId: 'user-2',
        user: { email: 'priya@test.com' },
      };

      const app1 = {
        id: 'app-1',
        studentId: 'student-1',
        drive: { company: { name: 'Microsoft' }, role: 'SDE' },
      };

      const app2 = {
        id: 'app-2',
        studentId: 'student-2',
        drive: { company: { name: 'Google' }, role: 'SDE' },
      };

      prismaMock.student.findUnique
        .mockResolvedValueOnce(student1 as any)
        .mockResolvedValueOnce(student2 as any);
      prismaMock.application.findFirst
        .mockResolvedValueOnce(app1 as any)
        .mockResolvedValueOnce(app2 as any);
      prismaMock.application.update.mockResolvedValue({} as any);
      prismaMock.notification.create.mockResolvedValue({} as any);

      const csv = `rollNo,status
CS001,SHORTLISTED
CS002,OFFER`;

      const req = createFormDataWithCSV(csv);
      const response = await POST(req as any);
      const data = await response.json();

      expect(data.success).toBe(2);
      expect(data.failed).toBe(0);
    });

    it('should handle mix of success and failures', async () => {
      const student1 = {
        id: 'student-1',
        rollNo: 'CS001',
        firstName: 'Rahul',
        lastName: 'Kumar',
        userId: 'user-1',
        user: { email: 'rahul@test.com' },
      };

      const app1 = {
        id: 'app-1',
        studentId: 'student-1',
        drive: { company: { name: 'Microsoft' }, role: 'SDE' },
      };

      prismaMock.student.findUnique
        .mockResolvedValueOnce(student1 as any)
        .mockResolvedValueOnce(null); // Second student not found
      prismaMock.application.findFirst.mockResolvedValue(app1 as any);
      prismaMock.application.update.mockResolvedValue({} as any);
      prismaMock.notification.create.mockResolvedValue({} as any);

      const csv = `rollNo,status
CS001,SHORTLISTED
CS999,OFFER`;

      const req = createFormDataWithCSV(csv);
      const response = await POST(req as any);
      const data = await response.json();

      expect(data.success).toBe(1);
      expect(data.failed).toBe(1);
      expect(data.errors).toHaveLength(1);
    });

    it('should skip empty lines in CSV', async () => {
      const student1 = {
        id: 'student-1',
        rollNo: 'CS001',
        firstName: 'Rahul',
        lastName: 'Kumar',
        userId: 'user-1',
        user: { email: 'rahul@test.com' },
      };

      const app1 = {
        id: 'app-1',
        studentId: 'student-1',
        drive: { company: { name: 'Microsoft' }, role: 'SDE' },
      };

      prismaMock.student.findUnique.mockResolvedValue(student1 as any);
      prismaMock.application.findFirst.mockResolvedValue(app1 as any);
      prismaMock.application.update.mockResolvedValue({} as any);
      prismaMock.notification.create.mockResolvedValue({} as any);

      const csv = `rollNo,status
CS001,SHORTLISTED

`;

      const req = createFormDataWithCSV(csv);
      const response = await POST(req as any);
      const data = await response.json();

      expect(data.success).toBe(1);
    });
  });

  describe('Real-World Scenarios', () => {
    beforeEach(() => {
      (getServerSession as jest.Mock).mockResolvedValue(mockAdminSession);
    });

    it('Scenario: Shortlist 50 students after resume screening', async () => {
      const mockStudent = {
        id: 'student-1',
        rollNo: 'CS001',
        firstName: 'Student',
        lastName: 'Name',
        userId: 'user-1',
        user: { email: 'student@test.com' },
      };

      const mockApp = {
        id: 'app-1',
        studentId: 'student-1',
        drive: { company: { name: 'Microsoft' }, role: 'SDE' },
      };

      prismaMock.student.findUnique.mockResolvedValue(mockStudent as any);
      prismaMock.application.findFirst.mockResolvedValue(mockApp as any);
      prismaMock.application.update.mockResolvedValue({} as any);
      prismaMock.notification.create.mockResolvedValue({} as any);

      const csv = Array.from(
        { length: 50 },
        (_, i) => `CS${String(i + 1).padStart(3, '0')},SHORTLISTED`
      ).join('\n');

      const req = createFormDataWithCSV(`rollNo,status\n${csv}`);
      const response = await POST(req as any);
      const data = await response.json();

      expect(data.success).toBe(50);
    });

    it('Scenario: Mark 10 students as rejected after interview', async () => {
      const mockStudent = {
        id: 'student-1',
        rollNo: 'CS001',
        firstName: 'Student',
        lastName: 'Name',
        userId: 'user-1',
        user: { email: 'student@test.com' },
      };

      const mockApp = {
        id: 'app-1',
        studentId: 'student-1',
        drive: { company: { name: 'Microsoft' }, role: 'SDE' },
      };

      prismaMock.student.findUnique.mockResolvedValue(mockStudent as any);
      prismaMock.application.findFirst.mockResolvedValue(mockApp as any);
      prismaMock.application.update.mockResolvedValue({} as any);
      prismaMock.notification.create.mockResolvedValue({} as any);

      const csv = `rollNo,status,remarks
CS001,REJECTED,Not a cultural fit
CS002,REJECTED,Weak technical skills`;

      const req = createFormDataWithCSV(csv);
      const response = await POST(req as any);
      const data = await response.json();

      expect(data.success).toBe(2);
      expect(prismaMock.application.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: 'REJECTED',
            remarks: expect.any(String),
          }),
        })
      );
    });
  });

  describe('Error Handling', () => {
    beforeEach(() => {
      (getServerSession as jest.Mock).mockResolvedValue(mockAdminSession);
    });

    it('should continue processing if email fails', async () => {
      const mockStudent = {
        id: 'student-1',
        rollNo: 'CS001',
        firstName: 'Rahul',
        lastName: 'Kumar',
        userId: 'user-1',
        user: { email: 'rahul@test.com' },
      };

      const mockApp = {
        id: 'app-1',
        studentId: 'student-1',
        drive: { company: { name: 'Microsoft' }, role: 'SDE' },
      };

      prismaMock.student.findUnique.mockResolvedValue(mockStudent as any);
      prismaMock.application.findFirst.mockResolvedValue(mockApp as any);
      prismaMock.application.update.mockResolvedValue({} as any);
      prismaMock.notification.create.mockResolvedValue({} as any);
      (sendApplicationStatusEmail as jest.Mock).mockRejectedValue(
        new Error('Email service down')
      );

      const req = createFormDataWithCSV('rollNo,status\nCS001,OFFER');
      const response = await POST(req as any);
      const data = await response.json();

      expect(data.success).toBe(1); // Should still count as success
    });
  });
});
