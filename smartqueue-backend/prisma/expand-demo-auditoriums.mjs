import { PrismaClient } from '@prisma/client';

// Additive, repeatable demo layout. Never deletes seats or changes existing tickets.
export async function expandDemoAuditoriums(db) {
  if (process.env.NODE_ENV === 'production' && process.env.ALLOW_DEMO_SEED !== 'true') {
    throw new Error('Demo seed disabled in production');
  }
  const rooms = await db.auditorium.findMany({
    where: { name: 'Sala Demo 1', cinema: { name: { startsWith: 'Cinetrux Demo ' } } },
    select: { id: true, name: true },
  });
  for (const room of rooms) {
    await db.$transaction(async (tx) => {
      const data = [...'ABCDEFGHIJ'].flatMap((row) =>
        Array.from({ length: 14 }, (_, i) => i + 1)
          .filter((number) => number !== 9 && number !== 10)
          .map((number) => ({
            auditoriumId: room.id, row, number,
            type: row === 'D' && number === 1 ? 'ACCESSIBLE'
              : row === 'D' && number === 2 ? 'COMPANION'
                : 'GHIJ'.includes(row) ? 'PREMIUM' : 'STANDARD',
          })),
      );
      await tx.seat.createMany({ data, skipDuplicates: true });
      const capacity = await tx.seat.count({ where: { auditoriumId: room.id } });
      await tx.auditorium.update({ where: { id: room.id }, data: { capacity } });
    });
  }
  return rooms.length;
}

if (process.argv.includes('--apply')) {
  const db = new PrismaClient();
  try {
    console.log(`Salas demo ampliadas: ${await expandDemoAuditoriums(db)}`);
  } finally {
    await db.$disconnect();
  }
}
