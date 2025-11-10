/**
 * Unit Tests: Company CRUD Operations
 * Tests GET and POST endpoints for company management
 */

import { GET, POST } from '@/app/api/admin/companies/route';
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

describe('GET /api/admin/companies - Get All Companies', () => {
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
    const mockCompanies = [
      {
        id: 'company-1',
        name: 'Microsoft',
        logo: 'https://example.com/microsoft.png',
        sector: 'Technology',
        website: 'https://microsoft.com',
        description: 'Leading tech company',
        packageRange: '20-30 LPA',
        eligibilityMinCGPA: 8.0,
        eligibilityMaxBacklogs: 0,
        eligibilityBranches: 'CSE,IT',
        hrContactName: 'John Doe',
        hrContactEmail: 'hr@microsoft.com',
        hrContactPhone: '1234567890',
        createdAt: new Date(),
        updatedAt: new Date(),
        drives: [
          {
            id: 'drive-1',
            applications: [
              { id: 'app-1', status: 'APPLIED' },
              { id: 'app-2', status: 'OFFER' },
            ],
          },
          {
            id: 'drive-2',
            applications: [
              { id: 'app-3', status: 'OFFER' },
            ],
          },
        ],
      },
      {
        id: 'company-2',
        name: 'Google',
        logo: 'https://example.com/google.png',
        sector: 'Technology',
        website: 'https://google.com',
        description: 'Search engine giant',
        packageRange: '25-35 LPA',
        eligibilityMinCGPA: 8.5,
        eligibilityMaxBacklogs: 0,
        eligibilityBranches: 'CSE',
        hrContactName: null,
        hrContactEmail: null,
        hrContactPhone: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        drives: [],
      },
    ];

    it('should return all companies with stats', async () => {
      (getServerSession as jest.Mock).mockResolvedValue(mockAdminSession);
      prismaMock.company.findMany.mockResolvedValue(mockCompanies as any);

      const req = createMockRequest();
      const response = await GET(req as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.companies).toHaveLength(2);
      expect(data.companies[0].name).toBe('Microsoft');
    });

    it('should calculate drives count correctly', async () => {
      (getServerSession as jest.Mock).mockResolvedValue(mockAdminSession);
      prismaMock.company.findMany.mockResolvedValue(mockCompanies as any);

      const req = createMockRequest();
      const response = await GET(req as any);
      const data = await response.json();

      expect(data.companies[0].drivesCount).toBe(2); // Microsoft has 2 drives
      expect(data.companies[1].drivesCount).toBe(0); // Google has 0 drives
    });

    it('should calculate total applications correctly', async () => {
      (getServerSession as jest.Mock).mockResolvedValue(mockAdminSession);
      prismaMock.company.findMany.mockResolvedValue(mockCompanies as any);

      const req = createMockRequest();
      const response = await GET(req as any);
      const data = await response.json();

      expect(data.companies[0].totalApplications).toBe(3); // Microsoft: 2 + 1 applications
    });

    it('should calculate total offers correctly', async () => {
      (getServerSession as jest.Mock).mockResolvedValue(mockAdminSession);
      prismaMock.company.findMany.mockResolvedValue(mockCompanies as any);

      const req = createMockRequest();
      const response = await GET(req as any);
      const data = await response.json();

      expect(data.companies[0].totalOffers).toBe(2); // Microsoft: 2 OFFER status applications
      expect(data.companies[1].totalOffers).toBe(0); // Google: 0 offers
    });

    it('should order companies by name ascending', async () => {
      (getServerSession as jest.Mock).mockResolvedValue(mockAdminSession);
      prismaMock.company.findMany.mockResolvedValue(mockCompanies as any);

      const req = createMockRequest();
      await GET(req as any);

      expect(prismaMock.company.findMany).toHaveBeenCalledWith({
        where: {},
        include: expect.any(Object),
        orderBy: { name: 'asc' },
      });
    });
  });

  describe('Search and Filter Tests', () => {
    it('should filter companies by search query (name)', async () => {
      (getServerSession as jest.Mock).mockResolvedValue(mockAdminSession);
      prismaMock.company.findMany.mockResolvedValue([]);

      const req = createMockRequest(null, null, { search: 'Microsoft' });
      await GET(req as any);

      expect(prismaMock.company.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { name: { contains: 'Microsoft' } },
            { sector: { contains: 'Microsoft' } },
          ],
        },
        include: expect.any(Object),
        orderBy: { name: 'asc' },
      });
    });

    it('should filter companies by sector', async () => {
      (getServerSession as jest.Mock).mockResolvedValue(mockAdminSession);
      prismaMock.company.findMany.mockResolvedValue([]);

      const req = createMockRequest(null, null, { sector: 'Technology' });
      await GET(req as any);

      expect(prismaMock.company.findMany).toHaveBeenCalledWith({
        where: {
          sector: 'Technology',
        },
        include: expect.any(Object),
        orderBy: { name: 'asc' },
      });
    });

    it('should apply both search and sector filters', async () => {
      (getServerSession as jest.Mock).mockResolvedValue(mockAdminSession);
      prismaMock.company.findMany.mockResolvedValue([]);

      const req = createMockRequest(null, null, { search: 'Tech', sector: 'Technology' });
      await GET(req as any);

      expect(prismaMock.company.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { name: { contains: 'Tech' } },
            { sector: { contains: 'Tech' } },
          ],
          sector: 'Technology',
        },
        include: expect.any(Object),
        orderBy: { name: 'asc' },
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty companies list', async () => {
      (getServerSession as jest.Mock).mockResolvedValue(mockAdminSession);
      prismaMock.company.findMany.mockResolvedValue([]);

      const req = createMockRequest();
      const response = await GET(req as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.companies).toEqual([]);
    });

    it('should handle companies with null optional fields', async () => {
      const minimalCompany = {
        id: 'company-1',
        name: 'Startup Inc',
        logo: null,
        sector: 'Technology',
        website: null,
        description: null,
        packageRange: null,
        eligibilityMinCGPA: null,
        eligibilityMaxBacklogs: null,
        eligibilityBranches: null,
        hrContactName: null,
        hrContactEmail: null,
        hrContactPhone: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        drives: [],
      };

      (getServerSession as jest.Mock).mockResolvedValue(mockAdminSession);
      prismaMock.company.findMany.mockResolvedValue([minimalCompany] as any);

      const req = createMockRequest();
      const response = await GET(req as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.companies[0].logo).toBeNull();
      expect(data.companies[0].hrContactEmail).toBeNull();
    });
  });
});

describe('POST /api/admin/companies - Create Company', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Authorization Tests', () => {
    it('should return 401 if user is not authenticated', async () => {
      (getServerSession as jest.Mock).mockResolvedValue(null);

      const req = createMockRequest({ name: 'Microsoft', sector: 'Technology' });
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

      const req = createMockRequest({ name: 'Microsoft', sector: 'Technology' });
      const response = await POST(req as any);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });
  });

  describe('Validation Tests', () => {
    it('should return 400 if name is missing', async () => {
      (getServerSession as jest.Mock).mockResolvedValue(mockAdminSession);

      const req = createMockRequest({ sector: 'Technology' });
      const response = await POST(req as any);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Validation error');
    });

    it('should return 400 if sector is missing', async () => {
      (getServerSession as jest.Mock).mockResolvedValue(mockAdminSession);

      const req = createMockRequest({ name: 'Microsoft' });
      const response = await POST(req as any);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Validation error');
    });

    it('should return 400 if logo is invalid URL', async () => {
      (getServerSession as jest.Mock).mockResolvedValue(mockAdminSession);

      const req = createMockRequest({
        name: 'Microsoft',
        sector: 'Technology',
        logo: 'not-a-url',
      });
      const response = await POST(req as any);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Validation error');
    });

    it('should return 400 if website is invalid URL', async () => {
      (getServerSession as jest.Mock).mockResolvedValue(mockAdminSession);

      const req = createMockRequest({
        name: 'Microsoft',
        sector: 'Technology',
        website: 'invalid-website',
      });
      const response = await POST(req as any);
      const data = await response.json();

      expect(response.status).toBe(400);
    });

    it('should return 400 if eligibilityMinCGPA is negative', async () => {
      (getServerSession as jest.Mock).mockResolvedValue(mockAdminSession);

      const req = createMockRequest({
        name: 'Microsoft',
        sector: 'Technology',
        eligibilityMinCGPA: -1,
      });
      const response = await POST(req as any);
      const data = await response.json();

      expect(response.status).toBe(400);
    });

    it('should return 400 if eligibilityMinCGPA exceeds 10', async () => {
      (getServerSession as jest.Mock).mockResolvedValue(mockAdminSession);

      const req = createMockRequest({
        name: 'Microsoft',
        sector: 'Technology',
        eligibilityMinCGPA: 11,
      });
      const response = await POST(req as any);
      const data = await response.json();

      expect(response.status).toBe(400);
    });

    it('should return 400 if eligibilityMaxBacklogs is negative', async () => {
      (getServerSession as jest.Mock).mockResolvedValue(mockAdminSession);

      const req = createMockRequest({
        name: 'Microsoft',
        sector: 'Technology',
        eligibilityMaxBacklogs: -1,
      });
      const response = await POST(req as any);
      const data = await response.json();

      expect(response.status).toBe(400);
    });

    it('should return 400 if hrContactEmail is invalid', async () => {
      (getServerSession as jest.Mock).mockResolvedValue(mockAdminSession);

      const req = createMockRequest({
        name: 'Microsoft',
        sector: 'Technology',
        hrContactEmail: 'not-an-email',
      });
      const response = await POST(req as any);
      const data = await response.json();

      expect(response.status).toBe(400);
    });
  });

  describe('Duplicate Detection', () => {
    it('should return 409 if company name already exists', async () => {
      (getServerSession as jest.Mock).mockResolvedValue(mockAdminSession);
      prismaMock.company.findUnique.mockResolvedValue({
        id: 'company-1',
        name: 'Microsoft',
      } as any);

      const req = createMockRequest({ name: 'Microsoft', sector: 'Technology' });
      const response = await POST(req as any);
      const data = await response.json();

      expect(response.status).toBe(409);
      expect(data.error).toBe('Company with this name already exists');
    });
  });

  describe('Successful Company Creation', () => {
    const mockCreatedCompany = {
      id: 'company-1',
      name: 'Microsoft',
      logo: 'https://example.com/logo.png',
      sector: 'Technology',
      website: 'https://microsoft.com',
      description: 'Leading tech company',
      packageRange: '20-30 LPA',
      eligibilityMinCGPA: 8.0,
      eligibilityMaxBacklogs: 0,
      eligibilityBranches: 'CSE,IT',
      hrContactName: 'John Doe',
      hrContactEmail: 'hr@microsoft.com',
      hrContactPhone: '1234567890',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should create company with all fields', async () => {
      (getServerSession as jest.Mock).mockResolvedValue(mockAdminSession);
      prismaMock.company.findUnique.mockResolvedValue(null);
      prismaMock.company.create.mockResolvedValue(mockCreatedCompany as any);

      const req = createMockRequest({
        name: 'Microsoft',
        logo: 'https://example.com/logo.png',
        sector: 'Technology',
        website: 'https://microsoft.com',
        description: 'Leading tech company',
        packageRange: '20-30 LPA',
        eligibilityMinCGPA: 8.0,
        eligibilityMaxBacklogs: 0,
        eligibilityBranches: 'CSE,IT',
        hrContactName: 'John Doe',
        hrContactEmail: 'hr@microsoft.com',
        hrContactPhone: '1234567890',
      });
      const response = await POST(req as any);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.company.name).toBe('Microsoft');
    });

    it('should create company with only required fields', async () => {
      (getServerSession as jest.Mock).mockResolvedValue(mockAdminSession);
      prismaMock.company.findUnique.mockResolvedValue(null);
      prismaMock.company.create.mockResolvedValue({
        id: 'company-1',
        name: 'Startup Inc',
        sector: 'Technology',
        logo: null,
        website: null,
        description: undefined,
        packageRange: undefined,
        eligibilityMinCGPA: undefined,
        eligibilityMaxBacklogs: undefined,
        eligibilityBranches: undefined,
        hrContactName: undefined,
        hrContactEmail: null,
        hrContactPhone: undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);

      const req = createMockRequest({
        name: 'Startup Inc',
        sector: 'Technology',
      });
      const response = await POST(req as any);

      expect(response.status).toBe(201);
      expect(prismaMock.company.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          name: 'Startup Inc',
          sector: 'Technology',
        }),
      });
    });

    it('should convert empty strings to null for optional URL fields', async () => {
      (getServerSession as jest.Mock).mockResolvedValue(mockAdminSession);
      prismaMock.company.findUnique.mockResolvedValue(null);
      prismaMock.company.create.mockResolvedValue(mockCreatedCompany as any);

      const req = createMockRequest({
        name: 'Microsoft',
        sector: 'Technology',
        logo: '',
        website: '',
        hrContactEmail: '',
      });
      await POST(req as any);

      expect(prismaMock.company.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          logo: null,
          website: null,
          hrContactEmail: null,
        }),
      });
    });
  });

  describe('Real-World Scenarios', () => {
    it('Scenario: Create Microsoft with high eligibility criteria', async () => {
      (getServerSession as jest.Mock).mockResolvedValue(mockAdminSession);
      prismaMock.company.findUnique.mockResolvedValue(null);
      prismaMock.company.create.mockResolvedValue({
        id: 'company-1',
        name: 'Microsoft',
        sector: 'Technology',
        eligibilityMinCGPA: 8.5,
        eligibilityMaxBacklogs: 0,
        eligibilityBranches: 'CSE,IT',
      } as any);

      const req = createMockRequest({
        name: 'Microsoft',
        sector: 'Technology',
        eligibilityMinCGPA: 8.5,
        eligibilityMaxBacklogs: 0,
        eligibilityBranches: 'CSE,IT',
        packageRange: '24-30 LPA',
      });
      const response = await POST(req as any);

      expect(response.status).toBe(201);
    });

    it('Scenario: Create startup with lenient eligibility', async () => {
      (getServerSession as jest.Mock).mockResolvedValue(mockAdminSession);
      prismaMock.company.findUnique.mockResolvedValue(null);
      prismaMock.company.create.mockResolvedValue({
        id: 'company-2',
        name: 'Tech Startup',
        sector: 'Technology',
        eligibilityMinCGPA: 6.0,
        eligibilityMaxBacklogs: 3,
        eligibilityBranches: 'CSE,IT,ECE,MECH',
      } as any);

      const req = createMockRequest({
        name: 'Tech Startup',
        sector: 'Technology',
        eligibilityMinCGPA: 6.0,
        eligibilityMaxBacklogs: 3,
        eligibilityBranches: 'CSE,IT,ECE,MECH',
        packageRange: '6-12 LPA',
      });
      const response = await POST(req as any);

      expect(response.status).toBe(201);
    });

    it('Scenario: Create company with complete HR contact details', async () => {
      (getServerSession as jest.Mock).mockResolvedValue(mockAdminSession);
      prismaMock.company.findUnique.mockResolvedValue(null);
      prismaMock.company.create.mockResolvedValue({} as any);

      const req = createMockRequest({
        name: 'Google',
        sector: 'Technology',
        hrContactName: 'Jane Smith',
        hrContactEmail: 'jane.smith@google.com',
        hrContactPhone: '+91-9876543210',
      });
      const response = await POST(req as any);

      expect(response.status).toBe(201);
      expect(prismaMock.company.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          hrContactName: 'Jane Smith',
          hrContactEmail: 'jane.smith@google.com',
          hrContactPhone: '+91-9876543210',
        }),
      });
    });
  });

  describe('Edge Cases', () => {
    it('should accept CGPA exactly at 0', async () => {
      (getServerSession as jest.Mock).mockResolvedValue(mockAdminSession);
      prismaMock.company.findUnique.mockResolvedValue(null);
      prismaMock.company.create.mockResolvedValue({} as any);

      const req = createMockRequest({
        name: 'Open Company',
        sector: 'Services',
        eligibilityMinCGPA: 0,
      });
      const response = await POST(req as any);

      expect(response.status).toBe(201);
    });

    it('should accept CGPA exactly at 10', async () => {
      (getServerSession as jest.Mock).mockResolvedValue(mockAdminSession);
      prismaMock.company.findUnique.mockResolvedValue(null);
      prismaMock.company.create.mockResolvedValue({} as any);

      const req = createMockRequest({
        name: 'Elite Company',
        sector: 'Technology',
        eligibilityMinCGPA: 10,
      });
      const response = await POST(req as any);

      expect(response.status).toBe(201);
    });

    it('should accept 0 backlogs allowed', async () => {
      (getServerSession as jest.Mock).mockResolvedValue(mockAdminSession);
      prismaMock.company.findUnique.mockResolvedValue(null);
      prismaMock.company.create.mockResolvedValue({} as any);

      const req = createMockRequest({
        name: 'Strict Company',
        sector: 'Technology',
        eligibilityMaxBacklogs: 0,
      });
      const response = await POST(req as any);

      expect(response.status).toBe(201);
    });
  });
});
