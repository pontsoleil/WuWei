import {
  NgZone,
  Component,
  // Input,
  Output,
  // ChangeDetectorRef,
  HostListener,
  // ChangeDetectionStrategy,
  OnInit,
  AfterViewChecked,
  EventEmitter
} from '@angular/core';
// import { Router } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import { D3Service } from '../../d3';
import { Node, SimNode, Link, SimLink } from '../../../model/wuwei';
import { WuweiModel } from '../../../model/wuwei/wuwei.model';
import { ForceDirectedGraph } from '../../../model/wuwei/force-directed-graph';
import {
  CognitoUserService,
  MessageService,
  WpUserService,
  WuweiService
} from '../../../services';
import { FORCE } from 'assets/config/environment.force';
import * as globals from '../../../model/wuwei-globals';
import * as d3 from 'd3';

/** Component for D3 force simulation graph.
  * Receives following messages; drawingNotify
  */
@Component({
  selector: 'app-force',
  templateUrl: 'force.component.html',
  styleUrls: ['./force.component.scss']
})
export class ForceComponent implements AfterViewChecked, OnInit {

  @Output()
  nodeEvent = new EventEmitter<any>();

  // @HostListener('window:resize', ['$event'])
  // onResize(event) {
  //   this.force.initSimulation(/*this.options*/);
  // }

  private force: ForceDirectedGraph;
  private subscription: Subscription;

  public _options: { width, height } = { width: window.innerWidth, height: window.innerHeight };
  private initialized = false;
  private view_initialized = false;

  private stateMap = {
    x1: null,
    y1: null,
    offsetH: null,
    offsetV: null,
    scale: null,
    x: null,
    y: null
  };

  ngAfterViewChecked() {
    // console.log('- drawGraphComponent ngAfterViewChecked view_initialized=' + this.view_initialized);
    const
      self = this,
      util = self.util,
      model = self.model;

    for (const node of globals.graph.nodes) {
      if (node.visible && !node.filterout) {
        const d3node = d3.select('g.node#' + node.id); // node is Node
        d3node.attr('transform', 'translate(' + [node.x, node.y] + ')');
        const links = model.findLinksByNode(node);
        if (links) {
          const visibleLinks = links.visibles;
          for (const link of visibleLinks) {
            model.renderLink(link); // link is Link
          }
        }
      }
    }

    if ('open' === d3.select('#miniature').attr('class')) {
      util.setupMiniature();
      util.drawMiniature('force', 'simulation', 'miniCanvas');
    }

    d3.selectAll('g.node')
      .on('mouseover', event => {
        const
          now = Date.now(),
          id = d3.event.currentTarget.id,
          node = model.findNodeBy_id(id),
          d3node = d3.select('g.node#' + id),
          simNode = d3node.datum(),
          pContext = util.pContext({ x: d3.event.x, y: d3.event.y }),
          mouse = {
            node: node,
            position: { x: pContext.x, y: pContext.y }
          },
          mouseJson = JSON.stringify(mouse);

        // util.logIsoDateTime('mouseOver');
        self.messageService.mouseOver(mouseJson);

        if (FORCE.TRANSPARENT.EXPIRE) {
          /**
           * resset transparency timer of simNode
           */
          d3node.style('opacity', 1);
          if (simNode.touched < FORCE.TRANSPARENT.MAX_TOUCH) {
            simNode.touched++;
          }
          simNode.opacity = 1;
          simNode.expire = now + simNode.touched * FORCE.TRANSPARENT.TIMEOUT;
          const links = self.model.findSimLinksBySimNode(simNode);
          if (links) {
            // const visibleLinks = links.visibles;
            for (const simLink of links) {
              const
                linkId = simLink.id,
                d3link = d3.select('g.link#' + linkId),
                node = model.findNodeBy_id(simNode.id),
                otherNode = model.findOtherSimNode(simLink, simNode);
              let otherOpacity = 0;
              if (otherNode) {
                otherOpacity = d3.select('g.node#' + otherNode.id).style('opacity');
              }
              if (otherOpacity < 1) {
                d3link.style('opacity', otherOpacity);
              } else {
                d3link.style('opacity', 1);
              }
            }
          }
          model.updateLinkCount();
        }
        // console.log('SimNode "' + simNode.label + '" id=' + simNode.id + ' expire=' + util.toISOStringH(simNode.expire) +
        //             ' now=' + util.toISOStringH(now) + ' opacity=' + simNode.opacity +
        //             ' ForceComponent mouseover touched:' + simNode.touched);
      })
      .on('mouseout', event => {
        const
          id = d3.event.currentTarget.id,
          node = model.findNodeBy_id(id),
          mouse = { node: node },
          mouseJson = JSON.stringify(mouse);
        self.messageService.mouseOut(mouseJson);
      });

    d3.selectAll('g.link')
      .on('mouseover', event => {
        const
          id = d3.event.currentTarget.id,
          link = model.findLinkBy_id(id),
          pContext = util.pContext({ x: d3.event.x, y: d3.event.y }),
          mouse = {
            link: link,
            position: { x: pContext.x, y: pContext.y }
          },
          mouseJson = JSON.stringify(mouse);
        self.messageService.mouseOver(mouseJson);
      })
      .on('mouseout', event => {
        const
          id = d3.event.currentTarget.id,
          link = model.findLinkBy_id(id),
          mouse = { link: link },
          mouseJson = JSON.stringify(mouse);
        self.messageService.mouseOut(mouseJson);
      });

    globals.module.ngZone.runOutsideAngular(() => {
      if (!FORCE.SIMULATE) {
        this.applyDraggableLinkBehaviour();
      }
    });
  }

  ngOnInit() {
    this.moveCenter();
    // this.force.initSimulation(/*this.options*/);
  }

  constructor(
    private d3Service: D3Service,
    private messageService: MessageService,
    private auth: WpUserService,
    private util: WuweiService,
    private model: WuweiModel,
    private zone: NgZone
  ) {
    const self = this;

    this.subscription = messageService.drawingNotify$.subscribe(
      json => {
        const
          parsed = JSON.parse(json),
          command = parsed.command;
          // param = parsed.param;
        if (command) {
          if (['zoomin', 'zoomout', 'reset_view'].indexOf(command) >= 0) {
            self[command]();
          } else {
            self.nodeEvent.emit(json);
          }
        }
      },
      err => {
        alert('ForceComponent' + JSON.stringify(err));
      }
    );

  }

  moveCenter = () => {
    /** move center of svg */
    const
      vbox_width = window.innerWidth,
      vbox_height = window.innerHeight,
      vbox_x = vbox_width / 2,
      vbox_y = vbox_height / 2;
    let svg; // , canvas;
    svg = document.getElementById('force');
    svg.setAttribute('viewBox', '-' + vbox_x + ' -' + vbox_y + ' ' + vbox_width + ' ' + vbox_height);

    /** Receiving an initialized simulated graph from our custom d3 service */
    this.force = this.d3Service.getForceDirectedGraph(this.options);
  }

  get options() {
    return this._options = {
      width: window.innerWidth,
      height: window.innerHeight
    };
  }

  /** initialize d3 force simulation graph based on provides nodes and links */
  public getForceDirectedGraph(options?: { width, height}) {
    if (!options) {
      options = {
        width: window.innerWidth,
        height: window.innerHeight
      };
    }
    const force = this.d3Service.getForceDirectedGraph(options);
    return force;
  }

  zoomin = () => {
    this.util.zoomin();
  }

  zoomout = () => {
    this.util.zoomout();
  }

  reset_view = () => {
    this.util.reset_view();
  }

  applyDraggableLinkBehaviour = () => {
    const
      self = this,
      util = self.util,
      model = self.model,
      canvasId = globals.status.canvasId,
      messageService = self.messageService;

    function dragStart(d, i) {
      globals.status.dragging = true;
      const
        d3selected = d3.select(this),
        l = d3selected.datum(),
        id = l._id,
        link = model.findLinkBy_id(id);
      if (!link) {
        return;
      }
      const
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
      link.x += d3.event.dx;
      link.y += d3.event.dy;
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
        link = model.findLinkBy_id(id);
      if (!link) {
        return;
      }
      const
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

    /** mouseover on g.link prevent dragging g.link
      *  use svg:circle#Selected instead
      */
    d3.select('#Selected')
      .call(d3.drag()
        .on('start', dragStart)
        .on('drag', dragMove)
        .on('end', dragEnd)
      );

    util.drawMiniature('force', 'simulation', 'miniCanvas');
  }
}
