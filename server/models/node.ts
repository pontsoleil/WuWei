import * as mongoose from 'mongoose';
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;
const Mixed = Schema.Types.Mixed;

const nodeSchema = new Schema({
  _id: {type: String, unique: true, lowercase: true, trim: true},
  idx: String, // {type: String, ref: 'Resource'},
  label: String,
  group: String,
  description: String,
  x: Number,
  y: Number,
  shape: String,
  size: {
    radius: Number,
    width: Number,
    height: Number,
    rx: Number,
    ry: Number
  },
  color: String,
  outline: String,
  font: {
    family: String,
    size: String,
    color: String,
    style: String
  },
  text_anchor: String, // start middle end
  alignment_baseline: String, // middle
  thumbnail: String,
  img: String,
  creator_ref: String, // {type: String, ref: 'Agent'},
  created: Date,
  modified: Date,
  generator_ref: String,
  generated: String
});

const Node = mongoose.model('Node', nodeSchema);

export default Node;
