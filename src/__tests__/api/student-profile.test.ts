/**
 * Unit Tests: Student Profile Management
 * Tests GET and PATCH endpoints for student profile
 */

import { GET, PATCH } from '@/app/api/student/profile/route';
import { getServerSession } from 'next-auth';
import { prismaMock, mockStudentSession, createMockRequest } from '../utils/testUtils';

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

describe('GET /api/student/profile - Get Student Profile', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Authorization Tests', () => {
    it('should return 401 if user is not authenticated', async () => {
      (getServerSession as jest.Mock).mockResolvedValue(null);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('should return 401 if user is not a student', async () => {
      (getServerSession as jest.Mock).mockResolvedValue({
        user: { id: 'admin-1', role: 'ADMIN', email: 'admin@test.com' },
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      });

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('should return 404 if student profile not found', async () => {
      (getServerSession as jest.Mock).mockResolvedValue(mockStudentSession);
      prismaMock.student.findUnique.mockResolvedValue(null);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Student not found');
    });
  });

  describe('Successful Profile Retrieval', () => {
    const mockStudent = {
      id: 'student-1',
      userId: 'student-123',
      rollNo: 'CS001',
      firstName: 'Rahul',
      lastName: 'Kumar',
      branch: 'Computer Science',
      cgpa: 8.5,
      backlogs: 0,
      phone: '9876543210',
      profileImage: 'https://cloudinary.com/profile.jpg',
      resume: 'https://cloudinary.com/resume.pdf',
      skills: 'React, Node.js, TypeScript',
      github: 'https://github.com/rahul',
      linkedin: 'https://linkedin.com/in/rahul',
      portfolio: 'https://rahul.dev',
      createdAt: new Date(),
      updatedAt: new Date(),
      user: {
        email: 'rahul@test.com',
      },
    };

    it('should return student profile with email', async () => {
      (getServerSession as jest.Mock).mockResolvedValue(mockStudentSession);
      prismaMock.student.findUnique.mockResolvedValue(mockStudent as any);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.student).toBeDefined();
      expect(data.student.rollNo).toBe('CS001');
      expect(data.student.firstName).toBe('Rahul');
      expect(data.student.email).toBe('rahul@test.com');
    });

    it('should include all profile fields', async () => {
      (getServerSession as jest.Mock).mockResolvedValue(mockStudentSession);
      prismaMock.student.findUnique.mockResolvedValue(mockStudent as any);

      const response = await GET();
      const data = await response.json();

      expect(data.student.phone).toBe('9876543210');
      expect(data.student.skills).toBe('React, Node.js, TypeScript');
      expect(data.student.github).toBe('https://github.com/rahul');
      expect(data.student.linkedin).toBe('https://linkedin.com/in/rahul');
      expect(data.student.portfolio).toBe('https://rahul.dev');
      expect(data.student.profileImage).toBe('https://cloudinary.com/profile.jpg');
      expect(data.student.resume).toBe('https://cloudinary.com/resume.pdf');
    });

    it('should query with correct userId from session', async () => {
      (getServerSession as jest.Mock).mockResolvedValue(mockStudentSession);
      prismaMock.student.findUnique.mockResolvedValue(mockStudent as any);

      await GET();

      expect(prismaMock.student.findUnique).toHaveBeenCalledWith({
        where: { userId: 'student-123' },
        include: {
          user: {
            select: {
              email: true,
            },
          },
        },
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle student with null optional fields', async () => {
      const minimalStudent = {
        id: 'student-1',
        userId: 'student-123',
        rollNo: 'CS002',
        firstName: 'Priya',
        lastName: 'Sharma',
        branch: 'IT',
        cgpa: 7.0,
        backlogs: 1,
        phone: null,
        profileImage: null,
        resume: null,
        skills: null,
        github: null,
        linkedin: null,
        portfolio: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        user: {
          email: 'priya@test.com',
        },
      };

      (getServerSession as jest.Mock).mockResolvedValue(mockStudentSession);
      prismaMock.student.findUnique.mockResolvedValue(minimalStudent as any);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.student.phone).toBeNull();
      expect(data.student.skills).toBeNull();
    });
  });
});

describe('PATCH /api/student/profile - Update Student Profile', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockStudent = {
    id: 'student-1',
    userId: 'student-123',
    rollNo: 'CS001',
    firstName: 'Rahul',
    lastName: 'Kumar',
    branch: 'Computer Science',
    cgpa: 8.5,
    backlogs: 0,
    phone: '9876543210',
    profileImage: null,
    resume: null,
    skills: null,
    github: null,
    linkedin: null,
    portfolio: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  describe('Authorization Tests', () => {
    it('should return 401 if user is not authenticated', async () => {
      (getServerSession as jest.Mock).mockResolvedValue(null);

      const req = createMockRequest({ phone: '1234567890' });
      const response = await PATCH(req as any);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('should return 401 if user is not a student', async () => {
      (getServerSession as jest.Mock).mockResolvedValue({
        user: { id: 'admin-1', role: 'ADMIN', email: 'admin@test.com' },
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      });

      const req = createMockRequest({ phone: '1234567890' });
      const response = await PATCH(req as any);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('should return 404 if student profile not found', async () => {
      (getServerSession as jest.Mock).mockResolvedValue(mockStudentSession);
      prismaMock.student.findUnique.mockResolvedValue(null);

      const req = createMockRequest({ phone: '1234567890' });
      const response = await PATCH(req as any);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Student not found');
    });
  });

  describe('Single Field Updates', () => {
    it('should update phone number', async () => {
      (getServerSession as jest.Mock).mockResolvedValue(mockStudentSession);
      prismaMock.student.findUnique.mockResolvedValue(mockStudent as any);
      prismaMock.student.update.mockResolvedValue({
        ...mockStudent,
        phone: '9999999999',
      } as any);

      const req = createMockRequest({ phone: '9999999999' });
      const response = await PATCH(req as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(prismaMock.student.update).toHaveBeenCalledWith({
        where: { id: 'student-1' },
        data: { phone: '9999999999' },
      });
    });

    it('should update skills', async () => {
      (getServerSession as jest.Mock).mockResolvedValue(mockStudentSession);
      prismaMock.student.findUnique.mockResolvedValue(mockStudent as any);
      prismaMock.student.update.mockResolvedValue({
        ...mockStudent,
        skills: 'React, Node.js, MongoDB',
      } as any);

      const req = createMockRequest({ skills: 'React, Node.js, MongoDB' });
      const response = await PATCH(req as any);

      expect(response.status).toBe(200);
      expect(prismaMock.student.update).toHaveBeenCalledWith({
        where: { id: 'student-1' },
        data: { skills: 'React, Node.js, MongoDB' },
      });
    });

    it('should update GitHub URL', async () => {
      (getServerSession as jest.Mock).mockResolvedValue(mockStudentSession);
      prismaMock.student.findUnique.mockResolvedValue(mockStudent as any);
      prismaMock.student.update.mockResolvedValue({
        ...mockStudent,
        github: 'https://github.com/rahul',
      } as any);

      const req = createMockRequest({ github: 'https://github.com/rahul' });
      await PATCH(req as any);

      expect(prismaMock.student.update).toHaveBeenCalledWith({
        where: { id: 'student-1' },
        data: { github: 'https://github.com/rahul' },
      });
    });

    it('should update LinkedIn URL', async () => {
      (getServerSession as jest.Mock).mockResolvedValue(mockStudentSession);
      prismaMock.student.findUnique.mockResolvedValue(mockStudent as any);
      prismaMock.student.update.mockResolvedValue(mockStudent as any);

      const req = createMockRequest({ linkedin: 'https://linkedin.com/in/rahul' });
      await PATCH(req as any);

      expect(prismaMock.student.update).toHaveBeenCalledWith({
        where: { id: 'student-1' },
        data: { linkedin: 'https://linkedin.com/in/rahul' },
      });
    });

    it('should update portfolio URL', async () => {
      (getServerSession as jest.Mock).mockResolvedValue(mockStudentSession);
      prismaMock.student.findUnique.mockResolvedValue(mockStudent as any);
      prismaMock.student.update.mockResolvedValue(mockStudent as any);

      const req = createMockRequest({ portfolio: 'https://rahul.dev' });
      await PATCH(req as any);

      expect(prismaMock.student.update).toHaveBeenCalledWith({
        where: { id: 'student-1' },
        data: { portfolio: 'https://rahul.dev' },
      });
    });

    it('should update profile image', async () => {
      (getServerSession as jest.Mock).mockResolvedValue(mockStudentSession);
      prismaMock.student.findUnique.mockResolvedValue(mockStudent as any);
      prismaMock.student.update.mockResolvedValue(mockStudent as any);

      const req = createMockRequest({
        profileImage: 'https://cloudinary.com/profile.jpg',
      });
      await PATCH(req as any);

      expect(prismaMock.student.update).toHaveBeenCalledWith({
        where: { id: 'student-1' },
        data: { profileImage: 'https://cloudinary.com/profile.jpg' },
      });
    });

    it('should update resume', async () => {
      (getServerSession as jest.Mock).mockResolvedValue(mockStudentSession);
      prismaMock.student.findUnique.mockResolvedValue(mockStudent as any);
      prismaMock.student.update.mockResolvedValue(mockStudent as any);

      const req = createMockRequest({
        resume: 'https://cloudinary.com/resume.pdf',
      });
      await PATCH(req as any);

      expect(prismaMock.student.update).toHaveBeenCalledWith({
        where: { id: 'student-1' },
        data: { resume: 'https://cloudinary.com/resume.pdf' },
      });
    });
  });

  describe('Multiple Field Updates', () => {
    it('should update multiple fields at once', async () => {
      (getServerSession as jest.Mock).mockResolvedValue(mockStudentSession);
      prismaMock.student.findUnique.mockResolvedValue(mockStudent as any);
      prismaMock.student.update.mockResolvedValue(mockStudent as any);

      const req = createMockRequest({
        phone: '9999999999',
        skills: 'React, Node.js, TypeScript',
        github: 'https://github.com/rahul',
        linkedin: 'https://linkedin.com/in/rahul',
        portfolio: 'https://rahul.dev',
      });
      const response = await PATCH(req as any);

      expect(response.status).toBe(200);
      expect(prismaMock.student.update).toHaveBeenCalledWith({
        where: { id: 'student-1' },
        data: {
          phone: '9999999999',
          skills: 'React, Node.js, TypeScript',
          github: 'https://github.com/rahul',
          linkedin: 'https://linkedin.com/in/rahul',
          portfolio: 'https://rahul.dev',
        },
      });
    });

    it('should update all editable fields', async () => {
      (getServerSession as jest.Mock).mockResolvedValue(mockStudentSession);
      prismaMock.student.findUnique.mockResolvedValue(mockStudent as any);
      prismaMock.student.update.mockResolvedValue(mockStudent as any);

      const req = createMockRequest({
        phone: '9999999999',
        skills: 'React, TypeScript, Python',
        github: 'https://github.com/rahul',
        linkedin: 'https://linkedin.com/in/rahul',
        portfolio: 'https://rahul.dev',
        profileImage: 'https://cloudinary.com/profile.jpg',
        resume: 'https://cloudinary.com/resume.pdf',
      });
      await PATCH(req as any);

      expect(prismaMock.student.update).toHaveBeenCalledWith({
        where: { id: 'student-1' },
        data: {
          phone: '9999999999',
          skills: 'React, TypeScript, Python',
          github: 'https://github.com/rahul',
          linkedin: 'https://linkedin.com/in/rahul',
          portfolio: 'https://rahul.dev',
          profileImage: 'https://cloudinary.com/profile.jpg',
          resume: 'https://cloudinary.com/resume.pdf',
        },
      });
    });
  });

  describe('Clearing Fields', () => {
    it('should allow clearing optional fields with null', async () => {
      (getServerSession as jest.Mock).mockResolvedValue(mockStudentSession);
      prismaMock.student.findUnique.mockResolvedValue({
        ...mockStudent,
        github: 'https://github.com/old',
      } as any);
      prismaMock.student.update.mockResolvedValue(mockStudent as any);

      const req = createMockRequest({ github: null });
      await PATCH(req as any);

      expect(prismaMock.student.update).toHaveBeenCalledWith({
        where: { id: 'student-1' },
        data: { github: null },
      });
    });

    it('should allow clearing skills', async () => {
      (getServerSession as jest.Mock).mockResolvedValue(mockStudentSession);
      prismaMock.student.findUnique.mockResolvedValue({
        ...mockStudent,
        skills: 'React, Node.js',
      } as any);
      prismaMock.student.update.mockResolvedValue(mockStudent as any);

      const req = createMockRequest({ skills: null });
      await PATCH(req as any);

      expect(prismaMock.student.update).toHaveBeenCalledWith({
        where: { id: 'student-1' },
        data: { skills: null },
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty update (no fields provided)', async () => {
      (getServerSession as jest.Mock).mockResolvedValue(mockStudentSession);
      prismaMock.student.findUnique.mockResolvedValue(mockStudent as any);
      prismaMock.student.update.mockResolvedValue(mockStudent as any);

      const req = createMockRequest({});
      const response = await PATCH(req as any);

      expect(response.status).toBe(200);
      expect(prismaMock.student.update).toHaveBeenCalledWith({
        where: { id: 'student-1' },
        data: {},
      });
    });

    it('should only update provided fields, not all', async () => {
      (getServerSession as jest.Mock).mockResolvedValue(mockStudentSession);
      prismaMock.student.findUnique.mockResolvedValue({
        ...mockStudent,
        phone: '1111111111',
        skills: 'Java, Python',
      } as any);
      prismaMock.student.update.mockResolvedValue(mockStudent as any);

      const req = createMockRequest({ phone: '9999999999' }); // Only updating phone
      await PATCH(req as any);

      expect(prismaMock.student.update).toHaveBeenCalledWith({
        where: { id: 'student-1' },
        data: { phone: '9999999999' }, // Skills should not be in update
      });
    });

    it('should handle very long skills list', async () => {
      const longSkills =
        'React, Node.js, TypeScript, MongoDB, PostgreSQL, Redis, Docker, Kubernetes, AWS, Azure, GraphQL, REST APIs, Jest, Cypress, Git';

      (getServerSession as jest.Mock).mockResolvedValue(mockStudentSession);
      prismaMock.student.findUnique.mockResolvedValue(mockStudent as any);
      prismaMock.student.update.mockResolvedValue({
        ...mockStudent,
        skills: longSkills,
      } as any);

      const req = createMockRequest({ skills: longSkills });
      const response = await PATCH(req as any);

      expect(response.status).toBe(200);
      expect(prismaMock.student.update).toHaveBeenCalledWith({
        where: { id: 'student-1' },
        data: { skills: longSkills },
      });
    });
  });

  describe('Return Value Tests', () => {
    it('should return updated student object', async () => {
      const updatedStudent = {
        ...mockStudent,
        phone: '9999999999',
        skills: 'React, Node.js',
      };

      (getServerSession as jest.Mock).mockResolvedValue(mockStudentSession);
      prismaMock.student.findUnique.mockResolvedValue(mockStudent as any);
      prismaMock.student.update.mockResolvedValue(updatedStudent as any);

      const req = createMockRequest({
        phone: '9999999999',
        skills: 'React, Node.js',
      });
      const response = await PATCH(req as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.student).toBeDefined();
      expect(data.student.phone).toBe('9999999999');
      expect(data.student.skills).toBe('React, Node.js');
    });
  });

  describe('Real-World Scenarios', () => {
    it('Scenario: Student completes profile after initial login', async () => {
      const incompleteStudent = {
        ...mockStudent,
        phone: null,
        skills: null,
        github: null,
        linkedin: null,
        portfolio: null,
        profileImage: null,
        resume: null,
      };

      const completeStudent = {
        ...mockStudent,
        phone: '9876543210',
        skills: 'React, Node.js, MongoDB',
        github: 'https://github.com/rahul',
        linkedin: 'https://linkedin.com/in/rahul',
        portfolio: 'https://rahul.dev',
        profileImage: 'https://cloudinary.com/profile.jpg',
        resume: 'https://cloudinary.com/resume.pdf',
      };

      (getServerSession as jest.Mock).mockResolvedValue(mockStudentSession);
      prismaMock.student.findUnique.mockResolvedValue(incompleteStudent as any);
      prismaMock.student.update.mockResolvedValue(completeStudent as any);

      const req = createMockRequest({
        phone: '9876543210',
        skills: 'React, Node.js, MongoDB',
        github: 'https://github.com/rahul',
        linkedin: 'https://linkedin.com/in/rahul',
        portfolio: 'https://rahul.dev',
        profileImage: 'https://cloudinary.com/profile.jpg',
        resume: 'https://cloudinary.com/resume.pdf',
      });

      const response = await PATCH(req as any);
      expect(response.status).toBe(200);
    });

    it('Scenario: Student updates resume before drive application', async () => {
      (getServerSession as jest.Mock).mockResolvedValue(mockStudentSession);
      prismaMock.student.findUnique.mockResolvedValue({
        ...mockStudent,
        resume: 'https://cloudinary.com/old-resume.pdf',
      } as any);
      prismaMock.student.update.mockResolvedValue({
        ...mockStudent,
        resume: 'https://cloudinary.com/new-resume.pdf',
      } as any);

      const req = createMockRequest({
        resume: 'https://cloudinary.com/new-resume.pdf',
      });
      const response = await PATCH(req as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.student.resume).toBe('https://cloudinary.com/new-resume.pdf');
    });
  });
});
