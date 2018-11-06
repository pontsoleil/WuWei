import * as mongoose from 'mongoose';

const agentSchema = new mongoose.Schema({
  _id: {type: String, unique: true, lowercase: true, trim: true},
  type: String,
  name: String,
  nickname: String,
  email: {type: String, unique: true, lowercase: true, trim: true},
  homepage: String,
  creator_ref: String, // {type: String, ref: 'Agent'},
  created: {type: Date, default: Date.now},
  modifier_ref: String, // {type: String, ref: 'Agent'},
  modified: Date,
  generator_ref: String, // {type: String, ref: 'Agent'},
  generated: Date
});

const Agent = mongoose.model('Agent', agentSchema);

export default Agent;
