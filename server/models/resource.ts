import * as mongoose from 'mongoose';
const Schema = mongoose.Schema;
// const ObjectId = Schema.Types.ObjectId;
// const Mixed = Schema.Types.Mixed;

const resourceSchema = new Schema({
  _id: {type: String, unique: true, lowercase: true, trim: true},
  id: String, // this may be url of the contents
  type: String, // DataSet, Image, Video, Sound, Text, or TextualBody
  name: String,
  format: String,
  language: String,
  processingLanguage: String,
  textDirection: String,
  accessibility: String,
  rights: String,
  value: String, // for TextualBody
  source: String,
  purpose: String,
  scope: String,
  creator_ref: String, // {type: String, ref: 'Agent'},
  created: {type: Date, default: Date.now},
  modified: Date,
  generator_ref: String, // {type: String, ref: 'Agent'},
  generated: Date
});

const Resource = mongoose.model('Resource', resourceSchema);

export default Resource;
