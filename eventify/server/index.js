require('dotenv').config();
const express    = require('express');
const session    = require('express-session');
const mongoose   = require('mongoose');
const MongoStore = require('connect-mongo');
const morgan     = require('morgan');
const path       = require('path');

const authenticationRoutes  = require('./routes/auth');
const eventRoutes = require('./routes/events');

const webPlatform  = express();
const PORT = process.env.PORT || 3000;
const pages = (name) => path.join(__dirname, '../client/pages', name);

webPlatform.use(morgan('dev'));
webPlatform.use(express.urlencoded({ extended: true }));
webPlatform.use(express.json());
webPlatform.use(express.static(path.join(__dirname, '../client')));


webPlatform.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: process.env.MONGODB }),
  cookie: { maxAge: 1000 * 60 * 60 * 24 * 2 } // 2 days
}));

// ── AUTH GUARD ──
const guard = (request, response, next) => {
  if (request.session.userId) return next();
  response.redirect('/login');
};

// ── PAGE NAVIGATION ROUTES ──
webPlatform.get('/',          (request, response) => response.sendFile(pages('home.html')));
webPlatform.get('/home',      (request, response) => response.sendFile(pages('home.html')));
webPlatform.get('/register',  (request, response) => request.session.userId ? response.redirect('/events') : response.sendFile(pages('register.html')));
webPlatform.get('/login',     (request, response) => request.session.userId ? response.redirect('/events') : response.sendFile(pages('login.html')));
webPlatform.get('/events',    guard, (request, response) => response.sendFile(pages('events.html')));
webPlatform.get('/about',     (request, response) => response.sendFile(pages('about.html')));
webPlatform.get('/add-event', guard, (request, response) => response.sendFile(pages('add-event.html')));


// ── USER INFO (for navigation username display) ──
webPlatform.get('/api/me', guard, (request, response) => {
  response.json({ username: request.session.username });
});


// ── ACTION ROUTES ──
webPlatform.use('/auth', authenticationRoutes);
webPlatform.use('/api/events', guard, eventRoutes);


// ── CONNECT & START WEB PLATFORM ──
mongoose.connect(process.env.MONGODB)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    webPlatform.listen(PORT, () => console.log(`🚀 Eventify running at http://localhost:${PORT}`));
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });
