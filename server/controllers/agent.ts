import Agent from '../models/agent';
import BaseCtrl from './base';

export default class AgentCtrl extends BaseCtrl {
  model = Agent;
  // Get all filter by creator_ref
  getAll = (req, res) => {
    console.log('--- getAll(post) /agents creator_ref=' + req.body.creator_ref);
    this.model.find({creator_ref: req.body.creator_ref })
      .exec((err, docs) => {
        if (err) { return console.error(err); }
        console.log(docs);
        res.json(docs);
      });
  }

  // Count all  filter by creator_ref
  count = (req, res) => {
    console.log('--- count(post) /agent/count creator_ref=' + req.body.creator_ref);
    this.model
      .find({creator_ref: req.body.creator_ref })
      .count((err, count) => {
        if (err) { return console.error(err); }
        res.status(200).json(count);
      });
  }

}
