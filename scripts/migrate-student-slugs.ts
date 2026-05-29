import prisma from "@/lib/db";

// Helper to generate default slug from name
function generateDefaultSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Helper to ensure slug uniqueness
async function ensureUniqueSlug(
  baseSlug: string,
  excludeId?: string
): Promise<string> {
  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const existing = await prisma.student.findUnique({
      where: { slug },
    });

    if (!existing || existing.id === excludeId) {
      return slug;
    }

    slug = `${baseSlug}-${counter}`;
    counter++;
  }
}

async function migrateStudentSlugs() {
  console.log("🔄 Starting student slug migration...\n");

  // Find all students without slugs
  const studentsWithoutSlug = await prisma.student.findMany({
    where: { slug: null },
    select: { id: true, name: true },
  });

  if (studentsWithoutSlug.length === 0) {
    console.log("✅ All students already have slugs. No migration needed.");
    return;
  }

  console.log(`Found ${studentsWithoutSlug.length} students without slugs.\n`);

  let successCount = 0;
  let failureCount = 0;

  for (const student of studentsWithoutSlug) {
    try {
      // Generate slug from name
      const baseSlug = generateDefaultSlug(student.name);

      // Ensure it's unique
      const uniqueSlug = await ensureUniqueSlug(baseSlug);

      // Update student
      await prisma.student.update({
        where: { id: student.id },
        data: { slug: uniqueSlug },
      });

      console.log(`✓ ${student.name} → ${uniqueSlug}`);
      successCount++;
    } catch (error) {
      console.error(`✗ Failed to migrate ${student.name}:`, error);
      failureCount++;
    }
  }

  console.log(`\n📊 Migration Summary:`);
  console.log(`   ✓ Successfully migrated: ${successCount}`);
  console.log(`   ✗ Failed: ${failureCount}`);
  console.log(`\n✅ Student slug migration complete!`);
}

migrateStudentSlugs()
  .then(() => {
    console.log("\n🎉 All done!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Migration failed:", error);
    process.exit(1);
  });
