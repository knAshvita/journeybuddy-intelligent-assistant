const { initializeApp, cert, getApps } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");
const path = require("path");

let authInstance = null;

try {
  const serviceAccount = require(path.join(__dirname, "../serviceAccountKey.json"));

  if (getApps().length === 0) {
    initializeApp({
      credential: cert(serviceAccount),
    });
  }

  authInstance = getAuth();
  console.log("🔒 Firebase Admin SDK initialized successfully.");
} catch (err) {
  console.warn("⚠️ Firebase Admin credentials not loaded:", err.message);
}

// Middleware to verify Firebase Bearer Tokens
const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      error: "Access Denied: Missing or malformed authorization token.",
    });
  }

  const token = authHeader.split("Bearer ")[1];

  try {
    if (!authInstance) {
      authInstance = getAuth();
    }
    const decodedToken = await authInstance.verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    return res.status(403).json({
      error: "Access Denied: Invalid or expired token.",
      details: error.message,
    });
  }
};

module.exports = { verifyToken };