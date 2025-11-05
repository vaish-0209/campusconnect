import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database with sample data...");

  // Create default admin user
  const hashedPassword = await bcrypt.hash("admin123", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@bmsce.ac.in" },
    update: {},
    create: {
      email: "admin@bmsce.ac.in",
      password: hashedPassword,
      role: Role.ADMIN,
      isActive: true,
    },
  });

  console.log("✅ Admin user created:", admin.email);

  // Create multiple students
  const studentPassword = await bcrypt.hash("student123", 12);
  const studentsData = [
    { rollNo: "1BM21CS001", firstName: "Rahul", lastName: "Sharma", email: "rahul@student.com", branch: "CSE", cgpa: 8.5, backlogs: 0, phone: "+919876543210" },
    { rollNo: "1BM21CS002", firstName: "Priya", lastName: "Verma", email: "priya@student.com", branch: "CSE", cgpa: 9.2, backlogs: 0, phone: "+919876543211" },
    { rollNo: "1BM21CS003", firstName: "Amit", lastName: "Kumar", email: "amit@student.com", branch: "CSE", cgpa: 7.8, backlogs: 1, phone: "+919876543212" },
    { rollNo: "1BM21IT001", firstName: "Sneha", lastName: "Reddy", email: "sneha@student.com", branch: "IT", cgpa: 8.9, backlogs: 0, phone: "+919876543213" },
    { rollNo: "1BM21IT002", firstName: "Vikram", lastName: "Singh", email: "vikram@student.com", branch: "IT", cgpa: 8.0, backlogs: 0, phone: "+919876543214" },
    { rollNo: "1BM21ECE001", firstName: "Ananya", lastName: "Patel", email: "ananya@student.com", branch: "ECE", cgpa: 8.7, backlogs: 0, phone: "+919876543215" },
    { rollNo: "1BM21ECE002", firstName: "Rohan", lastName: "Gupta", email: "rohan@student.com", branch: "ECE", cgpa: 7.5, backlogs: 2, phone: "+919876543216" },
    { rollNo: "1BM21MECH001", firstName: "Kavya", lastName: "Nair", email: "kavya@student.com", branch: "MECH", cgpa: 8.3, backlogs: 0, phone: "+919876543217" },
    { rollNo: "1BM21CS004", firstName: "Arjun", lastName: "Mehta", email: "arjun@student.com", branch: "CSE", cgpa: 8.8, backlogs: 0, phone: "+919876543218" },
    { rollNo: "1BM21IT003", firstName: "Divya", lastName: "Shah", email: "divya@student.com", branch: "IT", cgpa: 7.9, backlogs: 1, phone: "+919876543219" },
    { rollNo: "1BM21CS005", firstName: "Karan", lastName: "Joshi", email: "karan@student.com", branch: "CSE", cgpa: 8.6, backlogs: 0, phone: "+919876543220" },
    { rollNo: "1BM21CS006", firstName: "Neha", lastName: "Desai", email: "neha@student.com", branch: "CSE", cgpa: 9.0, backlogs: 0, phone: "+919876543221" },
    { rollNo: "1BM21IT004", firstName: "Ravi", lastName: "Iyer", email: "ravi@student.com", branch: "IT", cgpa: 8.4, backlogs: 0, phone: "+919876543222" },
    { rollNo: "1BM21ECE003", firstName: "Sanya", lastName: "Kapoor", email: "sanya@student.com", branch: "ECE", cgpa: 8.1, backlogs: 1, phone: "+919876543223" },
    { rollNo: "1BM21MECH002", firstName: "Aditya", lastName: "Rao", email: "aditya@student.com", branch: "MECH", cgpa: 7.7, backlogs: 1, phone: "+919876543224" },
    { rollNo: "1BM21CS007", firstName: "Isha", lastName: "Pillai", email: "isha@student.com", branch: "CSE", cgpa: 9.1, backlogs: 0, phone: "+919876543225" },
    { rollNo: "1BM21IT005", firstName: "Sahil", lastName: "Agarwal", email: "sahil@student.com", branch: "IT", cgpa: 8.2, backlogs: 0, phone: "+919876543226" },
    { rollNo: "1BM21ECE004", firstName: "Tanvi", lastName: "Bhat", email: "tanvi@student.com", branch: "ECE", cgpa: 8.5, backlogs: 0, phone: "+919876543227" },
    { rollNo: "1BM21CS008", firstName: "Varun", lastName: "Malhotra", email: "varun@student.com", branch: "CSE", cgpa: 8.9, backlogs: 0, phone: "+919876543228" },
    { rollNo: "1BM21MECH003", firstName: "Pooja", lastName: "Menon", email: "pooja@student.com", branch: "MECH", cgpa: 7.6, backlogs: 2, phone: "+919876543229" },
  ];

  const students = [];
  for (const studentData of studentsData) {
    const user = await prisma.user.upsert({
      where: { email: studentData.email },
      update: {},
      create: {
        email: studentData.email,
        password: studentPassword,
        role: Role.STUDENT,
        isActive: true,
        student: {
          create: {
            rollNo: studentData.rollNo,
            firstName: studentData.firstName,
            lastName: studentData.lastName,
            branch: studentData.branch,
            cgpa: studentData.cgpa,
            backlogs: studentData.backlogs,
            phone: studentData.phone,
            skills: "Python, Java, JavaScript, React, Node.js",
          },
        },
      },
      include: { student: true },
    });
    students.push(user);
  }
  console.log(`✅ Created ${students.length} students`);

  // Create companies
  const companiesData = [
    { name: "Google", sector: "Technology", website: "https://careers.google.com", logo: "https://logo.clearbit.com/google.com" },
    { name: "Microsoft", sector: "Technology", website: "https://careers.microsoft.com", logo: "https://logo.clearbit.com/microsoft.com" },
    { name: "Amazon", sector: "E-Commerce", website: "https://amazon.jobs", logo: "https://logo.clearbit.com/amazon.com" },
    { name: "Infosys", sector: "IT Services", website: "https://infosys.com/careers", logo: "https://logo.clearbit.com/infosys.com" },
    { name: "TCS", sector: "IT Services", website: "https://tcs.com/careers", logo: "https://logo.clearbit.com/tcs.com" },
    { name: "Flipkart", sector: "E-Commerce", website: "https://flipkart.com/careers", logo: "https://logo.clearbit.com/flipkart.com" },
  ];

  const companies = [];
  for (const companyData of companiesData) {
    const company = await prisma.company.upsert({
      where: { name: companyData.name },
      update: {},
      create: companyData,
    });
    companies.push(company);
  }
  console.log(`✅ Created ${companies.length} companies`);

  // Create drives
  const drivesData = [
    {
      companyId: companies[0].id,
      title: "Software Engineer Intern 2025",
      role: "SDE Intern",
      jobDescription: "Join Google as a Software Engineering Intern and work on cutting-edge technologies. You'll collaborate with world-class engineers and contribute to products used by billions.",
      ctc: 12.0,
      ctcBreakup: "Base: ₹10L, Performance Bonus: ₹2L",
      location: "Bangalore",
      bond: "None",
      techStack: "Python, Java, Go, Cloud",
      minCgpa: 8.0,
      maxBacklogs: 0,
      allowedBranches: "CSE, IT",
      registrationStart: new Date("2025-01-01"),
      registrationEnd: new Date("2025-01-31"),
      isActive: true,
    },
    {
      companyId: companies[1].id,
      title: "Program Manager Intern",
      role: "PM Intern",
      jobDescription: "Work with product teams to drive feature development and customer success at Microsoft.",
      ctc: 11.0,
      location: "Hyderabad",
      techStack: "Product Management, Analytics, Azure",
      minCgpa: 8.5,
      maxBacklogs: 0,
      allowedBranches: "CSE, IT, ECE",
      registrationStart: new Date("2025-01-05"),
      registrationEnd: new Date("2025-02-05"),
      isActive: true,
    },
    {
      companyId: companies[2].id,
      title: "SDE Intern - Summer 2025",
      role: "SDE Intern",
      jobDescription: "Build scalable systems and contribute to Amazon's world-class infrastructure.",
      ctc: 10.0,
      location: "Bangalore",
      techStack: "Java, AWS, Distributed Systems",
      minCgpa: 7.5,
      maxBacklogs: 1,
      allowedBranches: "CSE, IT",
      registrationStart: new Date("2024-12-20"),
      registrationEnd: new Date("2025-01-20"),
      isActive: true,
    },
    {
      companyId: companies[3].id,
      title: "Systems Engineer",
      role: "Systems Engineer",
      jobDescription: "Join Infosys as a Systems Engineer and work on enterprise solutions.",
      ctc: 4.5,
      location: "Multiple Locations",
      techStack: "Java, SQL, Web Development",
      minCgpa: 6.5,
      maxBacklogs: 2,
      allowedBranches: "CSE, IT, ECE, MECH",
      registrationStart: new Date("2024-12-01"),
      registrationEnd: new Date("2025-01-15"),
      isActive: true,
    },
    {
      companyId: companies[4].id,
      title: "Digital Ninja",
      role: "Digital Engineer",
      jobDescription: "Be part of TCS Digital and work on modern digital transformation projects.",
      ctc: 7.0,
      location: "Pune",
      techStack: "JavaScript, React, Node.js, Cloud",
      minCgpa: 7.0,
      maxBacklogs: 1,
      allowedBranches: "CSE, IT",
      registrationStart: new Date("2024-12-15"),
      registrationEnd: new Date("2025-01-25"),
      isActive: true,
    },
  ];

  const drives = [];
  for (const driveData of drivesData) {
    const drive = await prisma.drive.create({ data: driveData });
    drives.push(drive);
  }
  console.log(`✅ Created ${drives.length} drives`);

  // Create events
  const eventsData = [
    {
      driveId: drives[0].id,
      title: "Pre-Placement Talk",
      description: "Learn about Google's culture and interview process",
      type: "PPT" as const,
      startTime: new Date("2025-01-15T14:00:00"),
      endTime: new Date("2025-01-15T16:00:00"),
      venue: "Auditorium",
    },
    {
      driveId: drives[0].id,
      title: "Online Assessment",
      description: "Coding test",
      type: "TEST" as const,
      startTime: new Date("2025-01-18T10:00:00"),
      endTime: new Date("2025-01-18T12:00:00"),
      meetingLink: "https://meet.google.com/xyz-abc-def",
    },
    {
      driveId: drives[1].id,
      title: "Technical Interview Round 1",
      description: "First round interviews",
      type: "INTERVIEW" as const,
      startTime: new Date("2025-01-20T09:00:00"),
      endTime: new Date("2025-01-20T18:00:00"),
      meetingLink: "https://teams.microsoft.com/xyz",
    },
  ];

  for (const eventData of eventsData) {
    await prisma.event.create({ data: eventData as any });
  }
  console.log(`✅ Created ${eventsData.length} events`);

  // Create applications
  const applicationsData = [
    // Google - Software Engineer Intern (Drive 0)
    { studentId: students[0].student!.id, driveId: drives[0].id, status: "SHORTLISTED" },
    { studentId: students[1].student!.id, driveId: drives[0].id, status: "OFFER" },
    { studentId: students[3].student!.id, driveId: drives[0].id, status: "TEST_CLEARED" },
    { studentId: students[8].student!.id, driveId: drives[0].id, status: "OFFER" },
    { studentId: students[10].student!.id, driveId: drives[0].id, status: "SHORTLISTED" },
    { studentId: students[11].student!.id, driveId: drives[0].id, status: "OFFER" },
    { studentId: students[15].student!.id, driveId: drives[0].id, status: "APPLIED" },
    { studentId: students[18].student!.id, driveId: drives[0].id, status: "TEST_CLEARED" },

    // Microsoft - PM Intern (Drive 1)
    { studentId: students[0].student!.id, driveId: drives[1].id, status: "INTERVIEW_CLEARED" },
    { studentId: students[1].student!.id, driveId: drives[1].id, status: "OFFER" },
    { studentId: students[3].student!.id, driveId: drives[1].id, status: "SHORTLISTED" },
    { studentId: students[5].student!.id, driveId: drives[1].id, status: "APPLIED" },
    { studentId: students[10].student!.id, driveId: drives[1].id, status: "OFFER" },
    { studentId: students[12].student!.id, driveId: drives[1].id, status: "SHORTLISTED" },
    { studentId: students[13].student!.id, driveId: drives[1].id, status: "APPLIED" },
    { studentId: students[17].student!.id, driveId: drives[1].id, status: "TEST_CLEARED" },

    // Amazon - SDE Intern (Drive 2)
    { studentId: students[2].student!.id, driveId: drives[2].id, status: "APPLIED" },
    { studentId: students[4].student!.id, driveId: drives[2].id, status: "OFFER" },
    { studentId: students[9].student!.id, driveId: drives[2].id, status: "SHORTLISTED" },
    { studentId: students[11].student!.id, driveId: drives[2].id, status: "OFFER" },
    { studentId: students[12].student!.id, driveId: drives[2].id, status: "TEST_CLEARED" },
    { studentId: students[16].student!.id, driveId: drives[2].id, status: "APPLIED" },

    // Infosys - Systems Engineer (Drive 3)
    { studentId: students[2].student!.id, driveId: drives[3].id, status: "OFFER" },
    { studentId: students[4].student!.id, driveId: drives[3].id, status: "APPLIED" },
    { studentId: students[6].student!.id, driveId: drives[3].id, status: "REJECTED" },
    { studentId: students[7].student!.id, driveId: drives[3].id, status: "OFFER" },
    { studentId: students[13].student!.id, driveId: drives[3].id, status: "SHORTLISTED" },
    { studentId: students[14].student!.id, driveId: drives[3].id, status: "APPLIED" },
    { studentId: students[19].student!.id, driveId: drives[3].id, status: "APPLIED" },

    // TCS - Digital Ninja (Drive 4)
    { studentId: students[0].student!.id, driveId: drives[4].id, status: "APPLIED" },
    { studentId: students[2].student!.id, driveId: drives[4].id, status: "TEST_CLEARED" },
    { studentId: students[4].student!.id, driveId: drives[4].id, status: "OFFER" },
    { studentId: students[9].student!.id, driveId: drives[4].id, status: "SHORTLISTED" },
    { studentId: students[12].student!.id, driveId: drives[4].id, status: "OFFER" },
    { studentId: students[16].student!.id, driveId: drives[4].id, status: "APPLIED" },
  ];

  for (const appData of applicationsData) {
    await prisma.application.create({ data: appData });
  }
  console.log(`✅ Created ${applicationsData.length} applications`);

  console.log("\n🎉 Database seeded successfully!");
  console.log("\n📝 Login Credentials:");
  console.log("=====================================");
  console.log("Admin:");
  console.log("  Email: admin@bmsce.ac.in");
  console.log("  Password: admin123");
  console.log("\nStudents (all use same password):");
  console.log("  Email: rahul@student.com");
  console.log("  Email: priya@student.com");
  console.log("  Email: amit@student.com");
  console.log("  Email: sneha@student.com");
  console.log("  Password: student123");
  console.log("=====================================");
  console.log("\n📊 Summary:");
  console.log(`  • ${students.length} Students`);
  console.log(`  • ${companies.length} Companies`);
  console.log(`  • ${drives.length} Drives`);
  console.log(`  • ${applicationsData.length} Applications`);
  console.log(`  • ${eventsData.length} Events`);
  console.log("=====================================\n");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
