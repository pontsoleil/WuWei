abstract class BaseCtrl {

  abstract model: any;

  // Get all
  getAll = (req, res) => {
    console.log('--- getAll', req.body);
    this.model.find({}, (err, docs) => {
      if (err) { return console.error(err); }
      res.status(200).json(docs);
    });
  }

  // Count all
  count = (req, res) => {
    console.log('--- count', req.body);
    this.model.count((err, count) => {
      if (err) { return console.error(err); }
      res.status(200).json(count);
    });
  }

  // Insert
  insert = (req, res) => {
    const obj = new this.model(req.body);
    console.log('--- insert', obj);
    obj.save((err, item) => {
      // 11000 is the code for duplicate key error
      if (err && err.code === 11000) {
        res.sendStatus(400);
      }
      if (err) {
        return console.error(err);
      }
      res.status(200).json(item);
    });
  }

  // Get by id
  get = (req, res) => {
    console.log('--- get _id=' + req.params._id);
    this.model.findOne({_id: req.params._id}, (err, item) => {
      if (err) { return console.error(err); }
      console.log('** get', item);
      res.status(200).json(item);
    });
  }

  // Update by id
  update = (req, res) => {
    console.log('--- update', req.body);
    this.model.findOneAndUpdate({_id: req.body._id}, {$set: req.body}, (err) => {
      // findOneAndUpdate() returns null item
      if (err) { return console.error(err); }
      res.sendStatus(200);
    });
  }

  // Delete by id
  delete = (req, res) => {
    console.log('--- delete id=' + req.params._id);
    this.model.findOneAndRemove({_id: req.params._id}, (err) => {
      if (err) { return console.error(err); }
      res.sendStatus(200);
    });
  }
}

export default BaseCtrl;
