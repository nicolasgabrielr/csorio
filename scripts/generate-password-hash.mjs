/**
 * Genera el hash bcrypt en base64 para la contraseña del admin.
 * Uso: node scripts/generate-password-hash.mjs <tu-contraseña>
 *
 * El hash se codifica en base64 para evitar problemas con los caracteres $
 * en el archivo .env.local
 */
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const bcrypt = require("bcryptjs");

const password = process.argv[2];

if (!password) {
  console.error("Uso: node scripts/generate-password-hash.mjs <contraseña>");
  process.exit(1);
}

const hash = await bcrypt.hash(password, 12);
const base64Hash = Buffer.from(hash).toString("base64");

console.log("\nCopia este valor en tu .env.local:");
console.log(`ADMIN_PASSWORD_HASH=${base64Hash}\n`);
