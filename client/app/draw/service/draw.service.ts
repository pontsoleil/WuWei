/** app-draw */
import {
  Injectable,
  EventEmitter,
  Input, Output,
  Inject
} from '@angular/core';
import { Node, Link } from '../../model/wuwei';
import { GraphModel } from '../../model/wuwei/graph-model';
import { MessageService } from '../../services/message.service';
import { WuweiService } from '../../services/wuwei.service';
import { WuweiModel } from '../../model/wuwei/wuwei.model';
import * as globals from '../../model/wuwei-globals';
import * as d3 from 'd3';

export class DrawService {

  @Input('nodes') nodes: Node[];
  @Input('links') links: Link[];

  // @Output() nodeEvent = new EventEmitter<any>();

  private dragging = globals.status.dragging;
  private svg;
  private container;

/** This service will provide methods to enable user interaction with elements
  * while maintaining the d3 simulations physics
  */
  constructor(
    @Inject(MessageService) private messageService,
    @Inject(WuweiService) private util,
    @Inject(WuweiModel) private model
  ) {
    globals.module.drawService = this;
  }

  /** A method to bind a pan and zoom behaviour to an svg element */
  applyZoomableBehaviour(svgElement, containerElement) {
    let
      zoomed, zoom;
    this.svg = d3.select(svgElement);
    this.container = d3.select(containerElement);
    zoomed = () => {
      if (!globals.status.dragging) {
        const
          transform = d3.event.transform;
        let
          xTransform, yTransform, zoom;
        if (transform) {
          xTransform = transform.x;
          yTransform = transform.y;
          zoom = globals.current.page.transform.scale;
          zoom = Math.round(zoom * 100) / 100;
          if (zoom < 0.2) {
            zoom = 0.2;
          } else if (zoom > 5) {
            zoom = 5;
          }
        } else {
          xTransform = 0;
          yTransform = 0;
          zoom = 1;
        }
        this.container.attr(
          'transform',
          'translate(' + [xTransform, yTransform] + ') scale(' + zoom + ')'
        );
        if (0.99 < zoom && zoom < 1.01) {
          d3.select('#reset_view').html('=');
        } else {
          d3.select('#reset_view').html(zoom);
        }
      }
    };
    zoom = d3.zoom().on('zoom', zoomed);
    this.svg
      .call(zoom)
      /**
       * see https://stackoverflow.com/questions/11786023/how-to-disable-double-click-zoom-for-d3-behavior-zoom
       */
      .on('dblclick.zoom', null);
  }

  /** A method to bind a draggable behaviour to an node element */
  applyDraggableBehaviour(element, node: Node) {
    const
      self = this,
      util = self.util,
      d3element = d3.select(element);

    element.addEventListener('mouseover', event => {
      const
        mouse = {node: node},
        mouseJson = JSON.stringify(mouse);
      self.messageService.mouseOver(mouseJson);
    });

    element.addEventListener('mouseout', event => {
      const
        mouse = {node: node},
        mouseJson = JSON.stringify(mouse);
      self.messageService.mouseOut(mouseJson);
    });

    function dragStart() {
      globals.status.dragging = true;
      d3element
        .raise()
        .style('cursor', 'move')
        .classed('active', true)
        .style('cursor', 'move');
      const links = self.model.findLinksByNode(node).links;
      self.model.saveCurrent({
        node: [node],
        link: links
      });

      // self.messageService.closeMenu('{}');
      d3.select('#ContextMenu').classed('collapsed', true);
      d3.selectAll('.contextMenu').classed('collapsed', true);
    }

    function dragged() {
      globals.status.dragging = true;
      if (globals.status.dragging) {
        node.x += d3.event.dx;
        node.y += d3.event.dy;
        d3element
          .style('cursor', 'move')
          .attr('x', node.x)
          .attr('y', node.y)
          .attr('transform', 'translate(' + [node.x, node.y] + ')')
          .style('cursor', 'move');
        if ('Node' === node.type ||
            'Content' === node.type ||
            'Topic' === node.type ||
            'Memo' === node.type) {
          const json = JSON.stringify({ _id: node._id});
          self.messageService.linkStraighten(json);
        }
      }
    }

    function dragEnd() {
      globals.status.dragging = false;
      d3element
        .classed('active', false)
        .style('cursor', 'default');
      const links = self.model.findLinksByNode(node).links;
      const logData = {
        command: 'drag',
        param: {
          node: [node],
          link: links
        }
      };
      self.model.storeLog(logData);
      self.messageService.undoRedo(JSON.stringify({
        action: 'drag'
      }));
    }

    d3element.call(d3.drag()
      .on('start', dragStart)
      .on('drag', dragged)
      .on('end', dragEnd));
  }

  /** A method to bind a selectable behaviour to an link element */
  applySelectableBehaviour(element, link: Link/*, graph: GraphModel*/) {
    const
      self = this,
      // util = self.util,
      // messageService = self.messageService,
      d3element = d3.select(element);

    element.addEventListener('mouseover', event => {
      const
        position = {
          x: link.x,
          y: link.y
        },
        mouse = {
          link: link,
          position: position
        },
        mouseJson = JSON.stringify(mouse);
      self.messageService.mouseOver(mouseJson);
    });

    element.addEventListener('mouseout', event => {
      const
        position = {
          x: link.x,
          y: link.y
        },
        mouse = {
          link: link,
          position: position
        },
        mouseJson = JSON.stringify(mouse);
      self.messageService.mouseOut(mouseJson);
    });
  }

  /** The interactable graph we will simulate in this article
    * This method does not interact with the document, purely physical calculations with d3
    */
  getGraphModel(nodes: Node[], links: Link[], options: { width, height }) {
    const graphModel = new GraphModel(nodes, links, options);
    return graphModel;
  }

}
