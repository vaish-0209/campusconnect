/**
 * Unit Tests for Student API Routes
 * Tests: /api/admin/students/add
 */

import { POST } from '@/app/api/admin/students/add/route';
import { prismaMock, mockAdminSession, mockStudentSession, createMockRequest } from '../utils/testUtils';
import { getServerSession } from 'next-auth';

// Mock next-auth
jest.mock('next-auth', () => ({
  getServerSession: jest.fn(),
}));

// Mock prisma
jest.mock('@/lib/prisma', () => ({
  prisma: require('../utils/testUtils').prismaMock,
}));

describe('POST /api/admin/students/add', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 401 if user is not authenticated', async () => {
    (getServerSession as jest.Mock).mockResolvedValue(null);

    const req = createMockRequest({
      rollNo: 'CS001',
      firstName: 'Rahul',
      lastName: 'Kumar',
      email: 'rahul@test.com',
      branch: 'CSE',
      cgpa: 8.5,
      backlogs: 0,
    });

    const response = await POST(req as any);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Unauthorized');
  });

  it('should return 401 if user is not admin', async () => {
    (getServerSession as jest.Mock).mockResolvedValue(mockStudentSession);

    const req = createMockRequest({
      rollNo: 'CS001',
      firstName: 'Rahul',
      lastName: 'Kumar',
      email: 'rahul@test.com',
      branch: 'CSE',
      cgpa: 8.5,
      backlogs: 0,
    });

    const response = await POST(req as any);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Unauthorized');
  });

  it('should return 409 if email already exists', async () => {
    (getServerSession as jest.Mock).mockResolvedValue(mockAdminSession);

    prismaMock.user.findUnique.mockResolvedValue({
      id: 'existing-user',
      email: 'rahul@test.com',
      password: 'hashed',
      role: 'STUDENT',
      isActive: true,
      inviteToken: null,
      inviteSentAt: null,
      resetToken: null,
      resetTokenExpiry: null,
      lastLoginAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const req = createMockRequest({
      rollNo: 'CS001',
      firstName: 'Rahul',
      lastName: 'Kumar',
      email: 'rahul@test.com',
      branch: 'CSE',
      cgpa: 8.5,
      backlogs: 0,
    });

    const response = await POST(req as any);
    const data = await response.json();

    expect(response.status).toBe(409);
    expect(data.error).toBe('A user with this email already exists');
  });

  it('should return 409 if roll number already exists', async () => {
    (getServerSession as jest.Mock).mockResolvedValue(mockAdminSession);

    prismaMock.user.findUnique.mockResolvedValue(null);
    prismaMock.student.findUnique.mockResolvedValue({
      id: 'existing-student',
      userId: 'user-1',
      rollNo: 'CS001',
      firstName: 'Existing',
      lastName: 'Student',
      branch: 'CSE',
      cgpa: 8.0,
      backlogs: 0,
      phone: null,
      profilePhoto: null,
      profileImage: null,
      resume: null,
      skills: null,
      github: null,
      linkedin: null,
      portfolio: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const req = createMockRequest({
      rollNo: 'CS001',
      firstName: 'Rahul',
      lastName: 'Kumar',
      email: 'rahul@test.com',
      branch: 'CSE',
      cgpa: 8.5,
      backlogs: 0,
    });

    const response = await POST(req as any);
    const data = await response.json();

    expect(response.status).toBe(409);
    expect(data.error).toBe('A student with this roll number already exists');
  });

  it('should successfully create student with valid data', async () => {
    (getServerSession as jest.Mock).mockResolvedValue(mockAdminSession);

    prismaMock.user.findUnique.mockResolvedValue(null);
    prismaMock.student.findUnique.mockResolvedValue(null);
    prismaMock.user.create.mockResolvedValue({
      id: 'new-user-id',
      email: 'rahul@test.com',
      password: null,
      role: 'STUDENT',
      isActive: false,
      inviteToken: 'token123',
      inviteSentAt: new Date(),
      resetToken: null,
      resetTokenExpiry: null,
      lastLoginAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      student: {
        id: 'new-student-id',
        userId: 'new-user-id',
        rollNo: 'CS001',
        firstName: 'Rahul',
        lastName: 'Kumar',
        branch: 'CSE',
        cgpa: 8.5,
        backlogs: 0,
        phone: '9876543210',
        profilePhoto: null,
        profileImage: null,
        resume: null,
        skills: null,
        github: null,
        linkedin: null,
        portfolio: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    } as any);

    const req = createMockRequest({
      rollNo: 'CS001',
      firstName: 'Rahul',
      lastName: 'Kumar',
      email: 'rahul@test.com',
      branch: 'CSE',
      cgpa: 8.5,
      backlogs: 0,
      phone: '9876543210',
    });

    const response = await POST(req as any);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.success).toBe(true);
    expect(data.message).toBe('Student added successfully');
    expect(data.student.rollNo).toBe('CS001');
  });

  it('should return 400 if CGPA is invalid', async () => {
    (getServerSession as jest.Mock).mockResolvedValue(mockAdminSession);

    const req = createMockRequest({
      rollNo: 'CS001',
      firstName: 'Rahul',
      lastName: 'Kumar',
      email: 'rahul@test.com',
      branch: 'CSE',
      cgpa: 10.5, // Invalid: > 10
      backlogs: 0,
    });

    const response = await POST(req as any);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBeDefined();
  });

  it('should return 400 if backlogs is negative', async () => {
    (getServerSession as jest.Mock).mockResolvedValue(mockAdminSession);

    const req = createMockRequest({
      rollNo: 'CS001',
      firstName: 'Rahul',
      lastName: 'Kumar',
      email: 'rahul@test.com',
      branch: 'CSE',
      cgpa: 8.5,
      backlogs: -1, // Invalid: negative
    });

    const response = await POST(req as any);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBeDefined();
  });

  it('should return 400 if email is invalid', async () => {
    (getServerSession as jest.Mock).mockResolvedValue(mockAdminSession);

    const req = createMockRequest({
      rollNo: 'CS001',
      firstName: 'Rahul',
      lastName: 'Kumar',
      email: 'notanemail', // Invalid email
      branch: 'CSE',
      cgpa: 8.5,
      backlogs: 0,
    });

    const response = await POST(req as any);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBeDefined();
  });

  it('should return 400 if required fields are missing', async () => {
    (getServerSession as jest.Mock).mockResolvedValue(mockAdminSession);

    const req = createMockRequest({
      rollNo: 'CS001',
      // Missing firstName, lastName, email, branch, cgpa
      backlogs: 0,
    });

    const response = await POST(req as any);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBeDefined();
  });
});
