import 'dotenv/config';
import './firebase'; // eagerly initialise Admin SDK — crashes at startup on bad credentials
import { createApp } from './app';
import { config } from './config';

const PORT = config.port;
const app = createApp();

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
