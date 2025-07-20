const express = require("express");
const dotenv = require("dotenv");
const { registerRoutes } = require("./routes");
const connectDB = require("./mongodb");
const cors = require("cors");
const path = require("path");
// const { clerkMiddleware } = require("./clerk");

dotenv.config(); // Load .env


const app = express();

// CORS options
const corsOptions = {
  origin: ['http://localhost:5173', 'http://192.168.0.136:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Optional Clerk middleware
// app.use(clerkMiddleware);

// Logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }
      console.log(logLine);
    }
  });

  next();
});

// Main async setup
(async () => {
  await connectDB();

  const server = await registerRoutes(app);

  // Global error handler
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });

  // Static file serving (optional)
  // const clientPath = path.join(__dirname, "public");
  // app.use(express.static(clientPath));
  // app.get("*", (req, res) => {
  //   res.sendFile(path.join(clientPath, "index.html"));
  // });

  const port = 5000;
  server.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
})();
