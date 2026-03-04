import crypto from "crypto";

const ALGO = "aes-256-cbc";
const KEY = Buffer.from(process.env.ENCRYPTION_KEY || "", "hex");

export function encrypt(text) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGO, KEY, iv);
  let enc = cipher.update(text, "utf8", "hex");
  enc += cipher.final("hex");
  return { encrypted: enc, iv: iv.toString("hex") };
}

export function decrypt(encrypted, ivHex) {
  const iv = Buffer.from(ivHex, "hex");
  const decipher = crypto.createDecipheriv(ALGO, KEY, iv);
  let dec = decipher.update(encrypted, "hex", "utf8");
  dec += decipher.final("utf8");
  return dec;
}
