const { ClerkExpressWithAuth } = require('@clerk/clerk-sdk-node');
const dotenv = require('dotenv');

dotenv.config();

if (!process.env.CLERK_SECRET_KEY) {
  throw new Error('CLERK_SECRET_KEY must be set');
}

// Middleware to require a signed-in user (disabled check for now)
const requireAuth = (req, res, next) => {
  // Uncomment below to enable auth check
  // if (!req.auth || !req.auth.userId) {
  //   return res.status(401).json({ message: 'Unauthorized' });
  // }
  next();
};

// Clerk middleware to parse authentication
const clerkMiddleware = ClerkExpressWithAuth();

module.exports = {
  requireAuth,
  clerkMiddleware
};
