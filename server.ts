
import express from 'express';
import http from 'http';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import { investigationRouter } from './src/server/routes/investigate.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const server = http.createServer(app);

  // Server Port Configuration
  let PORT = Number(process.env.PORT) || 3000;

  const portArgIndex = process.argv.indexOf('--port');

  if (portArgIndex !== -1 && process.argv[portArgIndex + 1]) {
    const parsed = Number(process.argv[portArgIndex + 1]);

    if (!isNaN(parsed) && parsed > 0) {
      PORT = parsed;
    }
  }

  const isProduction = process.env.NODE_ENV === 'production';

  // Request Body Configuration
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));

  // Mount API Routes
  app.use('/api', investigationRouter);

  // Development / Production Configuration
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');

    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr:
          process.env.DISABLE_HMR === 'true'
            ? false
            : { server },
        watch:
          process.env.DISABLE_HMR === 'true'
            ? null
            : {},
      },
      appType: 'spa',
    });

    app.use(vite.middlewares);

  } else {
    const distPath = path.resolve(__dirname, 'dist');

    app.use(express.static(distPath));

    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  // Handle Server Errors
  server.on('error', (err) => {
    console.error('[SENTINEL AI LISTEN ERROR]:', err);
  });

  // Start HTTP Server
  server.listen(PORT, '0.0.0.0', () => {
    console.log(
      '[SENTINEL AI] Server is listening:',
      server.address()
    );

    console.log(
      `[SENTINEL AI] Running in ${
        isProduction ? 'production' : 'development'
      } mode.`
    );
  });
}

// Start Application
startServer().catch((err) => {
  console.error('[SENTINEL AI Server Crash]:', err);
  process.exit(1);
});

