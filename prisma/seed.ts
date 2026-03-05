import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = "admin@onmart.com";
  const passwordHash = await hash("admin123", 10);

  try {
    const existing = await prisma.admin.findUnique({ where: { email: adminEmail } });
    if (existing) {
      await prisma.admin.update({
        where: { email: adminEmail },
        data: { passwordHash, name: "Admin" },
      });
      console.log("Admin password updated: admin@onmart.com / admin123");
      return;
    }
    await prisma.admin.create({
      data: { email: adminEmail, name: "Admin", passwordHash },
    });
    console.log("Admin created: admin@onmart.com / admin123");
  } catch (e) {
    console.error("Admin setup failed.", e);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
