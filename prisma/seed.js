/* eslint-disable */
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const prisma = new PrismaClient();

// Helper lists for generating realistic Bengali and Indian names/data
const firstNamesParentMale = ["Avik", "Somnath", "Debashis", "Arpan", "Anirban", "Subrata", "Bhaskar", "Sandip", "Tanmoy", "Sayan", "Parthib", "Rajib", "Pranab", "Amit", "Sujit", "Sourav", "Bikram", "Gopal", "Joydeb", "Niladri", "Indranil", "Prokash", "Alok", "Barun", "Chiranjit", "Dipankar", "Koushik", "Manoj", "Pradip", "Ranjan", "Subhas", "Tarun"];
const firstNamesParentFemale = ["Sunetra", "Deboshree", "Tanuja", "Mousumi", "Rinku", "Soma", "Payel", "Piyali", "Kakali", "Keya", "Sucharita", "Lopamudra", "Priyanka", "Srabanti", "Mimi", "Koyel", "Subhashree", "Rituparna", "Swastika", "Tuhina", "Sanchari", "Anjali", "Barnali", "Chaitali", "Devika", "Gargi", "Jaya", "Mithu", "Nandini", "Rupa", "Shampa"];
const surnames = ["Sen", "Das", "Roy", "Dhar", "Bose", "Ghosh", "Mitra", "Banerjee", "Mukherjee", "Chatterjee", "Ganguly", "Bhattacharya", "Dutta", "Ray", "Chowdhury", "Sarkar", "Adhikary", "Samanta", "Manna", "Kundu", "Nath", "Guha", "Pramanik", "Majumdar", "Halder", "Naskar", "Chakraborty", "Bhowmick", "Saha", "Dasgupta", "Sen-Gupta", "Bagchi"];

// Bengali UTF-8 names
const firstNamesParentMaleBengali = ["অনির্বাণ", "ভাস্কর", "সৌম্য", "অমিত", "সন্দীপ", "রাজীব", "ইন্দ্রনীল", "দেবব্রত", "অভিষেক", "शुभमय"];
const firstNamesParentFemaleBengali = ["অনন্যা", "দেবস্মিতা", "সুনীতা", "মৌসুমী", "পায়েল", "শ্রেয়া", "লোপামুদ্রা", "তনুজা", "অর্পিতা", "প্রিয়াঙ্কা"];
const surnamesBengali = ["সেন", "দাস", "রায়", "ঘোষ", "ব্যানার্জী", "চ্যাটার্জী", "চক্রবর্তী", "সাহা", "মিত্র", "দত্ত"];

const studentNamesMale = ["Ritoban", "Soumyajit", "Srijan", "Abhirup", "Arkadeep", "Aniket", "Soham", "Ishan", "Aarav", "Vivaan", "Kabir", "Rohan", "Dev", "Neil", "Aditya", "Rishi", "Arjun", "Subho", "Bappa", "Sandy", "Riju", "Jojo", "Tubai", "Aaryan", "Ayush", "Joy", "Ritam", "Shibam", "Shouvik", "Sayandeep", "Saptarshi", "Pratyush"];
const studentNamesFemale = ["Madhurima", "Anwesha", "Pooja", "Sneha", "Riya", "Diya", "Ishita", "Tiyasa", "Bristi", "Rupsa", "Oindrila", "Shreya", "Ananya", "Pritha", "Rimi", "Tista", "Titir", "Payel", "Piu", "Misha", "Rini", "Buli", "Munmun", "Antara", "Debolina", "Koel", "Paulami", "Rupanjana", "Sayantika", "Sohini", "Sujata"];

const studentNamesMaleBengali = ["ঋতবান", "সৌম্যজিৎ", "অনিকেত", "আদিত্য", "কবীর", "অরিজিৎ", "শুভ", "সোহম", "ঈশান", "আরণ্যক"];
const studentNamesFemaleBengali = ["মধুরিমা", "অন্বেষা", "পূজা", "দিয়া", "শ্রেয়া", "ঐন্দ্রিলা", "সোহিনী", "তিয়াসা", "বৃষ্টি", "রুপসা"];

const cities = ["Kolkata", "Howrah", "Hooghly", "Kalyani", "Burdwan", "Siliguri", "Durgapur", "Kharagpur", "Asansol", "Suri", "Bolpur", "Barasat", "Barrackpore", "Ranaghat", "Midnapore", "Malda", "Cooch Behar", "Jalpaiguri", "Purulia", "Bankura"];

// International locations helper definitions
const internationalLocations = [
  {
    country: "USA",
    cities: ["New York", "San Jose", "Boston", "Seattle", "Austin"],
    states: ["NY", "CA", "MA", "WA", "TX"],
    postalCodes: ["10001", "95112", "02108", "98101", "73301"],
    phonePrefix: "+1 (555) 01",
    addressPrefixes: ["120 Broadway", "450 Sutter St", "88 Colin P Kelly Jr St", "2400 Sand Hill Rd", "100 Winchester Blvd"]
  },
  {
    country: "Bangladesh",
    cities: ["Dhaka", "Chittagong", "Sylhet", "Rajshahi", "Khulna"],
    states: ["Dhaka Division", "Chittagong Division", "Sylhet Division", "Rajshahi Division", "Khulna Division"],
    postalCodes: ["1212", "4000", "3100", "6000", "9000"],
    phonePrefix: "+880 171",
    addressPrefixes: ["Gulshan 2, Road 45", "Dhanmondi R/A, Road 27", "Banani Block H", "Agrabad C/A", "Zindabazar"]
  },
  {
    country: "United Kingdom",
    cities: ["London", "Birmingham", "Manchester", "Edinburgh", "Glasgow"],
    states: ["Greater London", "West Midlands", "Greater Manchester", "Midlothian", "Lanarkshire"],
    postalCodes: ["EC1A 1BB", "B1 1AY", "M1 1AE", "EH1 1YT", "G1 1QX"],
    phonePrefix: "+44 7911 5",
    addressPrefixes: ["10 Downing St", "221B Baker St", "50 High St", "12 Princes St", "88 Buchanan St"]
  },
  {
    country: "Canada",
    cities: ["Toronto", "Vancouver", "Montreal", "Calgary"],
    states: ["ON", "BC", "QC", "AB"],
    postalCodes: ["M5V 2T6", "V6B 2T4", "H2W 1Y4", "T2P 1J9"],
    phonePrefix: "+1 (604) 555-0",
    addressPrefixes: ["100 Queen St W", "300 W Georgia St", "450 Rue Saint-Jean", "800 5 Ave SW"]
  }
];
const remarksList = [
  "Excellent pronunciation and posture.",
  "Very melodious rendering, nice scale alignment.",
  "Needs minor practice on timing and tempo.",
  "Beautiful choice of colors and neat detailing.",
  "Great breath control throughout.",
  "Rhythm was slightly off at the end, but good try.",
  "Wonderful confidence and voice projection.",
  "Highly expressive and immersive performance.",
  "Good composition, try to work on structural margins.",
  "Impressive emotional delivery.",
  "Brilliant artwork. Promising talent.",
  "Strong classical base. Keep up the practice."
];

function getRandomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function main() {
  console.log("Starting large scale database seeding...");

  // 1. Clear existing records in correct order
  await prisma.certificate.deleteMany({});
  await prisma.score.deleteMany({});
  await prisma.socialMetric.deleteMany({});
  await prisma.judgeAssignment.deleteMany({});
  await prisma.transaction.deleteMany({});
  await prisma.registration.deleteMany({});
  await prisma.student.deleteMany({});
  await prisma.parent.deleteMany({});
  await prisma.judge.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.competitionCategory.deleteMany({});
  await prisma.competition.deleteMany({});
  await prisma.category.deleteMany({});

  console.log("Database cleared successfully.");

  // 2. Seed 15 Categories
  const categoriesData = [
    { name: "Bengali Recitation", slug: "bengali-recitation" },
    { name: "English Recitation", slug: "english-recitation" },
    { name: "Rabindra Sangeet", slug: "rabindra-sangeet" },
    { name: "Nazrul Geeti", slug: "nazrul-geeti" },
    { name: "Classical Dance", slug: "classical-dance" },
    { name: "Drawing & Painting", slug: "drawing-painting" },
    { name: "Creative Writing", slug: "creative-writing" },
    { name: "Story Telling", slug: "story-telling" },
    { name: "Folk Singing", slug: "folk-singing" },
    { name: "Instrumental Flute", slug: "instrumental-flute" },
    { name: "Instrumental Sitar", slug: "instrumental-sitar" },
    { name: "Western Vocals", slug: "western-vocals" },
    { name: "Clay Modeling", slug: "clay-modeling" },
    { name: "Photography", slug: "photography" },
    { name: "Drama & Mime", slug: "drama-mime" },
    { name: "Handwriting Improvement", slug: "handwriting-improvement" },
    { name: "Hindustani Classical Vocals", slug: "hindustani-classical-vocals" },
    { name: "Modern Bengali Songs", slug: "modern-bengali-songs" },
    { name: "Digital Illustration", slug: "digital-illustration" },
    { name: "Elocution & Speech", slug: "elocution-speech" }
  ];

  const categoryMap = {}; // slug -> id
  for (const cat of categoriesData) {
    const created = await prisma.category.create({
      data: cat
    });
    categoryMap[cat.slug] = created.id;
  }
  console.log(`Seeded ${categoriesData.length} Categories.`);

  // 3. Seed 10 Competitions (past, active, and upcoming)
  const competitionsData = [
    {
      title: "Nabanno Art Festival 2025",
      description: "Celebrate the harvest season through traditional drawings, paintings, and cultural recitations.",
      entryFeeINR: 40.00,
      startDate: new Date("2025-11-01T00:00:00.000Z"),
      endDate: new Date("2025-11-25T23:59:59.000Z"),
      registrationDeadline: new Date("2025-11-20T23:59:59.000Z"),
      resultDate: new Date("2025-11-30T18:00:00.000Z"),
      isActive: false,
      bannerUrl: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&q=80"
    },
    {
      title: "Bishwo Kobi Shradhyanjali 2025",
      description: "Tribute to Rabindranath Tagore and classical Fine Arts.",
      entryFeeINR: 50.00,
      startDate: new Date("2025-12-01T00:00:00.000Z"),
      endDate: new Date("2025-12-25T23:59:59.000Z"),
      registrationDeadline: new Date("2025-12-20T23:59:59.000Z"),
      resultDate: new Date("2025-12-30T18:00:00.000Z"),
      isActive: false,
      bannerUrl: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800&q=80"
    },
    {
      title: "Saraswati Puja Fine Arts 2026",
      description: "Annual children's and youth digital art and music festival celebrating Saraswati Puja.",
      entryFeeINR: 60.00,
      startDate: new Date("2026-01-10T00:00:00.000Z"),
      endDate: new Date("2026-02-10T23:59:59.000Z"),
      registrationDeadline: new Date("2026-02-05T23:59:59.000Z"),
      resultDate: new Date("2026-02-18T18:00:00.000Z"),
      isActive: false,
      bannerUrl: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=800&q=80"
    },
    {
      title: "Spring Art Carnival 2026",
      description: "Celebrating spring colors and fine arts creations.",
      entryFeeINR: 50.00,
      startDate: new Date("2026-02-20T00:00:00.000Z"),
      endDate: new Date("2026-03-15T23:59:59.000Z"),
      registrationDeadline: new Date("2026-03-10T23:59:59.000Z"),
      resultDate: new Date("2026-03-22T18:00:00.000Z"),
      isActive: false,
      bannerUrl: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&q=80"
    },
    {
      title: "Dol Jatra Utsav 2026",
      description: "Festival of colors themed drawings, music, and dances.",
      entryFeeINR: 70.00,
      startDate: new Date("2026-03-20T00:00:00.000Z"),
      endDate: new Date("2026-04-10T23:59:59.000Z"),
      registrationDeadline: new Date("2026-04-05T23:59:59.000Z"),
      resultDate: new Date("2026-04-18T18:00:00.000Z"),
      isActive: false,
      bannerUrl: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=800&q=80"
    },
    {
      title: "Bengali New Year Celebration 2026",
      description: "Poila Baisakh fine arts festival and performances.",
      entryFeeINR: 80.00,
      startDate: new Date("2026-04-12T00:00:00.000Z"),
      endDate: new Date("2026-05-05T23:59:59.000Z"),
      registrationDeadline: new Date("2026-04-30T23:59:59.000Z"),
      resultDate: new Date("2026-05-12T18:00:00.000Z"),
      isActive: false,
      bannerUrl: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800&q=80"
    },
    {
      title: "Borsha Bodhon 2026",
      description: "Online cultural competition celebrating monsoon themed performances.",
      entryFeeINR: 50.00,
      startDate: new Date("2026-05-01T00:00:00.000Z"),
      endDate: new Date("2026-06-20T23:59:59.000Z"),
      registrationDeadline: new Date("2026-06-15T23:59:59.000Z"),
      resultDate: new Date("2026-06-30T18:00:00.000Z"),
      isActive: true,
      bannerUrl: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800&q=80"
    },
    {
      title: "Independence Day Cultural Contest 2026",
      description: "Showcase patriotic spirit through speech, dance, poetry recitation, and patriotic songs.",
      entryFeeINR: 50.00,
      startDate: new Date("2026-05-15T00:00:00.000Z"),
      endDate: new Date("2026-06-15T23:59:59.000Z"),
      registrationDeadline: new Date("2026-06-10T23:59:59.000Z"),
      resultDate: new Date("2026-06-25T18:00:00.000Z"),
      isActive: true,
      bannerUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80"
    },
    {
      title: "Rabindra Smaran 2026",
      description: "Digital fine arts festival dedicated to Rabindranath Tagore.",
      entryFeeINR: 80.00,
      startDate: new Date("2026-07-01T00:00:00.000Z"),
      endDate: new Date("2026-07-25T23:59:59.000Z"),
      registrationDeadline: new Date("2026-07-20T23:59:59.000Z"),
      resultDate: new Date("2026-08-05T18:00:00.000Z"),
      isActive: true,
      bannerUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80"
    },
    {
      title: "Sharod Utsav Talent Hunt 2026",
      description: "Festival themed online competition for children and youth.",
      entryFeeINR: 100.00,
      startDate: new Date("2026-09-01T00:00:00.000Z"),
      endDate: new Date("2026-09-25T23:59:59.000Z"),
      registrationDeadline: new Date("2026-09-20T23:59:59.000Z"),
      resultDate: new Date("2026-10-05T18:00:00.000Z"),
      isActive: false,
      bannerUrl: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=800&q=80"
    },
    {
      title: "Durga Puja Digital Art & Music 2026",
      description: "Celebrate the grandest festival of Bengal with digital illustration, modern songs, and creative crafts.",
      entryFeeINR: 100.00,
      startDate: new Date("2026-09-15T00:00:00.000Z"),
      endDate: new Date("2026-10-15T23:59:59.000Z"),
      registrationDeadline: new Date("2026-10-10T23:59:59.000Z"),
      resultDate: new Date("2026-10-25T18:00:00.000Z"),
      isActive: false,
      bannerUrl: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&q=80"
    },
    {
      title: "Winter Fine Arts Carnival 2026",
      description: "Annual end-of-year fine arts and recitation competition.",
      entryFeeINR: 90.00,
      startDate: new Date("2026-12-01T00:00:00.000Z"),
      endDate: new Date("2026-12-25T23:59:59.000Z"),
      registrationDeadline: new Date("2026-12-20T23:59:59.000Z"),
      resultDate: new Date("2026-12-30T18:00:00.000Z"),
      isActive: false,
      bannerUrl: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=800&q=80"
    }
  ];

  const competitionMap = {}; // title -> id
  const competitionFeeMap = {}; // title -> fee
  const competitionsList = [];
  for (const comp of competitionsData) {
    const created = await prisma.competition.create({
      data: comp
    });
    competitionMap[comp.title] = created.id;
    competitionFeeMap[comp.title] = comp.entryFeeINR;
    competitionsList.push({ id: created.id, title: comp.title, isActive: comp.isActive, startDate: comp.startDate });
  }
  console.log(`Seeded ${competitionsData.length} Competitions.`);

  // 4. Map a specific, logical subset of Categories to each Competition with Junior/Senior divisions
  const compToCats = {
    "Nabanno Art Festival 2025": ["drawing-painting", "clay-modeling", "photography"],
    "Bishwo Kobi Shradhyanjali 2025": ["rabindra-sangeet", "bengali-recitation", "instrumental-sitar"],
    "Saraswati Puja Fine Arts 2026": ["drawing-painting", "classical-dance", "folk-singing"],
    "Spring Art Carnival 2026": ["drawing-painting", "creative-writing", "clay-modeling"],
    "Dol Jatra Utsav 2026": ["classical-dance", "folk-singing", "nazrul-geeti"],
    "Bengali New Year Celebration 2026": ["bengali-recitation", "rabindra-sangeet", "folk-singing"],
    "Borsha Bodhon 2026": ["rabindra-sangeet", "bengali-recitation", "story-telling"],
    "Independence Day Cultural Contest 2026": ["elocution-speech", "classical-dance", "handwriting-improvement", "english-recitation"],
    "Rabindra Smaran 2026": ["rabindra-sangeet", "instrumental-sitar", "drawing-painting"],
    "Sharod Utsav Talent Hunt 2026": ["classical-dance", "drawing-painting", "drama-mime"],
    "Durga Puja Digital Art & Music 2026": ["digital-illustration", "modern-bengali-songs", "clay-modeling"],
    "Winter Fine Arts Carnival 2026": ["english-recitation", "western-vocals", "drama-mime"]
  };

  const compCatMap = {}; // "competitionTitle|categorySlug" -> id[] (array of division IDs)
  const ccList = [];
  
  for (const compTitle in compToCats) {
    const slugs = compToCats[compTitle];
    for (const catSlug of slugs) {
      const compId = competitionMap[compTitle];
      const catId = categoryMap[catSlug];
      if (compId && catId) {
        // Create Junior Division (4-9)
        const junior = await prisma.competitionCategory.create({
          data: {
            competitionId: compId,
            categoryId: catId,
            minAge: 4,
            maxAge: 9
          }
        });
        // Create Senior Division (10-16)
        const senior = await prisma.competitionCategory.create({
          data: {
            competitionId: compId,
            categoryId: catId,
            minAge: 10,
            maxAge: 16
          }
        });
        
        compCatMap[`${compTitle}|${catSlug}`] = [junior.id, senior.id];
        ccList.push({ key: `${compTitle}|${catSlug}`, id: junior.id, compTitle, catSlug });
        ccList.push({ key: `${compTitle}|${catSlug}`, id: senior.id, compTitle, catSlug });
      }
    }
  }
  console.log(`Seeded ${ccList.length} CompetitionCategory mapping divisions.`);

  // 5. Seed Core System Users & Staff
  
  // A. Super Admin
  const hashedAdminPassword = await bcrypt.hash("adminpassword", 10);
  await prisma.user.create({
    data: {
      email: "admin@pratibhaparishad.org",
      passwordHash: hashedAdminPassword,
      role: "SUPER_ADMIN"
    }
  });

  // B. Moderators
  const hashedModPassword = await bcrypt.hash("moderatorpassword", 10);
  await prisma.user.create({
    data: { email: "moderator1@pratibhaparishad.org", passwordHash: hashedModPassword, role: "MODERATOR" }
  });
  await prisma.user.create({
    data: { email: "moderator2@pratibhaparishad.org", passwordHash: hashedModPassword, role: "MODERATOR" }
  });
  console.log("Seeded Admin and Moderator accounts.");

  // C. 20 Judges (Specialized across categories)
  const hashedJudgePassword = await bcrypt.hash("judgepassword", 10);
  const judgeIds = [];
  const judgeMap = {}; // name -> id
  
  for (let i = 1; i <= 25; i++) {
    const isMale = Math.random() > 0.5;
    const name = isMale 
      ? `Prof. ${getRandomItem(firstNamesParentMale)} ${getRandomItem(surnames)}`
      : `Smt. ${getRandomItem(firstNamesParentFemale)} ${getRandomItem(surnames)}`;
    const email = `judge${i}@pratibhaparishad.org`;
    
    // Choose 3 random category slugs
    const specializations = [];
    while (specializations.length < 3) {
      const slug = getRandomItem(categoriesData).slug;
      if (!specializations.includes(slug)) specializations.push(slug);
    }

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash: hashedJudgePassword,
        role: "JUDGE"
      }
    });

    const profile = await prisma.judge.create({
      data: {
        userId: user.id,
        name,
        specializations
      }
    });

    judgeIds.push(profile.id);
    judgeMap[name] = profile.id;
  }
  console.log(`Seeded ${judgeIds.length} Examiner/Judge profiles.`);

  // 6. Generate 300 Parent Profiles
  const parentIds = [];
  const parentEmailMap = {}; // email -> id
  const hashedParentPassword = await bcrypt.hash("parentpassword", 10);
  
  // Bulk create Users in chunks to avoid overloading memory
  console.log("Generating 300 Parent Users...");
  const parentUsersToCreate = [];
  for (let i = 1; i <= 300; i++) {
    parentUsersToCreate.push({
      id: crypto.randomUUID(),
      email: `parent_${i}@example.com`,
      passwordHash: hashedParentPassword,
      role: "PARENT"
    });
  }
  await prisma.user.createMany({ data: parentUsersToCreate });

  console.log("Generating Parent Profiles...");
  const parentProfilesToCreate = [];
  for (let i = 1; i <= 300; i++) {
    const isMale = Math.random() > 0.5;
    
    // 20% UTF-8 Bengali Names
    const isBengaliName = Math.random() < 0.2;
    let pName = "";
    if (isBengaliName) {
      const pFirstNameBen = isMale ? getRandomItem(firstNamesParentMaleBengali) : getRandomItem(firstNamesParentFemaleBengali);
      const pFirstNameEng = isMale ? getRandomItem(firstNamesParentMale) : getRandomItem(firstNamesParentFemale);
      const pSurnameBen = getRandomItem(surnamesBengali);
      const pSurnameEng = getRandomItem(surnames);
      pName = `${pFirstNameBen} ${pSurnameBen} (${pFirstNameEng} ${pSurnameEng})`;
    } else {
      const pFirstName = isMale ? getRandomItem(firstNamesParentMale) : getRandomItem(firstNamesParentFemale);
      const pSurname = getRandomItem(surnames);
      pName = `${pFirstName} ${pSurname}`;
    }
    
    const user = parentUsersToCreate[i - 1];

    // Country distribution: 80% India, 20% International
    const isInternational = Math.random() < 0.2;
    let country = "India";
    let city = getRandomItem(cities);
    let state = "West Bengal";
    let postalCode = String(getRandomInt(700001, 731999));
    let phone = `98300${String(i).padStart(5, "0")}`;
    let address = `${getRandomInt(1, 250)} ${getRandomItem(["Gariahat Road", "Lake Town", "Suri Main Road", "Salt Lake Sector V", "Howrah Ring Road", "Burdwan Grand Trunk Road"])}`;

    if (isInternational) {
      const loc = getRandomItem(internationalLocations);
      country = loc.country;
      const idx = getRandomInt(0, loc.cities.length - 1);
      city = loc.cities[idx];
      state = loc.states[idx];
      postalCode = loc.postalCodes ? loc.postalCodes[idx] : String(getRandomInt(loc.postalCodeRange[0], loc.postalCodeRange[1]));
      phone = `${loc.phonePrefix}${String(i).padStart(4, "0")}`;
      address = `${loc.addressPrefixes[idx]}, ${city}`;
    }

    parentProfilesToCreate.push({
      id: crypto.randomUUID(),
      userId: user.id,
      name: pName,
      phone: phone,
      address: address,
      city: city,
      state: state,
      postalCode: postalCode,
      country: country
    });
  }
  await prisma.parent.createMany({ data: parentProfilesToCreate });
  
  for (const p of parentProfilesToCreate) {
    parentIds.push(p.id);
    const user = parentUsersToCreate.find(u => u.id === p.userId);
    parentEmailMap[user.email] = p.id;
  }
  console.log(`Generated ${parentIds.length} Parent accounts.`);

  // 7. Generate 600 Student Profiles linked to Parents
  console.log("Generating 600 Student Profiles...");
  const studentsToCreate = [];
  for (let i = 1; i <= 600; i++) {
    const parentId = getRandomItem(parentIds);
    const isMale = Math.random() > 0.5;
    
    // Check if we generate Bengali name for student (20%)
    const isBengaliName = Math.random() < 0.2;
    let sName = "";
    if (isBengaliName) {
      const sFirstNameBen = isMale ? getRandomItem(studentNamesMaleBengali) : getRandomItem(studentNamesFemaleBengali);
      const sFirstNameEng = isMale ? getRandomItem(studentNamesMale) : getRandomItem(studentNamesFemale);
      
      const parent = parentProfilesToCreate.find(p => p.id === parentId);
      let sSurnameEng = getRandomItem(surnames);
      let sSurnameBen = getRandomItem(surnamesBengali);
      if (parent) {
        const cleanParentName = parent.name.replace(/\s*\([^)]*\)/g, "");
        const parts = cleanParentName.split(" ");
        sSurnameBen = parts[parts.length - 1];
        
        const engMatch = parent.name.match(/\(([^)]+)\)/);
        if (engMatch) {
          const engParts = engMatch[1].split(" ");
          sSurnameEng = engParts[engParts.length - 1];
        } else {
          sSurnameEng = parts[parts.length - 1];
        }
      }
      sName = `${sFirstNameBen} ${sSurnameBen} (${sFirstNameEng} ${sSurnameEng})`;
    } else {
      const sFirstName = isMale ? getRandomItem(studentNamesMale) : getRandomItem(studentNamesFemale);
      const parent = parentProfilesToCreate.find(p => p.id === parentId);
      let sSurname = getRandomItem(surnames);
      if (parent) {
        const engMatch = parent.name.match(/\(([^)]+)\)/);
        if (engMatch) {
          const engParts = engMatch[1].split(" ");
          sSurname = engParts[engParts.length - 1];
        } else {
          const parts = parent.name.split(" ");
          sSurname = parts[parts.length - 1];
        }
      }
      sName = `${sFirstName} ${sSurname}`;
    }
    
    const age = getRandomInt(4, 16);
    const birthDate = new Date();
    birthDate.setFullYear(birthDate.getFullYear() - age);
    birthDate.setMonth(getRandomInt(0, 11));
    birthDate.setDate(getRandomInt(1, 28));

    studentsToCreate.push({
      id: crypto.randomUUID(),
      parentId,
      name: sName,
      dateOfBirth: birthDate,
      gender: isMale ? "MALE" : "FEMALE"
    });
  }
  await prisma.student.createMany({ data: studentsToCreate });
  console.log(`Generated ${studentsToCreate.length} Student profiles.`);

  // 8. Generate 2400+ Registrations, Transactions, Grades, and Certificates
  console.log("Generating registrations, transactions, and evaluations...");

  const registrationsToCreate = [];
  const transactionsToCreate = [];
  const assignmentsToCreate = [];
  const scoresToCreate = [];
  const socialMetricsToCreate = [];
  const certificatesToCreate = [];

  let regCount = 1;
  let certCount = 1;

  // Seed registrations for completed and currently active competitions
  const targetCompetitions = competitionsList.filter(c => 
    c.title !== "Sharod Utsav Talent Hunt 2026" && 
    c.title !== "Winter Fine Arts Carnival 2026" && 
    c.title !== "Rabindra Smaran 2026" &&
    c.title !== "Durga Puja Digital Art & Music 2026"
  );

  for (const comp of targetCompetitions) {
    const compFee = competitionFeeMap[comp.title] || 50.00;
    const isCompActive = comp.isActive; // true for Borsha Bodhon 2026
    
    // Distribute ~350 entries per competition
    const numEntries = 350;
    const allowedSlugs = compToCats[comp.title] || [];
    
    for (let i = 1; i <= numEntries; i++) {
      const student = getRandomItem(studentsToCreate);
      if (allowedSlugs.length === 0) continue;
      const catSlug = getRandomItem(allowedSlugs);
      const ccIds = compCatMap[`${comp.title}|${catSlug}`];
      
      if (ccIds && ccIds.length > 0) {
        const ccId = getRandomItem(ccIds);
        const regId = crypto.randomUUID();
        const code = `PP2026${comp.title.substring(0, 3).toUpperCase()}${String(regCount).padStart(4, "0")}`;
        
        let payStatus = "SUCCESS";
        let regStatus = "VERIFIED";

        if (isCompActive) {
          // Mixed states for active competition: 75% Success/Verified, 5% Success/Rejected, 2% Success/Disqualified, 13% Pending, 5% Failed
          const rand = Math.random();
          if (rand < 0.75) {
            payStatus = "SUCCESS";
            regStatus = "VERIFIED";
          } else if (rand < 0.80) {
            payStatus = "SUCCESS";
            regStatus = "REJECTED";
          } else if (rand < 0.82) {
            payStatus = "SUCCESS";
            regStatus = "DISQUALIFIED";
          } else if (rand < 0.95) {
            payStatus = "PENDING";
            regStatus = "PENDING_VERIFICATION";
          } else {
            payStatus = "FAILED";
            regStatus = "REJECTED";
          }
        } else {
          // Finished competitions: 85% Success/Verified, 3% Success/Rejected, 2% Success/Disqualified, 10% Failed/Rejected
          const rand = Math.random();
          if (rand < 0.85) {
            payStatus = "SUCCESS";
            regStatus = "VERIFIED";
          } else if (rand < 0.88) {
            payStatus = "SUCCESS";
            regStatus = "REJECTED";
          } else if (rand < 0.90) {
            payStatus = "SUCCESS";
            regStatus = "DISQUALIFIED";
          } else {
            payStatus = "FAILED";
            regStatus = "REJECTED";
          }
        }

        const createdDate = new Date(comp.startDate);
        createdDate.setDate(createdDate.getDate() + getRandomInt(0, 15));

        registrationsToCreate.push({
          id: regId,
          studentId: student.id,
          competitionCategoryId: ccId,
          registrationId: code,
          fbPostUrl: `https://facebook.com/groups/pratibhaparishad/posts/${comp.title.replace(/\s+/g, "_")}_${regCount}`,
          paymentStatus: payStatus,
          status: regStatus,
          createdAt: createdDate,
          updatedAt: createdDate
        });

        // Seed Transaction
        transactionsToCreate.push({
          id: crypto.randomUUID(),
          registrationId: regId,
          razorpayOrderId: `order_${code}`,
          razorpayPaymentId: payStatus === "SUCCESS" ? `pay_${code}` : null,
          amount: compFee,
          status: payStatus,
          createdAt: createdDate
        });

        // If paid success, generate marks and certifications
        if (payStatus === "SUCCESS") {
          // Generate Social Metric
          const seedNum = regCount + i;
          
          // Viral outlier logic: 1% of success entries have extremely high engagement
          const isViral = Math.random() < 0.01;
          const likes = isViral ? getRandomInt(5000, 15000) : ((seedNum * 13) % 450 + 20);
          const comments = isViral ? getRandomInt(1000, 3000) : ((seedNum * 7) % 120 + 5);
          const shares = isViral ? getRandomInt(500, 1500) : ((seedNum * 3) % 50 + 1);
          
          const rawPoints = likes * 1 + comments * 2 + shares * 5;
          const socialScore = Math.min((rawPoints / 500) * 100, 100);

          socialMetricsToCreate.push({
            id: crypto.randomUUID(),
            registrationId: regId,
            likesCount: likes,
            commentsCount: comments,
            sharesCount: shares,
            calculatedEngagement: socialScore
          });

          // Ongoing active competition: 40% of success entries are ungraded (assigned but pending evaluation)
          // But if registration status is REJECTED or DISQUALIFIED, we do not grade them
          const leaveUngraded = (isCompActive && (Math.random() > 0.6)) || regStatus === "REJECTED" || regStatus === "DISQUALIFIED";

          // Assign 2 random judges
          const j1Index = seedNum % judgeIds.length;
          const j2Index = (seedNum + 1) % judgeIds.length;
          const j1Id = judgeIds[j1Index];
          const j2Id = judgeIds[j2Index];

          const assign1Id = crypto.randomUUID();
          const assign2Id = crypto.randomUUID();

          assignmentsToCreate.push({
            id: assign1Id,
            registrationId: regId,
            judgeId: j1Id,
            isSubmitted: !leaveUngraded,
            assignedAt: createdDate,
            submittedAt: leaveUngraded ? null : createdDate
          });

          assignmentsToCreate.push({
            id: assign2Id,
            registrationId: regId,
            judgeId: j2Id,
            isSubmitted: !leaveUngraded,
            assignedAt: createdDate,
            submittedAt: leaveUngraded ? null : createdDate
          });

          if (!leaveUngraded) {
            // Generate Score records
            // Force a tied score scenario for every 50th registration
            let c1Score1, c2Score1, c3Score1, total1;
            let c1Score2, c2Score2, c3Score2, total2;
            
            const isTiedScenario = (regCount % 50 === 0);
            if (isTiedScenario) {
              c1Score1 = 30; c2Score1 = 20; c3Score1 = 20; // 70
              c1Score2 = 30; c2Score2 = 20; c3Score2 = 20; // 70
              total1 = 70;
              total2 = 70;
              // Override socialScore to be exactly identical
              socialMetricsToCreate[socialMetricsToCreate.length - 1].calculatedEngagement = 85.00;
            } else {
              c1Score1 = 20 + (seedNum % 21); // Technique/Skill (20-40)
              c2Score1 = 15 + (seedNum % 16); // Expression (15-30)
              c3Score1 = 15 + (seedNum % 16); // Rhythm (15-30)
              total1 = c1Score1 + c2Score1 + c3Score1;

              c1Score2 = 20 + ((seedNum + 3) % 21);
              c2Score2 = 15 + ((seedNum + 3) % 16);
              c3Score2 = 15 + ((seedNum + 3) % 16);
              total2 = c1Score2 + c2Score2 + c3Score2;
            }

            scoresToCreate.push({
              id: crypto.randomUUID(),
              judgeAssignmentId: assign1Id,
              criteria1: c1Score1,
              criteria2: c2Score1,
              criteria3: c3Score1,
              totalScore: total1,
              remarks: getRandomItem(remarksList)
            });

            scoresToCreate.push({
              id: crypto.randomUUID(),
              judgeAssignmentId: assign2Id,
              criteria1: c1Score2,
              criteria2: c2Score2,
              criteria3: c3Score2,
              totalScore: total2,
              remarks: getRandomItem(remarksList)
            });

            // Calculate final composite score
            const juryAverage = (total1 + total2) / 2;
            const currentSocialScore = socialMetricsToCreate[socialMetricsToCreate.length - 1].calculatedEngagement;
            const finalScore = juryAverage * 0.7 + currentSocialScore * 0.3;

            let awardType = "PARTICIPATION";
            if (finalScore >= 92) awardType = "MERIT_1";
            else if (finalScore >= 85) awardType = "MERIT_2";
            else if (finalScore >= 78) awardType = "MERIT_3";
            else if (finalScore >= 72) awardType = "SPECIAL_MENTION";

            const certCode = `CERT-PP-2026-${String(certCount).padStart(5, "0")}`;
            certificatesToCreate.push({
              id: crypto.randomUUID(),
              registrationId: regId,
              certificateId: certCode,
              certificateUrl: `https://cdn.pratibhaparishad.org/certificates/${certCode}.pdf`,
              qrCodeUrl: `https://cdn.pratibhaparishad.org/qrcodes/${certCode}.png`,
              type: awardType,
              issuedAt: createdDate
            });

            certCount++;
          }
        }

        regCount++;
      }
    }
  }

  // 9. Bulk insert all records in dependency chunks to avoid constraint violation
  console.log(`Writing ${registrationsToCreate.length} Registrations to database...`);
  // Chunk inserting to prevent too large transaction sizes in Postgres
  const chunkSize = 500;
  for (let i = 0; i < registrationsToCreate.length; i += chunkSize) {
    await prisma.registration.createMany({ data: registrationsToCreate.slice(i, i + chunkSize) });
  }

  console.log(`Writing ${transactionsToCreate.length} Transactions to database...`);
  for (let i = 0; i < transactionsToCreate.length; i += chunkSize) {
    await prisma.transaction.createMany({ data: transactionsToCreate.slice(i, i + chunkSize) });
  }

  console.log(`Writing ${socialMetricsToCreate.length} SocialMetrics to database...`);
  for (let i = 0; i < socialMetricsToCreate.length; i += chunkSize) {
    await prisma.socialMetric.createMany({ data: socialMetricsToCreate.slice(i, i + chunkSize) });
  }

  console.log(`Writing ${assignmentsToCreate.length} JudgeAssignments to database...`);
  for (let i = 0; i < assignmentsToCreate.length; i += chunkSize) {
    await prisma.judgeAssignment.createMany({ data: assignmentsToCreate.slice(i, i + chunkSize) });
  }

  console.log(`Writing ${scoresToCreate.length} Scores to database...`);
  for (let i = 0; i < scoresToCreate.length; i += chunkSize) {
    await prisma.score.createMany({ data: scoresToCreate.slice(i, i + chunkSize) });
  }

  console.log(`Writing ${certificatesToCreate.length} Certificates to database...`);
  for (let i = 0; i < certificatesToCreate.length; i += chunkSize) {
    await prisma.certificate.createMany({ data: certificatesToCreate.slice(i, i + chunkSize) });
  }

  console.log(`Bulk Seeding completed!`);
  console.log(`Summary of Seeded Volumes:`);
  console.log(`- Categories: ${categoriesData.length}`);
  console.log(`- Competitions: ${competitionsList.length}`);
  console.log(`- Division mappings: ${ccList.length}`);
  console.log(`- Parent Accounts: 300`);
  console.log(`- Student Child profiles: 600`);
  console.log(`- Submissions (Registrations): ${registrationsToCreate.length}`);
  console.log(`- Transactions: ${transactionsToCreate.length}`);
  console.log(`- Double-Blind Assignments: ${assignmentsToCreate.length}`);
  console.log(`- Examiner Scores: ${scoresToCreate.length}`);
  console.log(`- Generated Certificates: ${certificatesToCreate.length}`);

  // 10. ─── SPECIAL SEED: SHUBHAM DAS (MULTI-WINNER STUDENT) ───────────────────
  console.log("\n🌟 Seeding Shubham Das with multiple winning entries...");

  // Create parent for Shubham Das
  const shubhamParentUser = await prisma.user.create({
    data: {
      email: "shubham.parent@example.com",
      passwordHash: await bcrypt.hash("password123", 10),
      role: "PARENT"
    }
  });

  const shubhamParent = await prisma.parent.create({
    data: {
      userId: shubhamParentUser.id,
      name: "Ashok Kumar Das",
      phone: "9876543210",
      address: "123 Suren Road, Chowringhee",
      city: "Kolkata",
      state: "West Bengal",
      postalCode: "700020",
      country: "India"
    }
  });

  // Create Shubham Das student (age 12)
  const shubhamStudent = await prisma.student.create({
    data: {
      parentId: shubhamParent.id,
      name: "Shubham Das",
      dateOfBirth: new Date("2013-05-15"),
      gender: "MALE",
      disciplineInterests: ["rabindra-sangeet", "drawing-painting", "classical-dance", "instrumental-sitar"],
      slug: "shubham-das",
      profileImageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80",
      bio: "Young talented performer excelling in classical music and fine arts",
      city: "Kolkata",
      state: "West Bengal",
      schoolName: "St. Xavier's School",
      schoolClass: "Class 7",
      trainingInstitutes: ["Dover Lane Music Academy", "Rabindra Sarovar Open Air Theatre"],
      languages: ["Bengali", "Hindi", "English"],
      specialSkills: ["Rabindra Sangeet", "Classical Drawing", "Bharatanatyam"],
      isPublic: true
    }
  });

  console.log(`✓ Created Shubham Das (ID: ${shubhamStudent.id})`);

  // Define winning competitions and categories for Shubham
  const shubhamWinningEntries = [
    {
      compTitle: "Saraswati Puja Fine Arts 2026",
      categories: [
        { slug: "rabindra-sangeet", rank: 1, score: 96.5 }, // 1st Place
        { slug: "drawing-painting", rank: 2, score: 92.0 }, // 2nd Place
      ]
    },
    {
      compTitle: "Bengali New Year Celebration 2026",
      categories: [
        { slug: "rabindra-sangeet", rank: 1, score: 97.5 }, // 1st Place
        { slug: "folk-singing", rank: 3, score: 89.0 }, // 3rd Place
      ]
    },
    {
      compTitle: "Borsha Bodhon 2026",
      categories: [
        { slug: "bengali-recitation", rank: 2, score: 91.5 }, // 2nd Place
        { slug: "story-telling", rank: 1, score: 95.0 }, // 1st Place
      ]
    },
    {
      compTitle: "Spring Art Carnival 2026",
      categories: [
        { slug: "drawing-painting", rank: 1, score: 94.0 }, // 1st Place
      ]
    },
    {
      compTitle: "Dol Jatra Utsav 2026",
      categories: [
        { slug: "classical-dance", rank: 1, score: 93.5 }, // 1st Place
        { slug: "folk-singing", rank: 2, score: 90.5 }, // 2nd Place
      ]
    },
    {
      compTitle: "Independence Day Cultural Contest 2026",
      categories: [
        { slug: "english-recitation", rank: 1, score: 95.5 }, // 1st Place
      ]
    },
    {
      compTitle: "Nabanno Art Festival 2025",
      categories: [
        { slug: "drawing-painting", rank: 1, score: 96.0 }, // 1st Place
        { slug: "photography", rank: 2, score: 91.0 }, // 2nd Place
      ]
    },
    {
      compTitle: "Bishwo Kobi Shradhyanjali 2025",
      categories: [
        { slug: "rabindra-sangeet", rank: 1, score: 98.0 }, // 1st Place - Highest Score!
        { slug: "instrumental-sitar", rank: 3, score: 88.5 }, // 3rd Place
      ]
    }
  ];

  let shubhamRegCount = 1;
  let shubhamCertCount = 1;
  const prizePoolsToCreate = [];
  const prizeItemsToCreate = [];
  const prizeAwardsToCreate = [];

  for (const entry of shubhamWinningEntries) {
    const compId = competitionMap[entry.compTitle];
    if (!compId) continue;

    const comp = competitionsList.find(c => c.title === entry.compTitle);
    if (!comp) continue;

    const compFee = competitionFeeMap[entry.compTitle] || 50.00;

    // Create Prize Pool if it doesn't exist
    let prizePool = await prisma.prizePool.findUnique({
      where: { competitionId: compId }
    });

    if (!prizePool) {
      prizePool = await prisma.prizePool.create({
        data: {
          competitionId: compId,
          title: `${entry.compTitle} - Prize Pool`,
          description: "Prizes for top performers",
          isPublished: true
        }
      });
    }

    // Create Prize Items for this pool if needed
    const prizeItemsMap = {};
    for (const rank of ["FIRST_PLACE", "SECOND_PLACE", "THIRD_PLACE"]) {
      let item = await prisma.prizeItem.findFirst({
        where: {
          prizePoolId: prizePool.id,
          rank: rank
        }
      });

      if (!item) {
        item = await prisma.prizeItem.create({
          data: {
            prizePoolId: prizePool.id,
            rank: rank,
            type: "DIGITAL_CERTIFICATE",
            title: `${rank.replace("_", " ")} Prize`,
            description: `Digital Certificate for ${rank.replace("_", " ")}`,
            estimatedValue: rank === "FIRST_PLACE" ? 5000 : rank === "SECOND_PLACE" ? 3000 : 1500,
            isPhysical: false
          }
        });
      }
      prizeItemsMap[rank] = item.id;
    }

    // Create registrations and awards for each category
    for (const cat of entry.categories) {
      const ccIds = compCatMap[`${entry.compTitle}|${cat.slug}`];
      if (!ccIds || ccIds.length === 0) continue;

      const ccId = ccIds[1]; // Use Senior Division (10-16)
      const regId = crypto.randomUUID();
      const code = `PP2026${entry.compTitle.substring(0, 3).toUpperCase()}SHU${String(shubhamRegCount).padStart(3, "0")}`;

      const createdDate = new Date(comp.startDate);
      createdDate.setDate(createdDate.getDate() + getRandomInt(1, 10));

      // Determine final rank for ranking system
      let finalRank = null;
      if (cat.rank === 1) finalRank = 1;
      else if (cat.rank === 2) finalRank = 2;
      else if (cat.rank === 3) finalRank = 3;

      // Create registration
      const registration = await prisma.registration.create({
        data: {
          id: regId,
          studentId: shubhamStudent.id,
          competitionCategoryId: ccId,
          registrationId: code,
          fbPostUrl: `https://facebook.com/groups/pratibhaparishad/posts/${entry.compTitle.replace(/\s+/g, "_")}_shubham_${shubhamRegCount}`,
          paymentStatus: "SUCCESS",
          status: "VERIFIED",
          finalRank: finalRank,
          finalScore: cat.score,
          createdAt: createdDate,
          updatedAt: createdDate
        }
      });

      // Create transaction
      await prisma.transaction.create({
        data: {
          id: crypto.randomUUID(),
          registrationId: regId,
          razorpayOrderId: `order_${code}`,
          razorpayPaymentId: `pay_${code}`,
          amount: compFee,
          status: "SUCCESS",
          createdAt: createdDate
        }
      });

      // Create social metric (high engagement for winner)
      await prisma.socialMetric.create({
        data: {
          id: crypto.randomUUID(),
          registrationId: regId,
          likesCount: getRandomInt(800, 1500),
          commentsCount: getRandomInt(200, 400),
          sharesCount: getRandomInt(100, 250),
          calculatedEngagement: cat.score * 0.95 // High engagement for winners
        }
      });

      // Create judge assignments with high scores
      const j1Index = shubhamRegCount % judgeIds.length;
      const j2Index = (shubhamRegCount + 1) % judgeIds.length;
      const j1Id = judgeIds[j1Index];
      const j2Id = judgeIds[j2Index];

      const assign1Id = crypto.randomUUID();
      const assign2Id = crypto.randomUUID();

      await prisma.judgeAssignment.create({
        data: {
          id: assign1Id,
          registrationId: regId,
          judgeId: j1Id,
          isSubmitted: true,
          assignedAt: createdDate,
          submittedAt: createdDate
        }
      });

      await prisma.judgeAssignment.create({
        data: {
          id: assign2Id,
          registrationId: regId,
          judgeId: j2Id,
          isSubmitted: true,
          assignedAt: createdDate,
          submittedAt: createdDate
        }
      });

      // Create high scores
      const scoreValue1 = Math.floor(cat.score * 0.95);
      const scoreValue2 = Math.floor(cat.score * 0.90);

      await prisma.score.create({
        data: {
          id: crypto.randomUUID(),
          judgeAssignmentId: assign1Id,
          criteria1: Math.floor(scoreValue1 * 0.4),
          criteria2: Math.floor(scoreValue1 * 0.3),
          criteria3: Math.floor(scoreValue1 * 0.3),
          totalScore: scoreValue1,
          remarks: "Exceptional talent with outstanding execution!"
        }
      });

      await prisma.score.create({
        data: {
          id: crypto.randomUUID(),
          judgeAssignmentId: assign2Id,
          criteria1: Math.floor(scoreValue2 * 0.4),
          criteria2: Math.floor(scoreValue2 * 0.3),
          criteria3: Math.floor(scoreValue2 * 0.3),
          totalScore: scoreValue2,
          remarks: "Brilliant performance, shows great promise!"
        }
      });

      // Create prize award
      const rankMap = { 1: "FIRST_PLACE", 2: "SECOND_PLACE", 3: "THIRD_PLACE" };
      const prizeRank = rankMap[cat.rank];
      const prizeItemId = prizeItemsMap[prizeRank];

      const prizeAwardId = crypto.randomUUID();
      await prisma.prizeAward.create({
        data: {
          id: prizeAwardId,
          prizeItemId: prizeItemId,
          registrationId: regId,
          rank: prizeRank,
          awardedAt: createdDate,
          isDispatched: false
        }
      });

      // Create certificate
      const certCode = `CERT-PP-SHUBHAM-${String(shubhamCertCount).padStart(4, "0")}`;
      await prisma.certificate.create({
        data: {
          id: crypto.randomUUID(),
          registrationId: regId,
          certificateId: certCode,
          certificateUrl: `https://cdn.pratibhaparishad.org/certificates/${certCode}.pdf`,
          qrCodeUrl: `https://cdn.pratibhaparishad.org/qrcodes/${certCode}.png`,
          type: prizeRank === "FIRST_PLACE" ? "MERIT_1" : prizeRank === "SECOND_PLACE" ? "MERIT_2" : "MERIT_3",
          prizeAwardId: prizeAwardId,
          issuedAt: createdDate
        }
      });

      shubhamRegCount++;
      shubhamCertCount++;

      console.log(`  ✓ ${entry.compTitle} - ${cat.slug} (#${cat.rank} Place, Score: ${cat.score})`);
    }
  }

  console.log(`✓ Seeded Shubham Das with ${shubhamRegCount - 1} winning registrations and ${shubhamCertCount - 1} certificates!\n`);
}

main()
  .catch((e) => {
    console.error("Bulk seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
