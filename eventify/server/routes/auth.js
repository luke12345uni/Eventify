const express = require('express');
const User = require('../models/User');
const directionRouter = express.Router();


// POST /auth/login
directionRouter.post('/login', async (request, response) => {
  try {
    const { email, password } = request.body;
    if (!email || !password)
      return response.redirect('/login?error=Email and password are required to login');

    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password)))
      return response.redirect('/login?error=Invalid email or password, try again');

    request.session.userId   = user._id;
    request.session.username = user.username;
    response.redirect('/events');
  } catch {
    response.redirect('/login?error=Something went wrong. Please try again.');
  }
});

// POST /auth/register
directionRouter.post('/register', async (request, response) => {
  try {
    const { username, email, password } = request.body;
    if (!username || !email || !password)
      return response.redirect('/register?error=All fields are required for registration');

    const existing = await User.findOne({ $or: [{ email }, { username }] });
    if (existing)
      return response.redirect('/register?error=Username or email already in use, please enter a new one');

    await User.create({ username, email, password });
    response.redirect('/login?msg=Account created. Please sign in.');
  } catch (err) {
    const msg = err.name === 'ValidationError'
      ? Object.values(err.errors)[0].message
      : 'Something went wrong. Please try again.If issue persists please contact user support';
    response.redirect(`/register?error=${encodeURIComponent(msg)}`);
  }
});

// GET /auth/logout
directionRouter.get('/logout', (request, response) => {
  request.session.destroy(() => response.redirect('/login'));
});

module.exports = directionRouter;
