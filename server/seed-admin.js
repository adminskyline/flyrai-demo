import "dotenv/config";
import bcrypt from "bcryptjs";
import { initDB, run, get } from "./db.js";

async function seed() {
  await initDB();

  const adminEmail = "admin@getpostedai.com";
  const adminPassword = "testadmin123";

  const existing = get("SELECT * FROM users WHERE email = ?", [adminEmail]);
  if (existing) {
    run("UPDATE users SET is_admin = 1 WHERE email = ?", [adminEmail]);
    // Ensure subscription exists with active status
    const sub = get("SELECT * FROM subscriptions WHERE user_id = ?", [existing.id]);
    if (!sub) {
      run("INSERT INTO subscriptions (user_id, status, plan) VALUES (?, 'active', 'pro')", [existing.id]);
    } else {
      run("UPDATE subscriptions SET status = 'active', plan = 'pro' WHERE user_id = ?", [existing.id]);
    }
    console.log(`Admin account updated: ${adminEmail}`);
  } else {
    const hash = await bcrypt.hash(adminPassword, 10);
    const result = run(
      "INSERT INTO users (email, password_hash, account_type, name, is_admin) VALUES (?, ?, 'lo', 'Admin User', 1)",
      [adminEmail, hash]
    );
    run("INSERT INTO user_settings (user_id) VALUES (?)", [result.lastInsertRowid]);
    run("INSERT INTO subscriptions (user_id, status, plan) VALUES (?, 'active', 'pro')", [result.lastInsertRowid]);
    console.log(`Admin account created: ${adminEmail} / ${adminPassword}`);
  }

  // Also create a test user (non-admin, with active subscription for testing)
  const testEmail = "test@getpostedai.com";
  const testPassword = "testuser123";

  const testExisting = get("SELECT * FROM users WHERE email = ?", [testEmail]);
  if (!testExisting) {
    const hash = await bcrypt.hash(testPassword, 10);
    const result = run(
      "INSERT INTO users (email, password_hash, account_type, name) VALUES (?, ?, 'realtor', 'Test User')",
      [testEmail, hash]
    );
    run("INSERT INTO user_settings (user_id) VALUES (?)", [result.lastInsertRowid]);
    run("INSERT INTO subscriptions (user_id, status, plan) VALUES (?, 'active', 'pro')", [result.lastInsertRowid]);
    console.log(`Test account created: ${testEmail} / ${testPassword}`);
  } else {
    console.log(`Test account already exists: ${testEmail}`);
  }

  console.log("\nTest Login Credentials:");
  console.log("========================");
  console.log(`Admin:  ${adminEmail} / ${adminPassword}`);
  console.log(`User:   ${testEmail} / ${testPassword}`);
}

seed().catch(console.error);
