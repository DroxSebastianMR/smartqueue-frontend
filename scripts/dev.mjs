import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const npmCli = process.env.npm_execpath;
const python = process.env.SMARTQUEUE_PYTHON
  ?? (process.platform === 'win32'
    ? path.join(root, 'smartqueue-ai', '.venv', 'Scripts', 'python.exe')
    : path.join(root, 'smartqueue-ai', '.venv', 'bin', 'python'));

if (!npmCli) {
  console.error('Ejecuta este lanzador con npm run dev desde la raíz del proyecto.');
  process.exit(1);
}

const services = [
  { name: 'backend', directory: 'smartqueue-backend', command: process.execPath, args: [npmCli, 'run', 'start:dev'] },
  { name: 'frontend', directory: 'smartqueue-frontend', command: process.execPath, args: [npmCli, 'run', 'dev'] },
  { name: 'ai', directory: 'smartqueue-ai', command: python, args: ['-m', 'flask', '--app', 'app.main', 'run', '--port', '5001'] },
];

const children = [];
let stopping = false;

function stop(exitCode = 0) {
  if (stopping) return;
  stopping = true;
  process.exitCode = exitCode;

  for (const { child } of children) {
    if (child.exitCode !== null || child.pid === undefined) continue;
    if (process.platform === 'win32') {
      const killer = spawn('taskkill', ['/PID', String(child.pid), '/T', '/F'], { stdio: 'ignore', windowsHide: true });
      killer.on('error', () => child.kill());
    } else {
      child.kill('SIGTERM');
    }
  }
}

process.on('SIGINT', () => stop(130));
process.on('SIGTERM', () => stop(143));

for (const service of services) {
  const child = spawn(service.command, service.args, {
    cwd: path.join(root, service.directory),
    env: process.env,
    stdio: 'inherit',
    windowsHide: true,
  });

  children.push({ name: service.name, child });
  child.on('error', (error) => {
    console.error(`[${service.name}] No se pudo iniciar: ${error.message}`);
    stop(1);
  });
  child.on('exit', (code, signal) => {
    if (stopping) return;
    console.error(`[${service.name}] Se detuvo (${signal ?? code ?? 'sin código'}). Cerrando el otro servidor.`);
    stop(code && code > 0 ? code : 1);
  });
}
