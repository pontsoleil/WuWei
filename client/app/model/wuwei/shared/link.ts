import * as DRAW_CONFIG from '../../../../assets/config/environment.draw';
import * as globals from '../../wuwei-globals';

import { Node } from './node';
import * as uuid from 'uuid';

const defaultSettingLink = DRAW_CONFIG.defaultRtypeSetting.value;

export class Link {
  /** d3 */
  index?: any;
  source?: any;
  target?: any;

  _id: uuid; // unique identification, _id is used as id for MongoDB.
  key?: string; // key to globals.linkIndexer
  type?: string; // Link
  idx?: string; // _id of Annotation

  label?: string;

  source_id?: string;
  target_id?: string;
  role?: string;
  color?: string;
  style?: string;
  size?: number;
  font: {
    family: string,
    size: string,
    color: string
  };
  // distance?: number; // used by d3 as default length
  x?: number;
  y?: number;
  path?: string;
  marker_path?: string;
  marker_transform?: string;
  straight?: boolean;

  visible?: boolean;
  filterout?: boolean;
  bidirectional?: boolean;

  creator_ref?: uuid;
  creator?: string;
  created?: string;
  modified?: string;
  generator_ref?: uuid;
  generated?: string;

  /**
    * @id
    * @source_id: uuid
    * @target_id: uuid
    * @straight?) {
    */
  constructor(param: {
    _id: uuid,
    key?: string,
    type?: string,
    idx?: string; // _id of Annotation

    label?: string,

    source?: any,
    target?: any,
    source_id?: uuid,
    target_id?: uuid,

    role?: string,
    color?: string,
    style?: string,
    size?: number,
    font?: any,
    x?: number,
    y?: number,
    path?: string,
    marker_path?: string,
    marker_transform?: string,
    straight?: boolean,

    visible?: boolean,
    filterout?: boolean,
    bidirectional?: boolean,

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
    this.type = param.type || 'Link';
    if (param.idx) {
      this.idx = param.idx;
    }

    if (param.label) {
      this.label = param.label;
    }

    if (param.source) {
      this.source = param.source;
    }
    if (param.target) {
      this.target = param.target;
    }
    if (param.source_id) {
      this.source_id = param.source_id;
    }
    if (param.target_id) {
      this.target_id = param.target_id;
    }

    if (param.marker_transform) {
      this.marker_transform = param.marker_transform;
    }

    if (param.role) {
      this.role = param.role;
    }
    this.color = param.color || defaultSettingLink.color;
    this.style = param.style || defaultSettingLink.style;
    this.size = param.size || defaultSettingLink.size;
    this.font = param.font || defaultSettingLink.font;

    if (param.x) {
      this.x = param.x;
    }
    if (param.y) {
      this.y = param.y;
    }
    if (param.path) {
      this.path = param.path;
    }
    if (param.marker_path) {
      this.marker_path = param.marker_path;
    }
    if (param.marker_transform) {
      this.marker_transform = param.marker_transform;
    }

    this.straight = param.straight || true;

    this.visible = param.visible;
    this.filterout = param.filterout || false;
    this.bidirectional = param.bidirectional || false;

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
