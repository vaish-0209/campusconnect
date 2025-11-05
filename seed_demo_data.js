const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Starting to seed demo data...');

  // Get all students and drives
  const students = await prisma.student.findMany();
  const drives = await prisma.drive.findMany({
    include: { company: true }
  });

  if (students.length === 0 || drives.length === 0) {
    console.log('No students or drives found. Please seed them first.');
    return;
  }

  console.log(`Found ${students.length} students and ${drives.length} drives`);

  // Application statuses distribution
  const statuses = [
    { status: 'APPLIED', weight: 30 },
    { status: 'SHORTLISTED', weight: 20 },
    { status: 'TEST_CLEARED', weight: 15 },
    { status: 'INTERVIEW_SCHEDULED', weight: 10 },
    { status: 'INTERVIEW_CLEARED', weight: 8 },
    { status: 'OFFER', weight: 12 },
    { status: 'REJECTED', weight: 5 },
  ];

  // Create applications for students
  let applicationsCreated = 0;
  let offersCreated = 0;

  for (const student of students) {
    // Each student applies to 3-7 drives
    const numApplications = Math.floor(Math.random() * 5) + 3;
    const selectedDrives = drives
      .sort(() => Math.random() - 0.5)
      .slice(0, numApplications);

    for (const drive of selectedDrives) {
      // Check if application already exists
      const existing = await prisma.application.findFirst({
        where: {
          studentId: student.id,
          driveId: drive.id
        }
      });

      if (existing) {
        console.log(`Application already exists for ${student.rollNo} - ${drive.company.name}`);
        continue;
      }

      // Select random status based on weights
      const totalWeight = statuses.reduce((sum, s) => sum + s.weight, 0);
      let random = Math.random() * totalWeight;
      let selectedStatus = 'APPLIED';

      for (const s of statuses) {
        random -= s.weight;
        if (random <= 0) {
          selectedStatus = s.status;
          break;
        }
      }

      // Create application
      const appliedDate = new Date(drive.registrationStart);
      appliedDate.setDate(appliedDate.getDate() + Math.floor(Math.random() * 10));

      try {
        await prisma.application.create({
          data: {
            studentId: student.id,
            driveId: drive.id,
            status: selectedStatus,
            resumeUrl: student.resume,
            appliedAt: appliedDate,
            remarks: selectedStatus === 'OFFER'
              ? `Congratulations! Selected for ${drive.title} role at ${drive.company.name}`
              : selectedStatus === 'REJECTED'
              ? 'Thank you for your interest. We have proceeded with other candidates.'
              : selectedStatus === 'INTERVIEW_CLEARED'
              ? 'Cleared technical interview. HR round scheduled.'
              : null
          }
        });

        applicationsCreated++;

        if (selectedStatus === 'OFFER') {
          offersCreated++;
        }

        console.log(`✓ Created ${selectedStatus} application for ${student.rollNo} -> ${drive.company.name}`);
      } catch (error) {
        console.log(`! Skipping duplicate: ${student.rollNo} -> ${drive.company.name}`);
      }
    }
  }

  console.log(`\n✅ Successfully created ${applicationsCreated} applications`);
  console.log(`✅ Created ${offersCreated} OFFER applications`);

  // Display analytics
  const analytics = await prisma.application.groupBy({
    by: ['status'],
    _count: true
  });

  console.log('\nApplication Status Distribution:');
  analytics.forEach(({ status, _count }) => {
    console.log(`  ${status}: ${_count}`);
  });

  // Calculate placement rate
  const totalStudents = students.length;
  const placedStudents = await prisma.application.findMany({
    where: { status: 'OFFER' },
    distinct: ['studentId']
  });

  const placementRate = ((placedStudents.length / totalStudents) * 100).toFixed(2);
  console.log(`\n📊 Placement Rate: ${placementRate}% (${placedStudents.length}/${totalStudents} students placed)`);

  // Calculate average CTC
  const offersWithCtc = await prisma.application.findMany({
    where: { status: 'OFFER' },
    include: {
      drive: true
    }
  });

  const ctcValues = offersWithCtc
    .filter(app => app.drive.ctc)
    .map(app => app.drive.ctc);

  if (ctcValues.length > 0) {
    const avgCtc = (ctcValues.reduce((sum, ctc) => sum + ctc, 0) / ctcValues.length).toFixed(2);
    const maxCtc = Math.max(...ctcValues);
    console.log(`\n💰 Average CTC: ₹${avgCtc} LPA`);
    console.log(`💰 Highest CTC: ₹${maxCtc} LPA`);
  }
}

main()
  .catch((e) => {
    console.error('Error seeding demo data:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
