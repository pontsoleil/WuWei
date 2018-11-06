import * as globals from './wuwei-globals';
import * as uuid from 'uuid';

export class Resource {
  _id: uuid; // unique identifier
  id?: string; // url
  key?: string; // key to globals.resourceIndexer
  name?: string;

  type: string; // DataSet, Image, Video, Sound, Text, or TextualBody
  format: string; // mime type

  thumbnail?: string;
  smallThumbnail?: string;

  value?: any; // for TextualBody and extended for options
  option?: string; // customize search/filter/edit/info pane
  ctype?: string; // config type; used when defining node shape, style, color... configurable

  language?: string;
  processingLanguage?: string;
  textDirection?: string;
  accessibility?: string;
  rights?: string;
  source?: string;
  purpose?: string;
  scope?: string;

  creator?: string;
  creator_ref?: uuid;
  created?: string;
  modifier?: string;
  modifier_ref?: uuid;
  modified?: string;
  generator?: string;
  generator_ref?: uuid;
  generated?: string;

  /** Resource
    * @_id unique identifier
    * @type Dataset Image Video Sound Text
    * @name
    * @format text/plain text/csv application/pdf application/epub image/svg+xml image/jpeg video/*
    */
  constructor(param: {
    _id: string,
    id?: string,
    ctype?: string,
    key?: string,
    name?: string,

    type?: string,
    format?: string,
    thumbnail?: string,
    smallThumbnail?: string,

    value?: any,
    option?: string,

    language?: string,
    processingLanguage?: string,
    textDirection?: string,
    accessibility?: string,
    rights?: string,
    purpose?: string,

    creator_ref?: uuid,
    creator?: string,
    created?: string,
    modified?: string,
    generator_ref?: uuid,
    generated?: string
  }) {
    this._id = param._id;
    if (param.id) {
      this.id = param.id;
    }
    if (param.ctype) {
      this.ctype = param.ctype;
    }
    if (param.key) {
      this.key = param.key;
    }
    if (param.name) {
      this.name = param.name;
    }
    this.type = param.type || 'TextualBody';
    this.format = param.format || 'text/plain';
    if (param.thumbnail) {
      this.thumbnail = param.thumbnail;
    }
    if (param.smallThumbnail) {
      this.smallThumbnail = param.smallThumbnail;
    }

    if (param.value) {
      this.value = param.value;
    }
    this.option = param.option || '';

    if (param.language) {
      this.language = param.language;
    }
    if (param.processingLanguage) {
      this.processingLanguage = param.processingLanguage;
    }
    if (param.textDirection) {
      this.textDirection = param.textDirection;
    }
    if (param.accessibility) {
      this.accessibility = param.accessibility;
    }
    if (param.rights) {
      this.rights = param.rights;
    }
    if (param.purpose) {
      this.purpose = param.purpose;
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
