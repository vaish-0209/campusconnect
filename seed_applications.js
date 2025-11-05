const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding applications data for demo...');

  // Get all drives and students
  const drives = await prisma.drive.findMany({
    include: { company: true }
  });
  const students = await prisma.student.findMany();

  if (drives.length === 0 || students.length === 0) {
    console.log('❌ No drives or students found. Please seed them first.');
    return;
  }

  // Delete existing applications
  await prisma.application.deleteMany({});

  const statuses = ['APPLIED', 'SHORTLISTED', 'TEST_SCHEDULED', 'TEST_CLEARED', 'INTERVIEW_SCHEDULED', 'INTERVIEW_CLEARED', 'OFFER', 'REJECTED'];

  let totalApplications = 0;

  for (const drive of drives) {
    // Determine number of applications based on CTC
    let numApplications;
    if (drive.ctc && drive.ctc > 15) {
      // Premium companies - fewer applications but high quality
      numApplications = Math.min(Math.floor(Math.random() * 15) + 10, students.length);
    } else if (drive.ctc && drive.ctc > 8) {
      // Product companies - moderate applications
      numApplications = Math.min(Math.floor(Math.random() * 30) + 20, students.length);
    } else {
      // Service companies - high volume
      numApplications = Math.min(Math.floor(Math.random() * 60) + 40, students.length);
    }

    // Randomly select students
    const shuffled = [...students].sort(() => 0.5 - Math.random());
    const selectedStudents = shuffled.slice(0, numApplications);

    for (const student of selectedStudents) {
      // Determine status based on student eligibility and drive tier
      let status;
      const isEligible =
        (!drive.minCgpa || student.cgpa >= drive.minCgpa) &&
        student.backlogs <= drive.maxBacklogs;

      if (!isEligible) {
        status = Math.random() > 0.3 ? 'REJECTED' : 'APPLIED';
      } else {
        // Eligible students progress through stages
        const rand = Math.random();
        if (drive.ctc && drive.ctc > 15) {
          // Premium - stricter
          if (rand < 0.10) status = 'OFFER';
          else if (rand < 0.20) status = 'INTERVIEW_CLEARED';
          else if (rand < 0.30) status = 'INTERVIEW_SCHEDULED';
          else if (rand < 0.45) status = 'TEST_CLEARED';
          else if (rand < 0.60) status = 'TEST_SCHEDULED';
          else if (rand < 0.75) status = 'SHORTLISTED';
          else if (rand < 0.90) status = 'APPLIED';
          else status = 'REJECTED';
        } else if (drive.ctc && drive.ctc > 8) {
          // Product - moderate
          if (rand < 0.15) status = 'OFFER';
          else if (rand < 0.25) status = 'INTERVIEW_CLEARED';
          else if (rand < 0.35) status = 'INTERVIEW_SCHEDULED';
          else if (rand < 0.50) status = 'TEST_CLEARED';
          else if (rand < 0.65) status = 'TEST_SCHEDULED';
          else if (rand < 0.80) status = 'SHORTLISTED';
          else if (rand < 0.95) status = 'APPLIED';
          else status = 'REJECTED';
        } else {
          // Service - easier
          if (rand < 0.20) status = 'OFFER';
          else if (rand < 0.35) status = 'INTERVIEW_CLEARED';
          else if (rand < 0.45) status = 'INTERVIEW_SCHEDULED';
          else if (rand < 0.60) status = 'TEST_CLEARED';
          else if (rand < 0.75) status = 'TEST_SCHEDULED';
          else if (rand < 0.90) status = 'SHORTLISTED';
          else status = 'APPLIED';
        }
      }

      // Create application
      const appliedAt = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000); // Within last 30 days

      await prisma.application.create({
        data: {
          studentId: student.id,
          driveId: drive.id,
          status,
          appliedAt,
          remarks: status === 'REJECTED' ? 'Did not meet eligibility criteria' :
                   status === 'OFFER' ? 'Congratulations! Offer extended' :
                   status.includes('CLEARED') ? 'Performed well' :
                   null,
        },
      });

      totalApplications++;
    }

    const driveStats = await prisma.application.count({
      where: { driveId: drive.id }
    });

    const offers = await prisma.application.count({
      where: { driveId: drive.id, status: 'OFFER' }
    });

    console.log(`✅ ${drive.company.name} - ${drive.title}: ${driveStats} applications, ${offers} offers`);
  }

  console.log(`\n✨ Seeded ${totalApplications} applications across ${drives.length} drives!`);

  // Print summary statistics
  console.log('\n📊 Summary Statistics:');
  for (const status of statuses) {
    const count = await prisma.application.count({ where: { status } });
    console.log(`   ${status}: ${count}`);
  }
}

main()
  .catch((e) => {
    console.error('❌ Error seeding applications:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
