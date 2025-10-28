# 🧪 Complete Testing Guide - CampusConnect

This guide walks you through testing every feature of the platform.

---

## 🎯 Testing Overview

**What to Test:**
1. ✅ Admin Portal (Student Management, Company Management, Drive Management)
2. ✅ Student Portal (Browse, Apply, Track)
3. ✅ Authentication & Authorization
4. ✅ Data Flow (CSV Import, Applications, Shortlists)

**Estimated Testing Time:** 30-45 minutes

---

## 🚀 Before You Start

1. **Start the server:**
   ```bash
   npm run dev
   ```

2. **Open browser:**
   ```
   http://localhost:3000
   ```

3. **Have these ready:**
   - Excel/Sheets for CSV files
   - Test email addresses
   - Sample company data

---

# PART 1: ADMIN PORTAL TESTING

## Test 1: Admin Login ✅

**Steps:**
1. Go to http://localhost:3000
2. Enter credentials:
   - Email: `admin@bmsce.ac.in`
   - Password: `admin123`
3. Click "Sign In"

**Expected Result:**
- ✅ Redirects to `/admin/dashboard`
- ✅ Shows navbar with "CampusConnect Admin"
- ✅ Displays 5 stat cards (Students, Active Drives, Companies, Applications, Placement %)
- ✅ Shows "Recent Applications" and "Upcoming Drives" widgets

**Screenshot What You See:**
- [ ] Stats showing real numbers
- [ ] Navigation menu with 5 links
- [ ] Logout button visible

---

## Test 2: Student Management - View List ✅

**Steps:**
1. Click "Students" in navbar
2. Observe the table

**Expected Result:**
- ✅ Table with columns: Roll No, Name, Email, Branch, CGPA, Applications, Offers, Status
- ✅ Search bar at top
- ✅ Branch filter dropdown
- ✅ Pagination if >50 students
- ✅ "Import Students" button visible

**Test Filters:**
1. Type "CSE" in branch filter → Should show only CSE students
2. Type name in search → Should filter results
3. Clear filters → Should show all students

---

## Test 3: Student Import via CSV ✅

**Steps:**

### Step 3.1: Download Template
1. Go to `/admin/students/import`
2. Click "Download CSV Template"
3. Open the downloaded file

**Expected:**
- ✅ File named `student_import_template.csv`
- ✅ Headers: rollNo, firstName, lastName, email, branch, cgpa, backlogs

### Step 3.2: Fill Template
Add these rows to the CSV:

```csv
rollNo,firstName,lastName,email,branch,cgpa,backlogs
1BM21CS001,Raj,Kumar,raj.kumar@test.com,CSE,8.5,0
1BM21CS002,Priya,Sharma,priya.sharma@test.com,CSE,9.2,0
1BM21IT001,Arjun,Patel,arjun.patel@test.com,IT,7.8,1
1BM21ECE001,Sneha,Reddy,sneha.reddy@test.com,ECE,8.9,0
1BM21MECH001,Vikram,Singh,vikram.singh@test.com,MECH,7.5,2
```

Save as `test_students.csv`

### Step 3.3: Upload
1. On `/admin/students/import` page
2. Click "Choose File" and select `test_students.csv`
3. Click "Upload CSV"

**Expected Result:**
- ✅ Shows "Importing..." spinner
- ✅ After 2-3 seconds, shows results:
  - Imported: 5
  - Failed: 0
  - Errors: (none)
- ✅ "View Students" button appears

### Step 3.4: Verify
1. Click "View Students" or go to `/admin/students`
2. Search for "Raj"

**Expected:**
- ✅ Raj Kumar appears in table
- ✅ Roll No: 1BM21CS001
- ✅ CGPA: 8.5
- ✅ Status: Inactive (red badge) - because they haven't set password yet

---

## Test 4: Company Management ✅

### Step 4.1: View Companies
1. Click "Companies" in navbar
2. Observe the grid layout

**Expected:**
- ✅ Cards in 3-column grid
- ✅ Each card shows: Logo/Initial, Company name, Sector, Tier badge, Drive count
- ✅ Edit and Delete buttons on each card
- ✅ "+ Add Company" button at top right

### Step 4.2: Create Company
1. Click "+ Add Company"
2. Modal opens
3. Fill form:
   - Name: `Flipkart`
   - Sector: `E-Commerce`
   - Tier: `Dream`
   - Logo URL: `https://logo.clearbit.com/flipkart.com`
   - Website: `https://www.flipkart.com`
4. Click "Save"

**Expected:**
- ✅ Modal closes
- ✅ New card appears for Flipkart
- ✅ Logo loads (if URL is valid)
- ✅ Tier badge shows "Dream" in purple

### Step 4.3: Edit Company
1. Click "Edit" on Flipkart card
2. Change Tier to `Super Dream`
3. Click "Save"

**Expected:**
- ✅ Modal closes
- ✅ Tier badge updates to "Super Dream" in blue

### Step 4.4: Delete Company (Test Protection)
1. Click "Delete" on any company that has drives
2. Confirm deletion

**Expected:**
- ✅ Error alert: "Cannot delete company with existing drives"
- ✅ Company NOT deleted

1. Click "Delete" on Flipkart (no drives yet)
2. Confirm

**Expected:**
- ✅ Flipkart card disappears
- ✅ Success confirmation

---

## Test 5: Drive Management - Create Drive ✅

### Step 5.1: Navigate to Create Drive
1. Click "Drives" in navbar
2. Click "+ Create Drive" button
3. Or go directly to `/admin/drives/new`

**Expected:**
- ✅ Long form with multiple sections
- ✅ Company dropdown populated
- ✅ All fields visible

### Step 5.2: Fill Drive Form

**Company Information:**
- Company: Select "Google" (or any available)

**Job Details:**
- Drive Title: `Software Engineer Intern - Summer 2025`
- Role: `Software Development Intern`
- Job Description:
  ```
  We're looking for talented interns to join our engineering team.

  Responsibilities:
  - Build scalable web applications
  - Work with senior engineers
  - Contribute to real products

  Requirements:
  - Strong coding skills in Java/Python/C++
  - Data structures and algorithms
  - Problem-solving mindset
  ```
- CTC (LPA): `12.5`
- Location: `Bangalore, Hyderabad`
- CTC Breakup: `Base: 10L, Bonus: 2L, Stocks: 0.5L`
- Bond Details: `No bond`
- Tech Stack: `Java, Python, Kubernetes, React`

**Eligibility Criteria:**
- Minimum CGPA: `7.0`
- Max Backlogs Allowed: `0`
- Allowed Branches: Check `CSE`, `IT`, `ECE`

**Registration Period:**
- Start Date & Time: (Tomorrow, 9:00 AM)
- End Date & Time: (7 days from now, 11:59 PM)

### Step 5.3: Submit
1. Click "Create Drive"

**Expected:**
- ✅ Shows "Creating..." on button
- ✅ Redirects to `/admin/drives`
- ✅ New drive appears in table

---

## Test 6: Drive Management - View List ✅

**On `/admin/drives` page:**

**Expected Layout:**
- ✅ Table with columns: Company, Role, CTC, Eligibility, Registration, Applications, Status, Actions
- ✅ Search bar
- ✅ Status filter (All/Active/Inactive)
- ✅ Each drive shows:
  - Company logo
  - Drive title as subtitle
  - CTC in ₹X LPA format
  - Eligibility (CGPA, Backlogs, Branches)
  - Registration dates with "Open Now" or "Closed" badge
  - Application count
  - Active/Inactive toggle button
  - "View Details" link

**Test Features:**
1. Search for "Software" → Should filter to matching drives
2. Filter by "Active" → Should show only active drives
3. Click Active/Inactive toggle → Should change status immediately

---

## Test 7: Drive Management - View Details & Applications ✅

### Step 7.1: Open Drive Detail
1. Click "View Details" on any drive
2. URL should be `/admin/drives/[id]`

**Expected:**
- ✅ Drive header with company logo, name, title
- ✅ Complete job description
- ✅ CTC breakdown, bond details, tech stack tags
- ✅ Eligibility criteria
- ✅ Registration period dates

### Step 7.2: View Stats
**Expected 5 stat cards:**
- ✅ Total Applications
- ✅ Shortlisted count
- ✅ Test Cleared count
- ✅ Interview Cleared count
- ✅ Offers count

### Step 7.3: Applications Table
**Expected:**
- ✅ Table with: Roll No, Name, Branch, CGPA, Backlogs, Applied On, Status, Remarks
- ✅ Status filter dropdown
- ✅ Branch filter dropdown
- ✅ Color-coded status badges
- ✅ If no applications: Shows empty state with message

---

## Test 8: Shortlist Upload ✅

### Step 8.1: Prepare Shortlist CSV

On drive detail page:
1. Click "Upload Shortlist" button
2. Modal opens
3. Click "Download Template"
4. Open template

**Expected Template:**
```csv
rollNo,status,remarks
1BM20CS001,SHORTLISTED,Good performance
1BM20CS002,REJECTED,Did not meet criteria
```

### Step 8.2: Fill Shortlist Data

**Find students who applied** (check applications table first)

Example:
```csv
rollNo,status,remarks
1BM21CS001,SHORTLISTED,Excellent coding skills
1BM21CS002,SHORTLISTED,Strong algorithms knowledge
1BM21IT001,TEST_SCHEDULED,Scheduled for 15th Nov
1BM21ECE001,REJECTED,Below cutoff
```

**Valid Status Values:**
- APPLIED
- SHORTLISTED
- TEST_SCHEDULED
- TEST_CLEARED
- INTERVIEW_SCHEDULED
- INTERVIEW_CLEARED
- OFFER
- REJECTED
- WITHDRAWN

### Step 8.3: Upload Shortlist
1. Select the CSV file
2. Click "Upload"

**Expected Result:**
- ✅ Shows processing spinner
- ✅ Results appear:
  - Updated: X
  - Failed: Y
  - Notified: X
- ✅ If errors, shows list with roll number and error message
- ✅ Success message: "✓ All updates successful!"

### Step 8.4: Verify Updates
1. Close modal
2. Check applications table
3. Filter by "Shortlisted"

**Expected:**
- ✅ Status badges updated
- ✅ Remarks column shows your comments
- ✅ Stats cards updated (Shortlisted count increased)

---

## Test 9: Dashboard Stats ✅

1. Go back to `/admin/dashboard`

**Verify Stats:**
- ✅ Total Students: Should match number in database
- ✅ Active Drives: Should show drives with isActive=true
- ✅ Companies: Should match company count
- ✅ Applications: Total applications across all drives
- ✅ Placement %: Should be (students with OFFER status / total students) × 100

**Verify Widgets:**
- ✅ Recent Applications: Shows last 10 applications
- ✅ Upcoming Drives: Shows next 5 drives by registration end date
- ✅ Click on drive card → Should go to drive detail page

---

# PART 2: STUDENT PORTAL TESTING

## Test 10: Student Account Setup ✅

### Step 10.1: Get Invite Link
1. As admin, go to `/admin/students`
2. Find a student with "Inactive" status (e.g., Raj Kumar from CSV import)
3. Note their email: `raj.kumar@test.com`

### Step 10.2: Simulate Email Invite
Since emails aren't actually sent yet, we'll access the invite token directly:

1. Open Prisma Studio:
   ```bash
   npx prisma studio
   ```
2. Go to `User` table
3. Find user with email `raj.kumar@test.com`
4. Copy the `inviteToken` value (long random string)

### Step 10.3: Setup Password
1. In browser, go to:
   ```
   http://localhost:3000/setup-password?token=PASTE_INVITE_TOKEN_HERE
   ```
2. Fill form:
   - Name should auto-populate: "Raj Kumar"
   - Email should auto-populate: "raj.kumar@test.com"
   - Password: `student123`
   - Confirm Password: `student123`
3. Click "Set Password"

**Expected:**
- ✅ Shows success message
- ✅ Redirects to `/student/dashboard`
- ✅ Student is now logged in

---

## Test 11: Student Dashboard ✅

**On `/student/dashboard`:**

**Expected:**
- ✅ Welcome message with student name
- ✅ 3 stat cards:
  - Total Applications
  - Shortlisted (includes test cleared, interview cleared)
  - Offers
- ✅ "Upcoming Drives" section with drive cards
- ✅ Each drive shows:
  - Company logo
  - Company name + role
  - CTC
  - Registration deadline
  - Eligibility badge (Eligible/Not Eligible)
  - Application status (if already applied)

---

## Test 12: Browse Drives ✅

**Steps:**
1. Click "Companies" in student navbar
2. View drives list

**Expected:**
- ✅ Grid of drive cards (2 columns)
- ✅ Search bar at top
- ✅ Filters: CTC range, branches
- ✅ Each card shows:
  - Company logo
  - Company name
  - Role + CTC
  - Eligibility badge (✓ Eligible or ✗ Not Eligible)
  - Status badge (Open/Closed/Applied)
  - "View Details" button

**Test Filters:**
1. Search for company name → Should filter
2. Select branch → Should show relevant drives
3. Adjust CTC slider → Should filter by CTC

---

## Test 13: Apply to Drive ✅

### Step 13.1: View Drive Details
1. Click "View Details" on an ELIGIBLE drive
2. URL: `/student/companies/[id]`

**Expected:**
- ✅ Full drive information displayed
- ✅ Job description
- ✅ Eligibility requirements
- ✅ Your eligibility status shown clearly
- ✅ If eligible: "Apply Now" button enabled
- ✅ If not eligible: Button disabled with reasons

### Step 13.2: Apply
1. Click "Apply Now"
2. Confirmation dialog may appear

**Expected:**
- ✅ Button shows "Applying..."
- ✅ Success message appears
- ✅ Button changes to "Applied ✓"
- ✅ Button becomes disabled

### Step 13.3: Verify Application
1. Go to `/student/applications`

**Expected:**
- ✅ New application appears in list
- ✅ Shows: Company, Role, Applied Date, Status
- ✅ Status badge shows "APPLIED" (blue)

---

## Test 14: Track Application Status ✅

**On `/student/applications` page:**

**Expected Layout:**
- ✅ Table with all your applications
- ✅ Columns: Company, Role, Applied On, Status, CTC, Next Steps
- ✅ Color-coded status badges
- ✅ If no applications: Empty state message

**Test Status Colors:**
- APPLIED → Blue
- SHORTLISTED → Yellow
- TEST_SCHEDULED → Purple
- TEST_CLEARED → Indigo
- INTERVIEW_SCHEDULED → Orange
- INTERVIEW_CLEARED → Teal
- OFFER → Green
- REJECTED → Red
- WITHDRAWN → Gray

**After admin uploads shortlist (from Test 8):**
1. Refresh `/student/applications`
2. Status should update automatically
3. Remarks should be visible (if admin added any)

---

## Test 15: Ineligibility Scenarios ✅

### Test 15.1: Low CGPA
1. As admin, create a drive with minCgpa: 9.0
2. As student with CGPA 8.5, try to view that drive

**Expected:**
- ✅ Drive shows "✗ Not Eligible" badge
- ✅ On detail page: "Apply Now" button disabled
- ✅ Shows reason: "CGPA below minimum (need 9.0, have 8.5)"

### Test 15.2: Too Many Backlogs
1. Create drive with maxBacklogs: 0
2. Student with backlogs > 0 views drive

**Expected:**
- ✅ "✗ Not Eligible" badge
- ✅ Reason: "Too many backlogs (max 0, have 2)"

### Test 15.3: Branch Not Allowed
1. Create drive for CSE/IT only
2. ECE student views drive

**Expected:**
- ✅ "✗ Not Eligible" badge
- ✅ Reason: "Branch not allowed (only CSE, IT allowed)"

---

# PART 3: AUTHENTICATION & SECURITY TESTING

## Test 16: Route Protection ✅

### Test 16.1: Unauthenticated Access
1. Logout (if logged in)
2. Try to access:
   - http://localhost:3000/student/dashboard
   - http://localhost:3000/admin/dashboard

**Expected:**
- ✅ Both redirect to `/login`

### Test 16.2: Role-Based Access
1. Login as student
2. Try to access: http://localhost:3000/admin/students

**Expected:**
- ✅ Redirects to `/unauthorized` or `/student/dashboard`

1. Login as admin
2. Try to access: http://localhost:3000/student/dashboard

**Expected:**
- ✅ Redirects to `/unauthorized` or `/admin/dashboard`

---

## Test 17: Duplicate Prevention ✅

### Test 17.1: Duplicate Student Import
1. As admin, try to import the same student twice (same email)

**Expected:**
- ✅ Error: "Email already exists"
- ✅ Shows in failed count
- ✅ Other students in CSV still imported

### Test 17.2: Duplicate Application
1. As student, apply to a drive
2. Try to apply again

**Expected:**
- ✅ Button disabled/shows "Applied ✓"
- ✅ If API called directly: Error "ALREADY_APPLIED"

---

# PART 4: DATA INTEGRITY TESTING

## Test 18: Pagination ✅

1. Import 60+ students via CSV
2. Go to `/admin/students`

**Expected:**
- ✅ Shows first 50 students
- ✅ Pagination controls at bottom
- ✅ "Next" button enabled
- ✅ Click "Next" → Shows next 10 students
- ✅ "Previous" button now enabled

---

## Test 19: Search & Filters ✅

### On `/admin/students`:
1. Search for "Raj" → Shows matching students
2. Filter by "CSE" → Shows only CSE students
3. Combine search + filter → Shows CSE students named Raj
4. Clear filters → Shows all students

### On `/admin/drives`:
1. Search for company name → Filters drives
2. Filter by "Active" → Shows only active
3. Search + filter → Combined results

---

## Test 20: Responsive Design (Optional) ✅

1. Resize browser window
2. Test mobile view (press F12, click device toolbar)

**Expected:**
- ✅ Navigation collapses to hamburger (if implemented)
- ✅ Tables become scrollable
- ✅ Cards stack vertically
- ✅ Forms remain usable

---

# 🎯 TESTING CHECKLIST

Copy this and check off as you test:

## Admin Portal
- [ ] Admin login works
- [ ] Dashboard shows real stats
- [ ] Can view student list
- [ ] Can search/filter students
- [ ] CSV import works (5 students imported)
- [ ] Can create company
- [ ] Can edit company
- [ ] Can delete company (with protection)
- [ ] Can create drive with all fields
- [ ] Can view drive list
- [ ] Can search/filter drives
- [ ] Can view drive details
- [ ] Can see applications table
- [ ] Can upload shortlist CSV
- [ ] Stats update after shortlist upload

## Student Portal
- [ ] Student can set password via invite link
- [ ] Student dashboard shows stats
- [ ] Can browse drives
- [ ] Can search/filter drives
- [ ] Can view drive details
- [ ] Can apply to eligible drive
- [ ] Cannot apply to ineligible drive (shows reasons)
- [ ] Can track applications
- [ ] Status updates reflect in student view
- [ ] Cannot apply twice to same drive

## Security
- [ ] Unauthenticated users redirected to login
- [ ] Students cannot access admin routes
- [ ] Admins cannot access student routes
- [ ] Duplicate imports handled gracefully

## Data Flow
- [ ] CSV import → Students created → Invites generated
- [ ] Drive creation → Appears in student view
- [ ] Student applies → Shows in admin applications table
- [ ] Admin uploads shortlist → Student sees status update

---

# 🐛 Found a Bug?

**Document it like this:**

```
BUG: [Short description]
Steps to reproduce:
1.
2.
3.

Expected:
Actual:
Screenshot: (if applicable)
```

---

# ✅ Testing Complete!

If all tests pass, your platform is **production-ready** for Phase 1 MVP! 🎉

**Next Steps:**
1. Fix any bugs found
2. Add more seed data
3. Deploy to Vercel
4. Get real user feedback

---

**Happy Testing! 🧪**
