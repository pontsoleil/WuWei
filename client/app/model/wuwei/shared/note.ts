import { Node } from './node';
import { Link } from './link';
import { WuweiModel } from '../wuwei.model';
import * as globals from '../../wuwei-globals';
import * as uuid from 'uuid';

export class Page {
  pp: number;
  name: string;
  nodes: Node[];
  links: Link[];
  nodeIndexer: any;
  linkIndexer: any;
  transform:  {
    x: number;
    y: number;
    scale: number;
  };
  thumbnail: string;

  constructor (param: {
    pp: number,
    name?: string,
    nodes: Node[],
    links: Link[],
    nodeIndexer: any;
    linkIndexer: any;
    transform: {
      x: number,
      y: number,
      scale: number
    },
    thumbnail: string
  }) {
    this.pp = param.pp;
    this.name = param.name || '';
    this.nodes = param.nodes;
    this.links = param.links;
    this.nodeIndexer = param.nodeIndexer;
    this.linkIndexer = param.linkIndexer;
    this.transform = param.transform || { x: 0, y: 0, scale: 1 };
    // if (param.thumbnail) {
    this.thumbnail = param.thumbnail || null;
    // }
  }
}

export class Note {
  _id: string;
  resources: any;
  annotations: any;
  resourceIndexer: any;
  annotationIndexer: any;

  name?: string;
  thumbnail?: string;
  smallThumbnail?: string;

  currentPage: number;
  pages: Page[];

  subject?: string;
  description?: string;
  rights?: string;
  purpose?: string;
  scope?: string;
  creator_ref?: string;
  creator?: string;
  created?: string;
  modified?: string;
  generator_ref?: string;
  generated?: string;

  constructor (param: {
    _id: string,
    resources: any,
    annotations: any,
    resourceIndexer: any;
    annotationIndexer: any;

    currentPage: number,
    pages: Page[],

    name?: string;
    thumbnail?: string;
    smallThumbnail?: string;

    subject?: string;
    description?: string;
    rights?: string;
    purpose?: string;
    scope?: string;
    creator_ref?: string;
    creator?: string;
    created?: string;
    modified?: string;
    generator_ref?: string;
    generated?: string;
  }) {
    this._id = param._id;
    this.resources = param.resources;
    this.annotations = param.annotations;
    this.resourceIndexer = param.resourceIndexer;
    this.annotationIndexer = param.annotationIndexer;

    this.currentPage = param.currentPage;
    this.pages = param.pages;

    this.name = param.name ? param.name : '';
    if (param.thumbnail) {
      this.thumbnail =  param.thumbnail;
    }
    if (param.smallThumbnail) {
      this.smallThumbnail = param.smallThumbnail;
    }

    if (param.subject) {
      this.subject = param.subject;
    }
    if (param.description) {
      this.description = param.description;
    }
    if (param.rights) {
      this.rights = param.rights;
    }
    if (param.purpose) {
      this.purpose = param.purpose;
    }
    if (param.scope) {
      this.scope = param.scope;
    }
    if (param.creator_ref) {
      this.creator_ref = param.creator_ref;
    }
    if (param.creator) {
      this.creator = param.creator;
    }
    if (param.created) {
      this.created = param.created;
    }
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

