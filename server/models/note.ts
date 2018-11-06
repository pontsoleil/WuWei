import * as mongoose from 'mongoose';

// const Node = require('./node');
// const Link = require('./link');
const Schema = mongoose.Schema;
// const ObjectId = Schema.Types.ObjectId;
// const Mixed = Schema.Types.Mixed;

const transformSchema = new Schema({
  translate: {
    x: Number,
    y: Number
  },
  scale: Number
});

const pageSchema = new Schema({
  pp: Number,
  nodes: Schema.Types.Mixed,
  links: Schema.Types.Mixed,
  transform: transformSchema,
  thumbnail: String
});

const noteSchema = new Schema({
  _id: {type: String, unique: true, lowercase: true, trim: true},
  pages: [pageSchema],
  currentPage: Number,
  resources: Schema.Types.Mixed,
  annotations: Schema.Types.Mixed,
  name: String,
  thumbnail: String,
  smallThumbnail: String,
  subject: String,
  description: String,
  rights: String,
  purpose: String,
  scope: String,
  creator_ref: String, // {type: String, ref: 'Agent'},
  creator: String,
  created: Date,
  modified: Date
});

const Note = mongoose.model('Note', noteSchema);

export default Note;
