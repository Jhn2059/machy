import { PrismaClient, Role, Shift } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('[machy] Iniciando seed...');

  const hashedPassword = await bcrypt.hash('admin123', 12);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@machy.pe' },
    update: {},
    create: {
      name: 'Administrador',
      email: 'admin@machy.pe',
      password: hashedPassword,
      role: Role.ADMIN,
      shift: Shift.NONE,
      active: true,
    },
  });

  console.log(`[machy] Admin creado: ${admin.email} / admin123`);

  const sellerPassword = await bcrypt.hash('vendedor123', 12);

  const seller = await prisma.user.upsert({
    where: { email: 'vendedor@machy.pe' },
    update: {},
    create: {
      name: 'Vendedor Demo',
      email: 'vendedor@machy.pe',
      password: sellerPassword,
      role: Role.SELLER,
      shift: Shift.FULL,
      active: true,
    },
  });

  console.log(`[machy] Vendedor creado: ${seller.email} / vendedor123`);

  const categories = [
    { name: 'Útiles Escolares' },
    { name: 'Papelería' },
    { name: 'Libros' },
    { name: 'Manualidades' },
    { name: 'Juguetes' },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { name: cat.name },
      update: {},
      create: cat,
    });
  }

  console.log(`[machy] ${categories.length} categorías creadas`);

  const configs = [
    { key: 'business_name', value: 'Librería Machy' },
    { key: 'business_ruc', value: '10000000001' },
    { key: 'business_address', value: 'Av. Principal 123, Lima' },
    { key: 'business_phone', value: '01-1234567' },
    { key: 'min_boleta_amount', value: '5.00' },
    { key: 'default_min_stock', value: '5' },
    { key: 'timezone', value: 'America/Lima' },
  ];

  for (const config of configs) {
    await prisma.systemConfig.upsert({
      where: { key: config.key },
      update: { value: config.value },
      create: config,
    });
  }

  console.log(`[machy] ${configs.length} configuraciones creadas`);
  console.log('[machy] Seed completado exitosamente');
}

main()
  .catch((e) => {
    console.error('[machy] Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
