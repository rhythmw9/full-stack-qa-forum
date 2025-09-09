// JWT auth middleware 

import jwt from "jsonwebtoken";

// Extract "Bearer <token>" safely
function getTokenFromHeader(req) {
  const header = req.headers.authorization || "";
  const [type, token] = header.split(" ");
  if (type && type.toLowerCase() === "bearer" && token) return token.trim();
  return null;
}

// Require a valid token
export function requireAuth(req, res, next) {
  try {
    const token = getTokenFromHeader(req);
    if (!token) return res.status(401).json({ error: "Missing token" });

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: payload.id, username: payload.username };
    return next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

// Optional auth: if token present and valid, sets req.user; otherwise continue
export function optionalAuth(req, _res, next) {
  try {
    const token = getTokenFromHeader(req);
    if (token) {
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      req.user = { id: payload.id, username: payload.username };
    }
  } catch {
    // ignore token errors in optional mode
  }
  next();
}

// Helper to issue tokens in routes
export function signToken(user) {
  // user: { id, username }
  return jwt.sign(
    { id: user.id, username: user.username },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
}
