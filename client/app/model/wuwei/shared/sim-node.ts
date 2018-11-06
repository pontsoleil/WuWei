import { MessageService, WuweiService } from '../../../services';
import { WuweiModel } from '../wuwei.model';
import { FORCE } from 'assets/config/environment.force';
import * as globals from '../../wuwei-globals';
import * as uuid from 'uuid';
import * as d3 from 'd3';

export class SimNode {

  util: WuweiService = globals.module.util;
  model: WuweiModel = globals.module.wuweiModel;
  messageService: MessageService = globals.module.messageService;

  id: uuid; // unique identification for D3.js
  x: number;
  y: number;

  label?: string;
  index?: any;
  vx?: number;
  vy?: number;
  fx?: number;
  fy?: number;

  fixed?: boolean;

  start?: number;
  lastTouched?: number;
  touched?: number;
  expire?: number;
  // expired?: boolean;
  // timer?: any;
  opacity?: number;

  constructor(param: {
    id: uuid,
    x: number,
    y: number,
    label?: string;
    fixed?: boolean
  }) {
    const
      self = this,
      util = self.util,
      model = self.model,
      // simNodeIndexer = globals.graph.simNodeIndexer,
      now = Date.now();
    self.id = param.id;
    self.x = param.x;
    self.y = param.y;
    if (param.label) {
      self.label = param.label;
    } else {
      self.label = '';
    }
    if (param.fixed) {
      self.fixed = true;
    } else {
      self.fixed = false;
    }
    self.start = now;
    self.expire = now + FORCE.TRANSPARENT.TIMEOUT;
    self.touched = 1;
    self.lastTouched = now;
    self.opacity = 1;
  }
}
