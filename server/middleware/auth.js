import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET || "fallback-secret";

export default function auth(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No token provided" });
  }
  try {
    const payload = jwt.verify(header.slice(7), SECRET);
    req.userId = payload.id;
    next();
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
}
