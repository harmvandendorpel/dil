import mongoose from 'mongoose';
import { WorkImageStatus } from '../const/const';
const Schema = mongoose.Schema;

const WorkSchema = new Schema({
  title: String,
  hash: String,
  chromosome: String,
  filename: String,
  imageStatus: {
    type: Number,
    default: WorkImageStatus.IMAGE_NONE
  },
  parents: [String],
  ts: Number,
  enabled: {
    type: Boolean,
    default: true
  },
  frozen: {
    type: Boolean,
    default: false
  },
  hits: {
    type: Number,
    default: 0
  }
});

module.exports = mongoose.model('Work', WorkSchema);