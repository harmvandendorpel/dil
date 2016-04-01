import mongoose from 'mongoose';
const Schema = mongoose.Schema;

var WorkSchema = new Schema({
  title: String,
  hash: String,
  chromosome: String,
  filename: String,
  imageStatus: Number,
  parents: Array,
  ts: Number,
  enabled: false
});

module.exports = mongoose.model('Work', WorkSchema);