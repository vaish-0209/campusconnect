const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding events data for demo...');

  // Get all drives
  const drives = await prisma.drive.findMany({
    include: { company: true }
  });

  if (drives.length === 0) {
    console.log('❌ No drives found. Please seed drives first.');
    return;
  }

  // Delete existing events
  await prisma.event.deleteMany({});

  const now = new Date();
  let eventsCreated = 0;

  for (const drive of drives) {
    const companyName = drive.company.name;
    const events = [];

    // Pre-Placement Talk (PPT)
    const pptDate = new Date(now);
    pptDate.setDate(now.getDate() + Math.floor(Math.random() * 5) + 1);
    pptDate.setHours(14, 0, 0, 0);

    events.push({
      title: `${companyName} - Pre-Placement Talk`,
      description: `Join us for an interactive session with ${companyName} representatives. Learn about the company culture, growth opportunities, and the recruitment process. Q&A session included.`,
      type: 'PPT',
      startTime: pptDate,
      endTime: new Date(pptDate.getTime() + 2 * 60 * 60 * 1000), // 2 hours
      venue: 'Seminar Hall A',
      meetingLink: null,
      driveId: drive.id,
    });

    // Online Assessment
    const oaDate = new Date(pptDate);
    oaDate.setDate(pptDate.getDate() + 2);
    oaDate.setHours(10, 0, 0, 0);

    events.push({
      title: `${companyName} - Online Assessment`,
      description: `Online coding and aptitude test for ${drive.title}. Topics include: Data Structures, Algorithms, Problem Solving, Quantitative Aptitude, and Verbal Reasoning. Duration: 90 minutes.`,
      type: 'TEST',
      startTime: oaDate,
      endTime: new Date(oaDate.getTime() + 1.5 * 60 * 60 * 1000),
      venue: null,
      meetingLink: 'https://assessment.example.com/' + drive.id.substring(0, 8),
      driveId: drive.id,
    });

    // Technical Interview (for premium companies)
    if (drive.ctc && drive.ctc > 10) {
      const techDate = new Date(oaDate);
      techDate.setDate(oaDate.getDate() + 3);
      techDate.setHours(9, 0, 0, 0);

      events.push({
        title: `${companyName} - Technical Interview Round 1`,
        description: `Technical interview focusing on DSA, system design, and core CS fundamentals. Be prepared to solve coding problems on a whiteboard and discuss your projects in detail.`,
        type: 'INTERVIEW',
        startTime: techDate,
        endTime: new Date(techDate.getTime() + 6 * 60 * 60 * 1000), // Full day
        venue: 'Interview Rooms, Block C',
        meetingLink: null,
        driveId: drive.id,
      });

      const tech2Date = new Date(techDate);
      tech2Date.setDate(techDate.getDate() + 1);

      events.push({
        title: `${companyName} - Technical Interview Round 2`,
        description: `Advanced technical round covering system design, scalability, and domain-specific knowledge. Discussion on past projects and problem-solving approach.`,
        type: 'INTERVIEW',
        startTime: tech2Date,
        endTime: new Date(tech2Date.getTime() + 6 * 60 * 60 * 1000),
        venue: 'Interview Rooms, Block C',
        meetingLink: null,
        driveId: drive.id,
      });
    }

    // HR Interview
    const hrDate = new Date(oaDate);
    hrDate.setDate(oaDate.getDate() + (drive.ctc && drive.ctc > 10 ? 5 : 4));
    hrDate.setHours(10, 0, 0, 0);

    events.push({
      title: `${companyName} - HR Interview`,
      description: `Final HR round covering behavioral questions, salary negotiation, and cultural fit. Be prepared to discuss your strengths, weaknesses, and career goals.`,
      type: 'INTERVIEW',
      startTime: hrDate,
      endTime: new Date(hrDate.getTime() + 5 * 60 * 60 * 1000),
      venue: 'Placement Office',
      meetingLink: null,
      driveId: drive.id,
    });

    // Create all events for this drive
    for (const event of events) {
      await prisma.event.create({ data: event });
      eventsCreated++;
    }

    console.log(`✅ Created ${events.length} events for ${companyName} - ${drive.title}`);
  }

  console.log(`\n✨ Seeded ${eventsCreated} events across ${drives.length} drives!`);

  // Print summary
  const eventTypes = ['PPT', 'TEST', 'INTERVIEW', 'OTHER'];
  console.log('\n📊 Event Type Summary:');
  for (const type of eventTypes) {
    const count = await prisma.event.count({ where: { type } });
    console.log(`   ${type}: ${count}`);
  }
}

main()
  .catch((e) => {
    console.error('❌ Error seeding events:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
