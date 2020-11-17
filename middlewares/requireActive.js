module.exports = (req, res, next) => {
  if (Date.parse(req.user.tokenExpires) < Date.now()) {
    return res.status(401).send({ error: 'You must reconnect to Spotify!' });
  }
  next();
};
