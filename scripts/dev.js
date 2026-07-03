const { spawn } = require('child_process');
const net = require('net');

const DEFAULT_BACKEND_PORT = 3001;

function findAvailablePort(startPort) {
  return new Promise((resolve) => {
    const server = net.createServer();

    server.unref();
    server.on('error', () => resolve(findAvailablePort(startPort + 1)));
    server.listen(startPort, () => {
      const { port } = server.address();
      server.close(() => resolve(port));
    });
  });
}

function run(command, args, label, extraEnv = {}) {
  const child = spawn(command, args, {
    stdio: 'inherit',
    env: {
      ...process.env,
      ...extraEnv,
    },
  });

  child.on('exit', (code) => {
    if (code && code !== 0) {
      process.exitCode = code;
      console.error(`Processo ${label} finalizado com erro (${code}).`);
      shutdown('SIGTERM');
    }
  });

  return child;
}

async function main() {
  const backendPort = await findAvailablePort(Number(process.env.PORT) || DEFAULT_BACKEND_PORT);
  const backendUrl = `http://localhost:${backendPort}/api`;

  const backend = run('npm', ['--prefix', 'backend', 'run', 'dev'], 'backend', {
    PORT: String(backendPort),
  });
  const frontend = run('npm', ['--prefix', 'frontend', 'run', 'dev'], 'frontend', {
    VITE_API_URL: backendUrl,
  });

  function shutdown(signal) {
    backend.kill(signal);
    frontend.kill(signal);
  }

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('exit', () => shutdown('SIGTERM'));

  console.log(`Usando backend em ${backendUrl}`);
}

main().catch((error) => {
  console.error('Erro ao iniciar os servidores de desenvolvimento:', error);
  process.exit(1);
});