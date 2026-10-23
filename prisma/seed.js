// Idempotent seed: safe to run many times.
// Load .env when present (not needed when env vars are already set, e.g. in Docker).
try { process.loadEnvFile(); } catch {}

const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

const SELLER = { name: "Demo Seller", email: "seller@gaarizo.pk", phone: "03001234567", password: "Seller@123" };

const APPROVED = [
  { title: "Toyota Corolla Altis 1.6 2021", brand: "Toyota", model: "Corolla", year: 2021, price: 6450000, mileage: 38000, city: "Lahore", fuel: "Petrol", transmission: "Automatic", engineCC: 1600, color: "White", isFeatured: true },
  { title: "Honda Civic Oriel 1.8 2019", brand: "Honda", model: "Civic", year: 2019, price: 5900000, mileage: 62000, city: "Islamabad", fuel: "Petrol", transmission: "Automatic", engineCC: 1800, color: "Silver", isFeatured: true },
  { title: "Suzuki Alto VXL AGS 2022", brand: "Suzuki", model: "Alto", year: 2022, price: 2850000, mileage: 21000, city: "Karachi", fuel: "Petrol", transmission: "Automatic", engineCC: 660, color: "Red" },
  { title: "Suzuki Cultus VXL 2018", brand: "Suzuki", model: "Cultus", year: 2018, price: 2650000, mileage: 54000, city: "Rawalpindi", fuel: "Petrol", transmission: "Manual", engineCC: 1000, color: "White" },
  { title: "KIA Sportage Alpha 2022", brand: "KIA", model: "Sportage", year: 2022, price: 8750000, mileage: 29000, city: "Lahore", fuel: "Petrol", transmission: "Automatic", engineCC: 2000, color: "Black", isFeatured: true },
  { title: "Hyundai Tucson GLS Sport 2023", brand: "Hyundai", model: "Tucson", year: 2023, price: 10250000, mileage: 14000, city: "Karachi", fuel: "Petrol", transmission: "Automatic", engineCC: 2000, color: "Grey" },
  { title: "Honda City Aspire 1.5 2020", brand: "Honda", model: "City", year: 2020, price: 4650000, mileage: 47000, city: "Faisalabad", fuel: "Petrol", transmission: "Automatic", engineCC: 1500, color: "Blue" },
  { title: "Toyota Yaris ATIV X 1.5 2021", brand: "Toyota", model: "Yaris", year: 2021, price: 4350000, mileage: 33000, city: "Islamabad", fuel: "Petrol", transmission: "Automatic", engineCC: 1500, color: "Silver" },
  { title: "Suzuki Swift DLX 1.3 2017", brand: "Suzuki", model: "Swift", year: 2017, price: 2950000, mileage: 71000, city: "Lahore", fuel: "Petrol", transmission: "Manual", engineCC: 1300, color: "Orange", images: [{ url: "/cars/swift.jpg", publicId: "" }] },
  { title: "Suzuki Wagon R VXL 2015", brand: "Suzuki", model: "Wagon R", year: 2015, price: 1850000, mileage: 98000, city: "Karachi", fuel: "CNG", transmission: "Manual", engineCC: 1000, color: "White" },
];

const PENDING = [
  { title: "Toyota Fortuner Sigma 4 2020", brand: "Toyota", model: "Fortuner", year: 2020, price: 14500000, mileage: 45000, city: "Lahore", fuel: "Diesel", transmission: "Automatic", engineCC: 2800, color: "Pearl White" },
  { title: "Honda BR-V i-VTEC S 2019", brand: "Honda", model: "BR-V", year: 2019, price: 4850000, mileage: 66000, city: "Rawalpindi", fuel: "Petrol", transmission: "Automatic", engineCC: 1500, color: "Grey" },
];

const DESCRIPTION =
  "Well maintained, first owner, complete service history. Genuine paint and original documents. Serious buyers only, price slightly negotiable.";

async function main() {
  // Admin from env, only if no admin exists.
  const adminExists = await prisma.user.findFirst({ where: { role: "ADMIN" } });
  if (!adminExists) {
    await prisma.user.create({
      data: {
        name: process.env.ADMIN_NAME || "Gaarizo Admin",
        email: (process.env.ADMIN_EMAIL || "admin@gaarizo.pk").toLowerCase(),
        phone: "03000000000",
        password: await bcrypt.hash(process.env.ADMIN_PASSWORD || "Admin@123", 10),
        role: "ADMIN",
      },
    });
    console.log("Admin user created");
  }

  // Demo ads only when the table is empty.
  if ((await prisma.ad.count()) === 0) {
    const seller = await prisma.user.upsert({
      where: { email: SELLER.email },
      update: {},
      create: { ...SELLER, password: await bcrypt.hash(SELLER.password, 10) },
    });
    const build = (a, status) => ({
      ...a,
      price: BigInt(a.price),
      description: DESCRIPTION,
      images: a.images || [],
      status,
      sellerId: seller.id,
    });
    await prisma.ad.createMany({
      data: [...APPROVED.map((a) => build(a, "APPROVED")), ...PENDING.map((a) => build(a, "PENDING"))],
    });
    console.log("Demo ads created");
  } else {
    console.log("Ads already exist, skipping demo data");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
