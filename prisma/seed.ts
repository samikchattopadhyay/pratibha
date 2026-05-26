import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // ─── SEED BANNER TEMPLATES ────────────────────────────────────────────────────

  const templates = [
    {
      name: "General Traditional Festival",
      slug: "general",
      imageUrl: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=800&q=80",
      description: "Classic festival celebration theme",
      tags: ["festival", "general"],
    },
    {
      name: "Classical Singing / Music",
      slug: "singing",
      imageUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80",
      description: "Theme for vocal and instrumental music competitions",
      tags: ["music", "singing", "classical"],
    },
    {
      name: "Drawing & Visual Arts",
      slug: "drawing",
      imageUrl: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&q=80",
      description: "Theme for visual arts and painting competitions",
      tags: ["art", "drawing", "visual"],
    },
    {
      name: "Literature / Recitation",
      slug: "recitation",
      imageUrl: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800&q=80",
      description: "Theme for literary and recitation competitions",
      tags: ["literature", "recitation", "speaking"],
    },
  ];

  for (const template of templates) {
    await prisma.bannerTemplate.upsert({
      where: { slug: template.slug },
      update: {},
      create: template,
    });
  }

  console.log("✓ Seeded 4 default banner templates");

  // ─── SEED CATEGORIES ──────────────────────────────────────────────────────────

  const categories: Array<{
    name: string;
    slug: string;
    icon: string;
    grouping: "MUSIC_VOCAL" | "MUSIC_INSTRUMENTAL" | "VISUAL_ARTS" | "LITERARY_ARTS";
  }> = [
    {
      name: "Classical Vocal",
      slug: "classical-vocal",
      icon: "Music",
      grouping: "MUSIC_VOCAL",
    },
    {
      name: "Classical Instrumental",
      slug: "classical-instrumental",
      icon: "Music",
      grouping: "MUSIC_INSTRUMENTAL",
    },
    {
      name: "Drawing & Painting",
      slug: "drawing-painting",
      icon: "Paintbrush",
      grouping: "VISUAL_ARTS",
    },
    {
      name: "Poetry Recitation",
      slug: "poetry-recitation",
      icon: "BookOpen",
      grouping: "LITERARY_ARTS",
    },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
  }

  console.log("✓ Seeded 4 categories");

  // ─── SEED ADMIN USER ─────────────────────────────────────────────────────────

  const adminPassword = await bcrypt.hash("admin123", 10);

  const adminUser = await prisma.user.upsert({
    where: { email: "admin@test.com" },
    update: {},
    create: {
      email: "admin@test.com",
      passwordHash: adminPassword,
      role: "SUPER_ADMIN",
    },
  });

  console.log("✓ Seeded admin user (admin@test.com / admin123)");

  // ─── SEED PARENT & STUDENTS ───────────────────────────────────────────────────

  const parentPassword = await bcrypt.hash("password123", 10);

  const parentUser = await prisma.user.upsert({
    where: { email: "parent@test.com" },
    update: {},
    create: {
      email: "parent@test.com",
      passwordHash: parentPassword,
      role: "PARENT",
    },
  });

  const parent = await prisma.parent.upsert({
    where: { userId: parentUser.id },
    update: {},
    create: {
      userId: parentUser.id,
      name: "Test Parent",
      phone: "9876543210",
      address: "123 Test Street",
      city: "Bangalore",
      state: "Karnataka",
      postalCode: "560001",
      country: "India",
    },
  });

  const firstNames = ["Arjun", "Priya", "Aditya", "Sneha", "Rahul", "Vikram", "Ananya", "Rohan", "Diya", "Karan"];
  const lastNames = ["Kumar", "Sharma", "Patel", "Gupta", "Singh", "Desai", "Iyer", "Nair", "Chopra", "Mehta"];

  const studentNames = [];
  for (let i = 0; i < 50; i++) {
    const firstName = firstNames[i % firstNames.length];
    const lastName = lastNames[Math.floor(i / firstNames.length) % lastNames.length];
    const year = 2009 + (i % 4);
    const month = String((i % 12) + 1).padStart(2, "0");
    const day = String((i % 28) + 1).padStart(2, "0");
    studentNames.push({
      name: `${firstName} ${lastName} ${i + 1}`,
      dob: `${year}-${month}-${day}`
    });
  }

  const students = [];
  for (const studentData of studentNames) {
    const student = await prisma.student.create({
      data: {
        parentId: parent.id,
        name: studentData.name,
        dateOfBirth: new Date(studentData.dob),
        gender: Math.random() > 0.5 ? "Male" : "Female",
        disciplineInterests: ["classical-vocal", "drawing-painting"],
      },
    });
    students.push(student);
  }

  console.log(`✓ Seeded parent and ${students.length} students`);

  // ─── SEED COMPETITION ─────────────────────────────────────────────────────────

  const now = new Date();
  const competition = await prisma.competition.upsert({
    where: { id: "ab40399e-dd92-4e6f-97bb-ec90ce434a56" },
    update: {},
    create: {
      id: "ab40399e-dd92-4e6f-97bb-ec90ce434a56",
      title: "National Talent Hunt 2026",
      description: "Premier national competition for young talent",
      entryFeeINR: 500,
      startDate: new Date(now.getFullYear(), now.getMonth(), 1),
      endDate: new Date(now.getFullYear(), now.getMonth() + 1, 0),
      registrationDeadline: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
      resultDate: new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000),
      scope: "NATIONAL",
      hostState: "Karnataka",
      difficultyLevel: 2,
      minJudgesRequired: 3,
    },
  });

  console.log("✓ Seeded competition");

  // ─── SEED COMPETITION CATEGORIES ───────────────────────────────────────────────

  const vocalCategory = await prisma.category.findUnique({
    where: { slug: "classical-vocal" },
  });

  const drawingCategory = await prisma.category.findUnique({
    where: { slug: "drawing-painting" },
  });

  const compCategories = [];

  if (vocalCategory) {
    const cc1 = await prisma.competitionCategory.upsert({
      where: {
        competitionId_categoryId_minAge_maxAge: {
          competitionId: competition.id,
          categoryId: vocalCategory.id,
          minAge: 8,
          maxAge: 12,
        },
      },
      update: {},
      create: {
        competitionId: competition.id,
        categoryId: vocalCategory.id,
        minAge: 8,
        maxAge: 12,
        language: "Any",
      },
    });
    compCategories.push(cc1);
  }

  if (drawingCategory) {
    const cc2 = await prisma.competitionCategory.upsert({
      where: {
        competitionId_categoryId_minAge_maxAge: {
          competitionId: competition.id,
          categoryId: drawingCategory.id,
          minAge: 8,
          maxAge: 12,
        },
      },
      update: {},
      create: {
        competitionId: competition.id,
        categoryId: drawingCategory.id,
        minAge: 8,
        maxAge: 12,
        language: null,
      },
    });
    compCategories.push(cc2);
  }

  console.log(`✓ Seeded ${compCategories.length} competition categories`);

  // ─── SEED REGISTRATIONS ────────────────────────────────────────────────────────

  const registrations = [];
  for (let i = 0; i < students.length; i++) {
    const compCategory = compCategories[i % compCategories.length];
    if (!compCategory) continue;

    const registrationId = `REG-${competition.id.substring(0, 8).toUpperCase()}-${String(i + 1).padStart(3, "0")}`;
    const fbPostUrl = `https://facebook.com/post-${students[i].id}-${i}`;

    const registration = await prisma.registration.upsert({
      where: { registrationId },
      update: {},
      create: {
        studentId: students[i].id,
        competitionCategoryId: compCategory.id,
        fbPostUrl,
        registrationId,
        paymentStatus: Math.random() > 0.2 ? "SUCCESS" : "PENDING",
        status: Math.random() > 0.1 ? "VERIFIED" : "PENDING_VERIFICATION",
        finalRank: Math.random() > 0.6 ? Math.floor(Math.random() * 3) + 1 : null,
        finalScore: Math.random() > 0.6 ? 85 + Math.random() * 15 : null,
      },
    });
    registrations.push(registration);
  }

  console.log(`✓ Seeded ${registrations.length} registrations (participants)`);

  // ─── SEED JUDGES ──────────────────────────────────────────────────────────────

  const judgePassword = await bcrypt.hash("password123", 10);
  const judges = [];

  for (let i = 0; i < 3; i++) {
    const judgeEmail = `judge${i + 1}@test.com`;

    const judgeUser = await prisma.user.upsert({
      where: { email: judgeEmail },
      update: {},
      create: {
        email: judgeEmail,
        passwordHash: judgePassword,
        role: "JUDGE",
      },
    });

    const judge = await prisma.judge.upsert({
      where: { userId: judgeUser.id },
      update: {},
      create: {
        userId: judgeUser.id,
        name: `Judge ${i + 1}`,
        specializations: ["vocal", "instrumental"],
        tier: i === 0 ? "NATIONAL" : "REGIONAL",
        isVerified: true,
        yearsOfExperience: 10 + i * 5,
      },
    });
    judges.push(judge);
  }

  console.log(`✓ Seeded ${judges.length} judges`);

  // ─── ASSIGN JUDGES TO COMPETITION ─────────────────────────────────────────────

  for (const judge of judges) {
    await prisma.competitionJudge.upsert({
      where: {
        competitionId_judgeId: {
          competitionId: competition.id,
          judgeId: judge.id,
        },
      },
      update: {},
      create: {
        competitionId: competition.id,
        judgeId: judge.id,
      },
    });
  }

  console.log("✓ Assigned judges to competition");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
