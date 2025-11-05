const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Starting to seed events for demo...');

  // Delete existing events first
  await prisma.event.deleteMany({});
  console.log('Cleared existing events');

  // Get all drives
  const drives = await prisma.drive.findMany({
    include: { company: true }
  });

  if (drives.length === 0) {
    console.log('No drives found. Please seed drives first.');
    return;
  }

  // Create realistic events for each drive - spread across November 2025
  const events = [];
  const november2025 = new Date('2025-11-01');

  for (let i = 0; i < drives.length; i++) {
    const drive = drives[i];

    // Spread events throughout November (days 5-28)
    const baseDay = 5 + Math.floor((i / drives.length) * 23);

    // PPT - Pre-Placement Talk
    const pptDate = new Date(november2025);
    pptDate.setDate(baseDay);
    pptDate.setHours(14, 0, 0, 0); // 2:00 PM

    const pptEnd = new Date(pptDate);
    pptEnd.setMinutes(pptEnd.getMinutes() + 120); // 2 hours

    events.push({
      driveId: drive.id,
      type: 'PPT',
      title: `${drive.company.name} - Pre-Placement Talk`,
      description: `Pre-placement presentation by ${drive.company.name}. Learn about company culture, job roles, career growth opportunities, and the recruitment process.`,
      venue: Math.random() > 0.5 ? 'Auditorium' : 'Seminar Hall',
      meetingLink: Math.random() > 0.7 ? 'https://meet.google.com/xyz-abc-def' : null,
      startTime: pptDate,
      endTime: pptEnd,
    });

    // Online Test (2-4 days after PPT)
    const testDate = new Date(pptDate);
    testDate.setDate(testDate.getDate() + 2 + Math.floor(Math.random() * 3));
    testDate.setHours(10, 0, 0, 0); // 10:00 AM

    const testEnd = new Date(testDate);
    testEnd.setMinutes(testEnd.getMinutes() + 150); // 2.5 hours

    events.push({
      driveId: drive.id,
      type: 'TEST',
      title: `${drive.company.name} - Online Assessment`,
      description: `Online test covering aptitude, technical knowledge, and problem-solving. Topics include DSA, DBMS, OS, and coding questions.`,
      venue: 'Online',
      meetingLink: 'https://assessment.platform.com',
      startTime: testDate,
      endTime: testEnd,
    });

    // Interview (5-7 days after test)
    const interviewDate = new Date(testDate);
    interviewDate.setDate(interviewDate.getDate() + 5 + Math.floor(Math.random() * 3));

    // Make sure we don't go past November
    if (interviewDate.getMonth() > 10) {
      interviewDate.setDate(28);
      interviewDate.setMonth(10); // November
    }

    interviewDate.setHours(9, 0, 0, 0); // 9:00 AM

    const interviewEnd = new Date(interviewDate);
    interviewEnd.setHours(17, 0, 0, 0); // 5:00 PM

    const isOnline = Math.random() > 0.6;

    events.push({
      driveId: drive.id,
      type: 'INTERVIEW',
      title: `${drive.company.name} - Technical Interview`,
      description: `Technical and HR interviews for shortlisted candidates. Be prepared to discuss your projects, technical skills, and problem-solving approach.`,
      venue: isOnline ? 'Online' : 'Interview Rooms - 2nd Floor',
      meetingLink: isOnline ? 'https://meet.google.com/interview-link' : null,
      startTime: interviewDate,
      endTime: interviewEnd,
    });
  }

  // Create all events
  console.log(`Creating ${events.length} events...`);

  for (const event of events) {
    await prisma.event.create({
      data: event
    });
  }

  console.log(`✅ Successfully created ${events.length} events`);

  // Display summary
  const eventCounts = await prisma.event.groupBy({
    by: ['type'],
    _count: true
  });

  console.log('\nEvent Summary:');
  eventCounts.forEach(({ type, _count }) => {
    console.log(`  ${type}: ${_count}`);
  });
}

main()
  .catch((e) => {
    console.error('Error seeding events:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
