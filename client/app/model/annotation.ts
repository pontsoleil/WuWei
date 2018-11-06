import * as globals from './wuwei-globals';
import * as uuid from 'uuid';

export class Annotation {
  _id: uuid; // unique identifier
  key?: string; // key to globals.annotationIndexer
  type?: string; // Annotation
  role?: string;
  rtype?: string; // config type; used when defining link shape, style, color... configurable
  name?: string;
  body_ref: uuid;
  target_ref: uuid;
  audience?: string;
  motivation?: string;
  rights?: string;
  creator_ref?: uuid;
  creator?: string;
  created?: string;
  modified?: string;
  generator_ref?: uuid;
  generated?: string;

  constructor(param: {
    _id,
    key?,
    role?,
    rtype?,
    name?,
    body_ref,
    target_ref,
    audience?,
    motivation?,
    rights?,
    creator_ref?,
    creator?,
    created?,
    modified?,
    generator_ref?,
    generated?
  }) {
    this._id = param._id;
    if (param.key) {
      this.key = param.key;
    }
    this.type = 'Annotation';
    if (param.role) {
      this.role = param.role;
    }
    if (param.rtype) {
      this.rtype = param.rtype;
    }
    if (param.name) {
      this.name = param.name;
    }

    this.body_ref = param.body_ref;
    this.target_ref = param.target_ref;

    if (param.audience) {
      this.audience = param.audience;
    }
    if (param.motivation) {
      this.motivation = param.motivation;
    }
    if (param.rights) {
      this.rights = param.rights;
    }
    if (param.creator_ref) {
      this.creator_ref = param.creator_ref;
    }
    if (param.creator) {
      this.creator = param.creator;
    }
    this.created = param.created || (new Date()).toISOString();
    if (param.modified) {
      this.modified = param.modified;
    }
    if (param.generator_ref) {
      this.generator_ref = param.generator_ref;
    }
    if (param.generated) {
      this.generated = param.generated;
    }
    return this;
  }
}
