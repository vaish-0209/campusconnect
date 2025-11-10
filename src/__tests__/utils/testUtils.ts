/**
 * Test Utilities
 * Common helpers and mocks for unit tests
 */

import { PrismaClient } from '@prisma/client';
import { mockDeep, mockReset, DeepMockProxy } from 'jest-mock-extended';

// Mock Prisma Client
export const prismaMock = mockDeep<PrismaClient>() as unknown as DeepMockProxy<PrismaClient>;

// Reset mocks before each test
beforeEach(() => {
  mockReset(prismaMock);
});

// Mock user session for admin
export const mockAdminSession = {
  user: {
    id: 'admin-123',
    email: 'admin@test.com',
    role: 'ADMIN' as const,
  },
  expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
};

// Mock user session for student
export const mockStudentSession = {
  user: {
    id: 'student-123',
    email: 'student@test.com',
    role: 'STUDENT' as const,
  },
  expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
};

// Mock student data
export const mockStudent = {
  id: 'student-1',
  userId: 'user-1',
  rollNo: 'CS001',
  firstName: 'Rahul',
  lastName: 'Kumar',
  branch: 'Computer Science',
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
};

// Mock company data
export const mockCompany = {
  id: 'company-1',
  name: 'Microsoft',
  logo: 'https://example.com/microsoft-logo.png',
  sector: 'Technology',
  website: 'https://microsoft.com',
  description: 'Leading technology company',
  packageRange: '20-30 LPA',
  eligibilityMinCGPA: 7.5,
  eligibilityMaxBacklogs: 0,
  eligibilityBranches: 'CSE,IT,ECE',
  hrContactName: null,
  hrContactEmail: null,
  hrContactPhone: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

// Mock drive data
export const mockDrive = {
  id: 'drive-1',
  companyId: 'company-1',
  title: 'Software Engineer - Azure',
  jobDescription: 'Backend development for Azure cloud',
  role: 'Software Engineer',
  ctc: 24.0,
  ctcBreakup: null,
  location: 'Bangalore',
  bond: null,
  techStack: 'C#, Azure, Kubernetes',
  positionsAvailable: 10,
  minCgpa: 7.5,
  maxBacklogs: 0,
  allowedBranches: 'CSE,IT',
  registrationStart: new Date('2025-11-01'),
  registrationEnd: new Date('2025-11-30'),
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

// Mock application data
export const mockApplication = {
  id: 'app-1',
  studentId: 'student-1',
  driveId: 'drive-1',
  status: 'APPLIED' as const,
  resumeUrl: null,
  remarks: null,
  appliedAt: new Date(),
  updatedAt: new Date(),
};

// Mock event data
export const mockEvent = {
  id: 'event-1',
  driveId: 'drive-1',
  title: 'Pre-Placement Talk',
  description: 'Introduction to Azure team',
  type: 'PPT' as const,
  startTime: new Date('2025-11-09T14:00:00'),
  endTime: new Date('2025-11-09T16:00:00'),
  venue: 'Auditorium',
  meetingLink: 'https://meet.google.com/xyz',
  createdAt: new Date(),
  updatedAt: new Date(),
};

// Helper to create mock request
export function createMockRequest(body?: any, params?: any, searchParams?: any) {
  return {
    json: async () => body || {},
    nextUrl: {
      searchParams: new URLSearchParams(searchParams || {}),
    },
  };
}

// Helper to check response status and data
export async function parseResponse(response: any) {
  const data = await response.json();
  return {
    status: response.status,
    data,
  };
}
