import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/client';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Iniciando seed...');

  const sites = await Promise.all([
    prisma.site.upsert({
      where: {
        name: 'Manga Site A',
      },
      update: {},
      create: {
        name: 'Manga Site A',
        baseUrl: 'https://example.com',
      },
    }),
    prisma.site.upsert({
      where: {
        name: 'Manga Site B',
      },
      update: {},
      create: {
        name: 'Manga Site B',
        baseUrl: 'https://example.org',
      },
    }),
  ]);

  console.log(`✅ ${sites.length} sites criados/verificados.`);
}

main()
  .catch((error) => {
    console.error('❌ Erro ao executar seed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });