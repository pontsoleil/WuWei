import * as mongoose from 'mongoose';
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;
const Mixed = Schema.Types.Mixed;

const linkSchema = new Schema({
  _id: {type: String, unique: true, lowercase: true, trim: true},
  idx: String, // {type: String, ref: 'Annotation'},
  source_id: String, // {type: String, ref: 'Resource'},
  target_id: String, // {type: String, ref: 'Resource'},
  color: String,
  style: String,
  size: Number,
  font: {
    family: String,
    size: String,
    color: String
  },
  distance: Number, // used by d3 as default length
  straight: Boolean,
  x: Number,
  y: Number,
  path: String,
  marker_path: String,
  marker_transform: String,
  creator_ref: String, // {type: String, ref: 'Agent'},
  creator: String,
  created: Date,
  modified: Date,
  generator_ref: String,
  generated: String
});

const Link = mongoose.model('Link', linkSchema);

export default Link;
