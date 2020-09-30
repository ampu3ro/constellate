const requireLogin = require('../middlewares/requireLogin');
const mongoose = require('mongoose');

const User = mongoose.model('users');

module.exports = (app) => {
  app.get('/api/public_users', requireLogin, async (req, res) => {
    const users = await User.find({ isPublic: true }).lean();
    res.send(users);
  });

  app.post('/api/update_user', requireLogin, async (req, res) => {
    const user = await User.findOneAndUpdate(
      { spotifyId: req.body.spotifyId },
      req.body,
      { new: true }
    );
    res.send(user);
  });
};
