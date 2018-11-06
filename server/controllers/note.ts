import Note from '../models/note';
// import Resource from '../models/resource';
import BaseCtrl from './base';

export default class NoteCtrl extends BaseCtrl {

  model = Note;

  // Get by id
  get = (req, res) => {
    console.log('--- get /api/note/:id=' + req.params._id);
    this.model
      .findOne({ _id: req.params._id })
      .exec((err, obj) => {
        if (err) { return console.error(err); }
        res.json(obj);
      });
  }
  // Get all filter by creator_ref
  getAll = (req, res) => {
    console.log('--- getAll(post) /notes creator_ref=' + req.body.creator_ref);
    this.model.find({ creator_ref: req.body.creator_ref })
      .exec((err, docs) => {
        if (err) { return console.error(err); }
        console.log(docs);
        res.json(docs);
      });
  }

  // Count all  filter by creator_ref
  count = (req, res) => {
    console.log('--- count(post) /notes/count creator_ref=' + req.body.creator_ref);
    this.model
      .find({ creator_ref: req.body.creator_ref })
      .count((err, count) => {
        if (err) { return console.error(err); }
        res.status(200).json(count);
      });
  }

}
