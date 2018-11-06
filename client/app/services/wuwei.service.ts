import { Injectable } from '@angular/core';
import { Node, Link } from '../model';
import * as globals from '../model/wuwei-globals';
import * as d3 from 'd3';
import * as svgIntersections from 'svg-intersections';

declare function escape(s: string): string;
declare function unescape(s: string): string;

@Injectable()
export class WuweiService {
  private intersect? = svgIntersections.intersect;
  private shape? = svgIntersections.shape;
  onscreen = false;
  googleBook = false;
  router_url = null;
  router_previous_url = null;

  pad = function(number) {
    if (number < 10) {
      return '0' + number;
    }
    return number;
  };

  isUUID = function(id) {
    // see https://stackoverflow.com/questions/6603015/check-whether-a-string-matches-a-regex-in-js
    const rex = new RegExp(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
    return rex.test(id);
  };

  isUUID_id = function(id) {
    const rex = new RegExp(/^_[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
    return rex.test(id);
  };

  logIsoDateTime = (msg) => {
    console.log(msg + ' ' + (new Date()).toISOString());
  }

  toISOString = function(millisec) {
    const date = new Date(millisec + 9 * 60 * 60 * 1000);
    return date.getUTCFullYear() +
      '-' + this.pad(date.getUTCMonth() + 1) +
      '-' + this.pad(date.getUTCDate()) +
      'T' + this.pad(date.getUTCHours()) +
      ':' + this.pad(date.getUTCMinutes()) +
      ':' + this.pad(date.getUTCSeconds()) +
      // '.' + (date.getUTCMilliseconds() / 1000).toFixed(3).slice(2, 5) +
      '+09:00';
  };

  toISOStringH = function(millisec) {
    const date = new Date(millisec + 9 * 60 * 60 * 1000);
    return '' + this.pad(date.getUTCHours()) +
      ':' + this.pad(date.getUTCMinutes()) +
      ':' + this.pad(date.getUTCSeconds()) +
      // '.' + (date.getUTCMilliseconds() / 1000).toFixed(3).slice(2, 5) +
      '+09:00';
  };

  toISOStringM = function(millisec) {
    const date = new Date(millisec + 9 * 60 * 60 * 1000);
    return '' + this.pad(date.getUTCMinutes()) +
      ':' + this.pad(date.getUTCSeconds()) +
      '.' + (date.getUTCMilliseconds() / 1000).toFixed(3).slice(2, 5) +
      '+09:00';
  };

  urlExists = function(url) {
  // cf. http://stackoverflow.com/questions/3646914/how-do-i-check-if-file-exists-in-jquery-or-javascript
    const http = new XMLHttpRequest();
    http.open('HEAD', url, false);
    http.send();
    return http.status === 200;
  };

  // Convert HTML to plain text
  // see https://stackoverflow.com/questions/15180173/convert-html-to-plain-text-in-js-without-browser-environment
  toText = function(_html) {
    let html = _html.replace(/<style([\s\S]*?)<\/style>/gi, '');
    html = html.replace(/<script([\s\S]*?)<\/script>/gi, '');
    html = html.replace(/<\/div>/ig, '\n');
    html = html.replace(/<\/li>/ig, '\n');
    html = html.replace(/<li>/ig, '  *  ');
    html = html.replace(/<\/ul>/ig, '\n');
    html = html.replace(/<\/p>/ig, '\n');
    html = html.replace(/<br\s*[\/]?>/gi, "\n");
    html = html.replace(/<[^>]+>/ig, '');
    return html;
  };

  escapeLineFeed = function(str) {
    if ( str && str.replace) {
      str = str.replace(/\x00/g, '');
      str = str.replace(/(?:\r\n|\r|\n)/g, '\\n');
    }
    return str;
  };

  unescapeLineFeed = function(str) {
    const
      LFtextarea = <HTMLInputElement>document.getElementById('LFtextarea'),
      LFcode = (LFtextarea && LFtextarea.innerHTML) ? LFtextarea.innerHTML : '\n';
    if (str && str.replace ) {
      str = str.replace(/\\n/g, LFcode);
    }
    return str;
  };

  // Decodes HTML entities in a browser-friendly way
  // cf. http://stackoverflow.com/questions/1912501/unescape-html-entities-in-javascript
  decodeHtml = function(input) {
    const e = document.createElement('div');
    e.innerHTML = input;
    // handle case of empty input
    return e.childNodes.length === 0 ? "" : e.childNodes[0].nodeValue;
  };

  // This is single pass encoder for html entities and handles
  // an arbitrary number of characters
  encodeHtml = function(input_arg_str) {
    const
      regex = /[&"'><]/g,
      lookup_map = {
        '&' : '&#38;',
        '"' : '&#34;',
        "'" : '&#39;',
        '>' : '&#62;',
        '<' : '&#60;'
      },
      input_str = String(input_arg_str);
    return input_str.replace(regex,
      function(match, name) {
        return lookup_map[ match ] || '';
      }
   );
  };

  escapeChar = function(str) {
    if (str && str.replace) {
      str = str.replace(/\x00/g, '');
      str = str.replace(/(?:\r\n|\r|\n)/g, '\\n');
      // str = str.replace(/(?:\r\n|\r|\n)/g, '<br/>');
      // str = str.replace(/\&/g, '&amp;');
      // str = str.replace(/\"/g, '&quot;');
      // str = str.replace(/\'/g, '&apos;');
      // str = str.replace(/\</g, '&lt;');
      // str = str.replace(/\>/g, '&gt;');
    }
    return str;
  };

  unescapeChar = function(str) {
    const
      LFcode = (<HTMLInputElement>document.getElementById('LFtextarea')).value;
    if (str && str.replace) {
      str = str.replace(/(?:\\n)/g, LFcode);
      // str = str.replace(/(?:<br>|<br \/>|<br\/>|\\n)/g, LFcode);
      // str = str.replace(/(?:\&lt;br\&gt;|\&lt;br\/\&gt;|\&lt;br \/\&gt;)/g, LFcode);
      // str = str.replace(/\&amp;/g, '&');
      // str = str.replace(/\&quot;/g, '"');
      // str = str.replace(/\&apos;/g, "'");
      // str = str.replace(/\&lt;/g, '<');
      // str = str.replace(/\&gt;/g, '>');
    }
    return str;
  };

  isEmpty = function(v) {
    const
      ret = (v === undefined ||
             v === null ||
             v === 'undefined' ||
             v === 'null' ||
             ('string' === typeof v &&
              v.toString()
                  .replace(/^[^\S]+/, '')
                  .replace(/[^\S]+$/, '') === ''));
    return ret;
  };

  notEmpty = function(v) {
    const
      ret = (v !== undefined &&
             v !== null &&
             v !== 'undefined' &&
             v !== 'null' &&
             ('string' !== typeof v ||
              v.toString()
                .replace(/^[^\S]+/, '')
                .replace(/[^\S]+$/, '') !== ''));
    return ret;
  };

  isEmptyObject = function(v) {
    const self = this;
    return self.isEmpty(v) || ('object' === typeof v && 0 === Object.keys(v).length);
  };

  notEmptyObject = function(v) {
    const self = this;
    return self.notEmpty(v) && 'object' === typeof v && Object.keys(v).length > 0;
  };

  isEmptySelection = function(v) {
    const
      ret = !v || !v.node || !v.node();
    return ret;
  };

  notEmptySelection = function(v) {
    const
      ret = v && v.node && v.node();
    return ret;
  };

  isNumber = function(v) {
    return 'number' === typeof v && !isNaN(v);
  };

  round = function(v) {
    if (undefined === v || null === v || '' === v) {
      v = 1;
    }
    v = Math.round(0.5 + 100 * v) / 100;
    if (v < 0.01) { v = 0.01; }
    return v;
  };

  precisionRound = (number, precision) => {
    const factor = Math.pow(10, precision);
    return Math.round(number * factor) / factor;
  }

  isASCII = function(str) {
    // see http://stackoverflow.com/questions/14313183/javascript-regex-how-do-i-check-if-the-string-is-ascii-only
    return /^[\x00-\x7F]*$/.test(str);
  };

  random = function() {
    let min = 0;
    let max = 1;
    if (arguments.length === 1) {
      max = arguments[0];
    } else {
      min = arguments[0];
      max = arguments[1];
    }
    return Math.floor(Math.random() * (max - min)) + min;
  };

  append = function(items, item) {
    const self = this;
    if (items instanceof Array && self.notEmpty(item)) {
      const index = items.indexOf(item);
      if (index >= 0) {
        const v = items.splice(index, 1)[0];
        items.push(item);
      } else {
        items.push(item);
      }
      return items;
    }
    return null;
  };

  remove = function(items, item) {
    const self = this;
    if (items instanceof Array && self.notEmpty(item)) {
      const index = items.indexOf(item);
      if (index >= 0) {
        const v = items.splice(index, 1)[0];
      }
      return items;
    }
    return null;
  };

  findByid = function(items, id) {
    const self = this;
    if (items instanceof Array) {
      let i;
      const len = items.length;
      for (i = 0; i < len; i++) {
        if (id === items[i].id) {
          return items[i];
        }
      }
    }
    return null;
  };

  appendByid = function(items, item) {
    // const self = this;
    if (!item.id) {
      return null;
    }
    let i;
    if (items instanceof Array && item) {
      const len = items.length;
      for (i = 0; i < len; i++) {
        if (items[i].id && item.id === items[i].id) {
          const v = items.splice(i, 1)[0];
          items.push(item);
          return items;
        }
      }
      items.push(item);
      return items;
    }
    return null;
  };

  removeByid = function(items, id) {
    const self = this;
    if (items instanceof Array) {
      let i;
      const len = items.length;
      for (i = 0; i < len; i++) {
        if (id === items[i].id) {
          const v = items.splice(i, 1)[0];
          return items;
        }
      }
    }
    return false;
  };

  findBy_id = function(items, _id) {
    const self = this;
    if (items instanceof Array) {
      let i;
      const len = items.length;
      for (i = 0; i < len; i++) {
        if (_id === items[i]._id) {
          return items[i];
        }
      }
    }
    return null;
  };

  appendBy_id = function(items, item) {
    if (!item || !item._id) {
      return items;
    }
    let i;
    if (items instanceof Array && item) {
      const len = items.length;
      for (i = 0; i < len; i++) {
        if (items[i]._id && item._id === items[i]._id) {
          const v = items.splice(i, 1)[0];
          items.push(item);
          return items;
        }
      }
      items.push(item);
      return items;
    }
    return null;
  };

  removeBy_id = function(items, _id) {
    const self = this;
    if (items instanceof Array) {
      let i;
      const len = items.length;
      for (i = 0; i < len; i++) {
        if (_id === items[i]._id) {
          const v = items.splice(i, 1)[0];
          return items;
        }
      }
    }
    return false;
  };

  deleteFromArray = function(items, item) {
    if (items instanceof Array) {
      const index = items.indexOf(item);
      if (index >= 0) {
        items.splice(index, 1);
        return items;
      }
    }
    return false;
  };

  contains = function(items, item) {
    if (!items || !item) { return false; }
    if (items instanceof Array) {
      return items.indexOf(item) > -1;
    }
    return false;
  };

  parse = a => {
    if (!a) {
      return null;
    }
    const b = {};
    for (const i in a = a.match(/(\w+\((\-?\d+\.?\d*e?\-?\d*[,\s]?)+\))+/g)) { if (a.hasOwnProperty(i)) {
      const c = a[i].match(/[\w\.\-]+/g);
      b[c.shift()] = c;
    }}
    return b;
  }

  getTransform = (canvasId) => {
    const
      container = d3.select(canvasId);
    // let
    //   x, y, scale;
    const transform = container.attr('transform');
    if (transform) {
      const parsed = this.parse(transform);
      const translate = (parsed['translate'] && parsed['translate'].map(parseFloat)) || [0, 0];
      const
        scale = (parsed['scale'] && parseFloat(parsed['scale'][0])) || 1,
        x = translate[0],
        y = translate[1];
      return {
        x: x,
        y: y,
        scale: scale
      };
    }
    // no translation & no scale
    return null;
  }

  pContext = ({ x: x, y: y }) => {
    const
      svg = d3.select('svg#' + globals.status.svgId),
      viewBox = svg.attr('viewBox'),
      trns = this.getTransform('g#' + globals.status.canvasId);
    if (viewBox) {
      let vbox = [], vx, vy;
      vbox = viewBox.split(' ');
      vx = parseFloat(vbox[0]);
      vy = parseFloat(vbox[1]);
      if (trns && trns.scale > 0) {
        return {
          x: (x + vx - trns.x) / trns.scale,
          y: (y + vy - trns.y) / trns.scale
        };
      } else {
        return {
          x: x + vx,
          y: y + vy
        };
      }
    } else {
      return {
        x: x - window.innerWidth / 2,
        y: y - window.innerHeight / 2
      };
    }
  }

  pScreen = ({ x: x, y: y }) => {
    const
      svg = d3.select('svg#' + globals.status.svgId),
      viewBox = svg.attr('viewBox'),
      trns = this.getTransform('g#' + globals.status.canvasId);
    if (viewBox) {
      let vbox = [], vx, vy;
      vbox = viewBox.split(' ');
      vx = parseFloat(vbox[0]);
      vy = parseFloat(vbox[1]);
      if (trns && trns.scale > 0) {
        return {
          x: (x - vx + trns.x) * trns.scale,
          y: (y - vy + trns.y) * trns.scale
        };
      } else {
        return {
          x: x - vx,
          y: y - vy
        };
      }
    } else {
      return {
        x: x,
        y: y
      };
    }
  }

  getPosition = (node) => {
    const
      self = this,
      id = node.id;
    let
      element, shape, size,
      x, y, translate, trans_x, trans_y;
    if (!node) {
      return { 'x': 0, 'y': 0, 'trans_x': 0, 'trans_y': 0, 'shape': shape, 'size': size };
    }
    if (id) {
      element = document.getElementById(id);
      shape = node.style.shape;
      size = node.style.size;
    } else {
      x = y = 0;
    }
    if (element) {
      const transform = element.getAttribute('transform');
      if (transform) {
        const parsed = self.parse(transform);
        if (parsed && parsed['translate']) {
          translate = parsed['translate'].map(Number) || [0, 0];
          trans_x = translate[0];
          trans_y = translate[1];
          x = Math.round(trans_x);
          y = Math.round(trans_y);
          if ('CIRCLE' !== shape && 'ELLIPSE' !== shape) {
            x += size.width / 2;
            y += size.height / 2;
          }
        } else {
          x = y = 0;
        }
      } else {
        x = y = 0;
      }
    } else {
      x = y = 0;
    }
    return { 'x': x, 'y': y, 'trans_x': trans_x, 'trans_y': trans_y, 'shape': shape, 'size': size };
  }

  scale = (s) => {
    const
      self = this,
      id = 'g#' + globals.status.canvasId,
      canvas = d3.select(id);
    let
      transform,
      x, y,
      // xyScale,
      scale;
    transform = self.getTransform(id);
    if (transform) {
      x = transform.x;
      y = transform.y;
      scale = transform.scale;
    } else {
      x = 0;
      y = 0;
      scale = 1;
    }
    scale = scale * s;
    scale = Math.round(scale * 100) / 100;
    if (scale < 0.2) {
      scale = 0.2;
    } else if (scale > 5) {
      scale = 5;
    }
    const translate = 'translate(' + [x, screenY] + ') scale(' + scale + ')';
    canvas.attr('transform', translate);
    globals.current.page.transform.scale = scale;
    if (0.99 < scale && scale < 1.01) {
      d3.select('#reset_view').html('=');
    } else {
      d3.select('#reset_view').html(scale);
    }
    return scale;
  }

  zoomin = () => {
    const
      scale = this.scale(1.2);
    globals.current.page.transform.scale = scale;
    return scale;
  }

  zoomout = () => {
    const
      scale = this.scale(0.83333);
    globals.current.page.transform.scale = scale;
    return scale;
  }

  reset_view = () => {
    const
      self = this,
      id = 'g#' + globals.status.canvasId,
      canvas = d3.select(id),
      transform = self.getTransform(id);
    let xTrans, yTrans;
    if (transform) {
      xTrans = Math.round(transform.x || 0),
      yTrans = Math.round(transform.y || 0);
    } else {
      xTrans = yTrans = 0;
    }
    let
      translate;
    translate = 'translate(' + [xTrans, yTrans] + ') scale(1)';
    canvas.attr('transform', translate);
    globals.current.page.transform = {
      x: xTrans,
      y: yTrans,
      scale: 1
    };
    d3.select('#reset_view').html('=');
  }

  createThumbnail(param?: {
    miniSvg?: string,
    miniCanvas?: string,
    miniScale?: string,
    nodes?: Node[],
    links?: Link[]
  }) {
    let miniSvg, miniCanvas, miniScale, nodes, links;
    if (!param) {
      miniSvg = 'miniSvg';
      miniCanvas = 'miniCanvas';
      miniScale = 'miniScale';
    } else {
      miniSvg = param.miniSvg;
      miniCanvas = param.miniCanvas;
      miniScale = param.miniScale;
      nodes = param.nodes || [];
      links = param.links || [];
    }
    // If nodes/links are not provided, draw miniature on current page and make thumbnail
    const self = this;

    if (miniScale) {
      document.querySelector('#' + miniScale).setAttribute('style', 'opacity: 0');
    }
    if (miniScale) {
      self.setupMiniature();
    }

    self.drawMiniature(globals.status.svgId, globals.status.canvasId, miniCanvas, nodes, links);

    const
      svgId = miniSvg,
      svgString = new XMLSerializer().serializeToString(document.getElementById(svgId)),
      sanitizedSvg = unescape(encodeURIComponent(svgString)),
      base64 = window.btoa(sanitizedSvg),
      miniatureImg = 'data:image/svg+xml;base64,' + base64;
    return miniatureImg;
  }

  // Window open/close
  openWindow(url, viewWindow) {
    this.closeWindow(viewWindow);
    const features = 'height=400,width=400,top=80,left=80';
    viewWindow = window.open(url, 'wuwei', features);
  }

  closeWindow(viewWindow) {
    if (viewWindow) {
      viewWindow.close();
    }
  }

  /**
   * Operations
   * key, label, isSupporetdFunc(), style('danger' or null), icon
   */
  OperationsList = {
    // allNodes are all selected nodes
    'edit' : ['Edit',
      function(allNodes, util) {
        const
          node = allNodes[0];
        if (// ! globals.status.Selecting &&
            ! globals.status.Connecting &&
            ! util.isEmpty(node) &&
            ! node.copying
       ) {
          return true;
        }
        return false;
      },
      null,
      'fa fa-pencil fa-lg fa-fw'
    ],
    'addContent' : ['Add Content',
      function(allNodes, util) {
        const
          // util = self.util,
          node = allNodes[0];
        if (// ! globals.status.Selecting &&
            ! globals.status.Connecting &&
            ! util.isEmpty(node) &&
            ! node.copying
        ) {
          return true;
        }
        return false;
      },
      null,
      'fa fa-th-large fa-lg fa-fw'
    ],
    'addTopic' : ['Add Topic',
      function(allNodes, util) {
        const
          // util = self.util,
          node = allNodes[0];
        if (// ! globals.status.Selecting &&
            ! globals.status.Connecting &&
            ! util.isEmpty(node) &&
            ! node.copying
        ) {
          return true;
        }
        return false;
      },
      null,
      'fa fa-tag fa-lg fa-fw'
    ],
    'addMemo' : ['Add Memo',
      function(allNodes, util) {
        const
          // util = self.util,
          node = allNodes[0];
        if (// ! globals.status.Selecting &&
            ! globals.status.Connecting &&
            ! util.isEmpty(node) &&
            ! node.copying
        ) {
          return true;
        }
        return false;
      },
      null,
      'fa fa-sticky-note-o fa-lg fa-fw'
    ],
    'addSimpleTopic' : ['Add Topic',
      function(allNodes, util) {
        if (// ! globals.status.Selecting &&
            ! globals.status.Connecting
        ) {
          return true;
        }
        return false;
      },
      null,
      'fa fa-tag fa-lg fa-fw'
    ],
    'addSimpleContent' : ['Add Content',
      function(allNodes, util) {
        if (// ! globals.status.Selecting &&
            ! globals.status.Connecting
        ) {
          return true;
        }
        return false;
      },
      null,
      'fa fa-th-large fa-lg fa-fw'
    ],
    'addSimpleMemo' : ['Add Memo',
      function(allNodes, util) {
        if (// ! globals.status.Selecting &&
            ! globals.status.Connecting
        ) {
          return true;
        }
        return false;
      },
      null,
      'fa fa-sticky-note-o fa-lg fa-fw'
    ],
    'uploadFile' : ['Upload File',
      function(allNodes, util) {
        /*if ('guest' === self.userRole) {
          return false;
        }*/
        if (// ! globals.status.Selecting &&
            ! globals.status.Connecting
        ) {
          return true;
        }
        return false;
      },
      null,
      'fa fa-cloud-upload fa-lg fa-fw'
    ],
    'showAll' : ['Show All',
      function() {
        const self = this;
        if (globals.status.Extra) {
          return true;
        }
        return false;
      },
      null, null
    ],
    'clearScreen' : ['Clear Screen',
      function() {
        const self = this;
        if (globals.status.Chatmode) {
          return false;
        }
        if (globals.status.Extra) {
          return true;
        }
        return false;
      },
      null,
      'fa fa-times-circle fa-lg fa-fw'
    ],
    'showAllMemo' : ['Show All Memo',
      function(allNodes, util) {
        if (globals.status.Extra) {
          return true;
        }
        return false;
      },
      null, null
    ],
    'hideAllMemo' : ['Hide All Memo',
      function(allNodes, util) {
        if (globals.status.Extra) {
          return true;
        }
        return false;
      },
      null,
      'fa fa-times-circle fa-lg fa-fw'],
    'expand' : ['Bloom',
      function(allNodes, util) {
        const
          model = globals.module.wuweiModel,
          node = allNodes[0];
        let
          links,
          hiddens,
          undefineds;
        if (util.isEmpty(node) ||
            /*(globals.status.Chatmode &&
              (!self.auth.currentUser ||
                self.auth.currentUser._id !== node.creator_ref) &&
            'adviser' !== self.userRole) ||*/
            globals.status.Selecting ||
            globals.status.Connecting ||
            node.copying) {
          return false;
        }
        links = model.findLinksByNode(node);
        if (util.isEmpty(links)) {return false; }
        hiddens = links.hiddens.length;
        undefineds = links.undefineds.length;
        if (hiddens + undefineds === 0) {
          return false;
        }
        if (globals.status.Connecting ||
            node.copying) {
          return false;
        }
        if (allNodes.length === 1) {
          return true;
        }
        return false;
      },
      null,
      ['fa fa-expand fa-stack-1x', 'fa fa-expand fa-flip-horizontal fa-text-gray fa-stack-1x']
    ],
    'root' : ['Root',
      function(allNodes, util) {
        const
          // util = self.util,
          node = allNodes[0],
          note_id = globals.current.note_id,
          pp = globals.current.currentPage,
          visibleNodes = globals.graph.nodes.filter(node => node.visible && !node.filterout),
          visibleLinks = globals.graph.nodes.filter(link => link.visible && !link.filterout);
        if (util.isEmpty(node) ||
            (1 === visibleNodes.length && 0 === visibleLinks.length) ||
            // globals.status.Chatmode ||
            // globals.status.Selecting ||
            globals.status.Connecting ||
            node.copying) {
          return false;
        }
        if (allNodes.length === 1) {
          return true;
        }
        return false;
      },
      null,
      'fa fa-circle fa-lg fa-fw'
    ],
    'collapse' : ['Wilt',
      function(allNodes, util) {
        const
          // util = self.util,
          model = globals.module.wuweiModel,
          node = allNodes[0];
        let
          count,
          visibles;
        if (util.isEmpty(node) ||
            // globals.status.Chatmode ||
            // globals.status.Selecting ||
            globals.status.Connecting ||
            node.copying
        ) {
          return false;
        }
        const links = model.findLinksByNode(node);
        if (util.isEmpty(links)) { return; }
        count = links.links.length;
        visibles = links.visibles.length;
        if (0 === count || 0 === visibles) {
          return false;
        }
        if (allNodes.length === 1) {
          return true;
        }
        return false;
      },
      null,
      ['fa fa-compress fa-stack-1x', 'fa fa-compress fa-flip-horizontal fa-text-gray fa-stack-1x']
    ],
    'hide' : ['Hide',
      function(allNodes, util) {
        const
          // util = self.util,
          node = allNodes[0];
        if (util.isEmpty(node) ||
            /*(globals.status.Chatmode &&
              (!self.auth.currentUser ||
                self.auth.currentUser._id !== node.creator_ref) &&
              'adviser' !== self.userRole) ||*/
            globals.status.Connecting ||
            // globals.status.Selecting ||
            node.copying) {
          return false;
        }
        return true;
      },
      null,
      'fa fa-times-circle fa-lg fa-fw'
    ],
    'selectAll' : ['SelectAll',
      function(allNodes, util) {
        if (! globals.status.Editing) {
          return false;
        }
        if (globals.status.Selecting) {
          return true;
        }
        return false;
      },
      null,
      'fa fa-check fa-lg fa-fw'
    ],
    'clearSelection' : ['Clear Selection',
      function() {
        const self = this;
        if (! globals.status.Editing ||
            globals.status.Connecting
        ) {
          return false;
        }
        return true;
      },
      null,
      ['fa fa-check fa-stack-1x', 'fa fa-ban fa-text-gray fa-stack-2x']
    ],
    'copy' : ['Copy',
      function(allNodes, util) {
        const
          // util = self.util,
          model = globals.module.wuweiModel,
          node = allNodes[0];
        let
          one, another;
        if (! globals.status.Editing ||
            util.isEmpty(node) ||
            /*(!self.auth.currentUser ||
              self.auth.currentUser._id !== node.creator_ref) &&*/
            node.copying) {
          return false;
        }
        if (util.isLink(node)) {
          const link = node;
          one = model.findNode(link.body_ref);
          if (util.isEmpty(one)) {// ||
             /*!self.auth.currentUser ||
        self.auth.currentUser._id !== one.userid) {*/
            return false;
          }
          another = model.findNode(link.target_ref);
          if (util.isEmpty(another)) {/* ||
              !self.auth.currentUser ||
              self.auth.currentUser._id !== another.userid) {*/
            return false;
          }
        }
        if (allNodes.length === 1 && util.notEmpty(node) && ! node.copying) {
          return true;
        }
        return true;
      },
      null,
      'fa fa-clone fa-lg fa-fw'
    ],
    'paste' : ['Paste',
      function(allNodes, util) {
        const
          // util = self.util,
          node = allNodes[0];
        if (! globals.status.Editing ||
            util.isEmpty(node)// ||
            /*!self.auth.currentUser ||
            self.auth.currentUser._id !== node.creator_ref*/
          ) {
          return false;
        }
        if (allNodes.length === 1 && util.notEmpty(node) &&
            globals.status.Copying &&
            node.copying) {
          return true;
        }
        return false;
      },
      null,
      'fa fa-clone fa-lg fa-fw'
    ],
    'cancelCopy' : ['Cancel Copy',
      function(allNodes, util) {
        const
          // util = self.util,
          node = allNodes[0];
        if (! globals.status.Editing ||
            util.isEmpty(node)
          ) {
          return false;
        }
        if (node.copying ||
            globals.status.Copying) {
          return true;
        }
        return false;
      },
      null,
      ['fa fa-clone fa-stack-1x', 'fa fa-ban fa-text-gray fa-stack-2x']
    ],
    'reverse' : ['Reverse link direction',
      function(allNodes, util) {
        const
          // util = self.util,
          node = allNodes[0];
        if (globals.status.Editing &&
            // self.auth.currentUser &&
            // self.auth.currentUser._id === node.creator_ref &&
            allNodes.length === 1 &&
            util.notEmpty(node) &&
            ! node.copying &&
            util.isLink(node)) {
          return true;
        }
        return false;
      },
      null,
      'fa fa-exchange fa-lg fa-fw'
    ],
    'erase' : ['Erase',
      function(allNodes, util) {
        const
          // util = self.util,
          node = allNodes[0];
        if (node.copying ||
            util.isEmpty(node) ||
            (allNodes.length === 1 && util.notEmpty(node) && node.copying)) {
          return false;
        }
        /*if (self.auth.currentUser && node.creator_ref === self.auth.currentUser._id) {
          return true;
        }*/
        return true;
      },
      'danger',
      'fa fa-trash-o fa-lg fa-fw'
    ],
/*    'annotationStyle' : ['Annotation Style',
      function(allNodes, util) {
        if (self.Editing) {
          return true;
        }
        return false;
      },
      null,
      'fa fa-tag fa-lg fa-fw'
    ],
    'resourceStyle' : ['Resource Style',
      function(allNodes, util) {
        if (self.Editing) {
          return true;
        }
        return false;
      },
      null,
      'fa fa-th-large fa-lg fa-fw'
    ],
    'linkStyle' : ['Link Style',
      function(allNodes, util) {
        if (globals.status.Extra &&
            globals.status.Editing) {
          return true;
        }
        return false;
      },
      null,
      null
    ],*/
    'newNote' : ['New Note',
      function() {
        return true;
      },
      null,
      'fa fa-book fa-lg fa-fw'
    ],
    'closeNote' : ['Close Note',
      function() {
        const
          self = this,
          util = self.util;
        if (globals.status.loggedIn &&
            globals.current.note_id &&
            util.notEmpty(globals.current.note_name)) {
          return true;
        }
        return false;
      },
      "{'background-color': '#a0a0a0'}",
      null,
    ],
    'timemachine' : ['Timemachine',
      function() {
        const
          self = this,
          util = self.util;
        if (globals.status.loggedIn &&
            globals.current.note_id &&
            util.notEmpty(globals.current.note_name) &&
            util.notEmpty(globals.current.ownerId) &&
            self.auth.currentUser &&
            globals.current.ownerId === self.auth.currentUser._id) {
          return true;
        }
        return false;
      },
      null,
      'fa fa-history fa-lg fa-fw'
    ],
    'downloadTexts' : ['Download Texts',
      function() {
        const self = this;
        if (self.Extra &&
            self.Editing) {
          return true;
        }
        return false;
      },
      null,
      'fa fa-cloud-download fa-lg fa-fw'
    ],
    'overwriteModelInCloud' : ['Overwrite Note',
      function() {
        const
          self = this,
          util = self.util;
        if (self.logedIn &&
            globals.current.note_id &&
            (util.isEmpty(globals.current.ownerId) ||
              !self.auth.currentUser ||
              globals.current.ownerId === self.auth.currentUser._id ||
              'adviser' === self.userRole)) {
          return true;
        }
        return false;
      },
      null, null
    ],
    'saveModelInCloud' : ['Save Note',
      function() {
        const
          self = this,
          util = self.util;
        // allow save when there is no item on a project 2016-01-09
        if (self.logedIn) {
          if (util.isEmpty(globals.current.ownerId) ||
              globals.current.ownerId === self.auth.currentUser._id ||
              'adviser' === self.userRole) {
            return true;
          }
        }
        return false;
      },
      null, null
    ],
    'privateModel' : ['Private Note',
      function() {
        return true;
      },
      null, null
    ],
    'resumePrevious' : ['Resume Previous',
      function() {
        return true;
      },
      null, null
    ],
    'newPage' : ['New Page',
      function() {
        const
          self = this,
          util = self.util;
        if (self.Editing &&
            util.notEmpty(globals.current.ownerId) &&
            self.auth.currentUser &&
            globals.current.ownerId === self.auth.currentUser._id) {
          return true;
        }
        return false;
      },
      null,
      'fa fa-file-o fa-lg fa-fw'
    ],
    'notePage' : ['Note Page',
      function() {
        const
          self = this,
          util = self.util;
        if (self.Editing &&
            util.notEmpty(globals.current.ownerId) &&
            self.auth.currentUser &&
            globals.current.ownerId === self.auth.currentUser._id) {
          return true;
        }
        return false;
      },
      null, null
    ],
    'listPage' : ['List Page',
      function() {
        return true;
      },
      null, null
    ]
  };

/** Setup miniature canvas
  * expecting globals.status.svgId and globals.status.canvasId contains either
  * 'graph'/'draw' or 'force'/'simulation' respectively
  */
  setupMiniature = () => {
    const
      util = this;
    d3.select('#miniSvg')
      .call(d3.drag()
        .on('start', () => {
          const
            d3event = d3.event,
            canvasId = globals.status.canvasId,
            canvas = d3.select('g#' + canvasId),
            xTranslation = - (globals.miniature.x1 + (d3event.x - globals.miniature.offsetH) * globals.miniature.scale),
            yTranslation = - (globals.miniature.y1 + (d3event.y - globals.miniature.offsetV) * globals.miniature.scale);
          globals.miniature.xTranslation = util.precisionRound(xTranslation, 3);
          globals.miniature.yTranslation = util.precisionRound(yTranslation, 3);
          util.translate(canvasId, globals.miniature.xTranslation, globals.miniature.yTranslation);
          // console.log('- mini drag START x y globals.miniature.xTranslation globals.miniature.yTranslation ' + [d3event.x, d3event.y, globals.miniature.xTranslation, globals.miniature.yTranslation]);
          // console.log('  globals.status x1 y1 offsetH offsetV ' + [globals.miniature.x1, globals.miniature.y1, globals.miniature.offsetH, globals.miniature.offsetV]);
        })
        .on('drag', () => {
          const
            d3event = d3.event,
            svgId = globals.status.svgId,
            canvasId = globals.status.canvasId,
            canvas = d3.select('g#' + canvasId),
            miniCursor = d3.select('#miniCursor');
          miniCursor
            .text('\uf00e') // search-plus
            .attr('alignment-baseline', 'hanging')
            .attr('opacity', 1)
            .attr('fill', '#a0abaf')
            .attr('transform', 'translate(' + [d3event.x, d3event.y] + ')');
          globals.miniature.xTranslation -= d3event.dx * globals.miniature.scale;
          globals.miniature.yTranslation -= d3event.dy * globals.miniature.scale;
          globals.miniature.xTranslation = util.precisionRound(globals.miniature.xTranslation, 3);
          globals.miniature.yTranslation = util.precisionRound(globals.miniature.yTranslation, 3);
          util.translate(canvasId, globals.miniature.xTranslation, globals.miniature.yTranslation);
          // console.log('- drag x y dx dy globals.miniature.xTranslation globals.miniature.yTranslation ' + [d3event.x, d3event.y, d3event.dx, d3event.dy, globals.miniature.xTranslation, globals.miniature.yTranslation]);
        })
        .on('end', () => {
          const
            d3event = d3.event,
            svgId = globals.status.svgId,
            miniCursor = d3.select('#miniCursor');
          // console.log('- mini drag END ' + [d3event.x, d3event.y]);
          miniCursor.attr('opacity', 0);
          globals.miniature.xTranslation = null;
          globals.miniature.yTranslation = null;
        })
     );
  }

  translate = (canvasId, x, y) => {
    const
      util = this,
      canvas = d3.select('g#' + canvasId);
    let
      transform,
      scale;
    transform = util.getTransform('g#' + canvasId);
    let translate = '';
    if (transform) {
      scale = transform.scale;
      if (scale) {
        translate = 'translate(' + [x, y] + ') scale(' + scale + ')';
      } else {
        translate = 'translate(' + [x, y] + ')';
      }
    } else {
      translate = 'translate(' + [x, y] + ')';
    }
    canvas.attr('transform', translate);
  }

  getBorder = (nodes) => {
    if (!nodes || 0 === nodes.length) {
      return null;
    }
    const
      util = this,
      model = globals.module.wuweiModel;
    let
      xMin =  Number.MAX_VALUE / 2,
      xMax = -Number.MAX_VALUE / 2,
      yMin =  Number.MAX_VALUE / 2,
      yMax = -Number.MAX_VALUE / 2,
      _left, _right, _top, _bottom;
    // RECT CIRCLE ROUNDED ELLIPSE
    function left(node, translateX) {
      const
        rect = node.querySelector('rect') || node.querySelector('image'),
        circle = node.querySelector('circle');
      if (circle) {
        const
          r = +circle.getAttribute('r');
        return translateX - r;
      }
      if (rect) {
        const
          width = +rect.getAttribute('width');
        return translateX - width / 2;
      }
      return null;
    }
    function right(node, translateX) {
      const
        rect = node.querySelector('rect') || node.querySelector('image'),
        circle = node.querySelector('circle');
      if (circle) {
        const
          r = +circle.getAttribute('r');
        return translateX + r;
      }
      if (rect) {
        const
          width = +rect.getAttribute('width');
        return translateX + width / 2;
      }
      return null;
    }
    function top(node, translateY) {
      const
        rect = node.querySelector('rect') || node.querySelector('image'),
        circle = node.querySelector('circle');
      if (circle) {
        const
          r = +circle.getAttribute('r');
        return translateY - r;
      }
      if (rect) {
        const
          height = +rect.getAttribute('height');
        return translateY - height / 2;
      }
      return null;
    }
    function bottom(node, translateY) {
      const
        rect = node.querySelector('rect') || node.querySelector('image'),
        circle = node.querySelector('circle');
      if (circle) {
        const
          r = +circle.getAttribute('r');
        return translateY - r;
      }
      if (rect) {
        const
          height = +rect.getAttribute('height');
        return translateY + height / 2;
      }
      return null;
    }

    for (const node of nodes) {
      const
        transform = node.getAttribute('transform');
      if (transform) {
        const
          parsed = util.parse(transform),
          translate = (parsed['translate'] && parsed['translate'].map((v) => util.precisionRound(v, 3))) || [0, 0],
          translateX = translate[0],
          translateY = translate[1];
        _left = left(node, translateX);
        _right = right(node, translateX);
        _top = top(node, translateY);
        _bottom = bottom(node, translateY);
        if (_left < xMin) {
          xMin = _left;
        }
        if (xMax < _right) {
          xMax = _right;
        }
        if (_top < yMin) {
          yMin = _top;
        }
        if (yMax < _bottom) {
          yMax = _bottom;
        }
      }
      // console.log('-- getBorders', node, 'translateX=' + translateX + ' translateY=' + translateY);
    }

    const
      x1 = util.precisionRound(xMin, 2),
      y1 = util.precisionRound(yMin, 2),
      x2 = util.precisionRound(xMax, 2),
      y2 = util.precisionRound(yMax, 2),
      cx = util.precisionRound((x1 + x2) / 2, 2),
      cy = util.precisionRound((y1 + y2) / 2, 2),
      width = util.precisionRound(x2 - x1, 2),
      height = util.precisionRound(y2 - y1, 2);

    const border = {
      left: x1,
      top: y1,
      right: x2,
      bottom: y2,
      cx: cx,
      cy: cy,
      width: width,
      height: height
    };
    return border;
  }

  getBorderByNodes = (nodes) => {
    if (!nodes || 0 === nodes.length) {
      return null;
    }
    const
      util = this,
      model = globals.module.wuweiModel;
    let
      xMin =  Number.MAX_VALUE / 2,
      xMax = -Number.MAX_VALUE / 2,
      yMin =  Number.MAX_VALUE / 2,
      yMax = -Number.MAX_VALUE / 2,
      _left, _right, _top, _bottom;
    // RECT CIRCLE ROUNDED ELLIPSE
    for (const node of nodes) {
      const
        shape = node.shape,
        size = node.size,
        width = size.width,
        height = size.height,
        radius = size.radius;
      if ('CIRCLE' === shape) {
        _left = node.x - radius;
        _right = node.x + radius;
        _top = node.y - radius;
        _bottom = node.y + radius;
      } else {
        _left = node.x - width / 2;
        _right = node.x + width / 2;
        _top = node.y - height / 2;
        _bottom = node.y + height / 2;
      }
      if (_left < xMin) {
        xMin = _left;
      }
      if (xMax < _right) {
        xMax = _right;
      }
      if (_top < yMin) {
        yMin = _top;
      }
      if (yMax < _bottom) {
        yMax = _bottom;
      }
      // console.log('-- getBorders', node, 'translateX=' + translateX + ' translateY=' + translateY);
    }
    const
      x1 = util.precisionRound(xMin, 2),
      y1 = util.precisionRound(yMin, 2),
      x2 = util.precisionRound(xMax, 2),
      y2 = util.precisionRound(yMax, 2),
      cx = util.precisionRound((x1 + x2) / 2, 2),
      cy = util.precisionRound((y1 + y2) / 2, 2),
      width = util.precisionRound(x2 - x1, 2),
      height = util.precisionRound(y2 - y1, 2);

    const border = {
      left: x1,
      top: y1,
      right: x2,
      bottom: y2,
      cx: cx,
      cy: cy,
      width: width,
      height: height
    };
    return border;
  }

  shiftPath = (self, d, cx, cy) => {
    const
      model = globals.module.wuweiModel,
      points = model.pathString2points(d);
    if (points && points.length >= 2) {
      points[0].x -= cx;
      points[0].y -= cy;
      points[1].x -= cx;
      points[1].y -= cy;
      if (3 === points.length) {
        points[2].x -= cx;
        points[2].y -= cy;
      }
      const pathString = model.points2pathString(points);
      return pathString;
    }
    return null;
  }

  drawMiniature = (svgId, canvasId, miniatureId, _nodes?: Node[], _links?: Link[]) => {
    const
      util = this,
      canvas = document.getElementById(canvasId),
      miniCanvas = document.getElementById(miniatureId),
      offset = 8,
      miniCanvasWidth = globals.miniature.width,
      miniCanvasHeight = globals.miniature.height;

    let
      border,
      nodes,
      links,
      isD3 = false;
    if (_nodes) {
      border = util.getBorderByNodes(_nodes);
    } else {
      isD3 = true;
      nodes = canvas.querySelectorAll('g.node');
      links = canvas.querySelectorAll('g.link');
      border = util.getBorder(nodes);
    }
    // console.log('-- drawMiniature D3 is ' + isD3 + ' border', border);
    if (!border) {
      miniCanvas.innerHTML = '';
      return false;
    }
    globals.miniature.x1 = border.left;
    globals.miniature.y1 = border.top;

    let
      offsetH = offset,
      offsetV = offset,
      scale; // 1 / scale
    if (border.width > border.height) {
      scale = Math.ceil(border.width / miniCanvasWidth);
    } else {
      scale = Math.ceil(border.height / miniCanvasHeight);
    }
    if (scale > 50) {
      scale = 50;
    } else if (scale < 2) {
      scale = 2;
    }
    globals.miniature.scale = scale;
    if ('miniCanvas' === miniatureId) {
      d3.select('#miniScale').text('1 / ' + globals.miniature.scale);
    }
    offsetV = Math.ceil((miniCanvasHeight - (border.height / scale)) / 2);
    offsetH = Math.ceil((miniCanvasWidth - (border.width / scale)) / 2);
    // console.log('scale=', scale, ' offsetV=', offsetV, ' offsetH=', offsetH);
    if (offsetV < offset) {
      offsetV = offset;
    }
    if (offsetH < offset) {
      offsetH = offset;
    }
    globals.miniature.offsetH = offsetH;
    globals.miniature.offsetV = offsetV;

    const
      transform = util.getTransform('g#' + canvasId),
      xTranslation = transform ? transform.x : 0,
      yTranslation = transform ? transform.y : 0;

    const minTransform = 'scale(' + (1 / globals.miniature.scale) + ')';
    // console.log('scale=' + scale + ' offsetV=' + globals.miniature.offsetV + ' offsetH=' + globals.miniature.offsetH + 'minTransform:', minTransform);
    miniCanvas.setAttribute('transform', minTransform);
    miniCanvas.innerHTML = '';

    const frameEl = document.createElementNS("http://www.w3.org/2000/svg", 'rect');
    let x, y, width, height;
    if (isD3) {
      const viewBox = document.getElementById(svgId).getAttribute('viewBox').split(' ');
      x = util.precisionRound(+viewBox[0] - xTranslation + offsetH * scale - border.left, 2);
      y = util.precisionRound(+viewBox[1] - yTranslation + offsetV * scale - border.top, 2);
      width = viewBox[2];
      height = viewBox[3];
      let
        filter_width = 0,
        search_width = 0,
        info_width = 0,
        edit_width = 0;
      if (document.querySelector('app-filter')) {
        filter_width = (<HTMLElement>document.querySelector('app-filter')).offsetWidth;
        x += filter_width;
        width -= filter_width;
      }
      if (document.querySelector('app-search')) {
        search_width = (<HTMLElement>document.querySelector('app-search')).offsetWidth;
        x += search_width;
        width -= search_width;
      }
      if (document.querySelector('app-edit')) {
        edit_width = (<HTMLElement>document.querySelector('app-edit')).offsetWidth;
        width -= edit_width;
      }
      if (document.querySelector('app-info')) {
        info_width = (<HTMLElement>document.querySelector('app-info')).offsetWidth;
        width -= info_width;
      }
      // const pOrigin = this.pContext({ x: 0, y: 0 });
      // x += pOrigin.x * scale;
      // y += pOrigin.y * scale;
      // width /= globals.current.page.transform.scale;
      // height /= globals.current.page.transform.scale;
    } else {
      x = offsetH * scale;
      y = offsetV * scale;
      width = border.width;
      height = border.height;
    }
    // console.log('frameEl x=', x, ' y=', y, ' width=', width, ' height=', height);
    frameEl.setAttribute('x', x);
    frameEl.setAttribute('y', y);
    frameEl.setAttribute('width', width);
    frameEl.setAttribute('height', height);
    frameEl.setAttribute('fill', '#fefefe');
    frameEl.setAttribute('stroke', 'red');
    frameEl.setAttribute('stroke-width', '' + 0.5 * scale);
    miniCanvas.appendChild(frameEl);

    if (isD3) {
      for (let i = 0; i < links.length; i++) {
        const
          link = links[i],
          pathEl = document.createElementNS("http://www.w3.org/2000/svg", 'path'),
          // transform = link.getAttribute('transform'),
          path = link.getElementsByTagName('path')[0];
        if (path) {
          let d = path.getAttribute('d');
          if (d && d.indexOf('M') >= 0) {
            d = util.shiftPath(
              self,
              d,
              border.left - offsetH * scale,
              border.top - offsetV * scale
          );
            pathEl.setAttribute('d', d);
            pathEl.setAttribute('fill', 'none');
            pathEl.setAttribute('opacity', '1');
            pathEl.setAttribute('stroke', '#c0c0c0');
            pathEl.setAttribute('stroke-width', '3');
            miniCanvas.appendChild(pathEl);
          }
        }
      }
      for (const _nodeEl of nodes) {
        const
          transform = _nodeEl.getAttribute('transform');
        if (transform) {
          const
            rect = _nodeEl.getElementsByTagName('rect')[0],
            circle = _nodeEl.getElementsByTagName('circle')[0],
            image = _nodeEl.getElementsByTagName('image')[0],
            nodeEl = document.createElementNS("http://www.w3.org/2000/svg", 'g');
          nodeEl.setAttribute('transform', transform);
          miniCanvas.appendChild(nodeEl);
          if (rect) {
            const
              rectEl = document.createElementNS("http://www.w3.org/2000/svg", 'rect'),
              x = +rect.getAttribute('x') - border.left + offsetH * scale,
              y = +rect.getAttribute('y') - border.top + offsetV * scale,
              width = rect.getAttribute('width'),
              height = rect.getAttribute('height'),
              rx = rect.getAttribute('rx'),
              ry = rect.getAttribute('ry');
            rectEl.setAttribute('x', '' + x);
            rectEl.setAttribute('y', '' + y);
            rectEl.setAttribute('width', width);
            rectEl.setAttribute('height', height);
            if (rx) {
              rectEl.setAttribute('rx', rx);
            }
            if (ry) {
              rectEl.setAttribute('ry', ry);
            }
            rectEl.setAttribute('fill', '#dedede');
            rectEl.setAttribute('stroke', '#ababab');
            rectEl.setAttribute('stroke-width', '2');
            nodeEl.appendChild(rectEl);
          } else if (circle) {
            const
              circleEl = document.createElementNS("http://www.w3.org/2000/svg", "circle"),
              x = +circle.getAttribute('cx') - border.left + offsetH * scale,
              y = +circle.getAttribute('cy') - border.top + offsetV * scale,
              r = circle.getAttribute('r');
            circleEl.setAttribute('cx', '' + x);
            circleEl.setAttribute('cy', '' + y);
            if (r) {
              circleEl.setAttribute('r', r);
            }
            circleEl.setAttribute('fill', '#dedede');
            circleEl.setAttribute('stroke', '#ababab');
            circleEl.setAttribute('stroke-width', '2');
            nodeEl.appendChild(circleEl);
          } else if (image) {
            const
              imageEl = document.createElementNS("http://www.w3.org/2000/svg", 'rect'),
              x = +image.getAttribute('x') - border.left + offsetH * scale,
              y = +image.getAttribute('y') - border.top + offsetV * scale,
              width = image.getAttribute('width'),
              height = image.getAttribute('height'),
              href = image.getAttribute('href');
            imageEl.setAttribute('x', '' + x);
            imageEl.setAttribute('y', '' + y);
            imageEl.setAttribute('width', width);
            imageEl.setAttribute('height', height);
            imageEl.setAttribute('fill', '#e0e0e0');
            imageEl.setAttribute('stroke', '#a0a0a0');
            imageEl.setAttribute('stroke-width', '2');
            nodeEl.appendChild(imageEl);
          }
        }
      }
    } else {
      for (let i = 0; i < _links.length; i++) {
        const
          link = _links[i],
          pathEl = document.createElementNS("http://www.w3.org/2000/svg", 'path'),
          path = link.path;
        if (path) {
          let d = path;
          if (d && d.indexOf('M') >= 0) {
            d = util.shiftPath(
              self,
              d,
              border.left - offsetH * scale,
              border.top - offsetV * scale
          );
            pathEl.setAttribute('d', d);
            pathEl.setAttribute('fill', 'none');
            pathEl.setAttribute('opacity', '1');
            pathEl.setAttribute('stroke', '#c0c0c0');
            pathEl.setAttribute('stroke-width', '3');
            miniCanvas.appendChild(pathEl);
          }
        }
      }
      for (const node of _nodes) { // let i = 0; i < _nodes.length; i++) {
        const
          // node = _nodes[i],
          gEl = document.createElementNS("http://www.w3.org/2000/svg", 'g'),
          shape = node.shape;
        gEl.setAttribute('transform', 'translate(' +
          [
            node.x + offsetH * scale - border.left,
            node.y + offsetV * scale - border.top
          ] +
        ')');
        // console.log('nodeEl shape=' + shape + '(' + [node.x, node.y] + ')');
        miniCanvas.appendChild(gEl);
        if ('CIRCLE' !== shape) {
          const
            rectEl = document.createElementNS("http://www.w3.org/2000/svg", 'rect'),
            size = node.size,
            width = size.width,
            height = size.height,
            rx = size.rx,
            ry = size.ry,
            x = - width / 2,
            y = - height / 2;
          // console.log(shape, size);
          rectEl.setAttribute('x', '' + x);
          rectEl.setAttribute('y', '' + y);
          rectEl.setAttribute('width', '' + width);
          rectEl.setAttribute('height', '' + height);
          if (rx) {
            rectEl.setAttribute('rx', '' + rx);
          }
          if (ry) {
            rectEl.setAttribute('ry', '' + ry);
          }
          rectEl.setAttribute('fill', '#dedede');
          rectEl.setAttribute('stroke', '#ababab');
          rectEl.setAttribute('stroke-width', '2');
          gEl.appendChild(rectEl);
        } else if ('CIRCLE' === shape) {
          const
            circleEl = document.createElementNS("http://www.w3.org/2000/svg", "circle"),
            x = 0,
            y = 0,
            r = node.size.radius;
          circleEl.setAttribute('cx', '' + x);
          circleEl.setAttribute('cy', '' + y);
          if (r) {
            circleEl.setAttribute('r', '' + r);
          }
          circleEl.setAttribute('fill', '#dedede');
          circleEl.setAttribute('stroke', '#ababab');
          circleEl.setAttribute('stroke-width', '2');
          gEl.appendChild(circleEl);
        }
      }
    }
  }

  isNode = function(el) {
    if (el && ['TextualBody', 'Text', 'Video', 'Image', 'Sound', 'Book', 'Dataset'].indexOf(el.type) > -1) {
      return true;
    }
    return false;
  };

  isLink = function(el) {
    if (el && 'Link' === el.type) {
      return true;
    }
    return false;
  };

  getLinkPoints = (link) => {
    const
      drawing = this,
      path = link.select('.Path');
    if (!path) {
      return null;
    }
    const
      pathString = path.attr('d'),
      array = pathString
        .split(/(?=[LMQZ])/)
        .map(d => {
          const command = d.substr(0, 1);
          const pairsArray = [];
          let   pointsArray = [];
          if ('M' === command || 'L' === command) {
            pointsArray = d.slice(1, d.length).split(',');
            for (let i = 0; i < pointsArray.length; i += 2) {
              pairsArray.push([command, +pointsArray[i], +pointsArray[i + 1]]);
            }
          } else if ('Q' === command) {
            pointsArray = d.slice(1, d.length)
              .split(' ')
              .map(e => { return e.split(','); });
            for (let i = 0; i < pointsArray.length; i += 1) {
              pairsArray.push([command, +pointsArray[i][0], +pointsArray[i][1]]);
            }
          }
          return pairsArray;
        }
    );
    let x1, y1, xC, yC, x2, y2, x, y;
    if ('L' === array[1][0][0]) {
      // M x1 y1 L x2 y2
      // x = (x1 + x2)/1; y = (y1 + y2)/2;
      x1 = array[0][0][1]; y1 = array[0][0][2];
      x2 = array[1][0][1]; y2 = array[1][0][2];
      x = (x1 + x2) / 2;
      y = (y1 + y2) / 2;
    } else if ('Q' === array[1][0][0]) {
      // M x1 y1 Q xC yC x2 y2
      // x = xC/2 + (x1 + x2)/4; y = yC/2 + (y1 + y2)/4;
      x1 = array[0][0][1]; y1 = array[0][0][2];
      xC = array[1][0][1]; yC = array[1][0][2];
      x2 = array[1][1][1]; y2 = array[1][1][2];
      x = xC / 2 + (x1 + x2) / 4;
      y = yC / 2 + (y1 + y2) / 4;
    } else {
      return null;
    }
    const parsed = [[x1, y1], [x, y], [x2, y2]];
    return parsed;
  }

  copyObject = function(from_data, to_data) {
    const
      self = this;
    if (undefined === to_data) {
      to_data = {};
    }
    if (undefined === from_data ||
        null === from_data) {
      return to_data;
    }
    if (to_data !== from_data) {
      if ('number' === typeof from_data ||
          'string' === typeof from_data ||
          'boolean' === typeof from_data) {
        to_data = from_data;
      } else if ('[object Array]' === Object.prototype.toString.call(from_data)) {
        to_data = from_data.slice(0);
      } else if ('[object Object]' === Object.prototype.toString.call(from_data)) {
        Object.keys(from_data).forEach(function(key) {
          if (from_data.hasOwnProperty(key) &&
              to_data[key] !== from_data[key]) {
            if (undefined !== from_data[key] ||
                null      !== from_data[key] ||
                'number' === typeof from_data[key] ||
                'string' === typeof from_data[key] ||
                'boolean' === typeof from_data[key]) {
              to_data[key] = from_data[key];
            } else if ('[object Array]' === Object.prototype.toString.call(from_data[key])) {
              to_data[key] = from_data[key].slice(0);
            } else if ('[object Object]' === Object.prototype.toString.call(from_data[key])) {
              to_data[key] = self.copyObject(from_data[key], to_data[key]);
            }
          }
        });
      }
    }
    return to_data;
  };

  updateObject = function(from_data, to_data) {
    const
      self = this;
    if (undefined === to_data) {
      to_data = {};
    }
    if (undefined === from_data ||
        null === from_data) {
      return to_data;
    }
    if (to_data !== from_data) {
      if ('number' === typeof from_data ||
          'string' === typeof from_data ||
          'boolean' === typeof from_data) {
        to_data = from_data;
      } else if ('[object Array]' === Object.prototype.toString.call(from_data)) {
        to_data = from_data.slice(0);
      } else if ('[object Object]' === Object.prototype.toString.call(from_data)) {
        Object.keys(to_data).forEach(function(key) {
          if (from_data.hasOwnProperty(key) &&
              to_data[key] !== from_data[key]) {
            if (undefined !== from_data[key] ||
                null      !== from_data[key] ||
                'number' === typeof from_data[key] ||
                'string' === typeof from_data[key] ||
                'boolean' === typeof from_data[key]) {
              to_data[key] = from_data[key];
            } else if ('[object Array]' === Object.prototype.toString.call(from_data[key])) {
              to_data[key] = from_data[key].slice(0);
            } else if ('[object Object]' === Object.prototype.toString.call(from_data[key])) {
              to_data[key] = self.updateObject(from_data[key], to_data[key]);
            }
          }
        });
      }
    }
    return to_data;
  };

  toArray = function(object) {
    const
      self = this;
    let
      array = [],
      element;
    if (self.notEmpty(object)) {
      Object.keys(object).forEach(function(key) {
        element = object[key];
        self.append(array, element);
      });
    } else {
      array = [];
    }
    return array;
  };

  // Begin decodeHtml
  // Decodes HTML entities in a browser-friendly way
  // See http://stackoverflow.com/questions/1912501/unescape-html-entities-in-javascript
  //
  // decodeHtml = function(input) {
  //   const e = document.createElement('div');
  //   e.innerHTML = input;
  //   return e.childNodes.length === 0 ? '' : e.childNodes[0].nodeValue;
  // };

  // encodeHtml = function(input_arg_str, exclude_amp) {
  //   const
  //     input_str = String(input_arg_str),
  //     regex_encode_html = /[&"'><]/g,
  //     regex_encode_noamp = /["'><]/g,
  //     html_encode_map = {
  //       '&' : '&#38;',
  //       '"' : '&#34;',
  //       '\'' : '&#39;',
  //       '>' : '&#62;',
  //       '<' : '&#60;'
  //     },
  //     encode_noamp_map = {
  //       '"' : '&#34;',
  //       '\'' : '&#39;',
  //       '>' : '&#62;',
  //       '<' : '&#60;'
  //     };
  //   let
  //     regex,
  //     lookup_map;

  //   if (exclude_amp) {
  //     lookup_map = encode_noamp_map;
  //     regex = regex_encode_noamp;
  //   } else {
  //     lookup_map = html_encode_map;
  //     regex = regex_encode_html;
  //   }
  //   return input_str.replace(regex,
  //     function(match, name) {
  //       return lookup_map[match] || '';
  //     }
  // );
  // };

  // escapeChar = function(str) {
  //   if (str && str.replace) {
  //     str = str.replace(/\x00/g, '');
  //     str = str.replace(/(?:\r\n|\r|\n)/g, '<br/>');
  //     str = str.replace(/\&/g, '&amp;');
  //     str = str.replace(/\"/g, '&quot;');
  //     str = str.replace(/\'/g, '&apos;');
  //     str = str.replace(/\</g, '&lt;');
  //     str = str.replace(/\>/g, '&gt;');
  //   }
  //   return str;
  // };

  // unescapeChar = function(str) {
  //   const
  //     LFcode = (<HTMLInputElement>document.getElementById('LFtextarea')).value;
  //   if (str && str.replace) {
  //     str = str.replace(/(?:<br>|<br \/>|<br\/>)/g, LFcode);
  //     str = str.replace(/(?:\&lt;br\&gt;|\&lt;br\/\&gt;|\&lt;br \/\&gt;)/g, LFcode);
  //     str = str.replace(/\&amp;/g, '&');
  //     str = str.replace(/\&quot;/g, '"');
  //     str = str.replace(/\&apos;/g, '\'');
  //     str = str.replace(/\&lt;/g, '<');
  //     str = str.replace(/\&gt;/g, '>');
  //   }
  //   return str;
  // };

  getLineHeight = function(element) {
    // cf. http://stackoverflow.com/questions/4392868/javascript-find-divs-line-height-not-css-property-but-actual-line-height
    let temp = document.createElement(element.nodeName);
    temp.setAttribute('style',
      'margin:0px;padding:0px;font-family:' + element.style.fontFamily +
      ';font-size:' + element.style.fontSize);
    temp.innerHTML = 'いろは';
    temp = element.parentNode.appendChild(temp);
    const ret = temp.clientHeight;
    temp.parentNode.removeChild(temp);
    return ret;
  };

  getEmSize = function(elem) {
    return Number(
      getComputedStyle(elem, '').fontSize.match(/\d*\.?\d*/)[0]
  );
  };

}
