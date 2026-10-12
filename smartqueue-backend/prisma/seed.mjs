import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

await prisma.event.upsert({
  where: { slug: 'estreno-galactico' },
  update: {},
  create: {
    id: '001f5a1b-9a0e-4cb4-8c76-8fe880bfe17d',
    slug: 'estreno-galactico',
    name: 'Doomsday: estreno de medianoche',
    description: 'Evento ficticio para la demostración académica de SmartQueue ML.',
    startsAt: new Date('2026-12-17T23:45:00-05:00'),
    capacity: 100,
    availableStock: 100,
  },
});

await prisma.$disconnect();
