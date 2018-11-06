
import * as globals from '../../wuwei-globals';
import * as uuid from 'uuid';

export class Node {
  _id: uuid; // unique identification, _id is used as id for MongoDB
  key?: string; // key to globals.nodeIndexer
  type?: string; // Content, Topic, Memo
  idx?: string; // _id of Resource

  x?: number;
  y?: number;
  transform?: any;

  label?: string;
  group?: string;
  description?: string;

  shape?: string; // RECT CIRCLE ROUNDED ELLIPSE
  size: {
    radius?: number;
    width?: number;
    height?: number;
    rx?: number;
    ry?: number;
  };
  color?: string;
  outline?: string;
  font: {
    size?: string;
    color?: string;
    family?: string;
    style?: string;
  };
  text_anchor?: string; // start middle end
  alignment_baseline?: string; // middle
  thumbnail?: string;

  visible?: boolean;
  // not on page: visible=undefined, visible=true: on screen, visible=false: off screen
  filterout?: boolean;
  fixed?: boolean;

  creator_ref?: uuid;
  creator?: string;
  created?: string;
  modified?: string;
  generator_ref?: uuid;
  generated?: string;

  // fixed?: boolean;
  linkCount?: number = 0;
  stemLeaf?: string;
  changed?: boolean;

  constructor(param: {
    _id: uuid,
    key?: string,
    type?: string,
    idx?: uuid,

    x?: number,
    y?: number,
    transform?: any,

    label?: string,
    group?: string,
    description?: string,

    shape?: string,
    size?: any,
    color?: string,
    outline?: string,
    font?: any,
    text_anchor?: string, // start middle end
    alignment_baseline?: string, // middle
    thumbnail?: string,

    visible?: boolean,
    filterout?: boolean,
    fixed?: boolean,

    creator_ref?: uuid,
    creator?: string,
    created?: string,
    modified?: string,
    generator_ref?: uuid,
    generated?: string
  }) {
    this._id = param._id;
    if (param.key) {
      this.key = param.key;
    }
    this.type = param.type || 'Node'; // Content, Topic, Memo
    this.idx = param.idx;
    if (undefined === param.x) {
      this.x = Math.round(200 - 400 * Math.random());
    } else {
      this.x = param.x;
    }
    if (undefined === param.y) {
      this.y = Math.round(200 - 400 * Math.random());
    } else {
      this.y = param.y;
    }
    if (param.transform) {
      this.transform = param.transform;
    }

    if (param.label) {
      this.label = param.label;
    }
    if (param.group) {
      this.group = param.group;
    }
    if (param.description) {
      this.description = param.description;
    }

    this.shape = param.shape || 'RECTANGLE'; // CIRCLE, ROUNDED, ELLIPSE, MEMO, THUMBNAIL
    this.size = param.size || {
      width: 100,
      height: 120
    };
    this.color = param.color || globals.Color.nodeFill; // '#FEFEFE';
    this.outline = param.outline || globals.Color.nodeOutline; // '#FEFEFE';
    this.font = param.font || {
      size: '12pt',
      color: '#303030',
      family: 'Arial'
    };
    if (param.text_anchor) {
      this.text_anchor = param.text_anchor;
    }
    if (param.alignment_baseline) {
      this.alignment_baseline = param.alignment_baseline;
    }
    if (param.thumbnail) {
      this.thumbnail = param.thumbnail;
    }

    this.visible = param.visible;
    this.filterout = param.filterout || false;
    this.fixed = param.fixed || false;

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
  }

}
