/**
 * Unit Tests: Password Reset Flow
 * Tests both forgot-password and reset-password endpoints
 */

import { POST as ForgotPasswordPOST } from '@/app/api/auth/forgot-password/route';
import { POST as ResetPasswordPOST } from '@/app/api/auth/reset-password/route';
import { prismaMock, createMockRequest } from '../utils/testUtils';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

// Mock dependencies
jest.mock('@/lib/prisma', () => ({
  prisma: require('../utils/testUtils').prismaMock,
}));

jest.mock('@/lib/email', () => ({
  sendPasswordResetEmail: jest.fn().mockResolvedValue(true),
}));

jest.mock('@/lib/audit', () => ({
  createAuditLog: jest.fn().mockResolvedValue(true),
}));

jest.mock('@/lib/rate-limit', () => ({
  passwordResetLimiter: jest.fn().mockResolvedValue({
    success: true,
    limit: 3,
    remaining: 2,
    reset: Date.now() + 3600000,
  }),
  getClientIp: jest.fn().mockReturnValue('127.0.0.1'),
}));

jest.mock('bcryptjs');
jest.mock('crypto');

const { sendPasswordResetEmail } = require('@/lib/email');
const { createAuditLog } = require('@/lib/audit');
const { passwordResetLimiter } = require('@/lib/rate-limit');

describe('POST /api/auth/forgot-password - Request Password Reset', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Validation Tests', () => {
    it('should return 400 if email is missing', async () => {
      const req = createMockRequest({ email: '' });
      const response = await ForgotPasswordPOST(req as any);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid email format');
    });

    it('should return 400 if email is invalid format', async () => {
      const req = createMockRequest({ email: 'not-an-email' });
      const response = await ForgotPasswordPOST(req as any);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid email format');
    });
  });

  describe('Rate Limiting Tests', () => {
    it('should return 429 if rate limit exceeded', async () => {
      (passwordResetLimiter as jest.Mock).mockResolvedValueOnce({
        success: false,
        limit: 3,
        remaining: 0,
        reset: Date.now() + 3600000,
        retryAfter: 3600,
      });

      const req = createMockRequest({ email: 'rahul@test.com' });
      const response = await ForgotPasswordPOST(req as any);
      const data = await response.json();

      expect(response.status).toBe(429);
      expect(data.error).toContain('Too many password reset attempts');
      expect(data.retryAfter).toBe(3600);
    });

    it('should include rate limit headers in 429 response', async () => {
      (passwordResetLimiter as jest.Mock).mockResolvedValueOnce({
        success: false,
        limit: 3,
        remaining: 0,
        reset: Date.now() + 3600000,
        retryAfter: 3600,
      });

      const req = createMockRequest({ email: 'rahul@test.com' });
      const response = await ForgotPasswordPOST(req as any);

      expect(response.headers.get('X-RateLimit-Limit')).toBe('3');
      expect(response.headers.get('X-RateLimit-Remaining')).toBe('0');
      expect(response.headers.get('Retry-After')).toBe('3600');
    });
  });

  describe('Email Enumeration Prevention', () => {
    it('should return success even if user does not exist', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      const req = createMockRequest({ email: 'nonexistent@test.com' });
      const response = await ForgotPasswordPOST(req as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toBe('If an account exists, a reset link has been sent');
    });

    it('should not send email if user does not exist', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      const req = createMockRequest({ email: 'nonexistent@test.com' });
      await ForgotPasswordPOST(req as any);

      expect(sendPasswordResetEmail).not.toHaveBeenCalled();
    });
  });

  describe('Successful Password Reset Request', () => {
    const mockUser = {
      id: 'user-1',
      email: 'rahul@test.com',
      password: 'hashed_password',
      role: 'STUDENT',
      createdAt: new Date(),
      updatedAt: new Date(),
      resetToken: null,
      resetTokenExpiry: null,
    };

    const mockStudent = {
      id: 'student-1',
      userId: 'user-1',
      firstName: 'Rahul',
    };

    beforeEach(() => {
      (crypto.randomBytes as jest.Mock).mockReturnValue(
        Buffer.from('a'.repeat(64), 'hex')
      );
      (crypto.createHash as jest.Mock).mockReturnValue({
        update: jest.fn().mockReturnThis(),
        digest: jest.fn().mockReturnValue('hashed_token'),
      });
    });

    it('should generate reset token and store hashed version', async () => {
      prismaMock.user.findUnique.mockResolvedValue(mockUser);
      prismaMock.user.update.mockResolvedValue(mockUser);
      prismaMock.student.findUnique.mockResolvedValue(mockStudent as any);

      const req = createMockRequest({ email: 'rahul@test.com' });
      await ForgotPasswordPOST(req as any);

      expect(prismaMock.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: {
          resetToken: 'hashed_token',
          resetTokenExpiry: expect.any(Date),
        },
      });
    });

    it('should send password reset email with correct data', async () => {
      prismaMock.user.findUnique.mockResolvedValue(mockUser);
      prismaMock.user.update.mockResolvedValue(mockUser);
      prismaMock.student.findUnique.mockResolvedValue(mockStudent as any);

      const req = createMockRequest({ email: 'rahul@test.com' });
      await ForgotPasswordPOST(req as any);

      expect(sendPasswordResetEmail).toHaveBeenCalledWith({
        to: 'rahul@test.com',
        resetLink: expect.stringContaining('/auth/reset-password?token='),
        userName: 'Rahul',
      });
    });

    it('should use "User" as default name if no student profile', async () => {
      prismaMock.user.findUnique.mockResolvedValue(mockUser);
      prismaMock.user.update.mockResolvedValue(mockUser);
      prismaMock.student.findUnique.mockResolvedValue(null);

      const req = createMockRequest({ email: 'admin@test.com' });
      await ForgotPasswordPOST(req as any);

      expect(sendPasswordResetEmail).toHaveBeenCalledWith({
        to: 'admin@test.com',
        resetLink: expect.any(String),
        userName: 'User',
      });
    });

    it('should create audit log for password reset request', async () => {
      prismaMock.user.findUnique.mockResolvedValue(mockUser);
      prismaMock.user.update.mockResolvedValue(mockUser);
      prismaMock.student.findUnique.mockResolvedValue(mockStudent as any);

      const req = createMockRequest({ email: 'rahul@test.com' });
      await ForgotPasswordPOST(req as any);

      expect(createAuditLog).toHaveBeenCalledWith({
        userId: 'user-1',
        userEmail: 'rahul@test.com',
        action: 'PASSWORD_RESET',
        target: 'User',
        targetId: 'user-1',
        meta: { tokenExpiry: expect.any(Date) },
        req: expect.any(Object),
      });
    });

    it('should return success response', async () => {
      prismaMock.user.findUnique.mockResolvedValue(mockUser);
      prismaMock.user.update.mockResolvedValue(mockUser);
      prismaMock.student.findUnique.mockResolvedValue(mockStudent as any);

      const req = createMockRequest({ email: 'rahul@test.com' });
      const response = await ForgotPasswordPOST(req as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toBe('If an account exists, a reset link has been sent');
    });
  });

  describe('Edge Cases', () => {
    it('should convert email to lowercase before lookup', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      const req = createMockRequest({ email: 'Rahul@Test.COM' });
      await ForgotPasswordPOST(req as any);

      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'rahul@test.com' },
      });
    });
  });
});

describe('POST /api/auth/reset-password - Reset Password with Token', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (crypto.createHash as jest.Mock).mockReturnValue({
      update: jest.fn().mockReturnThis(),
      digest: jest.fn().mockReturnValue('hashed_token'),
    });
  });

  describe('Validation Tests', () => {
    it('should return 400 if token is missing', async () => {
      const req = createMockRequest({
        token: '',
        password: 'ValidPass123',
      });
      const response = await ResetPasswordPOST(req as any);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Validation error');
    });

    it('should return 400 if password is too short', async () => {
      const req = createMockRequest({
        token: 'valid_token',
        password: 'Pass1',
      });
      const response = await ResetPasswordPOST(req as any);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.details).toBeDefined();
    });

    it('should return 400 if password lacks uppercase letter', async () => {
      const req = createMockRequest({
        token: 'valid_token',
        password: 'password123',
      });
      const response = await ResetPasswordPOST(req as any);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.details[0].message).toContain('uppercase, lowercase, and number');
    });

    it('should return 400 if password lacks lowercase letter', async () => {
      const req = createMockRequest({
        token: 'valid_token',
        password: 'PASSWORD123',
      });
      const response = await ResetPasswordPOST(req as any);
      const data = await response.json();

      expect(response.status).toBe(400);
    });

    it('should return 400 if password lacks number', async () => {
      const req = createMockRequest({
        token: 'valid_token',
        password: 'PasswordOnly',
      });
      const response = await ResetPasswordPOST(req as any);
      const data = await response.json();

      expect(response.status).toBe(400);
    });
  });

  describe('Token Validation Tests', () => {
    it('should return 400 if token is invalid (not found)', async () => {
      prismaMock.user.findFirst.mockResolvedValue(null);

      const req = createMockRequest({
        token: 'invalid_token',
        password: 'ValidPass123',
      });
      const response = await ResetPasswordPOST(req as any);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid or expired reset token');
    });

    it('should return 400 if token is expired', async () => {
      const expiredDate = new Date(Date.now() - 60 * 60 * 1000); // 1 hour ago
      prismaMock.user.findFirst.mockResolvedValue(null);

      const req = createMockRequest({
        token: 'expired_token',
        password: 'ValidPass123',
      });
      const response = await ResetPasswordPOST(req as any);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid or expired reset token');
    });

    it('should hash token before database lookup', async () => {
      prismaMock.user.findFirst.mockResolvedValue(null);

      const req = createMockRequest({
        token: 'plain_token',
        password: 'ValidPass123',
      });
      await ResetPasswordPOST(req as any);

      expect(prismaMock.user.findFirst).toHaveBeenCalledWith({
        where: {
          resetToken: 'hashed_token',
          resetTokenExpiry: {
            gte: expect.any(Date),
          },
        },
      });
    });
  });

  describe('Successful Password Reset', () => {
    const mockUser = {
      id: 'user-1',
      email: 'rahul@test.com',
      password: 'old_hashed_password',
      role: 'STUDENT',
      resetToken: 'hashed_token',
      resetTokenExpiry: new Date(Date.now() + 60 * 60 * 1000), // Valid for 1 hour
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    beforeEach(() => {
      (bcrypt.hash as jest.Mock).mockResolvedValue('new_hashed_password');
    });

    it('should hash new password with bcrypt', async () => {
      prismaMock.user.findFirst.mockResolvedValue(mockUser as any);
      prismaMock.user.update.mockResolvedValue(mockUser as any);

      const req = createMockRequest({
        token: 'valid_token',
        password: 'NewPass123',
      });
      await ResetPasswordPOST(req as any);

      expect(bcrypt.hash).toHaveBeenCalledWith('NewPass123', 10);
    });

    it('should update password and clear reset token', async () => {
      prismaMock.user.findFirst.mockResolvedValue(mockUser as any);
      prismaMock.user.update.mockResolvedValue(mockUser as any);

      const req = createMockRequest({
        token: 'valid_token',
        password: 'NewPass123',
      });
      await ResetPasswordPOST(req as any);

      expect(prismaMock.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: {
          password: 'new_hashed_password',
          resetToken: null,
          resetTokenExpiry: null,
        },
      });
    });

    it('should create audit log for successful reset', async () => {
      prismaMock.user.findFirst.mockResolvedValue(mockUser as any);
      prismaMock.user.update.mockResolvedValue(mockUser as any);

      const req = createMockRequest({
        token: 'valid_token',
        password: 'NewPass123',
      });
      await ResetPasswordPOST(req as any);

      expect(createAuditLog).toHaveBeenCalledWith({
        userId: 'user-1',
        userEmail: 'rahul@test.com',
        action: 'PASSWORD_RESET',
        target: 'User',
        targetId: 'user-1',
        meta: { success: true },
        req: expect.any(Object),
      });
    });

    it('should return success response', async () => {
      prismaMock.user.findFirst.mockResolvedValue(mockUser as any);
      prismaMock.user.update.mockResolvedValue(mockUser as any);

      const req = createMockRequest({
        token: 'valid_token',
        password: 'NewPass123',
      });
      const response = await ResetPasswordPOST(req as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toBe('Password reset successfully');
    });
  });

  describe('Security Edge Cases', () => {
    it('should not allow token reuse after successful reset', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'rahul@test.com',
        password: 'old_password',
        role: 'STUDENT',
        resetToken: 'hashed_token',
        resetTokenExpiry: new Date(Date.now() + 3600000),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // First reset succeeds
      prismaMock.user.findFirst.mockResolvedValueOnce(mockUser as any);
      prismaMock.user.update.mockResolvedValueOnce({
        ...mockUser,
        resetToken: null,
        resetTokenExpiry: null,
      } as any);

      const req1 = createMockRequest({
        token: 'valid_token',
        password: 'NewPass123',
      });
      const response1 = await ResetPasswordPOST(req1 as any);
      expect(response1.status).toBe(200);

      // Second attempt with same token should fail
      prismaMock.user.findFirst.mockResolvedValueOnce(null);

      const req2 = createMockRequest({
        token: 'valid_token',
        password: 'AnotherPass456',
      });
      const response2 = await ResetPasswordPOST(req2 as any);
      const data2 = await response2.json();

      expect(response2.status).toBe(400);
      expect(data2.error).toBe('Invalid or expired reset token');
    });

    it('should validate token expiry at exact boundary', async () => {
      const now = new Date();
      const mockUser = {
        id: 'user-1',
        email: 'rahul@test.com',
        resetToken: 'hashed_token',
        resetTokenExpiry: new Date(now.getTime() - 1000), // 1 second ago
        password: 'old_password',
        role: 'STUDENT',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prismaMock.user.findFirst.mockResolvedValue(null); // Expired

      const req = createMockRequest({
        token: 'valid_token',
        password: 'NewPass123',
      });
      const response = await ResetPasswordPOST(req as any);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid or expired reset token');
    });
  });

  describe('Password Strength Edge Cases', () => {
    it('should accept minimum valid password (8 chars, mixed case, number)', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'rahul@test.com',
        resetToken: 'hashed_token',
        resetTokenExpiry: new Date(Date.now() + 3600000),
        password: 'old_password',
        role: 'STUDENT',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prismaMock.user.findFirst.mockResolvedValue(mockUser as any);
      prismaMock.user.update.mockResolvedValue(mockUser as any);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed');

      const req = createMockRequest({
        token: 'valid_token',
        password: 'Pass123a', // Exactly 8 chars
      });
      const response = await ResetPasswordPOST(req as any);

      expect(response.status).toBe(200);
    });

    it('should accept strong password with special characters', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'rahul@test.com',
        resetToken: 'hashed_token',
        resetTokenExpiry: new Date(Date.now() + 3600000),
        password: 'old_password',
        role: 'STUDENT',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prismaMock.user.findFirst.mockResolvedValue(mockUser as any);
      prismaMock.user.update.mockResolvedValue(mockUser as any);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed');

      const req = createMockRequest({
        token: 'valid_token',
        password: 'StrongP@ss123!',
      });
      const response = await ResetPasswordPOST(req as any);

      expect(response.status).toBe(200);
    });
  });
});
