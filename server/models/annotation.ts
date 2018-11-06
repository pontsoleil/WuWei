import * as mongoose from 'mongoose';

const annotationSchema = new mongoose.Schema({
  _id: {type: String, unique: true, lowercase: true, trim: true},
  id: String,
  type: String,
  audience: String,
  motivation: String,
  rights: String,
  body_ref: String, // {type: String, ref: 'Resource'},
  target_ref: String, // {type: String, ref: 'Resource'},
  creator_ref: String, // {type: String, ref: 'Agent'},
  created: {type: Date, default: Date.now},
  modified: Date,
  generator_ref: String, // {type: String, ref: 'Agent'},
  generated: Date
});

const Annotation = mongoose.model('Annotation', annotationSchema);

export default Annotation;
