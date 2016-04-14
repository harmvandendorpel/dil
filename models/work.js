import mongoose from 'mongoose';
import { WorkImageStatus } from '../const/const';
const Schema = mongoose.Schema;

var WorkSchema = new Schema({
  title: String,
  hash: String,
  chromosome: String,
  filename: String,
  imageStatus: {
    type: Number,
    default: WorkImageStatus.IMAGE_NONE
  },
  parents: Array,
  ts: Number,
  enabled: {
    type: Boolean,
    default: true
  },
  frozen: {
    type: Boolean,
    default: false
  },
});

module.exports = mongoose.model('Work', WorkSchema);