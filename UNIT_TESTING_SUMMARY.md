# Unit Testing Setup - Complete Guide

## ✅ What I've Set Up For You

### 1. Testing Framework Installed
```bash
npm install --save-dev jest @testing-library/react @testing-library/jest-dom jest-environment-jsdom ts-jest jest-mock-extended
```

### 2. Configuration Files Created
- ✅ `jest.config.js` - Jest configuration
- ✅ `jest.setup.js` - Test setup and global mocks
- ✅ `src/__tests__/utils/testUtils.ts` - Reusable test utilities
- ✅ `src/__tests__/api/students.test.ts` - Example student API tests (10 tests)
- ✅ `src/__tests__/api/events.test.ts` - Example events API tests (12 tests)

### 3. NPM Scripts Added to package.json
```json
"test": "jest",                          // Run all tests once
"test:watch": "jest --watch",            // Run tests in watch mode
"test:coverage": "jest --coverage",      // Run with coverage report
"test:ci": "jest --ci --coverage --maxWorkers=2"  // For CI/CD
```

---

## 🚀 How to Run Tests

### Basic Commands

```bash
# Run all tests
npm test

# Run tests in watch mode (reruns on file save)
npm run test:watch

# Run with coverage report
npm run test:coverage

# Run specific test file
npm test students.test.ts

# Run tests matching pattern
npm test --testNamePattern="should return 401"
```

---

## 📁 Test File Structure

```
src/
├── __tests__/
│   ├── utils/
│   │   └── testUtils.ts       # Shared mocks & helpers
│   ├── api/
│   │   ├── students.test.ts   # Student API tests (10 tests)
│   │   └── events.test.ts     # Events API tests (12 tests)
│   └── components/
│       └── [your component tests here]
```

---

## 📝 Example Tests Created

### Student API Tests (10 tests):
1. ✅ Returns 401 if not authenticated
2. ✅ Returns 401 if not admin
3. ✅ Returns 409 if email already exists
4. ✅ Returns 409 if roll number already exists
5. ✅ Successfully creates student with valid data
6. ✅ Returns 400 if CGPA is invalid
7. ✅ Returns 400 if backlogs is negative
8. ✅ Returns 400 if email is invalid
9. ✅ Returns 400 if required fields are missing

### Event API Tests (12 tests):
1. ✅ Returns 401 if not authenticated
2. ✅ Returns 400 if end time before start time
3. ✅ Returns 409 if event conflicts with existing
4. ✅ Successfully creates event with no conflicts
5. ✅ Detects exact time overlap
6. ✅ Detects partial overlap (starts during existing)
7. ✅ Detects partial overlap (ends during existing)
8. ✅ Detects complete encapsulation
9. ✅ Allows non-overlapping events
10. ✅ Returns 400 if event type is invalid

---

## 📖 Writing Your Own Tests

### Basic Template

```typescript
import { functionToTest } from '@/path/to/function';

describe('Feature Name', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should do something when condition', () => {
    // 1. ARRANGE - Setup
    const input = { /* test data */ };

    // 2. ACT - Execute
    const result = functionToTest(input);

    // 3. ASSERT - Verify
    expect(result).toBe(expected);
  });
});
```

### Testing API Routes

```typescript
import { POST } from '@/app/api/admin/students/add/route';
import { prismaMock, mockAdminSession } from '../utils/testUtils';
import { getServerSession } from 'next-auth';

jest.mock('next-auth');
jest.mock('@/lib/prisma', () => ({ prisma: prismaMock }));

describe('POST /api/admin/students/add', () => {
  it('should return 401 if unauthorized', async () => {
    (getServerSession as jest.Mock).mockResolvedValue(null);

    const req = createMockRequest({ rollNo: 'CS001' });
    const response = await POST(req as any);

    expect(response.status).toBe(401);
  });
});
```

---

## 🧪 What to Test

### Priority 1 - Critical Paths
- [ ] Authentication & Authorization
- [ ] Data validation (CGPA, backlogs, email)
- [ ] Duplicate detection (students, events)
- [ ] Conflict detection (event times)
- [ ] Business logic (eligibility checks)

### Priority 2 - Important Features
- [ ] API error handling
- [ ] Form validation
- [ ] Data transformations
- [ ] User permissions

### Priority 3 - UI Components
- [ ] Component rendering
- [ ] User interactions
- [ ] State management
- [ ] Conditional rendering

---

## 📊 Coverage Goals

Your project is configured for:
- **70% branch coverage**
- **70% function coverage**
- **70% line coverage**
- **70% statement coverage**

Tests will fail if coverage drops below these thresholds.

---

## 🔧 Available Test Utilities

Located in `src/__tests__/utils/testUtils.ts`:

### Mocks
- `prismaMock` - Mocked Prisma client
- `mockAdminSession` - Admin user session
- `mockStudentSession` - Student user session
- `mockStudent` - Sample student data
- `mockCompany` - Sample company data
- `mockDrive` - Sample drive data
- `mockEvent` - Sample event data

### Helpers
- `createMockRequest(body, params, searchParams)` - Mock Next.js request
- `parseResponse(response)` - Parse API response

---

## ✍️ Common Assertions

```typescript
// Equality
expect(value).toBe(4);
expect(object).toEqual({ name: 'Rahul' });

// Truthiness
expect(value).toBeTruthy();
expect(value).toBeFalsy();

// Numbers
expect(cgpa).toBeGreaterThan(7.0);
expect(cgpa).toBeLessThanOrEqual(10.0);

// Strings
expect(email).toMatch(/^.*@.*\.com$/);
expect(error).toContain('already exists');

// Arrays
expect(students).toHaveLength(10);

// Functions
expect(fn).toHaveBeenCalled();
expect(fn).toHaveBeenCalledWith('CS001');

// Async
await expect(promise).resolves.toBe(value);
await expect(promise).rejects.toThrow('Error');
```

---

## 🎯 Next Steps

1. **Run existing tests** to see them in action:
   ```bash
   npm test
   ```

2. **Add tests for your features**:
   - Copy the pattern from `students.test.ts` or `events.test.ts`
   - Test one feature at a time
   - Start with happy path, then add error cases

3. **Run tests in watch mode** while developing:
   ```bash
   npm run test:watch
   ```

4. **Check coverage** periodically:
   ```bash
   npm run test:coverage
   ```

---

## 📚 Resources

- [Jest Docs](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- Example tests in `src/__tests__/api/`

---

## 💡 Pro Tips

1. **Write tests before fixing bugs** - It helps verify the fix
2. **Test behavior, not implementation** - Focus on what, not how
3. **Use descriptive test names** - "should return 401 when user not authenticated"
4. **Mock external dependencies** - Database, APIs, third-party services
5. **Keep tests fast** - Unit tests should run in milliseconds
6. **One assertion per test** - Makes failures easier to debug

---

Happy Testing! 🧪✨
