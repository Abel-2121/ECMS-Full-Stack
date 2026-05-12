// backend/app.js
const express = require("express");
const cookieParser = require('cookie-parser');
const cors = require('cors');
const path = require('path');
const applySecurity = require('./config/securityConfig');
const errorHandler = require('./middleware/errorHandler');

// Import routes
const userRouter = require('./route/userRoute');
const electionRoute = require('./route/electionRoute');
const institutionRoute = require('./route/InstitutionRoute');
const candidateRoute = require('./route/candidateRoute');
const voteRoute = require('./route/votesRoute');
const voterEligibilityRoute = require('./route/voterEligibility');
const resultRoute = require('./route/resultRoute');
const dashboardRoute = require('./route/dashboardRoute');
const electionAdminDashboardRoute = require('./route/electionAdminDashboardRoute');
const systemSettingsRoute = require('./route/systemSettingsRoute');
const adminRoute = require('./route/adminRoute');
const compression = require('compression');
const { USE_LOCAL_STORAGE } = require('./middleware/upload');

const app = express();

app.use(compression({
  threshold: 2048,  
  level: 6,
  filter: (req, res) => {
    if (req.url.match(/\.(jpg|jpeg|png|gif|webp|ico)$/i)) {
      return false;
    }
    return compression.filter(req, res);
  }
}));

applySecurity(app);

const allowedOrigins = process.env.FRONTEND_URL || 'http://localhost:5173';

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'PUT'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(cookieParser());

// ========== STATIC FILES ==========
// Only serve local uploads when using local storage (development)
if (USE_LOCAL_STORAGE) {
  app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
  console.log(' Serving local uploads from: uploads/');
} else {
  console.log(' Using Cloudinary for file storage (no local static serving)');
}

// Public files (always serve locally - these are your app assets)
app.use('/public', express.static(path.join(__dirname, 'public')));

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({ status: 'OK', time: new Date() });
});

// ========== ROUTES ==========
app.use("/api/auth", userRouter);
app.use("/api/admin", adminRoute);
app.use("/api/institution", institutionRoute);
app.use("/api/election", electionRoute);
app.use("/api/voter-eligibility", voterEligibilityRoute);
app.use("/api/candidate", candidateRoute);
app.use("/api/vote", voteRoute);
app.use("/api/result", resultRoute);
app.use("/api/dashboard", dashboardRoute);
app.use("/api/election-admin/dashboard", electionAdminDashboardRoute);
app.use("/api/system-settings", systemSettingsRoute);

// 404 handler
app.all("/*splat", (req, res) => {
  res.status(404).json({
    status: 'fail',
    message: `Can't find ${req.originalUrl} on this server`
  });
});

app.use(errorHandler);

module.exports = app;