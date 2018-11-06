// import { EventEmitter, Inject } from '@angular/core';
import { MessageService } from '../../services/message.service';
import {
  Link,
  Node,
  SimLink,
  SimNode
} from './shared';
import { WuweiModel } from './wuwei.model';
import { WuweiService } from '../../services/wuwei.service';
import * as globals from '../wuwei-globals';
import * as d3 from 'd3';
// import * as svgIntersections from 'svg-intersections';
// import { setFlagsFromString } from 'v8';
import { FORCE } from 'assets/config/environment.force';
import { createSelf } from '@angular/compiler/src/core';

export class ForceDirectedGraph {
  private simulation: d3.Simulation<any, any>;
  private model: WuweiModel;
  private util: WuweiService;
  private messageService: MessageService;

  // private simNodes: SimNode[] = [];
  // private simLinks: SimLink[] = [];
  private d3simLink; // d3 simulation
  private d3simNode; // d3 simulation

  private timer;

  constructor(
    options: { width, height }
  ) {
    const
      self = this,
      canvas = d3.select('g#' + globals.status.canvasId);

    self.model = globals.module.wuweiModel;
    self.util = globals.module.util;
    self.messageService = globals.module.messageService;

    // globals.force.simNodes = [];
    // globals.force.simLinks = [];
    self.d3simNode = canvas.selectAll('.node') || [];
    self.d3simLink = canvas.selectAll('.link') || [];

    setTimeout(() => {
      if (FORCE && FORCE.SIMULATE && !self.simulation) {
        globals.status.simulation = self.initSimulation(/*options*/);
      }
    }, 500);
  }

  initSimulation() {
    const self = this;
    if (self.simulation) {
      console.log('*** initSimulation return self.simulation');
      return self.simulation;
    }
    /**
     * run outside the zone by using the runOutsideAngular method
     * see
     *  https://qiita.com/ukyo/items/1775f5f09bbd9b5c2978
     *  https://netbasal.com/angular-2-escape-from-change-detection-317b3b44906b
     */
    globals.module.ngZone.runOutsideAngular(() => {
      /** Creating the simulation */
      console.log('*** initSimulation');
      if (FORCE && FORCE.SIMULATE && !self.simulation) {
        console.log('--- Create the simulation');
        self.simulation = d3.forceSimulation()
          /**
           * The link force pushes linked nodes together or apart according to the desired link
           * distance. The strength of the force is proportional to the difference between the
           * linked nodes’ distance and the target distance, similar to a spring force.
           */
          .force('link', d3.forceLink()
            .id((d) => { return d.id; })
            .distance(FORCE.LINK.DISTANCE)
            // .iterations(FORCE.LINK.ITERATIONS)
          )
          /**
           * The many-body (or n-body) force applies mutually amongst all nodes. It can be
           * used to simulate gravity (attraction) if the strength is positive, or electrostatic
           * charge (repulsion) if the strength is negative. This implementation uses quadtrees
           * and the Barnes–Hut approximation to greatly improve performance; the accuracy can
           * be customized using the theta parameter.
           */
          .force('charge', d3.forceManyBody()
            // .strength(FORCE.CHARGE.STRENGTH)
            // .distanceMin(FORCE.CHARGE.DISTANCE.MIN)
            // .distanceMax(FORCE.CHARGE.DISTANCE.MAX)
          )
          /**
           * The collision force treats nodes as circles with a given radius, rather than points,
           * and prevents nodes from overlapping. More formally, two nodes a and b are separated
           * so that the distance between a and b is at least radius(a) + radius(b). To reduce
           * jitter, this is by default a “soft” constraint with a configurable strength and
           * iteration count.
           */
          .force('collide', d3.forceCollide()
            // .strength(FORCE.COLLIDE.STRENGTH)
            // .radius(FORCE.COLLIDE.RADIUS)
            // .iterations(FORCE.COLLIDE.ITERATIONS)
          )
          // .force('centers', d3.forceCenter(0, 0))
          // .force('y', d3.forceY(0.0001))
          // .force('x', d3.forceX(0.0001))
          // .velocityDecay(FORCE.VELOCITY_DECAY)
          // .alphaDecay(FORCE.ALPHA_DECAY)
          /**
           * If target is specified, sets the current target alpha to the specified number in
           * the range [0,1] and returns this simulation. If target is not specified, returns
           * the current target alpha value, which defaults to 0.
           */
          .alphaTarget(FORCE.ALPHA_TARGET);
      }
    });
    return self.simulation;
  }

  restart(param: {nodes?: Node[], links?: Link[], internal?: boolean, targetAlpha?: number}) {
    console.log('*** restart CALLED with param:', param);
    console.log('--- globals.graph:', globals.graph);
    console.log('--- globals.force:', globals.force);
    const
      self = this,
      model = self.model,
      util = self.util,
      simulation = self.simulation;
    Promise.resolve(param)
      .then(param => {
        if (!self.simulation) {
          console.log('*** restart CALL initSimulation()');
          return {
            simulation: self.initSimulation(),
            param: param
          };
        } else {
          return {
            simulation: self.simulation,
            param: param
          };
        }
      })
      .then(data => {
        const
          simulation = data.simulation,
          param = data.param,
          _nodes = <Node[]>param.nodes,
          _links = <Link[]>param.links,
          internal = param.internal,
          targetAlpha = param.targetAlpha;
        // console.log('restart param.nodes', internal ? globals.force.simNodes : _nodes);
        // console.log('restart param.links', internal ? globals.force.simLinks : _links);
        if (!internal) {
          console.log('restart() not internal then create globals.force.simNodes and globals.force.simLinks');
          console.log('globals.graph:', globals.graph);
          globals.force.simNodes = _nodes // Node[] includes fixed
            .filter(node => {
              return node.visible && !node.filterout;
            })
            .map(node => { // Node
              const simNode = model.SimNodeFactory(node); /*{
                id: node._id,
                label: node.label,
                x: node.x,
                y: node.y,
                fixed: node.fixed
              });*/
              return simNode;
            });
          globals.force.simLinks = _links // Link[]
            .filter(link => { // Link
              if (link.visible && !link.filterout) {
                const
                  source = model.findNodeBy_id(link.source_id),
                  target = model.findNodeBy_id(link.target_id);
                if (source && target &&
                    source.visible && !source.filterout &&
                    target.visible && !target.filterout
                ) {
                  return true;
                }
              }
              return false;
            })
            .map(link => {
              let simLink;
              simLink = model.SimLinkFactory(link); /*{
                id: link._id,
                source: link.source_id,
                target: link.target_id
              });*/
              return simLink;
            });
        }
        console.log('--- globals.force:', globals.force);

        if (FORCE && FORCE.SIMULATE && targetAlpha) {
          globals.status.playing = true;
          simulation.alphaTarget(0.3).restart();
        }

        globals.module.ngZone.runOutsideAngular(() => {
          if (FORCE && FORCE.SIMULATE && FORCE.TRANSPARENT.EXPIRE) {
            clearInterval(self.timer);
          }

          // drag event handlers for SimNode
          function dragStart(d) {
            const
              now = Date.now(),
              simNode = <SimNode>d,
              d3node = d3.select('g.node#' + simNode.id);

            globals.status.dragging = true;

            if (FORCE && FORCE.SIMULATE && FORCE.TRANSPARENT.EXPIRE) {
              /**
               * resset transparency timer of simNode
               */
              d3node.style('opacity', 1);
              if (simNode.touched < FORCE.TRANSPARENT.MAX_TOUCH) {
                simNode.touched++;
              }
              simNode.opacity = 1;
              simNode.expire = now + simNode.touched * FORCE.TRANSPARENT.TIMEOUT;
              const links = model.findSimLinksBySimNode(simNode);
              if (links) {
                // const visibleLinks = links.visibles;
                for (const simLink of links) {
                  const
                    d3link = d3.select('g.link#' + simLink.id),
                    otherSimNode = model.findOtherSimNode(simLink, simNode);
                  let otherOpacity = 1;
                  if (otherSimNode) {
                    otherOpacity = otherSimNode.opacity;
                  }
                  if (otherOpacity < 1) {
                    d3link.style('opacity', otherOpacity);
                  } else {
                    d3link.style('opacity', 1);
                  }
                  simLink.fixed = false;
                  // model.renderLink(d3link);
                }
              }
            }

            d3.select('#ContextMenu').classed('collapsed', true);
            d3.selectAll('.contextMenu').classed('collapsed', true);

            console.log('DRAG simNode', simNode);
            console.log('START drag d3.event.active=' + d3.event.active);
            /**
              d3.event.active indicates how many drag events,
              other than the one the event is currently being fired for.
              see https://stackoverflow.com/questions/42605261/d3-event-active-purpose-in-drag-dropping-circles
            */
            if (FORCE && FORCE.SIMULATE) {
              if (!d3.event.active) {
                console.log('--- dragStart simulation restart');
                // self.simulation.alphaTarget(0.3).restart();
                self.restart({
                  nodes: globals.graph.nodes.filter(n => n.visible && !n.filterout),
                  links: globals.graph.links.filter(l => l.visible && !l.filterout),
                  internal: true,
                  targetAlpha: 0.3
                });
              }
            }

            const
              transform = d3node.attr('transform');
            if (!transform) {
              return;
            }
            const
              parsed = util.parse(transform),
              translate = (parsed['translate'] && parsed['translate'].map(parseFloat)) || [0, 0],
              x = translate[0],
              y = translate[1];
            d.fx = d.x = x;
            d.fy = d.y = y;
          }

          function dragged(d) {
            globals.status.dragging = true;
            const forceNode = self.model.findNodeBy_id(d.id); // SimNode
            forceNode.x = d.fx = d.x = d3.event.x;
            forceNode.y = d.fy = d.y = d3.event.y;

            // position of all node/linkare updated in ForceComponent
            const d3node = d3.select('g.node#' + d.id); // d is SimNode
            d3node.attr('transform', 'translate(' + [d.x, d.y] + ')');

            const
              node = model.findNodeBy_id(d.id),
              links = model.findLinksByNode(node),
              visibleLinks = links.visibles;
            for (const link of visibleLinks) {
              link.fixed = false;
              model.renderLink(link); // link is Link
            }
          }

          function dragEnd(d) {
            globals.status.dragging = false;
            console.log('END drag d3.event.active=' + d3.event.active);
            if (FORCE && FORCE.SIMULATE && !d3.event.active) {
              self.simulation.alphaTarget(0);
            }

            const forceNode = self.model.findNodeBy_id(d.id); // d is SimNode, forceNode is Node
            if (forceNode) {
              forceNode.x = d.fx; // fotceNode: Node, d: SimNode
              forceNode.y = d.fy;
              forceNode.fixed = d.fixed = true;
            }
            const nodeEl = document.querySelector('g.node#' + d.id);
            nodeEl.classList.add('fixed');

            const d3node = d3.select('g.node#' + d.id); // d is SimNode
            d3node.attr('transform', 'translate(' + [d.x, d.y] + ')');

            if (FORCE && FORCE.SIMULATE) {
              const outline = d3node.select('.shape-node, .memo-node');
              outline.style('filter', function(d) {
                return 'url(#fixed-shadow)';
              });
            }

            d3node.raise();
          }

          // tick event handler
          function ticked() {
            const
              alpha = self.simulation.alpha(),
              stopAlpha = 0.01;
            if (alpha < stopAlpha && !globals.status.dragging) {
              self.simulation.alpha(0).stop();
              console.log('--- ticked simulation STOP alpha(' + alpha + ') < ' + stopAlpha);
              self.messageService.playPause(
                JSON.stringify({state: 'pause'})
              );
              return;
            }
            // console.log('... ticked alpha=' + alpha); // + ' target=' + FORCE.ALPHA_TARGET);
            if (self.d3simNode && self.d3simNode._groups[0].length > 0) {
              self.d3simNode.each(function(d, i) {
                if (d) {
                  const d3node = d3.select('g.node#' + d.id); // d: SimNode
                  d3node
                    .datum(d => d) // d: SimNode
                    .attr('transform', function(d) {
                      const
                        n = model.findNodeBy_id(d.id), // d is SimNode, n is Node
                        transform = d3node.attr('transform');
                      if (n && transform) {
                        const
                          parsed = util.parse(transform),
                          translate = (parsed['translate'] && parsed['translate'].map(parseFloat)) || [0, 0],
                          x = translate[0],
                          y = translate[1];
                        if (isFinite(d.x) && isFinite(d.y)) {
                          if (d.fixed) {
                            // console.log('--- ticked "' + d.label + '" id=' + d.id + ' simNode Fixed to nodeEl(' + [x, y] + ')');
                            d.x = x;
                            d.y = y;
                          }
                        } else {
                          // console.log('--- ticked "' + d.label + '" id=' + d.id + ' SimNode has NaN Fix to nodeEl(' + [x, y] + ')');
                          d.x = x;
                          d.y = y;
                        }
                        n.x = d.x;
                        n.y = d.y;
                      }
                      return 'translate(' + [d.x, d.y] + ')';
                    });
                  const
                    visibleLinks = model.findLinksByNode(d).visibles;
                  for (const link of visibleLinks) {
                    model.renderLink(link);
                  }
                }
              });

              // draw fixed node shadow
              self.d3simNode.each(function(d, i) {
                let fixed = false;
                const nodeEl = document.querySelector('g.node#' + d.id);
                if (nodeEl) {
                  fixed = nodeEl.classList.contains('fixed');
                  const d3node = d3.select('g.node#' + d.id); // d is SimNode
                  if (FORCE && FORCE.SIMULATE && d.fixed) {
                    d3node
                      .select('.shape-node, .memo-node')
                      .style('filter', function(d) {
                        return 'url(#fixed-shadow)';
                      });
                  } else {
                    d3node
                      .select('.shape-node, .memo-node')
                      .style('filter', function(d) {
                        return null;
                      });
                  }
                } else {
                  // console.log('--- ticked "' + d.label + '" id=' + d.id + ' no g.node Element');
                }
              });

              self.d3simLink.each(function(d, i) {
                if (d) {
                  const link = model.findLinkBy_id(d.id);
                  if (link) {
                    model.renderLink(link);
                  }
                }
              });
            }
          }

          function checkExpire() {
            if (!FORCE || !FORCE.SIMULATE) {
              return;
            }
            const
              // self = this,
              now = Date.now();
            for (const simNode of globals.force.simNodes) {
              const
                nodeId = simNode.id,
                d3node = d3.select('g.node#' + nodeId);
              if (d3node && d3node.node() && simNode.opacity < 0.05) {
                /*console.log('- REMOVE SimNode "' + simNode.label + '" id=' + nodeId +
                  ' expire=' + util.toISOStringH(simNode.expire) + ' now=' + util.toISOStringH(now)
                );*/
                d3node.remove();
                self.util.removeByid(globals.force.simNodes, nodeId);
                const node = model.findNodeBy_id(nodeId);
                if (node) {
                  node.visible = false;
                  const links = model.findLinksByNode(node);
                  if (links) {
                    const allLinks = links.links;
                    for (const link of allLinks) {
                      const
                        linkId = link.id,
                        d3link = d3.select('g.link#' + link._id);
                      if (d3link && d3link.node()) {
                        console.log('- REMOVE SimLink id=' + linkId);
                        d3link.remove();
                        self.util.removeByid(globals.force.simLinks, linkId);
                        link.visible = false;
                      }
                    }
                  }
                }
              } else if (simNode.expire < now) {
                if ((globals.status.infoNode && globals.status.infoNode._id === simNode.id) ||
                    (globals.status.editNode && globals.status.editNode._id === simNode.id) ||
                    simNode.fixed
                ) {
                  if (simNode.touched < FORCE.TRANSPARENT.MAX_TOUCH) {
                    simNode.touched++;
                  }
                  simNode.opacity = 1;
                  d3node.style('opacity', 1);
                } else {
                  simNode.opacity *= FORCE.TRANSPARENT.FACTOR;
                  d3node.style('opacity', simNode.opacity);
                  const
                    _simNode = model.findSimNodeById(nodeId),
                    _simLinks = model.findSimLinksBySimNode(_simNode);
                  if (_simLinks) {
                    // const visibleLinks = links.visibles;
                    for (const _simLink of _simLinks) {
                      const
                        // link_id = link._id,
                        otherSimNode = model.findOtherSimNode(_simLink, _simNode),
                        d3link = d3.select('g.link#' + _simLink.id);
                      let otherOpacity = 1;
                      if (otherSimNode) {
                        // const otherSimNode = util.findByid(globals.force.simNodes, otherSimNode.id);
                        // if (otherSimNode) {
                        otherOpacity = otherSimNode.opacity;
                        // }
                      }
                      if (d3link && d3link.node()) {
                        const linkOpacity = d3link.style('opacity');
                        if (simNode.opacity < linkOpacity) {
                          d3link.style('opacity', simNode.opacity);
                        }
                        if (otherOpacity < linkOpacity) {
                          d3link.style('opacity', otherOpacity);
                        }
                      }
                    }
                  }
                }
                simNode.expire = now + simNode.touched * FORCE.TRANSPARENT.TIMEOUT;
                /*console.log(
                  'SimNode"' + simNode.label + '" id=' + simNode.id +
                  ' expire=' + util.toISOStringH(simNode.expire) +
                  ' now=' + util.toISOStringH(now) + ' opacity=' + simNode.opacity +
                  ' touched:' + simNode.touched
                );*/
              }
              model.updateLinkCount();
            }
          }

          self.d3simNode = self.d3simNode.data(globals.force.simNodes, function(d) { return d.id; });
          // globals.force.simNodes includes fixed simNode
          // console.log('d3simNode 1:', self.d3simNode);
          // d3.selectAll('g.node').select(function(d, i) { console.log(d); });

          if (self.d3simNode.exit && self.d3simNode.enter && self.d3simNode.merge) {

            self.d3simNode.exit().remove();
            // console.log('d3simNode 2:', self.d3simNode);
            // d3.selectAll('g.node').select(function(d, i) { console.log(d); });

            const enterNodes = self.d3simNode.enter().append('g')
            .attr('id', d => d.id)
            .attr('class', 'node')
            .style('opacity', d => d.opacity)
            .datum(d => d);

            enterNodes.call(
            d3.drag()
              .on('start', dragStart)
              .on('drag', dragged)
              .on('end', dragEnd)
            );

            d3.selectAll('g.node').select(function(d, i) {
              const d3node = d3.select('g.node#' + d.id); // d is SimNode
              if (d3node && d3node.node()) {
                if (0 === d3node.node().childNodes.length) {
                  console.log('-- d3node child renderNode() d:', d);
                  const node = model.findNodeBy_id(d.id);
                  model.renderNode(node);
                }
                if (FORCE && FORCE.SIMULATE && d.fixed) {
                  // keep current position even if simulation change its position
                  const
                    d3node = d3.select('g.node#' + d.id); // d is SimNode
                  let x = null, y = null;
                  if (d3node && d3node.node()) {
                    const
                      transform = d3node.attr('transform');
                    if (transform) {
                      const
                        parsed = util.parse(transform),
                        translate = (parsed['translate'] && parsed['translate'].map(parseFloat)) || [0, 0];
                      x = translate[0];
                      y = translate[1];
                    }
                  }
                  if (null === x || null === y) {
                    x = d.x;
                    y = d.y;
                  } else {
                    console.log('-- d3node fix position (' + [d.x, d.y] + ') to (' + [x, y] + ')');
                  }
                  d.fx = d.x = x;
                  d.fy = d.y = y;
                }
              } else {
                console.log('** d3node EMPTY d:', d);
              }
            });

            self.d3simNode = self.d3simNode.merge(enterNodes);
            // console.log('d3simNode 3:', self.d3simNode);
          }

          globals.force.simLinks = globals.force.simLinks.filter(d => {
            const
              source_id = ('object' === typeof d.source) ? d.source.id : d.source,
              sourceSimNodes = globals.force.simNodes.filter(d => d.id === source_id),
              sourceSimNode = sourceSimNodes && sourceSimNodes.length > 0
                ? sourceSimNodes[0]
                : null,
              target_id = ('object' === typeof d.target) ? d.target.id : d.target,
              targetSimNodes = globals.force.simNodes.filter(d => d.id === target_id),
              targetSimNode = targetSimNodes && targetSimNodes.length > 0
                ? targetSimNodes[0]
                : null;
            return !d.expired && sourceSimNode && targetSimNode;
          });

          self.d3simLink = self.d3simLink.data(globals.force.simLinks, function(d) {
            const
              source_id = ('object' === typeof d.source)
                ? d.source.id
                : d.source || d.source_id,
              target_id = ('object' === typeof d.target)
                ? d.target.id
                : d.target || d.target_id;
            return d.id || d._id || source_id + '-' + target_id;
          });


          if (self.d3simLink.exit && self.d3simLink.enter && self.d3simLink.merge) {

            self.d3simLink.exit().remove();

            const enterLink = self.d3simLink.enter().append('g')
              .attr('id', d => d.id)
              .attr('class', 'link')
              .style('opacity', d => d.opacity)
              .datum(d => d);

            enterLink.append('path')
              .attr('class', 'Path')
              .attr('fill', 'none')
              .attr('opacity', 1)
              .attr('fill', d => d.color)
              .attr('stroke', d => d.color)
              .attr('stroke-width', d => d.size);

            enterLink.append('path')
              .attr('class', 'Marker')
              .attr('fill', d => d.color)
              .attr('stroke', d => d.color)
              .attr('stroke-width', d => d.size);

            self.d3simLink = self.d3simLink.merge(enterLink);
          }

          if (FORCE && FORCE.SIMULATE) {
            console.log(
              '*** RESTART simulation.restart() ' +
              'globals.force.simNodes:', globals.force.simNodes,
              'globals.force.simLinks:', globals.force.simLinks
            );
            self.simulation.nodes(globals.force.simNodes);
            self.simulation.force('link').links(globals.force.simLinks);
            self.simulation
              .on('tick', ticked)
              .alpha(1)
              .alphaTarget(0)
              .restart();
          }

          model.updateLinkCount();

          if (FORCE && FORCE.SIMULATE && FORCE.TRANSPARENT.EXPIRE) {
            self.timer = setInterval(() => {
              checkExpire();
            }, FORCE.TRANSPARENT.TIMEOUT / 2);
          }
        });
      });
  }

  stop() {
    console.log('--- Called stop simulation change to alpha(0)');
    const self = this;
    if (FORCE && FORCE.SIMULATE && self.simulation) {
      self.simulation.alpha(0);
    }
  }
}
