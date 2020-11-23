const passport = require('passport');

const scope = [
  'user-read-email',
  'user-read-private',
  'user-top-read',
  'streaming',
  'user-modify-playback-state',
];

module.exports = (app) => {
  app.get(
    '/auth/spotify',
    passport.authenticate('spotify', { scope, showDialog: true })
  );

  app.get(
    '/auth/spotify/reconnect',
    passport.authenticate('spotify', { scope })
  );

  app.get(
    '/auth/spotify/callback',
    passport.authenticate('spotify'),
    (req, res) => {
      res.redirect('/');
    }
  );

  app.get('/api/logout', (req, res) => {
    req.logout();
    res.redirect('/');
  });

  app.get('/api/current_user', (req, res) => {
    res.send(req.user);
  });
};
