import 'dotenv/config';
import './firebase'; // eagerly initialise Admin SDK — crashes at startup on bad credentials
import { createApp } from './app';
import { config } from './config';

const PORT = config.port;
const app = createApp();

// initialize database (no-op when DATABASE_URL is missing)
import { initDb } from './db';
initDb().catch((err) => {
  console.error('Failed to initialize database:', err);
  process.exit(1);
});

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
