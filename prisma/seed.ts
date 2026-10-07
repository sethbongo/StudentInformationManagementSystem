import { PrismaClient, Role, StudentStatus, EnrollmentStatus, GradeRemark } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database for Student Information Management System...");

  const standardPasswordHash = await bcrypt.hash("Password123!", 10);
  const adminPasswordHash = await bcrypt.hash("Admin123!", 10);
  const registrarPasswordHash = await bcrypt.hash("Registrar123!", 10);

  // ==========================================
  // 1. Academic Programs (Requirement: min 3)
  // ==========================================
  console.log("Creating Academic Programs...");
  const bscs = await prisma.program.upsert({
    where: { code: "BSCS" },
    update: {},
    create: {
      code: "BSCS",
      name: "Bachelor of Science in Computer Science",
      department: "Department of Computer Science",
      totalUnitsRequired: 124,
      isActive: true,
    },
  });

  const bsit = await prisma.program.upsert({
    where: { code: "BSIT" },
    update: {},
    create: {
      code: "BSIT",
      name: "Bachelor of Science in Information Technology",
      department: "Department of Information Technology",
      totalUnitsRequired: 120,
      isActive: true,
    },
  });

  const bsis = await prisma.program.upsert({
    where: { code: "BSIS" },
    update: {},
    create: {
      code: "BSIS",
      name: "Bachelor of Science in Information Systems",
      department: "Department of Information Systems",
      totalUnitsRequired: 122,
      isActive: true,
    },
  });

  const programs = [bscs, bsit, bsis];

  // ==========================================
  // 2. Staff Users & Instructors
  // ==========================================
  console.log("Creating Staff and Instructors...");

  // Administrator
  await prisma.user.upsert({
    where: { email: "admin@sims.edu" },
    update: { passwordHash: adminPasswordHash },
    create: {
      email: "admin@sims.edu",
      passwordHash: adminPasswordHash,
      role: Role.ADMINISTRATOR,
      firstName: "Super",
      lastName: "Administrator",
      isActive: true,
    },
  });

  // Registrar / Staff
  await prisma.user.upsert({
    where: { email: "registrar@sims.edu" },
    update: { passwordHash: registrarPasswordHash },
    create: {
      email: "registrar@sims.edu",
      passwordHash: registrarPasswordHash,
      role: Role.REGISTRAR,
      firstName: "Maria",
      lastName: "Santos",
      isActive: true,
    },
  });

  // Demo Faculty / Instructor
  const demoFaculty = await prisma.user.upsert({
    where: { email: "faculty@sims.edu" },
    update: { passwordHash: standardPasswordHash },
    create: {
      email: "faculty@sims.edu",
      passwordHash: standardPasswordHash,
      role: Role.INSTRUCTOR,
      firstName: "Demo",
      lastName: "Faculty",
      isActive: true,
      instructorProfile: {
        create: {
          employeeNumber: "EMP-2026-0000",
          department: "Department of Computer Science",
          title: "Associate Professor",
        },
      },
    },
    include: { instructorProfile: true },
  });

  // Instructors
  const instructor1User = await prisma.user.upsert({
    where: { email: "prof.smith@sims.edu" },
    update: { passwordHash: standardPasswordHash },
    create: {
      email: "prof.smith@sims.edu",
      passwordHash: standardPasswordHash,
      role: Role.INSTRUCTOR,
      firstName: "Alan",
      lastName: "Smith",
      isActive: true,
      instructorProfile: {
        create: {
          employeeNumber: "EMP-2026-0001",
          department: "Department of Computer Science",
          title: "Associate Professor",
        },
      },
    },
    include: { instructorProfile: true },
  });

  const instructor2User = await prisma.user.upsert({
    where: { email: "prof.johnson@sims.edu" },
    update: {},
    create: {
      email: "prof.johnson@sims.edu",
      passwordHash: standardPasswordHash,
      role: Role.INSTRUCTOR,
      firstName: "Grace",
      lastName: "Johnson",
      isActive: true,
      instructorProfile: {
        create: {
          employeeNumber: "EMP-2026-0002",
          department: "Department of Information Technology",
          title: "Assistant Professor",
        },
      },
    },
    include: { instructorProfile: true },
  });

  const instructor3User = await prisma.user.upsert({
    where: { email: "prof.rivera@sims.edu" },
    update: {},
    create: {
      email: "prof.rivera@sims.edu",
      passwordHash: standardPasswordHash,
      role: Role.INSTRUCTOR,
      firstName: "Carlos",
      lastName: "Rivera",
      isActive: true,
      instructorProfile: {
        create: {
          employeeNumber: "EMP-2026-0003",
          department: "Department of Computer Science",
          title: "Senior Lecturer",
        },
      },
    },
    include: { instructorProfile: true },
  });

  const instructor4User = await prisma.user.upsert({
    where: { email: "prof.gomez@sims.edu" },
    update: {},
    create: {
      email: "prof.gomez@sims.edu",
      passwordHash: standardPasswordHash,
      role: Role.INSTRUCTOR,
      firstName: "Elena",
      lastName: "Gomez",
      isActive: true,
      instructorProfile: {
        create: {
          employeeNumber: "EMP-2026-0004",
          department: "Department of Information Systems",
          title: "Assistant Professor",
        },
      },
    },
    include: { instructorProfile: true },
  });

  const instructors = [
    demoFaculty.instructorProfile!,
    instructor1User.instructorProfile!,
    instructor2User.instructorProfile!,
    instructor3User.instructorProfile!,
    instructor4User.instructorProfile!,
  ];

  // ==========================================
  // 3. Courses (Requirement: min 20)
  // ==========================================
  console.log("Creating Courses and Prerequisites (22 courses)...");

  const courseData = [
    { code: "CS101", title: "Introduction to Computer Science", units: 3, programId: bscs.id, description: "Fundamental programming and algorithms in modern languages" },
    { code: "CS102", title: "Data Structures and Algorithms", units: 3, programId: bscs.id, description: "Linear and tree structures, complexity, and sorting" },
    { code: "CS201", title: "Database Systems", units: 3, programId: bscs.id, description: "Relational database modeling, SQL, normalization, and indexing" },
    { code: "CS202", title: "Object-Oriented Programming", units: 3, programId: bscs.id, description: "Design patterns, encapsulation, polymorphism, and abstractions" },
    { code: "CS301", title: "Operating Systems", units: 3, programId: bscs.id, description: "Processes, virtual memory, concurrent concurrency, and file systems" },
    { code: "CS302", title: "Computer Networks", units: 3, programId: bscs.id, description: "OSI/TCP-IP models, packet routing, protocols, and socket programming" },
    { code: "CS401", title: "Software Engineering & Capstone", units: 3, programId: bscs.id, description: "Agile methodologies, system architecture, and project delivery" },

    { code: "IT101", title: "Information Technology Fundamentals", units: 3, programId: bsit.id, description: "IT infrastructure, hardware, operating systems, and basic scripting" },
    { code: "IT102", title: "Web Systems and Technologies", units: 3, programId: bsit.id, description: "Full-stack web architecture, HTML/CSS/JS, and RESTful APIs" },
    { code: "IT201", title: "Network Administration", units: 3, programId: bsit.id, description: "Router/switch configurations, VLANs, and firewall management" },
    { code: "IT202", title: "Systems Analysis and Design", units: 3, programId: bsit.id, description: "UML modeling, requirements engineering, and workflow design" },
    { code: "IT301", title: "Information Assurance and Security", units: 3, programId: bsit.id, description: "Cryptography, access control, cybersecurity frameworks, and threat vectors" },
    { code: "IT302", title: "Cloud Computing and DevOps", units: 3, programId: bsit.id, description: "Containers, CI/CD pipelines, and cloud native architectures" },

    { code: "IS101", title: "Foundations of Information Systems", units: 3, programId: bsis.id, description: "Role of information systems in enterprise business strategy" },
    { code: "IS102", title: "Business Process Management", units: 3, programId: bsis.id, description: "Process modeling, enterprise architecture, and optimization" },
    { code: "IS201", title: "Enterprise Systems Architecture", units: 3, programId: bsis.id, description: "ERP implementation, legacy system integration, and SOA" },
    { code: "IS202", title: "Data Warehousing and Analytics", units: 3, programId: bsis.id, description: "ETL pipelines, data marts, OLAP, and business intelligence reporting" },

    { code: "MATH101", title: "Calculus I", units: 4, programId: null, description: "Limits, derivatives, integrals, and rate-of-change applications" },
    { code: "MATH102", title: "Discrete Mathematics", units: 3, programId: null, description: "Set theory, logic, combinatorics, graph theory, and proofs" },
    { code: "ENG101", title: "Technical Communication", units: 3, programId: null, description: "Written and oral professional technical reporting" },
    { code: "HIST101", title: "Readings in Philippine History", units: 3, programId: null, description: "Primary source analysis and critical socio-historical thinking" },
    { code: "ETHICS101", title: "Ethics in Computing and Technology", units: 3, programId: null, description: "Moral principles, privacy laws, intellectual property, and AI ethics" },
  ];

  const createdCourses: Record<string, any> = {};
  for (const c of courseData) {
    const course = await prisma.course.upsert({
      where: { code: c.code },
      update: {},
      create: {
        code: c.code,
        title: c.title,
        units: c.units,
        description: c.description,
        programId: c.programId,
        isActive: true,
      },
    });
    createdCourses[c.code] = course;
  }

  // Prerequisites
  const prereqPairs = [
    ["CS102", "CS101"],
    ["CS201", "CS102"],
    ["CS202", "CS102"],
    ["CS301", "CS201"],
    ["CS302", "CS102"],
    ["CS401", "CS202"],
    ["IT102", "IT101"],
    ["IT201", "IT101"],
    ["IT301", "IT201"],
    ["IS102", "IS101"],
    ["IS201", "IS102"],
    ["MATH102", "MATH101"],
  ];

  for (const [target, prereq] of prereqPairs) {
    await prisma.coursePrerequisite.upsert({
      where: {
        courseId_prerequisiteId: {
          courseId: createdCourses[target].id,
          prerequisiteId: createdCourses[prereq].id,
        },
      },
      update: {},
      create: {
        courseId: createdCourses[target].id,
        prerequisiteId: createdCourses[prereq].id,
      },
    });
  }

  // ==========================================
  // 4. Academic Terms (Requirement: min 2)
  // ==========================================
  console.log("Creating Academic Terms...");
  const pastTerm = await prisma.academicTerm.upsert({
    where: { code: "AY2025-2026-2S" },
    update: {},
    create: {
      code: "AY2025-2026-2S",
      name: "Academic Year 2025-2026 2nd Semester",
      startDate: new Date("2026-01-15"),
      endDate: new Date("2026-05-30"),
      isEnrollmentOpen: false,
      isCurrent: false,
    },
  });

  const currentTerm = await prisma.academicTerm.upsert({
    where: { code: "AY2026-2027-1S" },
    update: {},
    create: {
      code: "AY2026-2027-1S",
      name: "Academic Year 2026-2027 1st Semester",
      startDate: new Date("2026-08-15"),
      endDate: new Date("2026-12-20"),
      isEnrollmentOpen: true,
      isCurrent: true,
    },
  });

  // ==========================================
  // 5. Course Offerings (Requirement: min 20)
  // ==========================================
  console.log("Creating Course Offerings (24 offerings)...");
  const offeringsConfigs = [
    // Past Term (12 offerings)
    { courseCode: "CS101", term: pastTerm, instructorIdx: 0, section: "CS101-PAST-A", sched: "MWF 08:00-09:00 AM", room: "CL-101", cap: 40 },
    { courseCode: "CS101", term: pastTerm, instructorIdx: 2, section: "CS101-PAST-B", sched: "MWF 09:00-10:00 AM", room: "CL-102", cap: 40 },
    { courseCode: "IT101", term: pastTerm, instructorIdx: 1, section: "IT101-PAST-A", sched: "TTh 08:30-10:00 AM", room: "CL-201", cap: 40 },
    { courseCode: "IS101", term: pastTerm, instructorIdx: 3, section: "IS101-PAST-A", sched: "TTh 10:00-11:30 AM", room: "Room 301", cap: 35 },
    { courseCode: "MATH101", term: pastTerm, instructorIdx: 0, section: "MATH101-PAST-A", sched: "MW 01:00-03:00 PM", room: "LH-1", cap: 50 },
    { courseCode: "ENG101", term: pastTerm, instructorIdx: 1, section: "ENG101-PAST-A", sched: "TTh 01:00-02:30 PM", room: "Room 401", cap: 45 },
    { courseCode: "HIST101", term: pastTerm, instructorIdx: 2, section: "HIST101-PAST-A", sched: "Fri 01:00-04:00 PM", room: "LH-2", cap: 50 },
    { courseCode: "ETHICS101", term: pastTerm, instructorIdx: 3, section: "ETHICS101-PAST-A", sched: "Wed 02:00-05:00 PM", room: "Room 302", cap: 40 },
    { courseCode: "CS102", term: pastTerm, instructorIdx: 0, section: "CS102-PAST-A", sched: "MWF 10:00-11:00 AM", room: "CL-101", cap: 35 },
    { courseCode: "IT102", term: pastTerm, instructorIdx: 1, section: "IT102-PAST-A", sched: "TTh 01:00-02:30 PM", room: "CL-202", cap: 35 },
    { courseCode: "MATH102", term: pastTerm, instructorIdx: 2, section: "MATH102-PAST-A", sched: "MW 03:00-04:30 PM", room: "LH-1", cap: 40 },
    { courseCode: "IS102", term: pastTerm, instructorIdx: 3, section: "IS102-PAST-A", sched: "TTh 03:00-04:30 PM", room: "Room 303", cap: 35 },

    // Current Term (12 offerings)
    { courseCode: "CS101", term: currentTerm, instructorIdx: 0, section: "CS101-A", sched: "MWF 08:00-09:00 AM", room: "CL-101", cap: 40 },
    { courseCode: "CS102", term: currentTerm, instructorIdx: 0, section: "CS102-A", sched: "TTh 10:00-11:30 AM", room: "CL-101", cap: 35 },
    { courseCode: "CS201", term: currentTerm, instructorIdx: 2, section: "CS201-A", sched: "MWF 01:00-02:00 PM", room: "CL-102", cap: 35 },
    { courseCode: "CS301", term: currentTerm, instructorIdx: 2, section: "CS301-A", sched: "TTh 01:00-02:30 PM", room: "CL-103", cap: 30 },
    { courseCode: "IT101", term: currentTerm, instructorIdx: 1, section: "IT101-A", sched: "MW 01:00-02:30 PM", room: "CL-201", cap: 40 },
    { courseCode: "IT102", term: currentTerm, instructorIdx: 1, section: "IT102-A", sched: "TTh 08:30-10:00 AM", room: "CL-202", cap: 35 },
    { courseCode: "IT201", term: currentTerm, instructorIdx: 1, section: "IT201-A", sched: "MWF 11:00-12:00 PM", room: "CL-201", cap: 35 },
    { courseCode: "IS101", term: currentTerm, instructorIdx: 3, section: "IS101-A", sched: "MWF 09:00-10:00 AM", room: "Room 301", cap: 40 },
    { courseCode: "IS201", term: currentTerm, instructorIdx: 3, section: "IS201-A", sched: "TTh 01:00-02:30 PM", room: "Room 302", cap: 35 },
    { courseCode: "MATH101", term: currentTerm, instructorIdx: 0, section: "MATH101-A", sched: "MW 09:00-11:00 AM", room: "LH-1", cap: 50 },
    { courseCode: "MATH102", term: currentTerm, instructorIdx: 2, section: "MATH102-A", sched: "TTh 03:00-04:30 PM", room: "LH-2", cap: 45 },
    { courseCode: "ETHICS101", term: currentTerm, instructorIdx: 3, section: "ETHICS101-A", sched: "Fri 01:00-04:00 PM", room: "LH-1", cap: 50 },
  ];

  const createdOfferings: any[] = [];
  for (const cfg of offeringsConfigs) {
    const offering = await prisma.courseOffering.upsert({
      where: {
        courseId_termId_sectionCode: {
          courseId: createdCourses[cfg.courseCode].id,
          termId: cfg.term.id,
          sectionCode: cfg.section,
        },
      },
      update: {},
      create: {
        courseId: createdCourses[cfg.courseCode].id,
        termId: cfg.term.id,
        instructorId: instructors[cfg.instructorIdx]?.id,
        sectionCode: cfg.section,
        schedule: cfg.sched,
        room: cfg.room,
        maxCapacity: cfg.cap,
      },
    });
    createdOfferings.push({ ...offering, courseCode: cfg.courseCode, termCode: cfg.term.code });
  }

  // ==========================================
  // 6. Students (Requirement: min 100)
  // ==========================================
  console.log("Creating Students (105 students with User profiles)...");

  const firstNames = [
    "Alice", "Bob", "Charlie", "David", "Emma", "Frank", "Grace", "Hannah", "Ian", "Julia",
    "Kevin", "Laura", "Michael", "Nina", "Oliver", "Paula", "Quinn", "Rachel", "Samuel", "Tina",
    "Victor", "Wendy", "Xavier", "Yasmine", "Zachary", "Liam", "Sophia", "Noah", "Isabella", "James",
    "Mia", "Lucas", "Harper", "Ethan", "Evelyn", "Alexander", "Abigail", "Henry", "Emily", "Sebastian"
  ];
  const lastNames = [
    "Guo", "Cruz", "Reyes", "Tan", "Santos", "Garcia", "Mendoza", "Flores", "Villanueva", "Bautista",
    "Dela Cruz", "Torres", "Lim", "Castillo", "Ramos", "Aquino", "Fernandez", "Rivera", "Gonzales", "Lopez",
    "Mercado", "Soriano", "Navarro", "Morales", "Salazar", "Valdez", "Pascual", "Domingo", "Vergara", "Cortez"
  ];

  const createdStudents: any[] = [];

  for (let i = 1; i <= 105; i++) {
    const fn = firstNames[(i - 1) % firstNames.length];
    const ln = lastNames[(i - 1) % lastNames.length];
    const studentNum = `2026-${String(i).padStart(5, "0")}`;
    const email = i === 1 ? "student@sims.edu"
      : i === 2 ? "student.bob@sims.edu"
      : i === 3 ? "student.charlie@sims.edu"
      : `student.${fn.toLowerCase()}.${ln.toLowerCase().replace(/\s+/g, "")}${i}@sims.edu`;

    const program = programs[(i - 1) % programs.length];
    const yearLevel = ((i - 1) % 4) + 1;
    const status = i % 25 === 0 ? StudentStatus.PROBATION : StudentStatus.ACTIVE;

    const user = await prisma.user.upsert({
      where: { email },
      update: { passwordHash: standardPasswordHash },
      create: {
        email,
        passwordHash: standardPasswordHash,
        role: Role.STUDENT,
        firstName: fn,
        lastName: ln,
        isActive: true,
        studentProfile: {
          create: {
            studentNumber: studentNum,
            programId: program.id,
            yearLevel,
            status,
            middleName: "M",
            suffix: i % 10 === 0 ? "Jr." : null,
            dateOfBirth: new Date(2003 + (yearLevel - 1), (i % 12), (i % 28) + 1),
            contactNumber: `+63917${String(1000000 + i).slice(1)}`,
            address: `${i * 12} University Avenue, Metro Manila`,
          },
        },
      },
      include: { studentProfile: true },
    });

    createdStudents.push(user.studentProfile);
  }

  // ==========================================
  // 7. Enrollments & Grades (Requirement: min 200 Enrollments, min 100 Grades)
  // ==========================================
  console.log("Creating Enrollments and Finalized Grades (220+ Enrollments, 110+ Grades)...");

  const pastOfferings = createdOfferings.filter((o) => o.termCode === "AY2025-2026-2S");
  const currentOfferings = createdOfferings.filter((o) => o.termCode === "AY2026-2027-1S");

  let gradeCount = 0;
  let enrollmentCount = 0;

  // 1. Past completed enrollments with grades (110 grades)
  for (let sIdx = 0; sIdx < 55; sIdx++) {
    const student = createdStudents[sIdx];
    // Assign 2 past offerings per student
    const off1 = pastOfferings[(sIdx * 2) % pastOfferings.length];
    const off2 = pastOfferings[(sIdx * 2 + 1) % pastOfferings.length];

    for (const off of [off1, off2]) {
      const enrollment = await prisma.enrollment.upsert({
        where: {
          studentId_courseOfferingId: {
            studentId: student.id,
            courseOfferingId: off.id,
          },
        },
        update: {},
        create: {
          studentId: student.id,
          courseOfferingId: off.id,
          status: EnrollmentStatus.COMPLETED,
          enrolledAt: new Date("2026-01-16"),
        },
      });
      enrollmentCount++;

      // Seed Grade for past enrollment
      const numericGrade = parseFloat((1.0 + ((sIdx + enrollmentCount) % 9) * 0.25).toFixed(2));
      const letterGrade = numericGrade <= 1.25 ? "A" : numericGrade <= 2.0 ? "B" : numericGrade <= 3.0 ? "C" : "F";
      const remarks = numericGrade <= 3.0 ? GradeRemark.PASSED : GradeRemark.FAILED;

      await prisma.grade.upsert({
        where: { enrollmentId: enrollment.id },
        update: {},
        create: {
          enrollmentId: enrollment.id,
          numericGrade,
          midtermGrade: numericGrade,
          finalGrade: numericGrade,
          letterGrade,
          remarks,
          isFinalized: true,
          submittedAt: new Date("2026-05-25"),
          submittedById: instructor1User.id,
        },
      });
      gradeCount++;
    }
  }

  // 2. Current active enrollments (110 active enrollments)
  for (let sIdx = 0; sIdx < 55; sIdx++) {
    const student = createdStudents[sIdx];
    // Assign 2 current offerings per student
    const curOff1 = currentOfferings[(sIdx * 2) % currentOfferings.length];
    const curOff2 = currentOfferings[(sIdx * 2 + 1) % currentOfferings.length];

    for (const curOff of [curOff1, curOff2]) {
      await prisma.enrollment.upsert({
        where: {
          studentId_courseOfferingId: {
            studentId: student.id,
            courseOfferingId: curOff.id,
          },
        },
        update: {},
        create: {
          studentId: student.id,
          courseOfferingId: curOff.id,
          status: EnrollmentStatus.ENROLLED,
          enrolledAt: new Date("2026-08-16"),
        },
      });
      enrollmentCount++;
    }
  }

  console.log(`✅ Seeding Complete!`);
  console.log(`📊 Total Programs seeded: ${programs.length} (Min requirement: 3)`);
  console.log(`📊 Total Courses seeded: ${Object.keys(createdCourses).length} (Min requirement: 20)`);
  console.log(`📊 Total Academic Terms seeded: 2 (Min requirement: 2)`);
  console.log(`📊 Total Course Offerings seeded: ${createdOfferings.length} (Min requirement: 20)`);
  console.log(`📊 Total Students seeded: ${createdStudents.length} (Min requirement: 100)`);
  console.log(`📊 Total Enrollments seeded: ${enrollmentCount} (Min requirement: 200)`);
  console.log(`📊 Total Grades seeded: ${gradeCount} (Min requirement: 100)`);
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
