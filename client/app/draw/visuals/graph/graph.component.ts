import {
  Component,
  Input,
  Output,
  ChangeDetectorRef,
  ElementRef,
  HostListener,
  ChangeDetectionStrategy,
  OnChanges,
  AfterViewChecked,
  EventEmitter
} from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
// import { LocalizationService } from '../../../services/localization.service';
import {
  CognitoUserService,
  NodeService,
  MessageService,
  WpUserService
} from '../../../services';
import { DrawService } from '../../service';
import { Node, Link } from '../../../model/wuwei';
import { GraphModel } from '../../../model/wuwei/graph-model';
import { Resource, Annotation } from '../../../model';
import { WuweiModel } from '../../../model/wuwei/wuwei.model';
import { WuweiService } from '../../../services/wuwei.service';
import { TranslatePipe } from '../../../services/nls/translate';

import * as globals from '../../../model/wuwei-globals';
import * as d3 from 'd3';

declare function escape(s: string): string;
declare function unescape(s: string): string;

/** Component for drawing graph.
 *  Receives following messages; straightenLink, drawingNotify
 */
@Component({
  selector: 'app-graph',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './graph.component.html',
  styleUrls: ['./graph.component.scss']
})
export class GraphComponent implements AfterViewChecked, OnChanges {

  @Input('nodes') nodes: Node[];
  @Input('links') links: Link[];
  @Input('simulating') simulating;

  @Output()
  nodeEvent = new EventEmitter<any>();

  // private model: WuweiModel;
  private graph: GraphModel;

  public _options: {width, height} = {width: window.innerWidth, height: window.innerHeight};
  private initialized = false;
  private view_initialized = false;

  private subscription: Subscription;
  private canvas;
  private resizeTimer = null;

  public lang: string;

  @HostListener('window:resize', ['$event'])
  onResize(event) { }

  constructor(
    private drawService: DrawService,
    private nodeService: NodeService,
    private ref: ChangeDetectorRef,
    private elementRef: ElementRef,
    private router: Router,
    private messageService: MessageService,
    // private auth: AuthService,
    private translate: TranslatePipe,
    private util: WuweiService,
    private model: WuweiModel
  ) {
    const self = this;
    self.lang = globals.nls.LANG;

    self.subscription = messageService.straightenLink$.subscribe(
      json => {
        const
          parsed = JSON.parse(json),
          _id = parsed._id;
        self.straightenLink(_id);
      },
      err => {
        alert('GraphComponent' + JSON.stringify(err));
      }
    );

    self.subscription = messageService.drawingNotify$.subscribe(
      json => {
        const
          self = this,
          parsed = JSON.parse(json),
          command = parsed.command,
          param = parsed.param;
        // console.log(globals.graph.nodes);
        if (command) {
          if (['zoomin', 'zoomout', 'reset_view'].indexOf(command) >= 0) {
            self[command]();
          } else {
            self.nodeEvent.emit(json);
          }
        }
      },
      err => {
        alert('GraphComponent' + JSON.stringify(err));
      }
    );
  }

  ngAfterViewChecked() {
    // console.log('- drawGraphComponent ngAfterViewChecked view_initialized=' + this.view_initialized);
    const
    self = this,
    util = self.util,
    model = self.model;

    this.applyDraggableLinkBehaviour();

    if (!self.simulating) {
      util.setupMiniature();
    }
    if ('open' === d3.select('#miniature').attr('class')) {
      util.drawMiniature('graph', 'draw', 'miniCanvas');
    }
    if (model && self.nodes.length > 0) {
      model.updateLinkCount();
      model.renderMultipleLines(self.nodes, self.nodeService);
    }
  }

  ngOnChanges() {
    console.log('- drawGraphComponent ngOnChanges initialized=' + this.initialized);
    if (!this.initialized) {
      console.log('- drawGraphComponent ngOnChanges moveCenter()');
      this.moveCenter();
      this.initialized = true;
    }
  }

  moveCenter = () => {
    /** move center of svg */
    const
      vbox_width = window.innerWidth,
      vbox_height = window.innerHeight,
      vbox_x = vbox_width / 2,
      vbox_y = vbox_height / 2;
    let svg;
    svg = document.getElementById(globals.status.svgId);
    svg.setAttribute('viewBox', '-' + vbox_x + ' -' + vbox_y + ' ' + vbox_width + ' ' + vbox_height);

    /** Receiving an initialized simulated graph from our custom d3 service */
    this.graph = this.drawService.getGraphModel(this.nodes, this.links, this.options);
  }

  applyDraggableLinkBehaviour = () => {
    const
      self = this,
      util = self.util,
      model = self.model,
      canvasId = globals.status.canvasId,
      messageService = self.messageService;

    this.canvas = d3.select('g#' + canvasId);

    function dragStart(d, i) {
      globals.status.dragging = true;
      const
        d3selected = d3.select(this),
        l = d3selected.datum(),
        id = l._id,
        link = model.findLinkBy_id(id),
        d3link = d3.select('g.link#' + id);
      if (!d3link) {
        return;
      }
      d3link
        .raise()
        .classed('active', true);

      model.saveCurrent({ node: [link] });

      // self.messageService.closeMenu('{}');
      d3.select('#ContextMenu').classed('collapsed', true);
      d3.selectAll('.contextMenu').classed('collapsed', true);
    }

    function dragMove(d, i) {
      globals.status.dragging = true;
      const
        d3selected = d3.select(this),
        l = d3selected.datum(),
        id = l._id,
        link = model.findLinkBy_id(id);
      if (!link) {
        return;
      }
      d3selected.attr('cursor', 'move');
      const
        dx = d3.event.dx,
        dy = d3.event.dy;
      console.log('dragMove (' + [dx, dy] + ')');
      link.x += dx;
      link.y += dy;
      link.straight = false;

      model.renderLink(link);
      return false;
    }

    function dragEnd(d, i) {
      globals.status.dragging = false;
      const
        d3selected = d3.select(this),
        l = d3selected.datum(),
        id = l._id,
        link = model.findLinkBy_id(id),
        d3link = d3.select('g.link#' + id);
      if (!d3link) {
        return;
      }
      d3link
        .classed("active", false)
        .attr('cursor', 'normal');
      d3selected.attr('class', '');
      const logData = {
        command: 'drag',
        param: { node: [link] }
      };
      self.model.storeLog(logData);
      self.messageService.undoRedo(JSON.stringify({
        action: 'drag'
      }));
      return false;
    }

    for (const link of this.links) {
      model.renderLink(link);
    }

    /** mouseover on g.link prevent dragging g.link
      *  use circle#Selected instead
      */
    d3.select('#Selected')
      .call(d3.drag()
        .on('start', dragStart)
        .on('drag', dragMove)
        .on('end', dragEnd)
      );

    util.drawMiniature('graph', 'draw', 'miniCanvas');
  }

  get options() {
    return this._options = {
      width: window.innerWidth,
      height: window.innerHeight
    };
  }

  getGraph(nodes, links) {
    this.nodes = nodes;
    this.links = links;
    return this;
  }

  straightenLink = (_id) => {
    const
      self = this,
      model = self.model,
      links = globals.graph.links;
    for (const link of links) {
      if (link.source_id === _id || link.target_id === _id) {
        link.straight = true;
        model.renderLink(link);
      }
    }
  }

  // ------------------- BEGIN UTILITY METHODS ------------------
  toFront = (sel) => {
    const util = this.util;
    if (!sel) {
      return;
    }
    const
      canvasElement = document.getElementById('draw'),
      datatype = typeof sel;
    if (!canvasElement) {
      return;
    }
    let element = null;
    if ('string' === datatype) {
      element = document.getElementById(sel);
    } else if (util.notEmptySelection(sel)) {
      element = sel.node();
    } else if (sel.type) {
      if ('Link' === sel.type) {
        element = document.getElementById('link_' + sel._id);
      } else {
        element = document.getElementById('node_' + sel._id);
      }
    }
    if (element) {
      canvasElement.appendChild(element);
    }
  }

  zoomin = () => {
    const canvasId = globals.status.canvasId;
    this.util.zoomin();
  }

  zoomout = () => {
    const canvasId = globals.status.canvasId;
    this.util.zoomout();
  }

  reset_view = () => {
    // const canvasId = globals.status.canvasId;
    this.util.reset_view();
  }

  closestPoint = (pathNode, point) => {
    // See https://bl.ocks.org/mbostock/8027637
    const
      pathLength = pathNode.getTotalLength();
    let
      precision = 8,
      best,
      bestLength,
      bestDistance = Infinity;

    // linear scan for coarse approximation
    for (let scan, scanLength = 0, scanDistance; scanLength <= pathLength; scanLength += precision) {
      if ((scanDistance = distance2(scan = pathNode.getPointAtLength(scanLength))) < bestDistance) {
        best = scan;
        bestLength = scanLength;
        bestDistance = scanDistance;
      }
    }

    // binary search for precise estimate
    precision /= 2;
    while (precision > 0.5) {
      let before,
          after,
          beforeLength,
          afterLength,
          beforeDistance,
          afterDistance;
      if ((beforeLength = bestLength - precision) >= 0 &&
          (beforeDistance = distance2(before = pathNode.getPointAtLength(beforeLength))) < bestDistance) {
        best = before;
        bestLength = beforeLength;
        bestDistance = beforeDistance;
      } else if ((afterLength = bestLength + precision) <= pathLength &&
          (afterDistance = distance2(after = pathNode.getPointAtLength(afterLength))) < bestDistance) {
        best = after;
        bestLength = afterLength;
        bestDistance = afterDistance;
      } else {
        precision /= 2;
      }
    }

    best = { 'x': best.x, 'y': best.y };
    best.distance = Math.sqrt(bestDistance);
    return best;

    function distance2(p) {
      const
        dx = p.x - point[0],
        dy = p.y - point[1];
      return dx * dx + dy * dy;
    }
  }

  start = () => {
    // see https://bl.ocks.org/mbostock/1095795 for Modifying a Force Layout
    const self = this;
    // ------------------- RESIZE WINDOW --------------------------
    // const openJson = JSON.stringify({
    //   'open': false
    // });
    // this.messageService.openEdit(openJson);
  }
}
