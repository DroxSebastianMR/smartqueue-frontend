import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { spawn } from 'node:child_process';

if (process.env.NODE_ENV === 'production') throw new Error('Pilot disabled in production');
const database = new URL(process.env.DATABASE_URL ?? '');
const apiBase = process.env.PILOT_API_URL ?? 'http://127.0.0.1:3001/api/v1';
const api = new URL(apiBase);
if (!['localhost', '127.0.0.1'].includes(database.hostname) ||
    database.port !== '55432' || database.pathname !== '/smartqueue_experiments' ||
    !['localhost', '127.0.0.1'].includes(api.hostname) || api.port !== '3001') {
  throw new Error('Pilot requires the isolated local database on 55432 and API on 3001');
}
if (!process.env.AUTH_ADMIN_EMAIL || !process.env.AUTH_ADMIN_PASSWORD) throw new Error('Demo admin configuration required');
const db = new PrismaClient();
const directory = resolve('../smartqueue-ai/data/generated/http-pilot', new Date().toISOString().replaceAll(':', '-'));
await mkdir(directory, { recursive: true });
const events = [];
const simulateClients = process.argv.includes('--simulate-clients');
const modes = (process.env.PILOT_MODES ?? 'FIXED,REACTIVE,PREDICTIVE').split(',');
if (!modes.length || modes.some(mode => !['FIXED', 'REACTIVE', 'PREDICTIVE'].includes(mode))) throw new Error('Invalid PILOT_MODES');
try {
  for (const mode of modes) {
    const event = await db.event.create({ data: {
      slug: `http-pilot-${randomUUID()}`, name: `HTTP pilot ${mode}`,
      description: 'Isolated demo records: 60 arrivals, no real payment. Not a final load benchmark.',
      startsAt: new Date(Date.now() + 86400000), capacity: 200, availableStock: 200,
    } });
    events.push({ id: event.id, mode });
  }
} finally { await db.$disconnect(); }
const file = resolve(directory, 'events.json');
await writeFile(file, JSON.stringify(events, null, 2));
console.log(`Pilot evidence: ${directory}`);
const extra = simulateClients ? process.argv.slice(2).filter(arg => arg !== '--simulate-clients') : [];
const child = spawn(resolve('../smartqueue-ai/.venv/Scripts/python.exe'), ['-m', simulateClients ? 'simulation.client_simulator' : 'simulation.http_pilot', '--events', file, '--output', directory, '--base-url', apiBase, ...extra], {
  cwd: resolve('../smartqueue-ai'), env: process.env, stdio: 'inherit', windowsHide: true,
});
child.on('exit', code => { process.exitCode = code ?? 1; });
