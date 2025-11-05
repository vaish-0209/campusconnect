const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Starting to seed companies and drives...');

  // Get existing students for applications
  const students = await prisma.student.findMany({ take: 20 });

  // Create companies with detailed information
  const companies = [
    {
      name: 'Google',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg',
      sector: 'IT',
      website: 'https://careers.google.com',
      description: 'Leading technology company specializing in Internet-related services and products',
      packageRange: '18-45 LPA',
      eligibilityMinCGPA: 7.5,
      eligibilityMaxBacklogs: 0,
      eligibilityBranches: 'CSE, IT, ECE',
      hrContactName: 'Priya Sharma',
      hrContactEmail: 'priya.sharma@google.com',
      hrContactPhone: '+91 9876543210'
    },
    {
      name: 'Microsoft',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg',
      sector: 'IT',
      website: 'https://careers.microsoft.com',
      description: 'Multinational technology corporation producing software, electronics, and cloud services',
      packageRange: '16-42 LPA',
      eligibilityMinCGPA: 7.0,
      eligibilityMaxBacklogs: 0,
      eligibilityBranches: 'CSE, IT, ECE, EEE',
      hrContactName: 'Rahul Verma',
      hrContactEmail: 'rahul.verma@microsoft.com',
      hrContactPhone: '+91 9876543211'
    },
    {
      name: 'Amazon',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg',
      sector: 'IT',
      website: 'https://amazon.jobs',
      description: 'Global e-commerce and cloud computing leader',
      packageRange: '15-38 LPA',
      eligibilityMinCGPA: 7.0,
      eligibilityMaxBacklogs: 0,
      eligibilityBranches: 'CSE, IT, ECE',
      hrContactName: 'Anjali Reddy',
      hrContactEmail: 'anjali.reddy@amazon.com',
      hrContactPhone: '+91 9876543212'
    },
    {
      name: 'TCS',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/b/b1/Tata_Consultancy_Services_Logo.svg',
      sector: 'IT',
      website: 'https://www.tcs.com/careers',
      description: 'Leading global IT services, consulting and business solutions organization',
      packageRange: '3.6-7 LPA',
      eligibilityMinCGPA: 6.0,
      eligibilityMaxBacklogs: 2,
      eligibilityBranches: 'All branches',
      hrContactName: 'Suresh Kumar',
      hrContactEmail: 'suresh.kumar@tcs.com',
      hrContactPhone: '+91 9876543213'
    },
    {
      name: 'Infosys',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/9/95/Infosys_logo.svg',
      sector: 'IT',
      website: 'https://www.infosys.com/careers',
      description: 'Global leader in next-generation digital services and consulting',
      packageRange: '4.5-9 LPA',
      eligibilityMinCGPA: 6.5,
      eligibilityMaxBacklogs: 1,
      eligibilityBranches: 'CSE, IT, ECE, EEE, MECH',
      hrContactName: 'Lakshmi Iyer',
      hrContactEmail: 'lakshmi.iyer@infosys.com',
      hrContactPhone: '+91 9876543214'
    },
    {
      name: 'Wipro',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/a/a0/Wipro_Primary_Logo_Color_RGB.svg',
      sector: 'IT',
      website: 'https://careers.wipro.com',
      description: 'Leading global information technology, consulting and business process services',
      packageRange: '3.5-8 LPA',
      eligibilityMinCGPA: 6.0,
      eligibilityMaxBacklogs: 2,
      eligibilityBranches: 'All branches',
      hrContactName: 'Amit Patel',
      hrContactEmail: 'amit.patel@wipro.com',
      hrContactPhone: '+91 9876543215'
    },
    {
      name: 'Accenture',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/c/cd/Accenture.svg',
      sector: 'Consulting',
      website: 'https://www.accenture.com/careers',
      description: 'Global professional services company with leading capabilities in digital, cloud and security',
      packageRange: '4.5-8.5 LPA',
      eligibilityMinCGPA: 6.5,
      eligibilityMaxBacklogs: 1,
      eligibilityBranches: 'CSE, IT, ECE, EEE',
      hrContactName: 'Neha Singh',
      hrContactEmail: 'neha.singh@accenture.com',
      hrContactPhone: '+91 9876543216'
    },
    {
      name: 'Cognizant',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/6/67/Cognizant_logo_2022.svg',
      sector: 'IT',
      website: 'https://careers.cognizant.com',
      description: 'Professional services company helping organizations modernize technology',
      packageRange: '4-7.5 LPA',
      eligibilityMinCGPA: 6.0,
      eligibilityMaxBacklogs: 2,
      eligibilityBranches: 'CSE, IT, ECE, EEE',
      hrContactName: 'Deepak Joshi',
      hrContactEmail: 'deepak.joshi@cognizant.com',
      hrContactPhone: '+91 9876543217'
    }
  ];

  for (const companyData of companies) {
    console.log(`Creating company: ${companyData.name}`);

    const company = await prisma.company.upsert({
      where: { name: companyData.name },
      update: companyData,
      create: companyData
    });

    // Create 1-3 drives for each company
    const drivesData = getDrivesForCompany(company);

    for (const driveData of drivesData) {
      console.log(`  Creating drive: ${driveData.title}`);

      const drive = await prisma.drive.create({
        data: {
          ...driveData,
          companyId: company.id
        }
      });

      // Add some applications for demo
      if (students.length > 0) {
        const numApplications = Math.floor(Math.random() * 10) + 5;
        const selectedStudents = students.slice(0, numApplications);

        for (const student of selectedStudents) {
          const statuses = ['APPLIED', 'SHORTLISTED', 'TEST_CLEARED', 'INTERVIEW_SCHEDULED', 'OFFER', 'REJECTED'];
          const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];

          try {
            await prisma.application.create({
              data: {
                studentId: student.id,
                driveId: drive.id,
                status: randomStatus
              }
            });
          } catch (e) {
            // Skip if duplicate
          }
        }
      }
    }
  }

  console.log('Seeding completed successfully!');
}

function getDrivesForCompany(company) {
  const drives = [];
  const now = new Date();
  const futureDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  if (company.name === 'Google') {
    drives.push({
      title: 'Software Engineering Intern - Summer 2025',
      role: 'Software Engineer Intern',
      jobDescription: 'Work on cutting-edge projects in Search, Ads, Android, or Cloud. Collaborate with talented engineers to build products used by billions.',
      ctc: 18,
      ctcBreakup: 'Base: 15 LPA, Bonus: 3 LPA',
      location: 'Bangalore, Hyderabad',
      bond: 'None',
      techStack: 'Java, Python, C++, Go, Kubernetes, TensorFlow',
      positionsAvailable: 25,
      minCgpa: 7.5,
      maxBacklogs: 0,
      allowedBranches: 'CSE, IT',
      registrationStart: now,
      registrationEnd: futureDate,
      isActive: true
    });
    drives.push({
      title: 'Full Stack Developer - 2025',
      role: 'Software Engineer',
      jobDescription: 'Build and maintain scalable web applications. Work with modern frameworks and cloud technologies.',
      ctc: 28,
      ctcBreakup: 'Base: 22 LPA, Bonus: 4 LPA, Stock: 2 LPA',
      location: 'Bangalore',
      bond: 'None',
      techStack: 'React, Node.js, Go, GCP, Kubernetes',
      positionsAvailable: 15,
      minCgpa: 8.0,
      maxBacklogs: 0,
      allowedBranches: 'CSE, IT, ECE',
      registrationStart: now,
      registrationEnd: futureDate,
      isActive: true
    });
  }

  if (company.name === 'Microsoft') {
    drives.push({
      title: 'Software Engineering - Azure Cloud',
      role: 'Software Engineer',
      jobDescription: 'Design and develop cloud solutions for Azure. Work on distributed systems at scale.',
      ctc: 24,
      ctcBreakup: 'Base: 18 LPA, Bonus: 4 LPA, Stock: 2 LPA',
      location: 'Hyderabad, Bangalore',
      bond: 'None',
      techStack: 'C#, .NET, Azure, Kubernetes, Microservices',
      positionsAvailable: 20,
      minCgpa: 7.5,
      maxBacklogs: 0,
      allowedBranches: 'CSE, IT, ECE',
      registrationStart: now,
      registrationEnd: futureDate,
      isActive: true
    });
  }

  if (company.name === 'Amazon') {
    drives.push({
      title: 'SDE-1 - AWS Services',
      role: 'Software Development Engineer',
      jobDescription: 'Build and scale AWS services used by millions of customers worldwide.',
      ctc: 21,
      ctcBreakup: 'Base: 16 LPA, Joining Bonus: 3 LPA, Stock: 2 LPA',
      location: 'Bangalore, Hyderabad',
      bond: 'None',
      techStack: 'Java, Python, AWS, DynamoDB, Lambda',
      positionsAvailable: 30,
      minCgpa: 7.0,
      maxBacklogs: 0,
      allowedBranches: 'CSE, IT, ECE',
      registrationStart: now,
      registrationEnd: futureDate,
      isActive: true
    });
  }

  if (company.name === 'TCS') {
    drives.push({
      title: 'TCS Digital - Full Stack Developer',
      role: 'System Engineer',
      jobDescription: 'Work on enterprise applications and digital transformation projects for global clients.',
      ctc: 7,
      ctcBreakup: 'Base: 7 LPA',
      location: 'Multiple locations',
      bond: '2 years',
      techStack: 'Java, Spring Boot, Angular, MySQL',
      positionsAvailable: 100,
      minCgpa: 6.0,
      maxBacklogs: 2,
      allowedBranches: 'All branches',
      registrationStart: now,
      registrationEnd: futureDate,
      isActive: true
    });
  }

  if (company.name === 'Infosys') {
    drives.push({
      title: 'Infosys Power Programmer',
      role: 'Software Engineer',
      jobDescription: 'Join our elite program for top performers. Work on cutting-edge technology projects.',
      ctc: 9,
      ctcBreakup: 'Base: 9 LPA',
      location: 'Bangalore, Mysore, Pune',
      bond: '18 months',
      techStack: 'Java, Python, Cloud, AI/ML',
      positionsAvailable: 50,
      minCgpa: 7.5,
      maxBacklogs: 0,
      allowedBranches: 'CSE, IT, ECE',
      registrationStart: now,
      registrationEnd: futureDate,
      isActive: true
    });
    drives.push({
      title: 'Systems Engineer - 2025',
      role: 'Systems Engineer',
      jobDescription: 'Work on diverse projects across technologies and domains.',
      ctc: 4.5,
      ctcBreakup: 'Base: 4.5 LPA',
      location: 'Multiple locations',
      bond: '18 months',
      techStack: 'Java, Python, SQL, Web Technologies',
      positionsAvailable: 80,
      minCgpa: 6.5,
      maxBacklogs: 1,
      allowedBranches: 'CSE, IT, ECE, EEE, MECH',
      registrationStart: now,
      registrationEnd: futureDate,
      isActive: true
    });
  }

  if (company.name === 'Wipro') {
    drives.push({
      title: 'Project Engineer - WILP',
      role: 'Project Engineer',
      jobDescription: 'Work on client projects while pursuing M.Tech from BITS Pilani.',
      ctc: 3.5,
      ctcBreakup: 'Base: 3.5 LPA + M.Tech sponsorship',
      location: 'Bangalore, Hyderabad, Pune',
      bond: '2 years',
      techStack: 'Java, Python, Cloud, DevOps',
      positionsAvailable: 60,
      minCgpa: 6.0,
      maxBacklogs: 2,
      allowedBranches: 'All branches',
      registrationStart: now,
      registrationEnd: futureDate,
      isActive: true
    });
  }

  if (company.name === 'Accenture') {
    drives.push({
      title: 'Advanced App Engineering Analyst',
      role: 'Application Development Analyst',
      jobDescription: 'Design, build and configure applications to meet business requirements.',
      ctc: 4.5,
      ctcBreakup: 'Base: 4.5 LPA',
      location: 'Bangalore, Hyderabad, Pune',
      bond: 'None',
      techStack: 'Java, .NET, Cloud, Salesforce',
      positionsAvailable: 70,
      minCgpa: 6.5,
      maxBacklogs: 1,
      allowedBranches: 'CSE, IT, ECE, EEE',
      registrationStart: now,
      registrationEnd: futureDate,
      isActive: true
    });
  }

  if (company.name === 'Cognizant') {
    drives.push({
      title: 'GenC - Programmer Analyst',
      role: 'Programmer Analyst',
      jobDescription: 'Develop and maintain software solutions for global clients.',
      ctc: 4,
      ctcBreakup: 'Base: 4 LPA',
      location: 'Chennai, Bangalore, Hyderabad',
      bond: '2 years',
      techStack: 'Java, Python, SQL, Cloud',
      positionsAvailable: 90,
      minCgpa: 6.0,
      maxBacklogs: 2,
      allowedBranches: 'CSE, IT, ECE, EEE',
      registrationStart: now,
      registrationEnd: futureDate,
      isActive: true
    });
  }

  return drives;
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
