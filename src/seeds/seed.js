const connectDatabase = require("../config/db");
const User = require("../models/User");
const Country = require("../models/Country");
const Partner = require("../models/Partner");
const Institution = require("../models/Institution");
const AiSetting = require("../models/AiSetting");

async function seed() {
  await connectDatabase();

  await Promise.all([
    User.deleteMany({}),
    Country.deleteMany({}),
    Partner.deleteMany({}),
    Institution.deleteMany({}),
    AiSetting.deleteMany({})
  ]);

  const countries = await Country.insertMany([
    { name: "Australia", currency: "AUD", visaProcessingDays: 45, intakeSeasons: ["Feb", "Jul", "Nov"] },
    { name: "Canada", currency: "CAD", visaProcessingDays: 60, intakeSeasons: ["Jan", "May", "Sep"] },
    { name: "United Kingdom", currency: "GBP", visaProcessingDays: 35, intakeSeasons: ["Jan", "Sep"] }
  ]);

  const partners = await Partner.insertMany([
    { name: "Global Pathways", type: "pathway-provider", countries: [countries[0]._id, countries[1]._id], applicationFee: 150, tuitionFrom: 18000, tuitionTo: 32000, commissionRate: 12 },
    { name: "Premier Colleges", type: "college", countries: [countries[2]._id], applicationFee: 75, tuitionFrom: 14000, tuitionTo: 24000, commissionRate: 10 }
  ]);

  await User.create([
    {
      name: "Super Admin",
      email: "superadmin@example.com",
      password: "password123",
      passwordPreview: "password123",
      role: "super-admin",
      canManageUsers: true
    },
    {
      name: "Visa Worker",
      email: "worker@example.com",
      password: "password123",
      passwordPreview: "password123",
      role: "worker"
    }
  ]);

  await AiSetting.create({
    provider: "openai",
    model: "gpt-4.1"
  });

  console.log("Seed completed");
  process.exit(0);
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
