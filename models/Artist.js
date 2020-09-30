const mongoose = require('mongoose');
const { Schema } = mongoose;

const artistSchema = new Schema({
  artistId: String,
  name: String,
  photo: String,
  genres: [String],
  popularity: Number,
  linkedIds: [String],
});

mongoose.model('artists', artistSchema);
