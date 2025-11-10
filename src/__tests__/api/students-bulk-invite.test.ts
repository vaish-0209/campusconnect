/**
 * Unit Tests for Student Bulk Invite API
 * Tests: /api/admin/students/bulk-invite (POST)
 * Critical feature with duplicate detection
 */

import { POST } from '@/app/api/admin/students/bulk-invite/route';
import { prismaMock, mockAdminSession, mockStudentSession, createMockRequest } from '../utils/testUtils';
import { getServerSession } from 'next-auth';

jest.mock('next-auth', () => ({
  getServerSession: jest.fn(),
}));

jest.mock('@/lib/prisma', () => ({
  prisma: require('../utils/testUtils').prismaMock,
}));

describe('POST /api/admin/students/bulk-invite', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Authorization', () => {
    it('should return 401 if user is not authenticated', async () => {
      (getServerSession as jest.Mock).mockResolvedValue(null);

      const req = createMockRequest({
        students: [
          { rollNo: 'CS001', firstName: 'Rahul', lastName: 'Kumar', email: 'rahul@test.com', branch: 'CSE', cgpa: 8.5 }
        ]
      });

      const response = await POST(req as any);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('should return 401 if user is not admin', async () => {
      (getServerSession as jest.Mock).mockResolvedValue(mockStudentSession);

      const req = createMockRequest({
        students: [
          { rollNo: 'CS001', firstName: 'Rahul', lastName: 'Kumar', email: 'rahul@test.com', branch: 'CSE', cgpa: 8.5 }
        ]
      });

      const response = await POST(req as any);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });
  });

  describe('Input Validation', () => {
    it('should return 400 if students array is empty', async () => {
      (getServerSession as jest.Mock).mockResolvedValue(mockAdminSession);

      const req = createMockRequest({ students: [] });

      const response = await POST(req as any);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid data format');
    });

    it('should return 400 if students is not an array', async () => {
      (getServerSession as jest.Mock).mockResolvedValue(mockAdminSession);

      const req = createMockRequest({ students: 'not-an-array' });

      const response = await POST(req as any);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid data format');
    });

    it('should return 400 if students field is missing', async () => {
      (getServerSession as jest.Mock).mockResolvedValue(mockAdminSession);

      const req = createMockRequest({});

      const response = await POST(req as any);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid data format');
    });
  });

  describe('Duplicate Detection', () => {
    it('should detect and skip all duplicate emails', async () => {
      (getServerSession as jest.Mock).mockResolvedValue(mockAdminSession);

      // Mock existing users with these emails
      prismaMock.user.findMany.mockResolvedValue([
        { email: 'rahul@test.com' },
        { email: 'priya@test.com' },
      ] as any);

      prismaMock.student.findMany.mockResolvedValue([]);

      const req = createMockRequest({
        students: [
          { rollNo: 'CS001', firstName: 'Rahul', lastName: 'Kumar', email: 'rahul@test.com', branch: 'CSE', cgpa: 8.5 },
          { rollNo: 'CS002', firstName: 'Priya', lastName: 'Sharma', email: 'priya@test.com', branch: 'CSE', cgpa: 9.0 },
        ]
      });

      const response = await POST(req as any);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.imported).toBe(0);
      expect(data.skipped).toBe(2);
      expect(data.duplicates).toHaveLength(2);
      expect(data.duplicates[0].reason).toBe('Email already exists');
      expect(data.duplicates[0].email).toBe('rahul@test.com');
      expect(data.duplicates[1].email).toBe('priya@test.com');
    });

    it('should detect and skip all duplicate roll numbers', async () => {
      (getServerSession as jest.Mock).mockResolvedValue(mockAdminSession);

      prismaMock.user.findMany.mockResolvedValue([]);

      // Mock existing students with these roll numbers
      prismaMock.student.findMany.mockResolvedValue([
        { rollNo: 'CS001' },
        { rollNo: 'CS002' },
      ] as any);

      const req = createMockRequest({
        students: [
          { rollNo: 'CS001', firstName: 'New', lastName: 'Student1', email: 'new1@test.com', branch: 'CSE', cgpa: 8.5 },
          { rollNo: 'CS002', firstName: 'New', lastName: 'Student2', email: 'new2@test.com', branch: 'CSE', cgpa: 9.0 },
        ]
      });

      const response = await POST(req as any);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.imported).toBe(0);
      expect(data.skipped).toBe(2);
      expect(data.duplicates).toHaveLength(2);
      expect(data.duplicates[0].reason).toBe('Roll number already exists');
      expect(data.duplicates[0].rollNo).toBe('CS001');
    });

    it('should handle mix of duplicates and valid students', async () => {
      (getServerSession as jest.Mock).mockResolvedValue(mockAdminSession);

      // CS001 email exists
      prismaMock.user.findMany.mockResolvedValue([
        { email: 'rahul@test.com' },
      ] as any);

      prismaMock.student.findMany.mockResolvedValue([]);

      // Mock successful creation for valid student
      prismaMock.user.create.mockResolvedValue({
        id: 'new-user-1',
        email: 'priya@test.com',
        role: 'STUDENT',
        student: {
          id: 'new-student-1',
          rollNo: 'CS002',
        },
      } as any);

      const req = createMockRequest({
        students: [
          { rollNo: 'CS001', firstName: 'Rahul', lastName: 'Kumar', email: 'rahul@test.com', branch: 'CSE', cgpa: 8.5 }, // Duplicate
          { rollNo: 'CS002', firstName: 'Priya', lastName: 'Sharma', email: 'priya@test.com', branch: 'CSE', cgpa: 9.0 }, // Valid
        ]
      });

      const response = await POST(req as any);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.imported).toBe(1);
      expect(data.skipped).toBe(1);
      expect(data.duplicates).toHaveLength(1);
      expect(data.duplicates[0].email).toBe('rahul@test.com');
    });

    it('should include row numbers in duplicate information', async () => {
      (getServerSession as jest.Mock).mockResolvedValue(mockAdminSession);

      prismaMock.user.findMany.mockResolvedValue([
        { email: 'student1@test.com' },
      ] as any);

      prismaMock.student.findMany.mockResolvedValue([
        { rollNo: 'CS003' },
      ] as any);

      const req = createMockRequest({
        students: [
          { rollNo: 'CS001', email: 'student1@test.com', firstName: 'Test', lastName: 'One', branch: 'CSE', cgpa: 8.0 }, // Row 1 - Duplicate email
          { rollNo: 'CS002', email: 'valid@test.com', firstName: 'Valid', lastName: 'Student', branch: 'CSE', cgpa: 8.0 },
          { rollNo: 'CS003', email: 'student3@test.com', firstName: 'Test', lastName: 'Three', branch: 'CSE', cgpa: 8.0 }, // Row 3 - Duplicate roll
        ]
      });

      const response = await POST(req as any);
      const data = await response.json();

      expect(data.duplicates[0].row).toBe(1);
      expect(data.duplicates[1].row).toBe(3);
    });
  });

  describe('Field Name Normalization', () => {
    it('should handle camelCase field names', async () => {
      (getServerSession as jest.Mock).mockResolvedValue(mockAdminSession);

      prismaMock.user.findMany.mockResolvedValue([]);
      prismaMock.student.findMany.mockResolvedValue([]);
      prismaMock.user.create.mockResolvedValue({
        id: 'user-1',
        student: { id: 'student-1', rollNo: 'CS001' },
      } as any);

      const req = createMockRequest({
        students: [
          { rollNo: 'CS001', firstName: 'Rahul', lastName: 'Kumar', email: 'rahul@test.com', branch: 'CSE', cgpa: 8.5 }
        ]
      });

      const response = await POST(req as any);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.imported).toBe(1);
      expect(prismaMock.user.create).toHaveBeenCalled();
    });

    it('should handle lowercase field names', async () => {
      (getServerSession as jest.Mock).mockResolvedValue(mockAdminSession);

      prismaMock.user.findMany.mockResolvedValue([]);
      prismaMock.student.findMany.mockResolvedValue([]);
      prismaMock.user.create.mockResolvedValue({
        id: 'user-1',
        student: { id: 'student-1', rollNo: 'CS001' },
      } as any);

      const req = createMockRequest({
        students: [
          { rollno: 'CS001', firstname: 'Rahul', lastname: 'Kumar', email: 'rahul@test.com', branch: 'CSE', cgpa: 8.5 }
        ]
      });

      const response = await POST(req as any);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.imported).toBe(1);
    });

    it('should handle mixed case Email field', async () => {
      (getServerSession as jest.Mock).mockResolvedValue(mockAdminSession);

      prismaMock.user.findMany.mockResolvedValue([
        { email: 'RAHUL@TEST.COM' },
      ] as any);
      prismaMock.student.findMany.mockResolvedValue([]);

      const req = createMockRequest({
        students: [
          { rollNo: 'CS001', firstName: 'Rahul', lastName: 'Kumar', Email: 'RAHUL@TEST.COM', branch: 'CSE', cgpa: 8.5 }
        ]
      });

      const response = await POST(req as any);
      const data = await response.json();

      expect(data.skipped).toBe(1);
      expect(data.duplicates[0].email).toBe('RAHUL@TEST.COM');
    });
  });

  describe('Data Validation', () => {
    it('should fail import if CGPA > 10', async () => {
      (getServerSession as jest.Mock).mockResolvedValue(mockAdminSession);

      prismaMock.user.findMany.mockResolvedValue([]);
      prismaMock.student.findMany.mockResolvedValue([]);

      const req = createMockRequest({
        students: [
          { rollNo: 'CS001', firstName: 'Rahul', lastName: 'Kumar', email: 'rahul@test.com', branch: 'CSE', cgpa: 10.5 }
        ]
      });

      const response = await POST(req as any);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.imported).toBe(0);
      expect(data.failed).toBe(1);
      expect(data.errors).toHaveLength(1);
      expect(data.errors[0].row).toBe(1);
    });

    it('should fail import if CGPA < 0', async () => {
      (getServerSession as jest.Mock).mockResolvedValue(mockAdminSession);

      prismaMock.user.findMany.mockResolvedValue([]);
      prismaMock.student.findMany.mockResolvedValue([]);

      const req = createMockRequest({
        students: [
          { rollNo: 'CS001', firstName: 'Rahul', lastName: 'Kumar', email: 'rahul@test.com', branch: 'CSE', cgpa: -1 }
        ]
      });

      const response = await POST(req as any);
      const data = await response.json();

      expect(data.failed).toBe(1);
      expect(data.errors[0].row).toBe(1);
    });

    it('should fail import if email is invalid', async () => {
      (getServerSession as jest.Mock).mockResolvedValue(mockAdminSession);

      prismaMock.user.findMany.mockResolvedValue([]);
      prismaMock.student.findMany.mockResolvedValue([]);

      const req = createMockRequest({
        students: [
          { rollNo: 'CS001', firstName: 'Rahul', lastName: 'Kumar', email: 'notanemail', branch: 'CSE', cgpa: 8.5 }
        ]
      });

      const response = await POST(req as any);
      const data = await response.json();

      expect(data.failed).toBe(1);
      expect(data.errors[0].row).toBe(1);
    });

    it('should fail import if required fields are missing', async () => {
      (getServerSession as jest.Mock).mockResolvedValue(mockAdminSession);

      prismaMock.user.findMany.mockResolvedValue([]);
      prismaMock.student.findMany.mockResolvedValue([]);

      const req = createMockRequest({
        students: [
          { rollNo: 'CS001', email: 'rahul@test.com', cgpa: 8.5 } // Missing firstName, lastName, branch
        ]
      });

      const response = await POST(req as any);
      const data = await response.json();

      expect(data.failed).toBe(1);
      expect(data.errors[0].row).toBe(1);
    });

    it('should handle backlogs field as optional (defaults to 0)', async () => {
      (getServerSession as jest.Mock).mockResolvedValue(mockAdminSession);

      prismaMock.user.findMany.mockResolvedValue([]);
      prismaMock.student.findMany.mockResolvedValue([]);
      prismaMock.user.create.mockResolvedValue({
        id: 'user-1',
        student: { id: 'student-1', rollNo: 'CS001' },
      } as any);

      const req = createMockRequest({
        students: [
          { rollNo: 'CS001', firstName: 'Rahul', lastName: 'Kumar', email: 'rahul@test.com', branch: 'CSE', cgpa: 8.5 }
          // No backlogs field
        ]
      });

      const response = await POST(req as any);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.imported).toBe(1);
      expect(prismaMock.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            student: expect.objectContaining({
              create: expect.objectContaining({
                backlogs: 0,
              })
            })
          })
        })
      );
    });
  });

  describe('Successful Import', () => {
    it('should successfully import multiple valid students', async () => {
      (getServerSession as jest.Mock).mockResolvedValue(mockAdminSession);

      prismaMock.user.findMany.mockResolvedValue([]);
      prismaMock.student.findMany.mockResolvedValue([]);

      // Mock successful creation for each student
      prismaMock.user.create
        .mockResolvedValueOnce({ id: 'user-1', student: { id: 'student-1' } } as any)
        .mockResolvedValueOnce({ id: 'user-2', student: { id: 'student-2' } } as any)
        .mockResolvedValueOnce({ id: 'user-3', student: { id: 'student-3' } } as any);

      const req = createMockRequest({
        students: [
          { rollNo: 'CS001', firstName: 'Rahul', lastName: 'Kumar', email: 'rahul@test.com', branch: 'CSE', cgpa: 8.5, backlogs: 0 },
          { rollNo: 'CS002', firstName: 'Priya', lastName: 'Sharma', email: 'priya@test.com', branch: 'CSE', cgpa: 9.0, backlogs: 0 },
          { rollNo: 'CS003', firstName: 'Amit', lastName: 'Singh', email: 'amit@test.com', branch: 'IT', cgpa: 7.8, backlogs: 1 },
        ]
      });

      const response = await POST(req as any);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.imported).toBe(3);
      expect(data.failed).toBe(0);
      expect(data.skipped).toBe(0);
      expect(data.invitesSent).toBe(3);
      expect(prismaMock.user.create).toHaveBeenCalledTimes(3);
    });

    it('should generate unique invite tokens for each student', async () => {
      (getServerSession as jest.Mock).mockResolvedValue(mockAdminSession);

      prismaMock.user.findMany.mockResolvedValue([]);
      prismaMock.student.findMany.mockResolvedValue([]);
      prismaMock.user.create.mockResolvedValue({ id: 'user-1', student: { id: 'student-1' } } as any);

      const req = createMockRequest({
        students: [
          { rollNo: 'CS001', firstName: 'Rahul', lastName: 'Kumar', email: 'rahul@test.com', branch: 'CSE', cgpa: 8.5 }
        ]
      });

      await POST(req as any);

      expect(prismaMock.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            inviteToken: expect.any(String),
            inviteSentAt: expect.any(Date),
          })
        })
      );
    });

    it('should set user as inactive initially', async () => {
      (getServerSession as jest.Mock).mockResolvedValue(mockAdminSession);

      prismaMock.user.findMany.mockResolvedValue([]);
      prismaMock.student.findMany.mockResolvedValue([]);
      prismaMock.user.create.mockResolvedValue({ id: 'user-1', student: { id: 'student-1' } } as any);

      const req = createMockRequest({
        students: [
          { rollNo: 'CS001', firstName: 'Rahul', lastName: 'Kumar', email: 'rahul@test.com', branch: 'CSE', cgpa: 8.5 }
        ]
      });

      await POST(req as any);

      expect(prismaMock.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            isActive: false,
            role: 'STUDENT',
          })
        })
      );
    });
  });

  describe('Complex Scenarios', () => {
    it('should handle 100+ students in one batch', async () => {
      (getServerSession as jest.Mock).mockResolvedValue(mockAdminSession);

      prismaMock.user.findMany.mockResolvedValue([]);
      prismaMock.student.findMany.mockResolvedValue([]);

      const students = Array.from({ length: 150 }, (_, i) => ({
        rollNo: `CS${String(i + 1).padStart(3, '0')}`,
        firstName: `Student${i + 1}`,
        lastName: 'Test',
        email: `student${i + 1}@test.com`,
        branch: 'CSE',
        cgpa: 7.0 + (i % 30) / 10,
        backlogs: i % 3,
      }));

      prismaMock.user.create.mockResolvedValue({ id: 'user', student: { id: 'student' } } as any);

      const req = createMockRequest({ students });

      const response = await POST(req as any);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.imported).toBe(150);
      expect(prismaMock.user.create).toHaveBeenCalledTimes(150);
    });

    it('should handle mixed success, failures, and duplicates', async () => {
      (getServerSession as jest.Mock).mockResolvedValue(mockAdminSession);

      // Student 1's email exists
      prismaMock.user.findMany.mockResolvedValue([
        { email: 'existing@test.com' },
      ] as any);

      prismaMock.student.findMany.mockResolvedValue([]);

      // Student 2 succeeds
      prismaMock.user.create.mockResolvedValueOnce({ id: 'user-2', student: { id: 'student-2' } } as any);
      // Student 3 fails (will be tested by invalid data)

      const req = createMockRequest({
        students: [
          { rollNo: 'CS001', firstName: 'Existing', lastName: 'User', email: 'existing@test.com', branch: 'CSE', cgpa: 8.5 }, // Duplicate
          { rollNo: 'CS002', firstName: 'Valid', lastName: 'Student', email: 'valid@test.com', branch: 'CSE', cgpa: 9.0 }, // Valid
          { rollNo: 'CS003', firstName: 'Invalid', lastName: 'Data', email: 'invalid@test.com', branch: 'CSE', cgpa: 11.0 }, // Invalid CGPA
        ]
      });

      const response = await POST(req as any);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.imported).toBe(1); // Only CS002
      expect(data.failed).toBe(1); // CS003 invalid
      expect(data.skipped).toBe(1); // CS001 duplicate
      expect(data.duplicates).toHaveLength(1);
      expect(data.errors).toHaveLength(1);
    });
  });

  describe('Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      (getServerSession as jest.Mock).mockResolvedValue(mockAdminSession);

      prismaMock.user.findMany.mockRejectedValue(new Error('Database connection failed'));

      const req = createMockRequest({
        students: [
          { rollNo: 'CS001', firstName: 'Rahul', lastName: 'Kumar', email: 'rahul@test.com', branch: 'CSE', cgpa: 8.5 }
        ]
      });

      const response = await POST(req as any);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Internal server error');
    });

    it('should continue importing other students if one fails', async () => {
      (getServerSession as jest.Mock).mockResolvedValue(mockAdminSession);

      prismaMock.user.findMany.mockResolvedValue([]);
      prismaMock.student.findMany.mockResolvedValue([]);

      // First student succeeds
      prismaMock.user.create.mockResolvedValueOnce({ id: 'user-1', student: { id: 'student-1' } } as any);
      // Second student fails with database error
      prismaMock.user.create.mockRejectedValueOnce(new Error('Unique constraint failed'));
      // Third student succeeds
      prismaMock.user.create.mockResolvedValueOnce({ id: 'user-3', student: { id: 'student-3' } } as any);

      const req = createMockRequest({
        students: [
          { rollNo: 'CS001', firstName: 'Student', lastName: 'One', email: 'one@test.com', branch: 'CSE', cgpa: 8.5 },
          { rollNo: 'CS002', firstName: 'Student', lastName: 'Two', email: 'two@test.com', branch: 'CSE', cgpa: 8.5 },
          { rollNo: 'CS003', firstName: 'Student', lastName: 'Three', email: 'three@test.com', branch: 'CSE', cgpa: 8.5 },
        ]
      });

      const response = await POST(req as any);
      const data = await response.json();

      expect(data.imported).toBe(2); // CS001 and CS003
      expect(data.failed).toBe(1); // CS002
      expect(data.errors[0].row).toBe(2);
    });
  });
});
