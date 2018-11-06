import { NgZone, Injectable, Inject, EventEmitter } from '@angular/core';
import { Node, Link, SimNode, SimLink } from '../../model/wuwei';
import { MessageService } from '../../services/message.service';
import { WuweiService } from '../../services/wuwei.service';
import { ForceDirectedGraph } from '../../model/wuwei/force-directed-graph';
import * as globals from '../../model/wuwei-globals';
import * as d3 from 'd3';

/** This service will provide methods to enable user interaction with elements
  * while maintaining the d3 simulations physics
  */
@Injectable()
export class D3Service {

  constructor(
    @Inject(MessageService) private messageService,
    @Inject(WuweiService) private util,
    ngZone: NgZone
  ) {
    globals.module.d3Service = this;
    globals.module.ngZone = ngZone;
    // ngZone.onMicrotaskEmpty.subscribe(() => {
    //   console.log('angular detect change');
    // });
  }

  /** A method to bind a pan and zoom behaviour to an svg element for  d3 force simulation */
  applyForceZoomableBehaviour(svgElement, containerElement) {
    const scale = globals.current.page.transform.scale;
    let svg, container, zoomed, zoom;

    svg = d3.select(svgElement);
    container = d3.select(containerElement);

    zoomed = () => {
      const transform = d3.event.transform;
      container.attr('transform', 'translate(' + transform.x + ',' + transform.y + ') scale(' + transform.k /*scale*/ + ')');
    };

    zoom = d3.zoom().on('zoom', zoomed);
    svg
      .call(zoom)
      /**
       * see https://stackoverflow.com/questions/11786023/how-to-disable-double-click-zoom-for-d3-behavior-zoom
       */
      .on('dblclick.zoom', null);
  }

  /** The interactable graph we will simulate in this article
    * This method does not interact with the document, purely physical calculations with d3
    */
  getForceDirectedGraph(options: { width, height }) {
    const forceDirectedGraph = new ForceDirectedGraph(options);
    return forceDirectedGraph;
  }
}
