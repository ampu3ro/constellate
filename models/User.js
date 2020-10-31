const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema({
  spotifyId: String,
  name: String,
  email: String,
  photo: String,
  isPublic: Boolean,
  shortArtistIds: [String],
  mediumArtistIds: [String],
  longArtistIds: [String],
  accessToken: String,
  refreshToken: String,
});

mongoose.model('users', userSchema);
