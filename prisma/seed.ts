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
    icon?: string;
    grouping: "MUSIC_VOCAL" | "MUSIC_INSTRUMENTAL" | "VISUAL_ARTS" | "LITERARY_ARTS" | "PERFORMING_ARTS" | "SPOKEN_WORD";
  }> = [
    { name: "Bengali Recitation", slug: "bengali-recitation", grouping: "SPOKEN_WORD" },
    { name: "English Recitation", slug: "english-recitation", grouping: "SPOKEN_WORD" },
    { name: "Rabindra Sangeet", slug: "rabindra-sangeet", grouping: "MUSIC_VOCAL" },
    { name: "Nazrul Geeti", slug: "nazrul-geeti", grouping: "MUSIC_VOCAL" },
    { name: "Classical Dance", slug: "classical-dance", grouping: "PERFORMING_ARTS" },
    { name: "Drawing & Painting", slug: "drawing-painting", grouping: "VISUAL_ARTS" },
    { name: "Creative Writing", slug: "creative-writing", grouping: "LITERARY_ARTS" },
    { name: "Story Telling", slug: "story-telling", grouping: "LITERARY_ARTS" },
    { name: "Folk Singing", slug: "folk-singing", grouping: "MUSIC_VOCAL" },
    { name: "Instrumental Flute", slug: "instrumental-flute", grouping: "MUSIC_INSTRUMENTAL" },
    { name: "Instrumental Sitar", slug: "instrumental-sitar", grouping: "MUSIC_INSTRUMENTAL" },
    { name: "Western Vocals", slug: "western-vocals", grouping: "MUSIC_VOCAL" },
    { name: "Clay Modeling", slug: "clay-modeling", grouping: "VISUAL_ARTS" },
    { name: "Photography", slug: "photography", grouping: "VISUAL_ARTS" },
    { name: "Drama & Mime", slug: "drama-mime", grouping: "PERFORMING_ARTS" },
    { name: "Handwriting Improvement", slug: "handwriting-improvement", grouping: "LITERARY_ARTS" },
    { name: "Hindustani Classical Vocals", slug: "hindustani-classical-vocals", grouping: "MUSIC_VOCAL" },
    { name: "Modern Bengali Songs", slug: "modern-bengali-songs", grouping: "MUSIC_VOCAL" },
    { name: "Digital Illustration", slug: "digital-illustration", grouping: "VISUAL_ARTS" },
    { name: "Elocution & Speech", slug: "elocution-speech", grouping: "SPOKEN_WORD" },
    { name: "Classical Vocal", slug: "classical-vocal", grouping: "MUSIC_VOCAL" },
    { name: "Classical Instrumental", slug: "classical-instrumental", grouping: "MUSIC_INSTRUMENTAL" },
    { name: "Poetry Recitation", slug: "poetry-recitation", grouping: "LITERARY_ARTS" },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { grouping: cat.grouping },
      create: cat,
    });
  }

  console.log(`✓ Seeded ${categories.length} categories with groupings`);

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

  // ─── SEED COMPETITIONS ────────────────────────────────────────────────────────

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

  // Secondary competition for testing
  const competition2 = await prisma.competition.upsert({
    where: { id: "6819db14-442d-43db-b8ad-02ef6a09449e" },
    update: {},
    create: {
      id: "6819db14-442d-43db-b8ad-02ef6a09449e",
      title: "Regional Arts Excellence 2026",
      description: "Regional competition for artistic talent across disciplines",
      entryFeeINR: 300,
      startDate: new Date(now.getFullYear(), now.getMonth(), 5),
      endDate: new Date(now.getFullYear(), now.getMonth() + 1, 5),
      registrationDeadline: new Date(now.getTime() + 20 * 24 * 60 * 60 * 1000),
      resultDate: new Date(now.getTime() + 50 * 24 * 60 * 60 * 1000),
      scope: "STATE",
      hostState: "West Bengal",
      difficultyLevel: 1,
      minJudgesRequired: 2,
    },
  });

  console.log("✓ Seeded 2 competitions");

  // ─── SEED COMPETITION CATEGORIES ───────────────────────────────────────────────

  const vocalCategory = await prisma.category.findUnique({
    where: { slug: "classical-vocal" },
  });

  const drawingCategory = await prisma.category.findUnique({
    where: { slug: "drawing-painting" },
  });

  const classicalDanceCategory = await prisma.category.findUnique({
    where: { slug: "classical-dance" },
  });

  const compCategories = [];
  const comp2Categories = [];

  // Categories for competition 1
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

  // Categories for competition 2
  if (vocalCategory) {
    const cc3 = await prisma.competitionCategory.upsert({
      where: {
        competitionId_categoryId_minAge_maxAge: {
          competitionId: competition2.id,
          categoryId: vocalCategory.id,
          minAge: 10,
          maxAge: 15,
        },
      },
      update: {},
      create: {
        competitionId: competition2.id,
        categoryId: vocalCategory.id,
        minAge: 10,
        maxAge: 15,
        language: "Any",
      },
    });
    comp2Categories.push(cc3);
  }

  if (classicalDanceCategory) {
    const cc4 = await prisma.competitionCategory.upsert({
      where: {
        competitionId_categoryId_minAge_maxAge: {
          competitionId: competition2.id,
          categoryId: classicalDanceCategory.id,
          minAge: 10,
          maxAge: 15,
        },
      },
      update: {},
      create: {
        competitionId: competition2.id,
        categoryId: classicalDanceCategory.id,
        minAge: 10,
        maxAge: 15,
        language: null,
      },
    });
    comp2Categories.push(cc4);
  }

  if (drawingCategory) {
    const cc5 = await prisma.competitionCategory.upsert({
      where: {
        competitionId_categoryId_minAge_maxAge: {
          competitionId: competition2.id,
          categoryId: drawingCategory.id,
          minAge: 10,
          maxAge: 15,
        },
      },
      update: {},
      create: {
        competitionId: competition2.id,
        categoryId: drawingCategory.id,
        minAge: 10,
        maxAge: 15,
        language: null,
      },
    });
    comp2Categories.push(cc5);
  }

  console.log(`✓ Seeded ${compCategories.length + comp2Categories.length} competition categories`);

  // ─── SEED REGISTRATIONS ────────────────────────────────────────────────────────

  const registrations = [];

  // Registrations for competition 1
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

  // Registrations for competition 2
  for (let i = 0; i < students.length; i++) {
    const compCategory = comp2Categories[i % comp2Categories.length];
    if (!compCategory) continue;

    const registrationId = `REG-${competition2.id.substring(0, 8).toUpperCase()}-${String(i + 1).padStart(3, "0")}`;
    const fbPostUrl = `https://facebook.com/post-${students[i].id}-comp2-${i}`;

    const registration = await prisma.registration.upsert({
      where: { registrationId },
      update: {},
      create: {
        studentId: students[i].id,
        competitionCategoryId: compCategory.id,
        fbPostUrl,
        registrationId,
        paymentStatus: Math.random() > 0.3 ? "SUCCESS" : "PENDING",
        status: Math.random() > 0.15 ? "VERIFIED" : "PENDING_VERIFICATION",
        finalRank: Math.random() > 0.5 ? Math.floor(Math.random() * 3) + 1 : null,
        finalScore: Math.random() > 0.5 ? 80 + Math.random() * 20 : null,
      },
    });
    registrations.push(registration);
  }

  console.log(`✓ Seeded ${registrations.length} registrations (participants) across 2 competitions`);

  // ─── SEED JUDGES ──────────────────────────────────────────────────────────────

  const judgePassword = await bcrypt.hash("password123", 10);
  const judges = [];

  const judgesData = [
    { email: "judge-classical-vocal@test.com", name: "Dr. Ravi Shankar", specs: ["classical-vocal", "hindustani-classical-vocals", "rabindra-sangeet"] },
    { email: "judge-classical-inst@test.com", name: "Prof. Ustad Ali Khan", specs: ["classical-instrumental", "instrumental-sitar", "instrumental-flute"] },
    { email: "judge-poetry@test.com", name: "Smt. Madhuri Dutta", specs: ["poetry-recitation", "creative-writing", "story-telling"] },
    { email: "judge-classical-dance@test.com", name: "Smt. Anita Verma", specs: ["classical-dance", "performing-arts"] },
    { email: "judge-visual-arts@test.com", name: "Mr. Rajesh Patel", specs: ["drawing-painting", "visual-arts", "digital-illustration"] },
  ];

  for (const judgeData of judgesData) {
    const judgeUser = await prisma.user.upsert({
      where: { email: judgeData.email },
      update: {},
      create: {
        email: judgeData.email,
        passwordHash: judgePassword,
        role: "JUDGE",
      },
    });

    const judge = await prisma.judge.upsert({
      where: { userId: judgeUser.id },
      update: { specializations: judgeData.specs },
      create: {
        userId: judgeUser.id,
        name: judgeData.name,
        specializations: judgeData.specs,
        tier: "NATIONAL",
        isVerified: true,
        yearsOfExperience: 15,
      },
    });
    judges.push(judge);
  }

  console.log(`✓ Seeded ${judges.length} judges with matching specializations`);

  // ─── ASSIGN JUDGES TO COMPETITIONS (MATCHING SPECIALIZATIONS) ─────────────────

  // Competition 1 categories: Classical Vocals, Drawing & Painting
  // Assign: Dr. Ravi Shankar (vocal), Mr. Rajesh Patel (visual arts)
  const vocalJudge = judges.find(j => j.specializations.includes("classical-vocal"));
  const visualArtsJudge = judges.find(j => j.specializations.includes("drawing-painting"));

  if (vocalJudge) {
    await prisma.competitionJudge.upsert({
      where: { competitionId_judgeId: { competitionId: competition.id, judgeId: vocalJudge.id } },
      update: {},
      create: { competitionId: competition.id, judgeId: vocalJudge.id },
    });
  }

  if (visualArtsJudge) {
    await prisma.competitionJudge.upsert({
      where: { competitionId_judgeId: { competitionId: competition.id, judgeId: visualArtsJudge.id } },
      update: {},
      create: { competitionId: competition.id, judgeId: visualArtsJudge.id },
    });
  }

  // Competition 2 categories: Classical Vocals, Classical Dance, Drawing & Painting
  // Assign: Dr. Ravi Shankar (vocal), Smt. Anita Verma (dance), Mr. Rajesh Patel (visual arts)
  const danceJudge = judges.find(j => j.specializations.includes("classical-dance"));

  if (vocalJudge) {
    await prisma.competitionJudge.upsert({
      where: { competitionId_judgeId: { competitionId: competition2.id, judgeId: vocalJudge.id } },
      update: {},
      create: { competitionId: competition2.id, judgeId: vocalJudge.id },
    });
  }

  if (danceJudge) {
    await prisma.competitionJudge.upsert({
      where: { competitionId_judgeId: { competitionId: competition2.id, judgeId: danceJudge.id } },
      update: {},
      create: { competitionId: competition2.id, judgeId: danceJudge.id },
    });
  }

  if (visualArtsJudge) {
    await prisma.competitionJudge.upsert({
      where: { competitionId_judgeId: { competitionId: competition2.id, judgeId: visualArtsJudge.id } },
      update: {},
      create: { competitionId: competition2.id, judgeId: visualArtsJudge.id },
    });
  }

  console.log("✓ Assigned judges to competitions (matched by category specializations)");

  // ─── SEED JUDGE ASSIGNMENTS & SCORES (VOTING DATA) ─────────────────────────────

  // Get all registrations for competition2
  const comp2Registrations = await prisma.registration.findMany({
    where: {
      competitionCategory: {
        competitionId: competition2.id,
      },
    },
    include: {
      competitionCategory: {
        include: { category: true },
      },
    },
  });

  let assignmentCount = 0;
  let scoreCount = 0;

  // Assign judges to registrations based on category match
  for (const registration of comp2Registrations) {
    const categorySlug = registration.competitionCategory.category.slug;

    // Find matching judge for this category
    let assignedJudge = null;
    if (categorySlug === "classical-vocal") {
      assignedJudge = vocalJudge;
    } else if (categorySlug === "classical-dance") {
      assignedJudge = danceJudge;
    } else if (categorySlug === "drawing-painting") {
      assignedJudge = visualArtsJudge;
    }

    if (!assignedJudge) continue;

    // Create judge assignment
    const assignment = await prisma.judgeAssignment.upsert({
      where: {
        registrationId_judgeId: {
          registrationId: registration.id,
          judgeId: assignedJudge.id,
        },
      },
      update: {},
      create: {
        registrationId: registration.id,
        judgeId: assignedJudge.id,
        isSubmitted: false,
      },
    });

    assignmentCount++;

    // Create scores for ~60% of assignments (simulate some judges have submitted)
    if (Math.random() > 0.4 && registration.status === "VERIFIED") {
      const c1 = Math.floor(Math.random() * 40); // 0-39 (max 40)
      const c2 = Math.floor(Math.random() * 30); // 0-29 (max 30)
      const c3 = Math.floor(Math.random() * 30); // 0-29 (max 30)
      const c4 = 0; // criteria4 only for national competitions, set to 0 for state competitions
      const total = c1 + c2 + c3 + c4; // Max 100

      await prisma.score.upsert({
        where: { judgeAssignmentId: assignment.id },
        update: {},
        create: {
          judgeAssignmentId: assignment.id,
          criteria1: c1,
          criteria2: c2,
          criteria3: c3,
          criteria4: c4,
          totalScore: total,
          remarks: "Good performance",
        },
      });

      // Update assignment to mark as submitted
      await prisma.judgeAssignment.update({
        where: { id: assignment.id },
        data: { isSubmitted: true, submittedAt: new Date() },
      });

      scoreCount++;
    }
  }

  console.log(`✓ Seeded ${assignmentCount} judge assignments with ${scoreCount} scores for voting`);
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
