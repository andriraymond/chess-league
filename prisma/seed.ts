import { PrismaClient, UserRole, UserStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const name = process.env.SEED_ADMIN_NAME ?? "Super Admin";
  const email = process.env.SEED_ADMIN_EMAIL ?? "admin@chess-league.com";
  const password = process.env.SEED_ADMIN_PASSWORD ?? "admin123";

  const existing = await prisma.user.findUnique({ where: { email } });

  if (existing) {
    console.log(`✓ Super Admin already exists: ${email}`);
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const superAdmin = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      role: UserRole.SUPER_ADMIN,
      status: UserStatus.APPROVED,
    },
  });

  console.log(`✓ Super Admin seeded: ${superAdmin.email} (id: ${superAdmin.id})`);
  console.log(`  ⚠️  Segera ubah password setelah login pertama!`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
