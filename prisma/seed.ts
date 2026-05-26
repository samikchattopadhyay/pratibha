import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
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
