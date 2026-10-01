import "dotenv/config";
import { initDb, pool } from "../src/db.js";
initDb().then(() => { console.log("✓ schema applied & seeded"); return pool.end(); }).catch((e) => { console.error(e); process.exit(1); });
