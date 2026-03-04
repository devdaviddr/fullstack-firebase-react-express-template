import 'dotenv/config';
import { createApp } from './app';

const PORT = process.env.PORT ?? 3001;
const app = createApp();

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
