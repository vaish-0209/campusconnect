/**
 * Unit Tests for Events API Routes
 * Tests: /api/admin/events (POST - conflict detection)
 */

import { POST } from '@/app/api/admin/events/route';
import { prismaMock, mockAdminSession, mockEvent, createMockRequest } from '../utils/testUtils';
import { getServerSession } from 'next-auth';

jest.mock('next-auth', () => ({
  getServerSession: jest.fn(),
}));

jest.mock('@/lib/prisma', () => ({
  prisma: require('../utils/testUtils').prismaMock,
}));

describe('POST /api/admin/events - Event Creation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 401 if user is not authenticated', async () => {
    (getServerSession as jest.Mock).mockResolvedValue(null);

    const req = createMockRequest({
      driveId: 'drive-1',
      title: 'Pre-Placement Talk',
      type: 'PPT',
      startTime: new Date('2025-11-09T14:00:00').toISOString(),
      endTime: new Date('2025-11-09T16:00:00').toISOString(),
    });

    const response = await POST(req as any);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Unauthorized');
  });

  it('should return 400 if end time is before start time', async () => {
    (getServerSession as jest.Mock).mockResolvedValue(mockAdminSession);

    const req = createMockRequest({
      driveId: 'drive-1',
      title: 'Pre-Placement Talk',
      type: 'PPT',
      startTime: new Date('2025-11-09T16:00:00').toISOString(),
      endTime: new Date('2025-11-09T14:00:00').toISOString(), // Before start time
    });

    const response = await POST(req as any);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('End time must be after start time');
  });

  it('should return 409 if event conflicts with existing event', async () => {
    (getServerSession as jest.Mock).mockResolvedValue(mockAdminSession);

    // Mock drive lookup
    prismaMock.drive.findUnique.mockResolvedValue({ id: 'drive-1' } as any);

    // Mock existing conflicting event
    prismaMock.event.findMany.mockResolvedValue([
      {
        ...mockEvent,
        startTime: new Date('2025-11-09T14:00:00'),
        endTime: new Date('2025-11-09T16:00:00'),
        drive: {
          title: 'Software Engineer',
          company: {
            name: 'Microsoft',
          },
        },
      } as any,
    ]);

    const req = createMockRequest({
      driveId: 'drive-1',
      title: 'Another PPT',
      type: 'PPT',
      startTime: new Date('2025-11-09T14:30:00').toISOString(), // Overlaps with existing event
      endTime: new Date('2025-11-09T16:30:00').toISOString(),
    });

    const response = await POST(req as any);
    const data = await response.json();

    expect(response.status).toBe(409);
    expect(data.error).toContain('Time conflict detected');
    expect(data.conflicts).toHaveLength(1);
  });

  it('should successfully create event with no conflicts', async () => {
    (getServerSession as jest.Mock).mockResolvedValue(mockAdminSession);

    // Mock drive lookup
    prismaMock.drive.findUnique.mockResolvedValue({ id: 'drive-1' } as any);

    // No conflicting events
    prismaMock.event.findMany.mockResolvedValue([]);

    prismaMock.event.create.mockResolvedValue({
      ...mockEvent,
      id: 'new-event-id',
      drive: {
        title: 'Software Engineer',
        company: {
          name: 'Microsoft',
        },
      },
    } as any);

    const req = createMockRequest({
      driveId: 'drive-1',
      title: 'Pre-Placement Talk',
      type: 'PPT',
      description: 'Intro to Azure',
      startTime: new Date('2025-11-09T14:00:00').toISOString(),
      endTime: new Date('2025-11-09T16:00:00').toISOString(),
      venue: 'Auditorium',
      meetingLink: 'https://meet.google.com/xyz',
    });

    const response = await POST(req as any);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.success).toBe(true);
    expect(data.event.id).toBe('new-event-id');
  });

  it('should detect exact time overlap', async () => {
    (getServerSession as jest.Mock).mockResolvedValue(mockAdminSession);

    // Mock drive lookup
    prismaMock.drive.findUnique.mockResolvedValue({ id: 'drive-2' } as any);

    prismaMock.event.findMany.mockResolvedValue([
      {
        ...mockEvent,
        startTime: new Date('2025-11-09T14:00:00'),
        endTime: new Date('2025-11-09T16:00:00'),
        drive: { title: 'Test', company: { name: 'Company' } },
      } as any,
    ]);

    const req = createMockRequest({
      driveId: 'drive-2',
      title: 'Another Event',
      type: 'TEST',
      startTime: new Date('2025-11-09T14:00:00').toISOString(), // Same time
      endTime: new Date('2025-11-09T16:00:00').toISOString(),
    });

    const response = await POST(req as any);
    const data = await response.json();

    expect(response.status).toBe(409);
    expect(data.conflicts).toHaveLength(1);
  });

  it('should detect partial overlap (new event starts during existing)', async () => {
    (getServerSession as jest.Mock).mockResolvedValue(mockAdminSession);

    // Mock drive lookup
    prismaMock.drive.findUnique.mockResolvedValue({ id: 'drive-2' } as any);

    prismaMock.event.findMany.mockResolvedValue([
      {
        ...mockEvent,
        startTime: new Date('2025-11-09T14:00:00'),
        endTime: new Date('2025-11-09T16:00:00'),
        drive: { title: 'Test', company: { name: 'Company' } },
      } as any,
    ]);

    const req = createMockRequest({
      driveId: 'drive-2',
      title: 'Overlapping Event',
      type: 'TEST',
      startTime: new Date('2025-11-09T15:00:00').toISOString(), // Starts during existing
      endTime: new Date('2025-11-09T17:00:00').toISOString(),
    });

    const response = await POST(req as any);
    const data = await response.json();

    expect(response.status).toBe(409);
    expect(data.conflicts).toHaveLength(1);
  });

  it('should detect partial overlap (new event ends during existing)', async () => {
    (getServerSession as jest.Mock).mockResolvedValue(mockAdminSession);

    // Mock drive lookup
    prismaMock.drive.findUnique.mockResolvedValue({ id: 'drive-2' } as any);

    prismaMock.event.findMany.mockResolvedValue([
      {
        ...mockEvent,
        startTime: new Date('2025-11-09T14:00:00'),
        endTime: new Date('2025-11-09T16:00:00'),
        drive: { title: 'Test', company: { name: 'Company' } },
      } as any,
    ]);

    const req = createMockRequest({
      driveId: 'drive-2',
      title: 'Overlapping Event',
      type: 'TEST',
      startTime: new Date('2025-11-09T13:00:00').toISOString(),
      endTime: new Date('2025-11-09T15:00:00').toISOString(), // Ends during existing
    });

    const response = await POST(req as any);
    const data = await response.json();

    expect(response.status).toBe(409);
    expect(data.conflicts).toHaveLength(1);
  });

  it('should detect complete encapsulation (new event contains existing)', async () => {
    (getServerSession as jest.Mock).mockResolvedValue(mockAdminSession);

    // Mock drive lookup
    prismaMock.drive.findUnique.mockResolvedValue({ id: 'drive-2' } as any);

    prismaMock.event.findMany.mockResolvedValue([
      {
        ...mockEvent,
        startTime: new Date('2025-11-09T14:00:00'),
        endTime: new Date('2025-11-09T16:00:00'),
        drive: { title: 'Test', company: { name: 'Company' } },
      } as any,
    ]);

    const req = createMockRequest({
      driveId: 'drive-2',
      title: 'Encapsulating Event',
      type: 'TEST',
      startTime: new Date('2025-11-09T13:00:00').toISOString(),
      endTime: new Date('2025-11-09T17:00:00').toISOString(), // Completely contains existing
    });

    const response = await POST(req as any);
    const data = await response.json();

    expect(response.status).toBe(409);
    expect(data.conflicts).toHaveLength(1);
  });

  it('should allow non-overlapping events', async () => {
    (getServerSession as jest.Mock).mockResolvedValue(mockAdminSession);

    // Mock drive lookup
    prismaMock.drive.findUnique.mockResolvedValue({ id: 'drive-2' } as any);

    // Mock findMany to return empty array (no conflicts for non-overlapping times)
    prismaMock.event.findMany.mockResolvedValue([]);

    prismaMock.event.create.mockResolvedValue({
      ...mockEvent,
      id: 'new-event',
      drive: { title: 'Test', company: { name: 'Company' } },
    } as any);

    const req = createMockRequest({
      driveId: 'drive-2',
      title: 'Non-overlapping Event',
      type: 'TEST',
      startTime: new Date('2025-11-09T17:00:00').toISOString(), // After existing event
      endTime: new Date('2025-11-09T18:00:00').toISOString(),
    });

    const response = await POST(req as any);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.success).toBe(true);
  });

  it('should return 400 if event type is invalid', async () => {
    (getServerSession as jest.Mock).mockResolvedValue(mockAdminSession);

    const req = createMockRequest({
      driveId: 'drive-1',
      title: 'Event',
      type: 'INVALID_TYPE', // Invalid
      startTime: new Date('2025-11-09T14:00:00').toISOString(),
      endTime: new Date('2025-11-09T16:00:00').toISOString(),
    });

    const response = await POST(req as any);
    const data = await response.json();

    expect(response.status).toBe(400);
  });
});
