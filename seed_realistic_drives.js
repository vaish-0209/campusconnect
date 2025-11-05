const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding realistic placement drives...');

  // Get all companies
  const companies = await prisma.company.findMany();

  if (companies.length === 0) {
    console.log('❌ No companies found. Please seed companies first.');
    return;
  }

  const google = companies.find(c => c.name === 'Google');
  const microsoft = companies.find(c => c.name === 'Microsoft');
  const amazon = companies.find(c => c.name === 'Amazon');
  const tcs = companies.find(c => c.name === 'TCS');
  const infosys = companies.find(c => c.name === 'Infosys');
  const wipro = companies.find(c => c.name === 'Wipro');
  const accenture = companies.find(c => c.name === 'Accenture');
  const cognizant = companies.find(c => c.name === 'Cognizant');

  // Delete existing drives
  await prisma.application.deleteMany({});
  await prisma.drive.deleteMany({});

  const now = new Date();
  const futureDate = new Date();
  futureDate.setDate(now.getDate() + 30);

  const drives = [
    // Google - Premium roles
    {
      companyId: google?.id,
      title: 'Software Engineer - Backend',
      role: 'SDE-2',
      jobDescription: `As a Backend Software Engineer at Google, you will work on critical projects that power Google Search and other core products.

Responsibilities:
• Design and implement scalable backend systems handling millions of requests
• Write clean, maintainable code and participate in code reviews
• Optimize application performance and troubleshoot production issues
• Collaborate with cross-functional teams and contribute to architectural decisions
• Mentor junior engineers and drive technical excellence

Requirements:
• Strong knowledge of data structures, algorithms, and software design
• Experience with distributed systems and cloud technologies
• Proficiency in Go, Python, Java, or C++
• Understanding of system design and scalability principles`,
      ctc: 28,
      ctcBreakup: 'Base: 18 LPA, Bonus: 5 LPA, Stocks: 5 LPA',
      location: 'Bangalore',
      bond: null,
      techStack: 'Go, Python, Kubernetes, GCP',
      positionsAvailable: 15,
      minCgpa: 8.0,
      maxBacklogs: 0,
      allowedBranches: 'CSE, IT',
      registrationStart: now,
      registrationEnd: futureDate,
      isActive: true,
    },
    {
      companyId: google?.id,
      title: 'SDE Intern - Summer 2025',
      role: 'SDE Intern',
      jobDescription: 'Work on cutting-edge projects in Google Cloud Platform',
      ctc: 1.2,
      ctcBreakup: '₹1,00,000/month for 3 months',
      location: 'Bangalore, Hyderabad',
      bond: null,
      techStack: 'Java, Python, Cloud Technologies',
      positionsAvailable: 25,
      minCgpa: 8.5,
      maxBacklogs: 0,
      allowedBranches: 'CSE, IT, ECE',
      registrationStart: now,
      registrationEnd: futureDate,
      isActive: true,
    },
    {
      companyId: google?.id,
      title: 'Cloud Solutions Engineer',
      role: 'Cloud Engineer',
      jobDescription: 'Build and optimize cloud infrastructure for Google Cloud customers',
      ctc: 32,
      ctcBreakup: 'Base: 20 LPA, Bonus: 6 LPA, Stocks: 6 LPA',
      location: 'Bangalore',
      bond: null,
      techStack: 'GCP, Terraform, Docker, Kubernetes',
      positionsAvailable: 10,
      minCgpa: 8.0,
      maxBacklogs: 0,
      allowedBranches: 'CSE, IT',
      registrationStart: now,
      registrationEnd: futureDate,
      isActive: true,
    },

    // Microsoft - Diverse roles
    {
      companyId: microsoft?.id,
      title: 'Software Engineer - Azure',
      role: 'SDE-1',
      jobDescription: 'Develop cloud services for Microsoft Azure platform',
      ctc: 24,
      ctcBreakup: 'Base: 16 LPA, Bonus: 4 LPA, Stocks: 4 LPA',
      location: 'Hyderabad, Bangalore',
      bond: null,
      techStack: 'C#, .NET, Azure, Microservices',
      positionsAvailable: 20,
      minCgpa: 7.5,
      maxBacklogs: 0,
      allowedBranches: 'CSE, IT, ECE',
      registrationStart: now,
      registrationEnd: futureDate,
      isActive: true,
    },
    {
      companyId: microsoft?.id,
      title: 'Cloud Solutions Architect Intern',
      role: 'Intern - Cloud',
      jobDescription: 'Design cloud architecture solutions for enterprise clients',
      ctc: 0.8,
      ctcBreakup: '₹80,000/month for 6 months',
      location: 'Hyderabad',
      bond: null,
      techStack: 'Azure, ARM Templates, PowerShell',
      positionsAvailable: 15,
      minCgpa: 8.0,
      maxBacklogs: 0,
      allowedBranches: 'CSE, IT',
      registrationStart: now,
      registrationEnd: futureDate,
      isActive: true,
    },
    {
      companyId: microsoft?.id,
      title: 'Full Stack Developer - M365',
      role: 'SDE',
      jobDescription: 'Build features for Microsoft 365 applications',
      ctc: 22,
      ctcBreakup: 'Base: 15 LPA, Bonus: 3.5 LPA, Stocks: 3.5 LPA',
      location: 'Bangalore',
      bond: null,
      techStack: 'React, TypeScript, Node.js, Azure',
      positionsAvailable: 12,
      minCgpa: 7.5,
      maxBacklogs: 1,
      allowedBranches: 'CSE, IT',
      registrationStart: now,
      registrationEnd: futureDate,
      isActive: true,
    },

    // Amazon - SDE roles
    {
      companyId: amazon?.id,
      title: 'SDE-1 - AWS Services',
      role: 'SDE-1',
      jobDescription: `Join Amazon Web Services team to build and scale cloud services used by millions of customers worldwide.

Key Responsibilities:
• Design and develop features for AWS core services (EC2, S3, Lambda, etc.)
• Build highly available and fault-tolerant distributed systems
• Participate in on-call rotations and troubleshoot production issues
• Collaborate with teams across Amazon to deliver customer-focused solutions
• Write high-quality, well-tested code following best practices

What We're Looking For:
• Strong computer science fundamentals and problem-solving skills
• Experience with object-oriented programming (Java, Python, C++)
• Knowledge of data structures, algorithms, and system design
• Ability to work in a fast-paced, agile environment
• Passion for learning new technologies`,
      ctc: 21,
      ctcBreakup: 'Base: 15 LPA, Joining: 2 LPA, Stocks: 4 LPA',
      location: 'Bangalore, Hyderabad',
      bond: null,
      techStack: 'Java, AWS, DynamoDB, Lambda',
      positionsAvailable: 30,
      minCgpa: 7.0,
      maxBacklogs: 0,
      allowedBranches: 'CSE, IT, ECE',
      registrationStart: now,
      registrationEnd: futureDate,
      isActive: true,
    },
    {
      companyId: amazon?.id,
      title: 'SDE Intern - Summer 2025',
      role: 'SDE Intern',
      jobDescription: 'Work on Amazon retail or AWS projects',
      ctc: 0.6,
      ctcBreakup: '₹50,000/month for 6 months',
      location: 'Bangalore',
      bond: null,
      techStack: 'Java, Python, AWS',
      positionsAvailable: 40,
      minCgpa: 7.5,
      maxBacklogs: 0,
      allowedBranches: 'CSE, IT, ECE, EEE',
      registrationStart: now,
      registrationEnd: futureDate,
      isActive: true,
    },
    {
      companyId: amazon?.id,
      title: 'Cloud Support Engineer',
      role: 'Support Engineer',
      jobDescription: 'Provide technical support for AWS customers',
      ctc: 18,
      ctcBreakup: 'Base: 14 LPA, Bonus: 2 LPA, Stocks: 2 LPA',
      location: 'Bangalore, Hyderabad',
      bond: null,
      techStack: 'AWS, Linux, Networking, Troubleshooting',
      positionsAvailable: 25,
      minCgpa: 6.5,
      maxBacklogs: 1,
      allowedBranches: 'CSE, IT, ECE, EEE',
      registrationStart: now,
      registrationEnd: futureDate,
      isActive: true,
    },

    // TCS - Volume hiring
    {
      companyId: tcs?.id,
      title: 'TCS Digital - Full Stack Developer',
      role: 'Digital Engineer',
      jobDescription: `TCS Digital is seeking talented engineers to join our digital transformation initiatives for global clients.

Role Overview:
• Develop end-to-end web applications using modern JavaScript frameworks
• Work on enterprise-level projects for Fortune 500 companies
• Participate in agile development cycles and sprint planning
• Collaborate with business analysts and stakeholders
• Contribute to technical documentation and knowledge sharing

Skills Required:
• Strong foundation in web technologies (HTML, CSS, JavaScript)
• Experience with React, Angular, or Vue.js
• Backend development with Node.js or Java
• Understanding of RESTful APIs and databases
• Good communication and teamwork skills`,
      ctc: 7,
      ctcBreakup: 'Base: 7 LPA',
      location: 'Multiple locations',
      bond: '2 years',
      techStack: 'React, Angular, Node.js, Java',
      positionsAvailable: 100,
      minCgpa: 6.0,
      maxBacklogs: 2,
      allowedBranches: 'CSE, IT, ECE, EEE, Mech',
      registrationStart: now,
      registrationEnd: futureDate,
      isActive: true,
    },
    {
      companyId: tcs?.id,
      title: 'TCS Ninja - IT Services',
      role: 'Assistant System Engineer',
      jobDescription: 'Work on IT services and application development',
      ctc: 3.6,
      ctcBreakup: 'Base: 3.36 LPA + Variable',
      location: 'Pan India',
      bond: '2 years',
      techStack: 'Java, SQL, Spring Boot',
      positionsAvailable: 200,
      minCgpa: 6.0,
      maxBacklogs: 3,
      allowedBranches: 'All branches',
      registrationStart: now,
      registrationEnd: futureDate,
      isActive: true,
    },

    // Infosys - Different roles
    {
      companyId: infosys?.id,
      title: 'Power Programmer',
      role: 'Software Engineer',
      jobDescription: 'Advanced programming role for high performers',
      ctc: 9,
      ctcBreakup: 'Base: 9 LPA',
      location: 'Bangalore, Mysore, Pune',
      bond: '1.5 years',
      techStack: 'Java, Python, Data Structures, Algorithms',
      positionsAvailable: 50,
      minCgpa: 7.5,
      maxBacklogs: 0,
      allowedBranches: 'CSE, IT',
      registrationStart: now,
      registrationEnd: futureDate,
      isActive: true,
    },
    {
      companyId: infosys?.id,
      title: 'Systems Engineer - 2025',
      role: 'Systems Engineer',
      jobDescription: 'Entry-level software development role',
      ctc: 4.5,
      ctcBreakup: 'Base: 4.5 LPA',
      location: 'Multiple locations',
      bond: '1.5 years',
      techStack: 'Java, SQL, Spring Boot',
      positionsAvailable: 150,
      minCgpa: 6.0,
      maxBacklogs: 2,
      allowedBranches: 'All branches',
      registrationStart: now,
      registrationEnd: futureDate,
      isActive: true,
    },
    {
      companyId: infosys?.id,
      title: 'Cloud Infrastructure Specialist',
      role: 'Cloud Specialist',
      jobDescription: 'Manage and optimize cloud infrastructure',
      ctc: 8,
      ctcBreakup: 'Base: 8 LPA',
      location: 'Bangalore, Pune',
      bond: '1.5 years',
      techStack: 'AWS, Azure, Terraform, Docker',
      positionsAvailable: 30,
      minCgpa: 7.0,
      maxBacklogs: 1,
      allowedBranches: 'CSE, IT, ECE',
      registrationStart: now,
      registrationEnd: futureDate,
      isActive: true,
    },

    // Wipro
    {
      companyId: wipro?.id,
      title: 'Project Engineer - WILP',
      role: 'Project Engineer',
      jobDescription: 'Work on enterprise projects with learning opportunities',
      ctc: 3.5,
      ctcBreakup: 'Base: 3.5 LPA',
      location: 'Bangalore, Hyderabad, Pune',
      bond: '1 year',
      techStack: 'Java, Python, Cloud',
      positionsAvailable: 100,
      minCgpa: 6.0,
      maxBacklogs: 2,
      allowedBranches: 'All branches',
      registrationStart: now,
      registrationEnd: futureDate,
      isActive: true,
    },
    {
      companyId: wipro?.id,
      title: 'DevOps Engineer',
      role: 'DevOps Engineer',
      jobDescription: 'Build and maintain CI/CD pipelines',
      ctc: 6,
      ctcBreakup: 'Base: 6 LPA',
      location: 'Bangalore, Pune',
      bond: '1 year',
      techStack: 'Jenkins, Docker, Kubernetes, Git',
      positionsAvailable: 20,
      minCgpa: 6.5,
      maxBacklogs: 1,
      allowedBranches: 'CSE, IT',
      registrationStart: now,
      registrationEnd: futureDate,
      isActive: true,
    },

    // Accenture
    {
      companyId: accenture?.id,
      title: 'Advanced App Engineering Analyst',
      role: 'Application Development Analyst',
      jobDescription: 'Develop applications for global clients',
      ctc: 4.5,
      ctcBreakup: 'Base: 4.5 LPA',
      location: 'Bangalore, Hyderabad, Pune',
      bond: null,
      techStack: 'Java, React, Spring Boot, Microservices',
      positionsAvailable: 80,
      minCgpa: 6.5,
      maxBacklogs: 2,
      allowedBranches: 'CSE, IT, ECE',
      registrationStart: now,
      registrationEnd: futureDate,
      isActive: true,
    },
    {
      companyId: accenture?.id,
      title: 'Cloud Engineering Intern',
      role: 'Cloud Intern',
      jobDescription: 'Learn and work on cloud migration projects',
      ctc: 0.3,
      ctcBreakup: '₹30,000/month for 6 months',
      location: 'Bangalore',
      bond: null,
      techStack: 'AWS, Azure, Cloud Fundamentals',
      positionsAvailable: 30,
      minCgpa: 7.0,
      maxBacklogs: 1,
      allowedBranches: 'CSE, IT',
      registrationStart: now,
      registrationEnd: futureDate,
      isActive: true,
    },

    // Cognizant
    {
      companyId: cognizant?.id,
      title: 'GenC - Programmer Analyst',
      role: 'Programmer Analyst',
      jobDescription: `Join Cognizant's GenC program as a Programmer Analyst and work on cutting-edge projects for leading banking and healthcare clients.

What You'll Do:
• Develop and maintain enterprise applications using modern technologies
• Work with cross-functional teams to deliver high-quality software solutions
• Participate in requirement gathering, design, coding, and testing phases
• Troubleshoot and resolve technical issues in production environments
• Follow agile methodologies and best coding practices

What We're Looking For:
• Strong programming skills in Java or .NET
• Knowledge of databases and SQL
• Good problem-solving and analytical abilities
• Excellent communication and teamwork skills
• Willingness to learn new technologies and adapt to changes`,
      ctc: 4,
      ctcBreakup: 'Base: 4 LPA',
      location: 'Chennai, Bangalore, Hyderabad',
      bond: '1 year',
      techStack: 'Java, .NET, SQL Server',
      positionsAvailable: 120,
      minCgpa: 6.0,
      maxBacklogs: 2,
      allowedBranches: 'All branches',
      registrationStart: now,
      registrationEnd: futureDate,
      isActive: true,
    },
    {
      companyId: cognizant?.id,
      title: 'Full Stack Developer - Digital',
      role: 'Full Stack Developer',
      jobDescription: `Be part of Cognizant Digital and build next-generation web applications for Fortune 500 companies.

Your Responsibilities:
• Design and develop responsive web applications using MERN stack
• Build reusable components and front-end libraries for future use
• Develop RESTful APIs and integrate with databases
• Optimize applications for maximum speed and scalability
• Collaborate with designers and back-end developers
• Write clean, maintainable, and well-documented code

Required Skills:
• Proficiency in MongoDB, Express.js, React, and Node.js
• Experience with Next.js and TypeScript is a plus
• Strong understanding of HTML, CSS, and JavaScript
• Knowledge of Git and version control
• Understanding of responsive design and cross-browser compatibility`,
      ctc: 6.5,
      ctcBreakup: 'Base: 6.5 LPA',
      location: 'Bangalore, Pune',
      bond: '1 year',
      techStack: 'MERN Stack, Next.js, TypeScript',
      positionsAvailable: 40,
      minCgpa: 7.0,
      maxBacklogs: 1,
      allowedBranches: 'CSE, IT',
      registrationStart: now,
      registrationEnd: futureDate,
      isActive: true,
    },
  ];

  console.log(`Creating ${drives.length} realistic drives...`);

  for (const drive of drives) {
    if (drive.companyId) {
      await prisma.drive.create({ data: drive });
      console.log(`✅ Created: ${drive.title} at ${companies.find(c => c.id === drive.companyId)?.name}`);
    }
  }

  console.log('✨ Realistic drives seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding drives:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
