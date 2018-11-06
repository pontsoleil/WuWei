import { Inject } from '@angular/core';
import { _transform } from '../../services/nls/translate';
import { MessageService } from '../../services/message.service';
import { treatments } from '../../../assets/config/treatments';
import { WuweiService } from '../../services/wuwei.service';
import { Resource } from '../resource';
import { Annotation } from '../annotation';
import { Link } from './shared/link';
import { Node } from './shared/node';
import { SimLink } from './shared/sim-link';
import { SimNode } from './shared/sim-node';
import { Page, Note } from './shared/note';
/* using import from '../' or './' cause
[1] WARNING in Circular dependency detected:
[1] client/app/model/wuwei/wuwei.model.ts -> client/app/model/index.ts -> client/app/model/wuwei/index.ts -> client/app/model/wuwei/wuwei.model.ts
*/
import { FORCE } from 'assets/config/environment.force';
import * as svgIntersections from 'svg-intersections';
import * as uuid from 'uuid';
import * as d3 from 'd3';
import * as globals from '../wuwei-globals';
import * as DRAW_CONFIG from '../../../assets/config/environment.draw';
import * as PC295_CONFIG from '../../../assets/config/environment.pc295';
// import { NullAstVisitor } from '@angular/compiler';
// import { Self } from '@angular/core';

function isEmpty(obj) {
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      return false;
    }
  }
  return true;
}

function notEmpty(obj) {
  return !isEmpty(obj);
}

// Exports the model utility module
export class WuweiModel {
  private intersect? = svgIntersections.intersect;
  private shape? = svgIntersections.shape;

  private util = new WuweiService();
  private currentUser;
  private user_id;

  private pp = 1;
  private defaultSettingNode = DRAW_CONFIG.defaultCtypeSetting.value;
  private defaultSettingLink = DRAW_CONFIG.defaultRtypeSetting.value;

  constructor(
    @Inject(MessageService) private messageService,
  ) {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.user_id = this.currentUser ? this.currentUser._id : null;
  }

// ------------------- BEGIN METHODS ---------------------
  PageFactory = (param) => {
    if (!param) {
      return null;
    }
    const page = new Page(param);
    return page;
  }

  NoteFactory = (param) => {
    if (!param) {
      return null;
    }
    if (!param._id) {
      param._id = '_' + uuid.v4();
    }
    const note = new Note(param); // ._id, item.pages, item.currentPage, item.resources, item.annotations);
    return note;
  }

  // Resurce
  ResourceFactory = (param) => {
    if (!param || !param._id) {
      return null;
    }
    const resource = new Resource(param); // id may be url of contents
    return resource;
  }

  createResource = (param) => {
    if (!param) {
      return null;
    }
    const
      _id = param._id,
      key = param.key;
      // id = param.id;
    let resource = null;
    if (_id) {
      resource = globals.resources[_id];
    }
    if (key && !resource) {
      resource = globals.resourceIndexer[key];
      if (resource && 'object' === typeof resource) {
        globals.resources[resource._id] = resource;
      }
    }
    if (!resource) {
      resource = this.ResourceFactory(param);
    }
    globals.resources[resource._id] = resource;
    if (key) {
      globals.resourceIndexer[key] = resource;
    }
    return resource;
  }

  updateResource = (r: Resource) => {
    globals.resources[r._id] = r;
  }

  findResourceById = (_id) => {
    return globals.resources[_id];
  }

  findResourceByName = (name) => {
    for (const _id in globals.resources) {
      if (globals.resources.hasOwnProperty(_id)) {
        if (name === globals.resources[_id].name) {
          return globals.resources[_id];
        }
      }
    }
    return null;
  }

  findResourceByKey = (key) => {
    for (const _id in globals.resources) {
      if (globals.resources.hasOwnProperty(_id)) {
        if (key === globals.resources[_id].key) {
          return globals.resources[_id];
        }
      }
    }
    return null;
  }

  deleteResource = (resource) => {
    if (resource) {
      const
        _id = resource._id,
        key = resource.key;
      if (key) {
        delete globals.resourceIndexer[key];
      }
      delete globals.resources[_id];
    }
  }

  /** Node */
  NodeFactory = (param) => {
    if (!param || !param._id) {
      return null;
    }
    const node =  new Node(param);
    return node;
  }

  SimNodeFactory = (param) => {
    if (!param || !param._id) {
      return null;
    }
    const simNode =  new SimNode(param);
    simNode.id = param._id;
    return simNode;
  }

  findNodeBy_id = (_id) => { // lookup node by it's _id
    let node = null;
    node = globals.nodeIndexer[_id];
    if (node) {
      return node;
    }
    for (node of  globals.graph.nodes) {
      if (_id === node._id) {
        return node;
      }
    }
    return null;
  }

  findNodeByIdx = (idx) => { // lookup node lelated to resource
    let node = null;
    node = globals.nodeIndexer[idx];
    if (node) {
      return node;
    }
    for (node of globals.graph.nodes) {
      if (idx === node.idx) {
        return node;
      }
    }
    return null;
  }

  createNode = (param) => {
    if (!param) {
      return null;
    }
    const
      key = param.key,
      idx = param.idx;
    let node = null;
    if (key) {
      node = globals.nodeIndexer[key];
    }
    if (!node && idx) {
      node = globals.nodeIndexer[idx];
    }
    if (!node) {
      node = this.NodeFactory(param);
    }
    this.util.appendBy_id(globals.graph.nodes, node);
    if (key) {
      globals.nodeIndexer[key] = node;
    }
    globals.nodeIndexer[idx] = node;
    return node;
  }

  removeNode = (param) => {
    const
      _id = param._id,
      key = param.key,
      idx = param.idx;
    let
      node = null;
    if (key) {
      delete globals.nodeIndexer[key];
      node = globals.nodeIndexer[key];
      if (node && _id !== node._id) {
        console.log('removeNode by key');
        this.util.removeBy_id(globals.graph.nodes, node._id);
      }
    }
    if (idx) {
      delete globals.nodeIndexer[idx];
      node = globals.nodeIndexer[idx];
      if (node && _id !== node._id) {
        console.log('removeNode by idx');
        this.util.removeBy_id(globals.graph.nodes, node._id);
      }
    }
    if (_id) {
      delete globals.nodeIndexer[_id];
      this.util.removeBy_id(globals.graph.nodes, _id);
    }
  }

  /** SimNode */
  findSimNodeById = (id) => { // lookup simNode by it's id
    for (const simNode of globals.force.simNodes) {
      if (id === simNode.id) {
        return simNode;
      }
    }
    return null;
  }

  /** Annotation */
  AnnotationFactory = (param: {
    _id: uuid,
    body_ref: any,
    target_ref: any,
    key?: string,
    rtype?: string
  }) => {
    if (!param) {
      return null;
    }
    const
      _id = param._id,
      body_ref = param.body_ref,
      target_ref = param.target_ref;
    if (!_id ||
        !body_ref || !this.util.isUUID_id(body_ref) ||
        !target_ref || !this.util.isUUID_id(target_ref)) {
      return null;
    }
    const annotation = new Annotation(param); // param: {_id, item.body_ref, item.target_ref, rtype};
    return annotation;
  }

  createAnnotation = (param: {
    body_ref: any, // bodyResource._id
    target_ref: any, // targetResource._id
    _id?: uuid,
    key?: string, // bodyResource.key~rtype~targetResource.key
    rtype?: string
  }) => {
    if (!param || !param._id || !param.body_ref || !param.target_ref) {
      return null;
    }
    const
      _id = param._id || '_' + uuid.v4(),
      rtype = param.rtype || '',
      body_ref = param.body_ref,
      target_ref = param.target_ref;
    let
      key = param.key, // bodyResource.key~rtype~targetResource.key
      body_key = '',
      target_key = '',
      annotation = null;
    if (key) {
      annotation = globals.annotationIndexer[key];
      // if (annotation && 'object' === typeof annotation) {
      //   return annotation;
      // }
      const keys = key.split('~');
      body_key = keys[0];
      target_key = keys[2];
    }
    if (!annotation) {
      annotation = globals.annotations[_id];
    }
    if (!annotation) {
      let
        body = null,
        target = null;
      if (this.util.isUUID_id(body_ref)) {
        body = globals.resources[body_ref];
      } else if (body_key) {
        body = globals.resourceIndexer[body_key];
      }
      if (this.util.isUUID_id(target_ref)) {
        target = globals.resources[target_ref];
      } else if (target_key) {
        target = globals.resourceIndexer[target_key];
      }
      if (!body || !target) {
        return null;
      }
      body_key = body.key || '';
      target_key = target.key || '';
      key = key || body_key + '~' + rtype + '~' + target_key;

      annotation = this.AnnotationFactory({
        _id: _id,
        body_ref: body._id,
        target_ref: target._id,
        key: key,
        rtype: rtype
      });
    }
    globals.annotations[annotation._id] = annotation;
    if (key) {
      globals.annotationIndexer[key] = annotation;
    }
    return annotation;
  }

  findAnnotationById = (_id) => {
    return globals.annotations[_id];
  }

  findAnnotationsByResource = (resource) => {
    const
      // util = this.util,
      // key = resource.key,
      _id = resource._id,
      annotations = [];
    for (const idx in globals.annotations) {
      if (globals.annotations.hasOwnProperty(idx)) {
        const
          annotation = globals.annotations[idx],
          link = annotation && globals.linkIndexer[annotation._id];
        if (annotation) {
          const
            body_id = annotation.body_ref,
            target_id = annotation.target_ref,
            resource = globals.resources[target_id],
            node =  resource && globals.nodeIndexer[resource._id];
          if (_id === body_id) {
            annotations.push({
              annotation: annotation,
              link: link,
              another_side: 'target',
              another_resource: resource, // globals.resources[target_id]
              another_node: node
            });
          }
          if (_id === target_id) {
            annotations.push({
              annotation: annotation,
              link: link,
              another_side: 'body',
              another_resource: resource, // globals.resources[body_id]
              another_node: node
            });
          }
        }
      }
    }
    return annotations;
  }

  deleteAnnotation = (annotation) => {
    if (annotation) {
      const
        _id = annotation._id,
        key = annotation.key;
      if (key) {
        delete globals.annotationIndexer[key];
      }
      delete globals.annotations[_id];
    }
  }

  /** Link */
  LinkFactory = (param) => { // Link
    if (!param || !param._id) {
      return null;
    }
    const link = new Link(param); // ._id, source_id, target_id);
    return link;
  }

  SimLinkFactory = (param) => {
    if (!param || !param._id) {
      return null;
    }
    const simLink =  new SimLink(param);
    simLink.id = param._id;
    return simLink;
  }

  findLinkBy_id = (_id) => {
    let link = null;
    link = globals.linkIndexer[_id];
    if (link) {
      return link;
    }
    for (link of globals.graph.links) {
      if (link._id === _id) {
        return link;
      }
    }
    return null;
  }

  findLinksByNode = (node) => {
    if (!node) {
      return null;
    }
    const
      util = this.util,
      idx = node.idx,
      links = [],
      visibles = [],
      hiddens = [],
      undefineds = [];

    const resource = globals.resources[idx];
    if (!resource) {
      return {
        links: [],
        visibles: [],
        hiddens: [],
        undefineds: []
      };
    }

    const annotations = this.findAnnotationsByResource(resource);
    for (const a of annotations) {
      const
        link = a.link,
        otherNode = a.another_node;
      if (link && otherNode) {
        links.push(link);
        if (!link.visible || link.filterout ||
            !otherNode.visible || otherNode.filterout) {
          util.appendBy_id(hiddens, link);
        } else {
          util.appendBy_id(visibles, link);
        }
      } else {
        undefineds.push(a);
      }
    }

    return {
      links: links,
      visibles: visibles,
      hiddens: hiddens,
      undefineds: undefineds
    };
  }

  findOtherNode = (link: Link, node: Node) => {
    const
      self = this,
      source_id = link.source_id,
      target_id = link.target_id,
      source = self.findNodeBy_id(source_id),
      target = self.findNodeBy_id(target_id);
    if (node._id === source_id) {
      return target;
    } else if (node._id === target_id) {
      return source;
    }
    console.log('findOtherNode', globals.graph, globals.resources, globals.annotations);
    const
      thisResource = self.findResourceById(node.idx),
      annotation = self.findAnnotationById(link.idx),
      annotations = self.findAnnotationsByResource(thisResource);
    for (const a of annotations) {
      if (annotation._id === a.annotation._id) {
        const
          anotherResource = a[0].resource,
          another = self.addCtypeNode(anotherResource);
        if (another) {
          return another;
        }
      }
    }
    // const
    //   anotherResource = annotations.filter(a => annotation._id === a.annotation._id)[0].resource,
    //   another = self.addCtypeNode(anotherResource);
    // if (another) {
    //   return another;
    // }
    return null;
  }

  createLink = (param) => {
    if (!param) {
      return null;
    }
    const
      self = this,
      util = self.util,
      _id = param._id,
      key = param.key,
      idx = param.idx;
    let link = null;
    if (key) {
      link = globals.linkIndexer[key];
    }
    if (!link && idx) {
      link = globals.linkIndexer[idx];
    }
    if (!link) {

      link = self.LinkFactory(param);

      util.appendBy_id(globals.graph.links, link);
      globals.linkIndexer[_id] = link;
      if (key) {
        globals.linkIndexer[key] = link;
      }
      globals.linkIndexer[idx] = link;
      setTimeout(() => {
        self.renderLink(link);
      }, 200);
    }
    return link;
  }

  removeLink = (param) => {
    const
      self = this,
      _id = param._id,
      key = param.key,
      idx = param.idx;
    let
      link = null;
    if (key) {
      link = globals.linkIndexer[key];
      if (link && _id !== link._id) {
        console.log('removeLink by key');
        self.util.removeBy_id(globals.graph.links, link._id);
      }
      delete globals.linkIndexer[key];
    }
    if (idx) {
      link = globals.linkIndexer[idx];
      if (link && _id !== link._id) {
        console.log('removeLink by idx');
        self.util.removeBy_id(globals.graph.links, link._id);
      }
      delete globals.linkIndexer[idx];
    }
    if (_id) {
      self.util.removeBy_id(globals.graph.links, _id);
    }
  }

  addLink = (item) => {
    const
      self = this,
      // util = this.util,
      link = item.link,
      // _id = link._id,
      idx = link.idx,
      source_id = link.source_id,
      target_id = link.target_id,
      source: Node = self.findNodeBy_id(source_id),
      target: Node = self.findNodeBy_id(target_id);
    let
      annotation: Annotation, body_ref, target_ref;
    annotation = item.annotation;
    if (!annotation) {
      body_ref = source.idx,
      target_ref = target.idx;
      annotation = new Annotation({
        _id: idx,
        body_ref: body_ref,
        target_ref: target_ref
      });
    }

    self.createLink(link); // self.links, globals.graph.links
    self.createAnnotation(annotation); // globals.annotations

    const link_map = {
      link: link,
      annotation: annotation
    };
    return link_map;
  }

  countHiddenLink(node: Node) {
    const allLinks = this.findLinksByNode(node);
    // console.log('--- countHiddenLink of ' + node.label, connectedLinks);
    return allLinks.hiddens.length + allLinks.undefineds.length;
  }

  /** SimLink */
  findSimLinkById = (id) => {
    for (const simLink of globals.force.simLinks) {
      if (id === simLink.id) {
        return simLink;
      }
    }
    return null;
  }

  findOtherSimNode = (simLink, simNode) => {
    const
      self = this,
      sourceId = simLink.source.id,
      targetId = simLink.target.id,
      source = self.findSimNodeById(sourceId),
      target = self.findSimNodeById(targetId);
    if (simNode.id === sourceId) {
      return target;
    } else if (simNode.id === targetId) {
      return source;
    }
    return null;
  }

  findSimLinksBySimNode = (simNode) => {
    if (!simNode) {
      return null;
    }
    const
      self = this,
      links = [];
    for (const simLink of globals.force.simLinks) {
      const otherSimNode = self.findOtherSimNode(simLink, simNode);
      if (otherSimNode) {
        links.push(simLink);
     }
    }
    return links;
  }

  /** called by event listener in AppComponent */
  newNode(item) {
    // console.log(item);
    const
      self = this,
      type = item.type,
      _r = self.addSimpleContent(),
      node = _r.node,
      resource = _r.resource;
    if ('FROM_CEXT' === type) {
      const
        ICON_WIDTH = 36,
        ICON_HEIGHT = 36,
        message = item.message,
        info = message.info,
        tab = message.tab,
        menuItemId = info.menuItemId,
        pageUrl = info.pageUrl,
        mediaType = info.mediaType,
        srcUrl = info.srcUrl,
        linkUrl = info.linkUrl,
        selectionText = info.selectionText,
        title = tab.title,
        url = tab.url,
        favIconUrl = tab.favIconUrl;
      if ('image' === menuItemId) {
        resource.type = 'Image';
        resource.id = pageUrl;
        resource.name = title;
        resource.thumbnail = srcUrl;
        resource.smallThumbnail = favIconUrl;
        node.type = 'Content';
        node.shape = 'THUMBNAIL';
        node.label = resource.name;
        node.thumbnail = resource.thumbnail;
      } else if ('selection' === menuItemId) {
        resource.type = 'Homepage';
        resource.name = title;
        if (linkUrl) {
          resource.id = linkUrl;
          node.shape = 'THUMBNAIL';
          node.size.width = ICON_WIDTH;
          node.size.height = ICON_HEIGHT;
        } else {
          resource.id = pageUrl;
          node.shape = 'RECTANGLE';
        }
        resource.value = selectionText;
        resource.thumbnail = favIconUrl;
        resource.smallThumbnail = favIconUrl;
        node.label = resource.name;
        node.type = 'Content';
        node.label = resource.name;
        node.description = 'ISO_PC295' === resource.option
            ? resource.value && resource.value.description
            : resource.value;
        node.thumbnail = resource.thumbnail;
      } else if ('link' === menuItemId) {
        resource.type = 'Homepage';
        resource.id = linkUrl;
        resource.name = selectionText;
        resource.thumbnail = favIconUrl;
        resource.smallThumbnail = favIconUrl;
        node.type = 'Content';
        node.shape = 'THUMBNAIL';
        node.label = resource.name;
        node.size.width = ICON_WIDTH;
        node.size.height = ICON_HEIGHT;
        node.thumbnail = resource.thumbnail;
      } else if ('page' === menuItemId) {
        resource.type = 'Homepage';
        resource.id = pageUrl;
        resource.name = title;
        resource.thumbnail = favIconUrl;
        resource.smallThumbnail = favIconUrl;
        node.type = 'Content';
        node.shape = 'RECTANGLE';
        node.label = resource.name;
        node.thumbnail = resource.thumbnail;
      }
    }
    self.createNode(node);
    self.createResource(resource);
    return {
      node: node,
      resource: resource
    };
  }

  /** draw/hide Node/Link */
  addNode(item: {node: Node, resource: Resource}) {
    const
      self = this,
      // util = self.util,
      node = item.node;
    let resource = item.resource;
    if ('ROUNDED' === node.shape) {
      if (!node.size.rx || node.size.ry) {
        if (node.size.width > node.size.height) {
          node.size.rx = node.size.height / 2;
          node.size.ry = node.size.height / 2;
        } else {
          node.size.rx = node.size.width / 2;
          node.size.ry = node.size.width / 2;
        }
      }
    } else if ('ELLIPSE' === node.shape) {
      if (!node.size.rx || node.size.ry) {
        node.size.rx = node.size.width / 2;
        node.size.ry = node.size.height / 2;
      }
    }
    if (node.label && node.label.length > 36) {
      node.label = node.label.substr(0, 35) + '...';
    }

    self.createNode(node);

    if (!resource) {
      resource = self.findResourceById(node.idx);
    }
    self.createResource(resource);
    return {
      node: node,
      resource: resource
    };
  }

  updateNode(node: Node) {
    const
      util = this.util,
      key = node.key,
      idx = node.idx,
      _id = node._id;
    util.appendBy_id(globals.graph.nodes, node);
    if (key) {
      globals.nodeIndexer[key] = node;
    }
    if (idx) {
      globals.nodeIndexer[idx] = node;
    }
    globals.nodeIndexer[_id] = node;
  }

  showNodes(nodes: Node[]) {
    for (const node of nodes) {
      node.visible = true;
      this.updateNode(node);
    }
  }

  hideNodes(nodes: Node[]) {
    for (const node of nodes) {
      if (node.visible) {
        node.visible = false;
        this.updateNode(node);
      }
    }
  }

  updateLink(link: Link) {
    const
      util = this.util,
      key = link.key,
      idx = link.idx,
      _id = link._id;
    util.appendBy_id(globals.graph.links, link);
    if (key) {
      globals.linkIndexer[key] = link;
    }
    if (idx) {
      globals.linkIndexer[idx] = link;
    }
    globals.linkIndexer[_id] = link;
  }

  showLinks(links: Link[]) {
    for (const link of links) {
      link.visible = true;
      this.updateLink(link);
    }
  }

  hideLinks(links: Link[]) {
    for (const link of links) {
      link.visible = false;
      this.updateLink(link);
    }
  }

  renderMultipleLines(nodes: Node[], nodeService) {
    const
      self = this,
      util = self.util;
    for (const node of nodes) {
      const
        d3node = d3.select('g#' + node._id),
        resource = self.findResourceById(node.idx);
      if (!node.visible) {
        d3node.selectAll('text.node-description tspan').remove();
      } else if ('Topic' !== node.type && 'THUMBNAIL' !== node.shape && node.description && node.description.length > 0) {
        const padding = { top: 4, right: 4, bottom: 4, left: 4 };
        const gText = d3node.select('text.node-description');
        gText.text(node.description);
        const
          item = {
            text: gText,
            width: node.size.width - (padding.right + padding.left),
            height: node.size.height - (padding.top + padding.bottom),
            offsetx: padding.top - node.size.width / 2,
            offsety: padding.left - node.size.height / 2,
            verticalAlign: 'top'
          };
        self.setMultipleLine(item);
        d3node.selectAll('rect.cover-description').raise();
      }
    }
  }

  renderNodes(nodes: Node[], nodeService) {
    for (const node of nodes) {
      // for (let i = 0; i <  globals.graph.nodes.length; i++) {
      //   const _node = globals.graph.nodes[i];
      //   if (node._id === _node._id) {
      //     globals.graph.nodes.splice(i, 1);
      //   }
      // }
      this.updateNode(node);
      this.renderNode(node);
      if (globals.status.isOnline) {
        nodeService.editNode(node).subscribe(
          res => {
            const status = res.status;
            if (200 !== status) {
              console.log('Nothing edited.');
            }
          },
          error => console.log(error)
        );
      }
    }
  }

  renderLinks(links: Link[], linkService) {
    for (const link of links) {
      // for (let i = 0; i <  globals.graph.links.length; i++) {
      //   const _link = globals.graph.links[i];
      //   if (link._id === _link._id) {
      //     globals.graph.links.splice(i, 1);
      //   }
      // }
      this.updateLink(link);
      this.renderLink(link);
      if (globals.status.isOnline) {
        linkService.editLink(link).subscribe(
          res => {
            const editedLink = res.json();
            if (isEmpty(editedLink)) {
              console.log('Nothing edited.');
            }
          },
          error => console.log(error)
        );
      }
    }
  }

  eraseNodes(nodes: Node[]) {
    // const util = this.util;
    for (const node of nodes) {
      this.removeNode(node);
      // util.removeBy_id(globals.graph.nodes, node._id);
    }
  }

  eraseLinks(links: Link[]) {
    // const util = this.util;
    for (const link of links) {
      this.removeLink(link);
      // util.removeBy_id(globals.graph.links, link._id);
    }
  }

  addNodeWithService(node: Node, resource: Resource, nodeService, resourceService) {
    const
      self = this,
      util = self.util;
    if ('ROUNDED' === node.shape) {
      if (!node.size.rx || node.size.ry) {
        if (node.size.width > node.size.height) {
          node.size.rx = node.size.height / 2;
          node.size.ry = node.size.height / 2;
        } else {
          node.size.rx = node.size.width / 2;
          node.size.ry = node.size.width / 2;
        }
      }
    } else if ('ELLIPSE' === node.shape) {
      if (!node.size.rx || node.size.ry) {
        node.size.rx = node.size.width / 2;
        node.size.ry = node.size.height / 2;
      }
    }
    if (node.label && node.label.length > 36) {
      node.label = node.label.substr(0, 35) + '...';
    }
    self.createNode(node);
    if (globals.status.isOnline) {
      nodeService.addNode(node).subscribe(
        res => {
          const newNode = res.json();
          if (isEmpty(newNode)) {
            console.log('Nothing added.');
          }
        },
        error => console.log(error)
      );
    }
    if (!resource) {
      resource = self.findResourceById(node.idx);
    }
    self.createResource(resource);
    if (globals.status.isOnline) {
      resourceService.addContent(resource).subscribe(
        res => {
          const newResource = res.json();
          if (isEmpty(newResource)) {
            console.log('Nothing added.');
          }
        },
        error => console.log(error)
      );
    }
  }

  addLinkWithService(link: Link, annotation: Annotation, linkService, annotationService) {
    const
      self = this,
      util = self.util;
    self.createLink(link);
    // util.appendBy_id(globals.graph.links, link);
    if (globals.status.isOnline) {
      linkService.addLink(link).subscribe(
        res => {
          const newLink = res.json();
          if (isEmpty(newLink)) {
            console.log('Nothing added.');
          }
        },
        error => console.log(error)
      );
    }
    if (!annotation) {
      annotation = self.findResourceById(link.idx);
    }
    self.createAnnotation(annotation);
    // globals.annotations[annotation._id] = annotation;
    if (globals.status.isOnline) {
      annotationService.addAnnotation(annotation).subscribe(
        res => {
          const newAnnotation = res.json();
          if (isEmpty(newAnnotation)) {
            console.log('Nothing added.');
          }
        },
        error => console.log(error)
      );
    }
  }

  eraseNodesWithService(nodes: Node[], nodeService) {
    for (const node of nodes) {
      if (globals.status.isOnline) {
        nodeService.deleteNode(node).subscribe(
          res => {
            const status = res.status;
            if (200 !== status) {
              console.log('Nothing deleted.');
            }
          },
          error => console.log(error)
        );
      }
    }
  }

  eraseLinksWithService(links: Link[], linkService) {
    for (const link of links) {
      if (globals.status.isOnline) {
        linkService.deleteLink(link).subscribe(
          res => {
            const status = res.status;
            if (200 !== status) {
              console.log('Nothing deleted.');
            }
          },
          error => console.log(error)
        );
      }
    }
  }

  updateNodeWithService(node: Node, nodeService) {
    const util = this.util;
    util.appendBy_id(globals.graph.nodes, node);
    if (globals.status.isOnline) {
      nodeService.editNode(node).subscribe(
        res => {
          const status = res.status;
          if (200 !== status) {
            console.log('Nothing edited.');
          }
        },
        error => console.log(error)
      );
    }
  }

  updateResourceWithService(resource: Resource, resourceService) {
    globals.resources[resource._id] = resource;
    if (globals.status.isOnline) {
      resourceService.editResource(resource).subscribe(
        res => {
          const status = res.status;
          if (200 !== status) {
            console.log('Nothing edited.');
          }
        },
        error => console.log(error)
      );
    }
  }

  updateLinkWithService(link: Link, linkService) {
    const util = this.util;
    util.appendBy_id(globals.graph.links, link);
    if (globals.status.isOnline) {
      linkService.editLink(link).subscribe(
        res => {
          const status = res.status;
          if (200 !== status) {
            console.log('Nothing edited.');
          }
        },
        error => console.log(error)
      );
    }
  }

  updateAnnotationWithService(annotation: Annotation, annotationService) {
    globals.annotations[annotation._id] = annotation;
    if (globals.status.isOnline) {
      annotationService.editAnnotation(annotation).subscribe(
        res => {
          const status = res.status;
          if (200 !== status) {
            console.log('Nothing edited.');
          }
        },
        error => console.log(error)
      );
    }
  }

  // Add PC295 Comments
  getCtypeSetting = (ctype) => {
    if (!ctype) {
      return null;
    }
    const
      params = ctype.split('|'),
      setting = PC295_CONFIG.ctypeSetting;
    let ctypeSetting = setting[params[0]];
    if (ctypeSetting.value) {
      return ctypeSetting.value;
    }
    if (params.length > 1) {
      for (let level = params.length - 1; level > 0; level--) {
        ctypeSetting = ctypeSetting[params[level]];
        if (ctypeSetting && ctypeSetting.value) {
          return ctypeSetting.value;
        } else {
          console.log('NOT defined ctypeSetting ctype=' + ctype);
        }
      }
    }
    return null;
  }

  addCtypeNode = (resource: Resource) => {
    if (!resource) {
      return null;
    }
    const resourceType = resource.type; // Dataset, Image, Video, Sound, Text, and TextualBody
    let nodeType = 'Content'; // Content, Topic, Memo
    if ('TextualBody' === resourceType) {
      nodeType = 'Topic';
      // TextualBody -> Topic
      // Althoug Memo is type of TextualBody, addSimpleMemo doesn't use this function
    }
    const
      self = this,
      util = self.util,
      ctype = resource.ctype,
      _id = '_' + uuid.v4(),
      key = resource.key,
      idx = resource._id,
      newP = self.newPosition(0, 0),
      xP = newP.x,
      yP = newP.y;

    // setting
    let setting = null;
    setting = self.getCtypeSetting(ctype);
    if (!setting) {
      console.log('addCtypeNode no setting ctype' + ctype);
      return null;
    }

    const
      node = self.createNode({
        _id: _id,
        key: key,
        idx: idx,
        type: nodeType,
        x: xP,
        y: yP,
        transform: 'translate(' + [xP, yP] + ')',
        shape: (setting && setting.shape) || self.defaultSettingNode.shape,
        label: resource.name,
        description: 'ISO_PC295' === resource.option
            ? resource.value && resource.value.description
            : resource.value,
        size: (setting && setting.size) || self.defaultSettingNode.size,
        color: (setting && setting.color) || self.defaultSettingNode.color,
        outline: (setting && setting.outline) || self.defaultSettingNode.outline,
        font: (setting && setting.font) || self.defaultSettingNode.font,
        thumbnail: setting.thumbnail
      });
    // util.appendBy_id(globals.graph.nodes, node);
    // globals.nodeIndexer[key] = node;
    return node;
  }

  getRtypeSetting = (rtype) => {
    if (!rtype) {
      return null;
    }
    const
      params = rtype.split('|'),
      setting = PC295_CONFIG.rtypeSetting;
    let rtypeSetting = setting[params[0]];
    if (rtypeSetting.value) {
      return rtypeSetting.value;
    }
    if (params.length > 1) {
      for (let level = params.length - 1; level > 0; level--) {
        rtypeSetting = rtypeSetting[params[level]];
        if (rtypeSetting.value) {
          return rtypeSetting.value;
        }
      }
    }
    return null;
  }

  addRtypeLink = (annotation: Annotation) => {
    if (!annotation) {
      return null;
    }
    const
      self = this,
      rtype = annotation.rtype,
      setting = self.getRtypeSetting(rtype),
      _id = '_' + uuid.v4(),
      idx = annotation._id,
      name = annotation.name || '',
      key = annotation.key; // body_key~rtype~target_key
    if (!key || (key.match(/_/g) || []).length !== 2) {
      return null;
    }
    const
      keys = key.split('~'),
      body_key = keys[0],
      target_key = keys[2];
    const
      source = globals.nodeIndexer[body_key],
      target = globals.nodeIndexer[target_key];
    const
      param = {
        _id: _id,
        key: key,
        idx: idx,
        source_id: source._id,
        target_id: target._id,
        label: name,
        rtype: rtype,
        shape: (setting && setting.style) || self.defaultSettingLink.style,
        size: (setting && setting.size) || self.defaultSettingLink.size,
        color: (setting && setting.color) || self.defaultSettingLink.color,
        font: (setting && setting.font) || self.defaultSettingLink.font
      },
      link = self.createLink(param);
    return link;
  }

  addPC295comments = (param) => {
    const
      self = this,
      util = self.util,
      clauses = {
        CD1: {},
        CD2: {}
      },
      tables = {
        CD1: {},
        CD2: {}
      },
      memberBodys = {},
      comments = {},
      tableNo = {},
      actions = {};

    const getCD1Table = (table_no) => {
      const t = PC295_CONFIG.CD1_tableIndex[table_no];
      let label, page, url;
      if (t) {
        label = table_no + ' ' + t.name;
        page = t.page ? '#page=' + t.page : '';
        url = PC295_CONFIG.info.pdf.CD1 + page;
      } else {
        label = table_no;
        url = PC295_CONFIG.info.pdf.CD2;
      }
      return {
        t: t,
        label: label,
        url: url
      };
    };

    const getCD2Table = (table_no) => {
      let t = PC295_CONFIG.CD2_tableIndex[table_no];
      if (!t) {
        const _t = table_no.split(' ');
        t = PC295_CONFIG.CD2_tableIndex[_t[0] + ' ' + (_t[1] - 1)];
      }
      let label, page, url;
      if (t) {
        label = table_no + ' ' + t.name;
        page = t.page ? '#page=' + t.page : '';
        url = PC295_CONFIG.info.pdf.CD2 + page;
      } else {
        label = table_no;
        url = PC295_CONFIG.info.pdf.CD2;
      }
      return {
        t: t,
        label: label,
        url: url
      };
    };

    const mapCD2Table = (table_no) => { // CD1 table_no
      const t = PC295_CONFIG.CD2_tableMapping[table_no];
      if (t) {
        const CD2_tableName = t.CD2name;
        const CD2_tableNo = t.CD2index;
        const label = CD2_tableNo + ' ' + CD2_tableName;
        const page = t.page ? '#page=' + t.page : '';
        const url = PC295_CONFIG.info.pdf.CD2 + page;
        const reftables = [];
        for (const key in PC295_CONFIG.CD2_tableReference) {
          if (PC295_CONFIG.CD2_tableReference.hasOwnProperty(key)) {
            const data = PC295_CONFIG.CD2_tableReference[key];
            if (0 === key.indexOf(CD2_tableName) && data.ID.indexOf('REF') >= 0) {
              reftables.push(data.referenced_table);
            }
          }
        }
        return {
          t: t,
          table_no: table_no,
          CD2_tableNo: CD2_tableNo,
          label: label,
          url: url
        };
      }
      return null;
    };

    const mapCD1Table = (table_no) => { // CD1 table_no
      const t = PC295_CONFIG.CD1_tableMapping[table_no];
      if (t) {
        const CD1_tableName = t.CD1name;
        const CD1_tableNo = t.CD1index;
        const label = CD1_tableNo + ' ' + CD1_tableName;
        const page = t.page ? '#page=' + t.page : '';
        const url = PC295_CONFIG.info.pdf.CD1 + page;
        const reftables = [];
        /*for (const key in PC295_CONFIG.CD1_tableReference) {
          if (PC295_CONFIG.CD1_tableReference.hasOwnProperty(key)) {
            const data = PC295_CONFIG.CD1_tableReference[key];
            if (0 === key.indexOf(CD1_tableName) && data.ID.indexOf('REF') >= 0) {
              reftables.push(data.referenced_table);
            }
          }
        }*/
        return {
          t: t,
          table_no: table_no,
          CD1_tableNo: CD1_tableNo,
          label: label,
          url: url
        };
      }
      return null;
    };

    const getCD1Clause = (index) => {
      const c = PC295_CONFIG.CD1_clauseIndex[index];
      let label, page, url;
      if (c) {
        label = index + ' ' + c.clause;
        page = '#page=' + c.page;
        url = PC295_CONFIG.info.pdf.CD1 + page;
      } else {
        label = index;
        url = PC295_CONFIG.info.pdf.CD1;
      }
      return {
        c: c,
        label: label,
        url: url
      };
    };

    const getCD2Clause = (index) => {
      const c = PC295_CONFIG.CD2_clauseIndex[index];
      let label, page, url;
      if (c) {
        label = index + ' ' + c.clause;
        page = '#page=' + c.page;
        url = PC295_CONFIG.info.pdf.CD2 + page;
      } else {
        label = index;
        url = PC295_CONFIG.info.pdf.CD2;
      }
      return {
        c: c,
        label: label,
        url: url
      };
    };

    const mapCD2Clause = (index) => {
      const c = PC295_CONFIG.CD2_clauseMapping[index]; // CD1 index
      let label, page, url;
      if (c) {
        label = c.CD2index + ' ' + c.clause;
        page = '#page=' + c.page;
        url = PC295_CONFIG.info.pdf.CD2 + page;
      } else {
        label = index;
        url = PC295_CONFIG.info.pdf.CD2;
      }
      return {
        c: c,
        label: label,
        url: url
      };
    };

    const mapCD1Clause = (index) => {
      const c = PC295_CONFIG.CD1_clauseMapping[index]; // CD1 index
      let label, page, url;
      if (c) {
        label = c.CD1index + ' ' + c.clause;
        page = '#page=' + c.page;
        url = PC295_CONFIG.info.pdf.CD1 + page;
      } else {
        label = index;
        url = PC295_CONFIG.info.pdf.CD1;
      }
      return {
        c: c,
        label: label,
        url: url
      };
    };

    const getCommentType = (_type) => {
      const map = {
        ge: 'General',
        te: 'Technical',
        ed: 'Editorial'
      };
      if (!_type) {
        return '_';
      }
      const types = _type.replace(/\//g, ',').split(',').map(t => t.trim().toLowerCase());
      // const _types = [];
      // for (const t of types) {
      //   _types.push(t);
      // }
      return types.join('_');
    };

    const getMbNC = (mb_nc) => {
      let mbNC = mb_nc.trim().split('/')[0];
      if ('China' === mbNC) {
        mbNC = 'CN';
      } else if ('NEN' === mbNC) {
        mbNC = 'NL';
      } else if ('JISC' === mbNC) {
        mbNC = 'JP';
      }
      return mbNC;
    };

    return Promise.resolve(param)
      .then(param => {
        globals.graph.nodes = [];
        globals.graph.links = [];
        return param;
      })
      .then((param) => { // CD1, CD2 clause and CD1, CD2 tables
        for (const index in PC295_CONFIG.CD1_clauseIndex) {
          if (PC295_CONFIG.CD1_clauseIndex.hasOwnProperty(index)) {
            const
              clause_ = PC295_CONFIG.CD1_clauseIndex[index],
              name = clause_.clause,
              clauseLabel = '(CD1)' + index + ' ' + name,
              page = clause_.page ? '#page=' + clause_.page : '',
              url = PC295_CONFIG.info.pdf.CD1 + page;
            const
              ctype = 'clause|CD1',
              key = ctype + '|' + index;
            const
              idx = '_' + uuid.v4(),
              clauseResource = self.createResource({
                _id: idx,
                ctype: ctype,
                key: key,
                name: clauseLabel,
                id: url,
                type: 'Text',
                format: 'text/plain',
                value: ''
              });

            clauses.CD1[index] = {
              resource: clauseResource,
              tables: {},
              docs: []
            };
          }
        }
        // CD2 clause
        for (const index in PC295_CONFIG.CD2_clauseIndex) {
          if (PC295_CONFIG.CD2_clauseIndex.hasOwnProperty(index)) {
            const
              clause_ = PC295_CONFIG.CD2_clauseIndex[index],
              name = clause_.clause,
              clauseLabel = '(CD2)' + index + ' ' + name,
              page = clause_.page ? '#page=' + clause_.page : '',
              url = PC295_CONFIG.info.pdf.CD2 + page;
            const
              ctype = 'clause|CD2',
              key = ctype + '|' + index;
            const
              idx = '_' + uuid.v4(),
              clauseResource = self.createResource({
                _id: idx,
                ctype: ctype,
                key: key,
                name: clauseLabel,
                id: url,
                type: 'Text',
                format: 'text/plain',
                value: ''
              });

            clauses.CD2[index] = {
              resource: clauseResource,
              tables: {},
              docs: []
            };
          }
        }
        // CD1 tables
        for (const table_no in PC295_CONFIG.CD1_tableIndex) {
          if (PC295_CONFIG.CD1_tableIndex.hasOwnProperty(table_no)) {
            const
              table_ = PC295_CONFIG.CD1_tableIndex[table_no],
              name = table_.name,
              index = table_.index,
              tableLabel = '(CD1)' + table_no + ' ' + name,
              page = table_.page ? '#page=' + table_.page : '',
              url = PC295_CONFIG.info.pdf.CD1 + page;
            const
              ctype = 'table|CD1',
              key = ctype + '|' + table_no;
            const
              idx = '_' + uuid.v4(),
              tableResource = self.createResource({
                _id: idx,
                ctype: ctype,
                key: key,
                name: tableLabel,
                id: url,
                type: 'Text',
                format: 'text/plain',
                value: ''
              });

            tables.CD1[table_no] = {
              resource: tableResource,
              docs: []
            };

            clauses.CD1[index].tables[table_no] = tableResource;
          }
        }
        // CD2 tables
        for (const table_no in PC295_CONFIG.CD2_tableIndex) {
          if (PC295_CONFIG.CD2_tableIndex.hasOwnProperty(table_no)) {
            const
              table_ = PC295_CONFIG.CD2_tableIndex[table_no],
              name = table_.name,
              index = table_.index,
              tableLabel = '(CD2)' + table_no + ' ' + name,
              page = table_.page ? '#page=' + table_.page : '',
              url = PC295_CONFIG.info.pdf.CD2 + page;

            tableNo[name] = table_no;

            const
              ctype = 'table|CD2',
              key = ctype + '|' + table_no;
            const
              idx = '_' + uuid.v4(),
              tableResource = self.createResource({
                _id: idx,
                ctype: ctype,
                key: key,
                name: tableLabel,
                id: url,
                type: 'Text',
                format: 'text/plain',
                value: ''
              });

            tables.CD2[table_no] = {
              resource: tableResource,
              docs: []
            };
            if (clauses.CD2[index]) {
              clauses.CD2[index].tables[table_no] = tableResource;
            } else {
              console.log('Undefined clauses.CD2[' + index + ']');
            }
          }
        }
        return param;
      })
      .then((param) => { // CD1 & CD2 comments
        const docs = param.docs;
        for (const doc_no in docs) {
          if (docs.hasOwnProperty(doc_no)) {
            const
              doc = docs[doc_no], // doc_no is doc.id
              commentLabel = doc.document + ' Comment ' + doc.no;
            let mbNC = '';
            if (doc.mb_nc) {
              mbNC = getMbNC(doc.mb_nc);
              if (!mbNC) {
                console.log('NOT Defined PC295_CONFIG.mbNC[' + mbNC + '] doc:', doc);
              }
            } else {
              console.log('NOT Defined doc.mb_nc doc:', doc);
            }
            const
              ctype = 'comment|' + mbNC,
              key   = 'comment|' + mbNC + '|' + doc.id,
              idx = '_' + uuid.v4();
            let
              alpha2_code = '';
            if (PC295_CONFIG.mbNC[mbNC]) {
              alpha2_code = '(' + PC295_CONFIG.mbNC[mbNC].alpha2_code + ')';
            } else {
              console.log('NOT Defined PC295_CONFIG.mbNC[' + mbNC + '].alpha2_code');
            }
            const
              commentResource = self.createResource({
                _id: idx,
                ctype: ctype,
                key: key,
                option: 'ISO_PC295',
                name: commentLabel + alpha2_code,
                type: 'Text',
                format: 'plain/text'
              });

            const comment = self.addCtypeNode(commentResource);

            // MB/NC
            const memberBody = memberBodys[mbNC];
            if (memberBody) {
              util.append(memberBodys[mbNC].docs, doc_no);
            } else {
              const
                ctype = 'mbNC|' + mbNC,
                key = ctype;
              // resource
              const
                idx = '_' + uuid.v4();
              let
                label = '';
              if (PC295_CONFIG.mbNC[mbNC]) {
                label = PC295_CONFIG.mbNC[mbNC].label;
              } else {
                console.log('NOT Defined PC295_CONFIG.mbNC[' + mbNC + '].label');
              }
              const
                memberBodyResource = self.createResource({
                  _id: idx,
                  ctype: ctype,
                  key: key,
                  name: label,
                  type: 'TextualBody',
                  format: 'n/a',
                  value: ''
                });

              memberBodys[mbNC] = {
                resource: memberBodyResource,
                docs: [doc_no]
              };
            }

            let action = null;
            if (doc.mapping_to_slide_actions) {
              const actionLabel = doc.mapping_to_slide_actions[0];
              action = actions[actionLabel];
              if (action) {
                actions[actionLabel].docs.push(doc_no);
              } else {
                const
                  ctype = 'action|CD1',
                  key = ctype + '|' + actionLabel;
                const
                  idx = '_' + uuid.v4(),
                  actionResource = self.createResource({
                    _id: idx,
                    ctype: ctype,
                    key: key,
                    name: actionLabel,
                    type: 'TextualBody',
                    format: 'n/a',
                    value: ''
                  });

                actions[actionLabel] = {
                  resource: actionResource,
                  docs: [doc_no]
                };
              }
            }

            // clause_subclause
            let cd1ClauseMap, cd2ClauseMap;
            if (doc.clause_subclause) {
              const indexes = doc.clause_subclause.trim().split('\n').map(clause => clause.trim());
              if ('CD1' === doc.document) {
                if (indexes) {
                  cd1ClauseMap = getCD1Clause(indexes[0]);
                  cd2ClauseMap = mapCD2Clause(indexes[0]);
                } else {
                  cd1ClauseMap = null;
                  cd2ClauseMap = null;
                }
                for (const index of indexes) {
                  const
                    clause = clauses.CD1[index];
                  if (clause) {
                    util.append(clauses.CD1[index].docs, doc_no);
                  }
                }
              } else if ('CD2' === doc.document) {
                if (indexes) {
                  cd1ClauseMap = mapCD1Clause(indexes[0]);
                  cd2ClauseMap = getCD2Clause(indexes[0]);
                } else {
                  cd1ClauseMap = null;
                  cd2ClauseMap = null;
                }
                for (const index of indexes) {
                  const
                    clause = clauses.CD2[index];
                  if (clause) {
                    util.append(clauses.CD2[index].docs, doc_no);
                  }
                }
              }
            }

            // paragraph_figure_table
            let
              cd1TableMap = null,
              cd2TableMap = null;
            if (doc.paragraph_figure_table) {
              const _table = /Table \d{1,3}/g.exec(doc.paragraph_figure_table.replace(/table/g, 'Table'));
              if (_table) {
                const table_no = _table[0];
                if ('CD1' === doc.document) {
                  cd1TableMap = getCD1Table(table_no);
                  cd2TableMap = mapCD2Table(table_no);
                  if (tables.CD1[table_no]) {
                    util.append(tables.CD1[table_no].docs, doc_no);
                  }
                } else if ('CD2' === doc.document) {
                  cd1TableMap = mapCD1Table(table_no);
                  cd2TableMap = getCD2Table(table_no);
                  if (tables.CD2[table_no]) {
                    util.append(tables.CD2[table_no].docs, doc_no);
                  }
                }
              }
            }

            const _treatment = 'CD1' === doc.document && treatments[doc.no]
                               ? treatments[doc.no].treatment
                               : '';

            let type_of_comment = getCommentType(doc.type_of_comment);
            if (type_of_comment) {
              type_of_comment = '(' + type_of_comment + ')';
            }

            let _comment = '';
            if (doc.comment) {
              _comment = doc.comment[0];
            } else {
              _comment = '(Proposed change) ' + doc.proposed_change[0];
              console.log('NO comment on doc commentResource.value doc:', doc);
            }

            let member_body = '';
            if (PC295_CONFIG.mbNC[mbNC]) {
              member_body = PC295_CONFIG.mbNC[mbNC].member_body;
            } else {
              console.log('NO member_body doc:', doc);
            }

            let description = '';
            if (mbNC && type_of_comment &&  _comment) {
              description = mbNC + type_of_comment + ': ' + _comment;
            } else {
              console.log('NO description doc:', doc);
            }

            commentResource.value = {
              mbNC: member_body,
              line_number: doc.line_number,
              clause_subclause: doc.clause_subclause,
              paragraph_figure_table: doc.paragraph_figure_table,
              type_of_comment: type_of_comment,
              comment: _comment,
              proposed_change: doc.proposed_change,
              mapping_to_slide_actions: doc.mapping_to_slide_actions,
              note: doc.note,
              description: description,
              treatment: _treatment,
              clauseMap: cd1ClauseMap,
              cd2ClauseMap: cd2ClauseMap,
              tableMap: cd1TableMap,
              cd2TableMap: cd2TableMap
            };

            if (comment) {
              comment.description = description;
            } else {
              console.log('Empty comment commentResource:', commentResource);
            }

            comments[doc.id] = {
              node: comment,
              resource: commentResource
            };
          }
        }
        return param;
      })
      .then(param => { // CD1 Cluster
        const
          clusters = param.clusters;
        for (const cluster of clusters) {
          const
            clusterLabel = cluster.title;
          const
            ctype = 'cluster|CD1',
            key = ctype + '|' + clusterLabel;
          // resource
          const
            idx = '_' + uuid.v4(),
            resource = self.createResource({
              _id: idx,
              ctype: ctype,
              key: key,
              name: clusterLabel,
              type: 'TextualBody',
              format: 'n/a',
              value: ''
            });

          clusters[clusterLabel] = {
            resource: resource
          };
        }
        return param;
      })
      .then((param) => { // relation among CD1, CD2, clause, table
        // CD2 clause -> CD1 clause
        for (const CD1index in PC295_CONFIG.CD2_clauseMapping) {
          if (PC295_CONFIG.CD2_clauseMapping.hasOwnProperty(CD1index)) {
            const
              mapping = PC295_CONFIG.CD2_clauseMapping[CD1index],
              CD2index = mapping.CD2index,
              CD1clause = clauses.CD1[CD1index] && clauses.CD1[CD1index].resource,
              CD2clause = clauses.CD2[CD2index] && clauses.CD2[CD2index].resource;
            if (CD1clause && CD2clause) {
              self.bind({
                body: CD2clause,
                target: CD1clause
              });
            }
          }
        }
        // CD1 clause -> CD1 table
        for (const index in clauses.CD1) {
          if (clauses.CD1.hasOwnProperty(index)) {
            const
              clause = clauses.CD1[index].resource,
              tables_ = clauses.CD1[index].tables;
            for (const table_no in tables_) {
              if  (tables_.hasOwnProperty(table_no)) {
                const table = tables_[table_no];
                if (clause && table) {
                  self.bind({
                    body: clause,
                    target: table
                  });
                }
              }
            }
          }
        }
        // CD2 clause -> CD2 table
        for (const index in clauses.CD2) {
          if (clauses.CD2.hasOwnProperty(index)) {
            const
              clause = clauses.CD2[index].resource,
              tables_ = clauses.CD2[index].tables;
            for (const table_no in tables_) {
              if  (tables_.hasOwnProperty(table_no)) {
                const table = tables_[table_no];
                if (clause && table) {
                  self.bind({
                    body: clause,
                    target: table
                  });
                }
              }
            }
          }
        }
        // CD2 table -> CD1 table
        for (const CD1index in PC295_CONFIG.CD2_tableMapping) {
          if (PC295_CONFIG.CD2_tableMapping.hasOwnProperty(CD1index)) {
            const
              mapping = PC295_CONFIG.CD2_tableMapping[CD1index],
              CD2index = mapping.CD2index,
              CD1table = tables.CD1[CD1index] && tables.CD1[CD1index].resource,
              CD2table = tables.CD2[CD2index] && tables.CD2[CD2index].resource;
            if (CD1table && CD2table) {
              self.bind({
                body: CD2table,
                target: CD1table
              });
            }
          }
        }
        // CD2 table -> CD2 referenced table
        for (const key in PC295_CONFIG.CD2_tableReference) {
          if (PC295_CONFIG.CD2_tableReference.hasOwnProperty(key)) {
            const
              reference = PC295_CONFIG.CD2_tableReference[key],
              table_name = key.substr(0, key.lastIndexOf('_')),
              table_no = tableNo[table_name],
              ID = reference.ID,
              referenced_table_name = reference.referenced_table,
              referenced_table_no = tableNo[referenced_table_name];
            if (ID.indexOf('REF') >= 0 && table_no && referenced_table_no) {
              const
                table = tables.CD2[table_no] && tables.CD2[table_no].resource,
                referenced_table = tables.CD2[referenced_table_no] &&  tables.CD2[referenced_table_no].resource;
              if (table && referenced_table) {
                self.bind({
                  body: table,
                  target: referenced_table
                });
              }
            }
          }
        }
        return param;
      })
      .then((param) => { // CD1 & CD2 comment -> memberBody, comment -> action, clause -> subclause, comment -> clause, comment -> table
        const
          docs = param.docs;
        for (const doc_no in docs) {
          if (docs.hasOwnProperty(doc_no)) {
            const
              doc = docs[doc_no],
              mbNC = getMbNC(doc.mb_nc);
            // MB/NC
            const
              memberBodyResource = memberBodys[mbNC].resource,
              commentResource = comments[doc.id].resource;
            const
              mbNC_annotation = self.bind({
                body: memberBodyResource,
                target: commentResource
              });
            // mapping_to_slide_actions
            if (doc.mapping_to_slide_actions) {
              const actionLabel = doc.mapping_to_slide_actions[0];
              const actionResource = actions[actionLabel].resource;
              if (commentResource && actionResource) {
                self.bind({
                  body: commentResource,
                  target: actionResource,
                  rtype: 'toAction'
                });
              }
            }
            // clause_subclause
            if (doc.clause_subclause) {
              const indexes = doc.clause_subclause.trim().split('\n').map(clause => clause.trim());
              let clauseResource = null;
              if ('CD1' === doc.document) {
                for (const index of indexes) {
                  clauseResource = clauses.CD1[index] ? clauses.CD1[index].resource : null;
                  const cd1ClauseMap = getCD1Clause(index);
                  if (cd1ClauseMap && cd1ClauseMap.c) {
                    const
                      c = cd1ClauseMap.c,
                      _parent = c.parent;
                    if (index !== _parent) {
                      const _subclause = clauseResource; // keep current as _subclause
                      const parentResource = clauses.CD1[_parent] ? clauses.CD1[_parent].resource : null;
                      if (parent) {
                        self.bind({
                          body: _subclause,
                          target: parentResource,
                          rtype: 'toParent'
                        });
                      }
                    }
                  }
                  if (commentResource && clauseResource) {
                    self.bind({
                      body: commentResource,
                      target: clauseResource,
                      rtype: 'toClause'
                    });
                  }
                }
              } else if ('CD2' === doc.document) {
                for (const index of indexes) {
                  clauseResource = clauses.CD2[index] ? clauses.CD2[index].resource : null;
                  const cd2ClauseMap = getCD1Clause(index);
                  if (cd2ClauseMap && cd2ClauseMap.c) {
                    const
                      c = cd2ClauseMap.c,
                      _parent = c.parent;
                    if (index !== _parent) {
                      const _subclause = clauseResource; // keep current as _subclause
                      const parentResource = clauses.CD2[_parent] ? clauses.CD2[_parent].resource : null;
                      if (parent) {
                        self.bind({
                          body: _subclause,
                          target: parentResource,
                          rtype: 'toParent'
                        });
                      }
                    }
                  }
                  if (commentResource && clauseResource) {
                    self.bind({
                      body: commentResource,
                      target: clauseResource,
                      rtype: 'toClause'
                    });
                  }
                }
              }
            }
            // paragraph_figure_table
            if (doc.paragraph_figure_table) {
              const _table = /Table \d{1,3}/g.exec(doc.paragraph_figure_table);
              let tableResource = null;
              if (_table) {
                const table_no = _table[0];
                if ('CD1' === doc.document) {
                  tableResource = tables.CD1[table_no] ? tables.CD1[table_no].resource : null;
                  self.bind({
                    body: commentResource,
                    target: tableResource,
                    rtype: 'toTable'
                  });
                } else if ('CD2' === doc.document) {
                  tableResource = tables.CD2[table_no] ? tables.CD2[table_no].resource : null;
                  self.bind({
                    body: commentResource,
                    target: tableResource,
                    rtype: 'toTable'
                  });
                }
              }
            }
          }
        }
        return param;
      })
      .then((param) => {
        const
          clusters = param.clusters;
        for (const cluster of clusters) {
          const clusterLabel = cluster.title;
          if (cluster.docs) {
            for (const doc of cluster.docs) {
              const
                clusterResource = clusters[clusterLabel].resource,
                commentResource = comments[doc.id].resource;
              self.bind({
                body: clusterResource,
                target: commentResource
              });
            } // for cluster.docs loop
          } // cluster.docs exists
        }
      })
      .then(param => { // final return
        return {
          clauses: clauses,
          tables: tables,
          mbNCs: memberBodys
        };
      });
  }

  // -- Add
  newPosition = (x, y) => {
    const
      util = this.util,
      r = 80 * (1 + Math.random()),
      theta = 2 * Math.PI * Math.random(),
      newX = x + util.precisionRound(r * Math.cos(theta), 3),
      newY = y + util.precisionRound(r * Math.sin(theta), 3);
    return {x: newX, y: newY};
  }

  addSimpleContent = () => {
    const
      self = this,
      util = self.util,
      // pid = globals.current.note_id,
      // uid = self.currentUser ? self.currentUser._id : null,
      // pp = globals.current.currentPage,
      center = util.pContext({
        x: window.innerWidth / 2,
        y: window.innerHeight / 2
      }),
      newP = self.newPosition(center.x, center.y),
      xP = newP.x,
      yP = newP.y,
      _id = '_' + uuid.v4(),
      idx = '_' + uuid.v4();
    let node, resource, _resource;

    node = self.createNode({
      _id: _id,
      type: 'Content',
      idx: idx,
      x: xP,
      y: yP,
      transform: 'translate(' + [xP, yP] + ')',
      shape: 'RECTANGLE',
      label: 'New Content',
      size: {
        width: 100,
        height: 100
      },
      color: globals.Color.contentFill,
      outline: globals.Color.nodeOutline,
      font: {
        size: '12pt',
        family: 'Arial',
        color: globals.Color.nodeText
      }
    });

    resource = self.createResource({
      _id: idx,
      name: 'New Content',
      type: 'Text',
      format: 'text/plain'
    });

    _resource = {
      node: node,
      resource: resource
    };
    return _resource;
  }

  addSimpleTopic = () => {
    const
      self = this,
      util = self.util,
      // pid = globals.current.note_id,
      // uid = self.currentUser ? self.currentUser._id : null,
      // pp = globals.current.currentPage,
      center = util.pContext({
        x: window.innerWidth / 2,
        y: window.innerHeight / 2
      }),
      newP = self.newPosition(center.x, center.y),
      xP = newP.x,
      yP = newP.y,
      _id = '_' + uuid.v4(),
      idx = '_' + uuid.v4();
    let node, resource, topic;

    node = self.createNode({
      _id: _id,
      type: 'Topic',
      idx: idx,
      x: xP,
      y: yP,
      transform: 'translate(' + [xP, yP] + ')',
      shape: 'RECTANGLE',
      label: 'New Topic',
      size: {
        width: 120,
        height: 32
      },
      color: globals.Color.nodeFill,
      outline: globals.Color.nodeOutline,
      font: {
        size: '12pt',
        family: 'Arial',
        color: globals.Color.nodeText
      }
    });

    resource = self.createResource({
      _id: idx,
      // id: resource_id,
      name: 'New Topic',
      type: 'TextualBody',
      format: 'text/plain'
    });

    topic = {
      node: node,
      resource: resource
    };
    return topic;
  }

  addSimpleMemo = () => {
    const
      self = this,
      util = self.util,
      // pid = globals.current.note_id,
      // uid = self.currentUser ? self.currentUser._id : null,
      // pp = globals.current.currentPage,
      center = util.pContext({
        x: window.innerWidth / 2,
        y: window.innerHeight / 2
      }),
      newP = self.newPosition(center.x, center.y),
      xP = newP.x,
      yP = newP.y,
      _id = '_' + uuid.v4(),
      idx = '_' + uuid.v4();
    let node, resource;

    resource = self.createResource({
      _id: idx,
      type: 'TexualBody',
      format: 'text/plain'
    });
    // resource.value = 'New Memo'; // 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.';

    node = self.createNode({
      _id: _id,
      type: 'Memo',
      idx: idx,
      x: xP,
      y: yP,
      transform: 'translate(' + [xP, yP] + ')',
      shape: 'MEMO',
      size: {
      width: 160,
      height: 160
    },
      font: {
        size: '12pt',
        family: 'Arial',
        color: globals.Color.nodeText
      },
      description: resource.value
    });

    const memo = {
      node: node,
      resource: resource
    };
    return memo;
  }

  addContent = (targets) => {
    const
      self = this,
      util = self.util,
      pid = globals.current.note_id,
      uid = self.currentUser ? self.currentUser._id : null,
      target_node = targets[0];
    let
      target_resource,
      _resource, source_node, body_resource,
      _annotation, link, annotation, logData;

    target_resource = self.findResourceById(target_node.idx);

    if (!target_resource) { return null; }

    _resource = self.addSimpleContent(); // returns {node, resource}

    source_node = _resource.node;
    const newP = self.newPosition(source_node.x, source_node.y);
    source_node.x = newP.x;
    source_node.y = newP.y;

    body_resource = _resource.resource;

    _annotation = self.connect(<uuid>source_node, <uuid>target_node); // returns {link, annotation}

    link = _annotation.link;
    annotation = _annotation.annotation;

    logData = {
      command: 'addContent',
      param: {
        node: [source_node, target_node],
        resource: [body_resource, target_resource],
        link: [link],
        annotation: [annotation]
      }
    };

    return logData;
  }

  addTopic = (targets) => {
    const
      self = this,
      util = self.util,
      pid = globals.current.note_id,
      uid = self.currentUser ? self.currentUser._id : null,
      target_node = targets[0];
    let
      target_resource,
      topic, source_node, body_resource,
      _annotation, link, annotation, logData;

    target_resource = self.findResourceById(target_node.idx);
    if (!target_resource) { return null; }

    topic = self.addSimpleTopic(); // returns {node, resource}

    source_node = topic.node;
    const newP = self.newPosition(source_node.x, source_node.y);
    source_node.x = newP.x;
    source_node.y = newP.y;
    body_resource = topic.resource;

    _annotation = self.connect(<uuid>source_node, <uuid>target_node); // returns {link, annotation}

    link = _annotation.link;
    annotation = _annotation.annotation;

    logData = {
      command: 'addTopic',
      param: {
        node: [source_node, target_node],
        resource: [body_resource, target_resource],
        link: [link],
        annotation: [annotation]
      }
    };
    return logData;
  }

  addMemo = (targets) => {
    const
      self = this,
      util = self.util,
      pid = globals.current.note_id,
      uid = self.currentUser ? self.currentUser._id : null,
      target_node = targets[0];
    let
      target_resource,
      memo, source_node, body_resource,
      _annotation, link, annotation, logData;

    target_resource = self.findResourceById(target_node.idx);
    if (!target_resource) { return null; }

    memo = self.addSimpleMemo(); // returns {node, resource}
    source_node = memo.node;
    const newP = self.newPosition(source_node.x, source_node.y);
    source_node.x = newP.x;
    source_node.y = newP.y;
    body_resource = memo.resource;

    _annotation = self.connect(<uuid>source_node, <uuid>target_node); // returns {link, annotation}

    link = _annotation.link;
    annotation = _annotation.annotation;

    logData = {
      command: 'addMemo',
      param: {
        node: [source_node, target_node],
        resource: [body_resource, target_resource],
        link: [link],
        annotation: [annotation]
      }
    };
    return logData;
  }

  showAll = () => {
    globals.graph.nodes.forEach(node => {
      if (!node.visible && undefined !== node.visible) {
        node.visible = true;
      }
    });
    globals.graph.links.forEach(link => {
      if (!link.visible && undefined !== link.visible) {
        link.visible = true;
      }
    });
  }

  hideAll = () => {
    globals.graph.nodes.forEach(node => {
      if (node.visible) {
        node.visible = false;
      }
    });
    globals.graph.links.forEach(link => {
      if (link.visible) {
        link.visible = false;
      }
    });
  }

  // Annotation
  bind = (param: {
    body: any,
    target: any,
    rtype?: string
  }) => {
    const
      self = this,
      body = param.body,
      target = param.target,
      rtype = param.rtype || '';
    if (!body) {
      console.log('bind NO body param:', param);
      return null;
    }
    if (!target) {
      console.log('bind NO tagrget param:', param);
      return null;
    }
    const
      body_id = body._id,
      target_id = target._id,
      body_key = body.key,
      target_key = target.key;
      // bodyResource = null,
      // targetResource = null,
    let
      key = null;
    /*if (body_id) {
      bodyResource = self.findResourceById(body_id);
    } else {
      console.log('bind NO body._id param:', param);
      return null;
    }
    if (target_id) {
      targetResource = self.findResourceById(target_id);
    } else {
      console.log('bind NO target._id param:', param);
      return null;
    }*/
    /*if (body_key && bodyResource) {
      body_key = bodyResource.key;
    } else {
      console.log('bind NO bodyResource param:', param);
      return null;
    }
    if (target_key && targetResource) {
      target_key = targetResource.key;
    } else {
      console.log('bind NO targetResource param:', param);
      return null;
    }*/
    if (body_key && target_key) {
      key = body_key + '~' + rtype + '~' + target_key;
    }
    const
      idx = '_' + uuid.v4(),
      annotation = self.createAnnotation({
        _id: idx,
        key: key,
        body_ref: body_id,
        target_ref: target_id,
        rtype: rtype
      });
    return annotation;
  }

  unbind = (idx) => {
    this.deleteAnnotation({ _id: idx });
  }

  // Link
  connect = (source_node: Node, target_node: Node, rtype?: string) => {
    if (!source_node || !target_node) {
      return null;
    }
    const
      self = this,
      util = self.util,
      _id = '_' + uuid.v4(),
      sourceIdx = source_node.idx,
      targetIdx = target_node.idx,
      body_resource = self.findResourceById(sourceIdx),
      target_resource = self.findResourceById(targetIdx);
    let
      _annotation = {link: null, annotation: null}, link, annotation;

    annotation = self.bind({
      body: body_resource,
      target: target_resource,
      rtype: rtype || ''
    });
    const idx = annotation._id;

    link = self.LinkFactory({
      _id: _id,
      idx: idx,
      source_id: source_node._id,
      target_id: target_node._id
    });

    util.appendBy_id(globals.graph.links, link);
    globals.linkIndexer[idx] = link;

    self.renderLink(link); // add path and marker, needs <g.node> to calculate path

    _annotation = {
      link: link,
      annotation: annotation
    };
    globals.status.Connecting = false;
    return _annotation;
  }

  cut = (link) => {
    const
      self = this,
      util = self.util,
      _id = link._id;

    util.removeBy_id(globals.graph.links, _id);

    self.updateLinkCount();

    const logData = {
      command: 'cut',
      param: {
        link: [{ _id: _id, type: 'Link' }]
      }
    };
    return logData;
  }

  erase = (nodes) => {
    const
      self = this,
      util = self.util,
      _nodes = [];
    let
      _links = [];
    nodes.forEach(node => {
      const _id = node._id;
      if (util.isLink(node)) {
        // link
        const link = node;
        util.removeBy_id(globals.graph.links, _id);
        _links.push({ _id: _id, type: 'Link' });
      } else {
        /**
         * node and its links
         */
        _links = self.findLinksByNode(node).links;
        for (const link of _links) {
          util.removeBy_id(globals.graph.links, link._id);
        }
        util.removeBy_id(globals.graph.nodes, _id);
        _nodes.push({ _id: _id, type: 'Node' });
      }
    });

    self.updateLinkCount();

    const logData = {
      command: 'erase',
      param: {
        node: _nodes,
        link: _links
      }
    };
    return logData;
  }

  expand = (_nodes) => {
    const
      self = this,
      util = self.util,
      nodes = [],
      links = [];
    for (const node of _nodes) {
      if ('Link' === node.type) {
        return null;
      }

      // util.appendBy_id(nodes, node);

      let another = null;
      const
        allLinks = self.findLinksByNode(node),
        hidden_links = allLinks.hiddens,
        undefined_links = allLinks.undefineds;
      let count_link = 0;
      for (const link of hidden_links) {
        count_link++;
        if (count_link <= globals.MAX_EXPANDS) {
          link.visible = true;
          util.appendBy_id(links, link);
          const
            source_id = link.source_id,
            target_id = link.target_id;
          if (node._id === source_id) {
            another = self.findNodeBy_id(target_id);
          } else if (node._id === target_id) {
            another = self.findNodeBy_id(source_id);
          }
          if (another) {
            if (!another.viibles) {
              if ('simulation' === globals.status.canvasId) {
                const newP = self.newPosition(node.x, node.y);
                another.x = newP.x;
                another.y = newP.y;
              }
              another.visible = true;
            }
            util.appendBy_id(nodes, another);
          }
        }
      }

      for (const a of undefined_links) {
        count_link++;
        if (count_link <= globals.MAX_EXPANDS) {
          const
            annotation = a.annotation,
            side = a.another,
            resource = a.resource;
          const
            _id = '_' + uuid.v4(),
            idx = annotation._id,
            key = annotation.key,
            rtype = annotation.rtype,
            setting = self.getRtypeSetting(rtype);
          let
            source = null,
            target = null;

          another = self.addCtypeNode(resource);

          if (!another.viibles) {
            if ('simulation' === globals.status.canvasId && FORCE.SIMULATE) {
              const newP = self.newPosition(node.x, node.y);
              another.x = newP.x;
              another.y = newP.y;
            }
            another.visible = true;
          }

          util.appendBy_id(nodes, another);

          if ('target' === side) {
            source = node;
            target = another;
          } else if ('body' === side) {
            source = another;
            target = node;
          }
          const
            param = {
              _id: _id,
              key: key,
              idx: idx,
              source_id: source._id,
              target_id: target._id,
              label: name,
              rtype: rtype,
              shape: (setting && setting.style) || self.defaultSettingLink.style,
              size: (setting && setting.size) || self.defaultSettingLink.size,
              color: (setting && setting.color) || self.defaultSettingLink.color,
              font: (setting && setting.font) || self.defaultSettingLink.font
            },
            link = self.createLink(param); // renderLink(link) performed in createLink(param)
          link.visible = true;
          util.appendBy_id(links, link);
        }
      }
    }

    // log
    const logData = {
      command: 'expand',
      param: {
        node: nodes,
        link: links
      }
    };
    return logData;
  }

  hide = (_nodes: any[]) => {
    const
      self = this,
      util = self.util,
      nodes: Node[] = [],
      links: Link[] = [];
    let
      node, link;
    for (const _node of _nodes) {
      if ('Link' === _node.type) {
        link = self.findLinkBy_id(_node._id);
        if (link.visible) {
          link.visible = false;
        }
        links.push(link);
      } else {
        node = self.findNodeBy_id(_node._id);
        node.visible = false;
        nodes.push(node);
        for (link of self.findLinksByNode(node).visibles) {
          link.visible = false;
          links.push(link);
        }
      }
    }

    self.updateLinkCount();

    // log
    const logData = {
      command: 'hide',
      param: {
        node: nodes,
        link: links
      }
    };
    return logData;
  }

  root = (_nodes) => {
    const
      self = this,
      util = self.util,
      node = _nodes[0],
      node_id = node._id,
      nodes = [],
      links = [];
    for (const node of globals.graph.nodes) {
      if (node.visible && node_id !== node._id) {
        node.visible = false;
      } else if (node_id === node._id) {
        node.visible = true;
      }
      nodes.push(node);
    }
    for (const link of globals.graph.links) {
      if (link.visible) {
        link.visible = false;
      }
      links.push(link);
    }

    self.updateLinkCount();

    // log
    const logData = {
      command: 'root',
      param: {
        node: nodes,
        link: links
      }
    };
    return logData;
  }

  collapse = (nodes) => {
    const
      self = this,
      util = self.util,
      trace = true,
      root = nodes[0],
      leafs = {},
      trunks = {},
      visited = {},
      checked = {},
      nodes_data = [],
      changedNodes = [],
      visibles = [],
      invisibles = [];
    if (!nodes) { return; }

    let
      node, currentLevel, nextLevel, d,
      links, link,
      otherNode,
      isLeaf, isTrunk;

    isLeaf = function (_node) {
      const _links = self.findLinksByNode(_node).visibles;
      let
        _otherNode,
        _linkCount = 0,
        leafCount = 0;
      if (leafs[_node._id]) {
        if (trace) {console.log('isLeaf End  %s#%s isLeaf=%s', node.type, node._id, true); }
        return true;
      }
      if (trunks[_node._id]) {
        if (trace) {console.log('isLeaf End  %s#%s isLeaf=%s', node.type, node._id, false); }
        return false;
      }
      _links.forEach(l => {
        if (l.visible) {
          _linkCount++;
        }
      });
      if (1 === _linkCount) {
        if (trace) {console.log('isLeaf End   %s#%s isLeaf=%s 1 === _linkCount', node.type, node._id, true); }
        return true;
      }
      _links.forEach(l => {
        if (l && l.visible) {
          _otherNode = self.findOtherNode(l, _node);
          if (_otherNode && leafs[_otherNode._id]) {
            leafCount++;
          }
        }
      });
      if (leafCount + 1 === _linkCount) {
        if (trace) {console.log('isLeaf End   %s#%s isLeaf=%s leafCount + 1 === _linkCount', node.type, node._id, true); }
        return true;
      }
      if (trace) {console.log('isLeaf End   %s#%s isLeaf=%s', node.type, node._id, undefined); }
      return undefined;
    };

    isTrunk = (_node, _visited) => {
      let
        _links,
        _i, _len, _link, _otherNode,
        visitedCount = 0;
      if (trunks[_node._id]) {
        if (trace) {console.log('isTrunk End   %s#%s trunks[node._id] isTrunk=%s', node.type, node._id, true); }
        return true;
      }
      if (leafs[_node._id]) {
        if (trace) {console.log('isTrunk End   %s#%s leafs[node._id] isTrunk=%s', node.type, node._id, false); }
        return false;
      }
      _links = self.findLinksByNode(_node).visibles;
      _len = _links.length;
      if (_len > 1) {
        for (_i = 0; _i < _len; _i++) {
          _link = _links[_i];
          if (_link) {
            _otherNode = self.findOtherNode(_link, _node);
            if (_otherNode && visited[_otherNode._id]) {
              visitedCount++;
            }
          }
        }
        if (visitedCount > 1) {
          if (trace) {console.log('isTrunk End   %s#%s visitedCount > 1 isTrunk=%s', node.type, node._id, true); }
          return true;
        }
        if (trace) {console.log('isTrunk End   %s#%s isTrunk=%s', node.type, node._id, undefined); }
        return undefined;
      }
      if (trace) {console.log('isTrunk End   %s#%s links.length == 1 isTrunk=%s', node.type, node._id, false); }
      return false;
    };

    // START
    if ('Link' === root.type) {
      return;
    }
    root.stemLeaf = 'root';
    d = 0;
    visited[root._id] = root._id;
    trunks[root._id] = root._id;
    currentLevel = [root];
    while (currentLevel.length) { // } && d < 3) {
      // if current level is nodes at distance d from the end, next level is d+1.
      nextLevel = [];
      for (node of currentLevel) {
        links = self.findLinksByNode(node).visibles;
        for (link of links) {
          otherNode = self.findOtherNode(link, node);
          if (otherNode &&
              otherNode.visible &&
              !visited[otherNode._id]) {
            // NOT VISITED THEN STORE IN nextLevel
            visited[otherNode._id] = otherNode._id;
            if (isLeaf(otherNode)) {
              leafs[otherNode._id] = otherNode._id;
              leafs[link._id] = link._id;
            } else if (isTrunk(otherNode, visited)) {
              trunks[otherNode._id] = otherNode._id;
            }
            nextLevel.push(otherNode);
          }
        }
      }
      d++;
      currentLevel = nextLevel;
    }
    currentLevel = [];
    for (const _node of globals.graph.nodes) {
      if (_node.visible &&
          root._id !== _node._id &&
          (leafs[_node._id] || trunks[_node._id])) {
        currentLevel.push(_node);
      }
    }
    d = 0;
    while (currentLevel.length) { // } && d < 3) {
      // if current level is nodes at distance d from the end, next level is d+1.
      nextLevel = [];
      for (node of currentLevel) {
        links = self.findLinksByNode(node).visibles;
        for (link of links) {
          visited[link._id] = link._id;
          otherNode = self.findOtherNode(link, node);
          if (otherNode && visited[otherNode._id]) {
            if (otherNode.visible &&
                visited[otherNode._id] &&
                !checked[otherNode._id] &&
                root._id !== otherNode._id) {
              // NOT CHECKED THEN STORE IN nextLevel
              checked[otherNode._id] = otherNode._id;
              if (isLeaf(otherNode)) {
                leafs[otherNode._id] = otherNode._id;
                leafs[link._id] = link._id;
              } else if (isTrunk(otherNode, visited)) {
                trunks[otherNode._id] = otherNode._id;
              }
              nextLevel.push(otherNode);
            }
          }
        }
      }
      d++;
      currentLevel = nextLevel;
    }

    for (const link of globals.graph.links) {
      if (link.visible && !leafs[link._id] && !trunks[link._id]) {
        const
          // util = this.util,
          source_id = link.source_id,
          target_id = link.target_id;
        if (leafs[source_id] || leafs[target_id]) {
          leafs[link._id] = link._id;
        } else {
          trunks[link._id] = link._id;
        }
      }
    }

    // Final Loop
    for (const node_id in visited) {
      if (visited.hasOwnProperty(node_id)) {
        node = self.findNodeBy_id(node_id);
        if (node && leafs[node._id]) {
          links = self.findLinksByNode(node).visibles;
          for (link of links) {
            otherNode = self.findOtherNode(link, node);
            if (trunks[otherNode]) {
              delete leafs[node._id];
            }
          }
        }
      }
    }
    for (const node_id in visited) {
      if (visited.hasOwnProperty(node_id)) {
        node = self.findNodeBy_id(node_id);
        if (node && leafs[node._id]) {
          const changedNodes = self.setVisible(node, false);
          for (const n of changedNodes) {
            if (root !== n) {
              delete n.stemLeaf;
              n.visible = false;
              util.appendBy_id(nodes_data, n);
            }
          }
        }
      }
    }

    for (const linkId in visited) {
      if (visited.hasOwnProperty(linkId)) {
        link = self.findLinkBy_id(linkId);
        if (link && leafs[link._id]) {
          const changedNodes = self.setVisible(link, false);
          for (const n of changedNodes) {
            if (root !== n) {
              delete n.stemLeaf;
              n.visible = false;
              util.appendBy_id(nodes_data, n);
            }
          }
        }
      }
    }

    root.visible = true;
    delete root.stemLeaf;

    self.updateLinkCount();

    // log
    const logData = {
      command: 'collapse',
      param: {
        node: nodes_data.filter((n) => { return !util.isLink(n); }),
        link: nodes_data.filter((l) => { return util.isLink(l); })
      }
    };
    return logData;
  }

  shuffle = (param: { nodes, links }) => {
    const
      self = this,
      util = self.util,
      center = util.pContext({
        x: window.innerWidth / 2,
        y: window.innerHeight / 2
      });

    let
      nodes = param.nodes.filter(n => n.visible && !n.filterout),
      links = param.links.filter(l => l.visible && !l.filterout);
    nodes = nodes.map(node => {
      const
        newP = self.newPosition(center.x, center.y);
      node.x = newP.x;
      node.y = newP.y;
      self.updateNode(node);
      self.renderNode(node);
    });
    links = links.map(link => {
      if (link.fixed) {
        link.fixed = false;
        self.updateLink(link);
        self.renderLink(link);
      }
    });
    // log
    const logData = {
      command: 'expand',
      param: {
        node: nodes,
        link: links
      }
    };
    return logData;
  }

  getVisibles = () => {
    const
      nodes = globals.graph.nodes.filter(node => node.visible && !node.filterout),
      links = globals.graph.links.filter(link => link.visible && !link.filterout);
    return {
      nodes: nodes,
      links: links
    };
  }

  setVisible = (node: any, visible: boolean) => {
    const
      self = this,
      util = self.util;
    if (!node) { return; }
    const changedNodes: any[] = [];
    let
      links: Link[],
      link: Link;

    function setVisibleNode(_node, _visible: boolean) {
      if (!_node ||
          util.isLink(_node) ||
          // skip already changed d3node/link
          util.contains(changedNodes, _node)) {
        return;
      }

      _node.visible = _visible;

      util.appendBy_id(changedNodes, _node);
      if (!_visible) { // When hide _node related links must be hidden
        links = self.findLinksByNode(_node).visibles; // links;
        for (link of links) {
          if (link) {
            setVisibleLink(link, false);
          }
        }
      }
    }

    function setVisibleLink(_link, _visible) {
      let
        source: Node, target: Node;
      if (!_link ||
          !util.isLink(_link) ||
          // skip already changed node/_link
          util.contains(changedNodes, _link)) {
        return;
      }

      _link.visible = _visible;

      util.appendBy_id(changedNodes, _link);
      if (_visible) { // Showing _link also show nodes related to this _link
        const
          source_id = _link.source_id,
          target_id = _link.target_id;
        source = self.findNodeBy_id(source_id);
        if (source) {
          setVisibleNode(source, true);
          util.appendBy_id(changedNodes, source);
        }
        target = self.findNodeBy_id(target_id);
        if (target) {
          setVisibleNode(target, true);
          util.appendBy_id(changedNodes, target);
        }
      }
    }

    if (util.isLink(node)) {
      setVisibleLink(node, visible);
    } else {
      setVisibleNode(node, visible);
    }
    return changedNodes;
  }

  setMultipleLine = (item) => {
    const
      t = item.text, // svg text
      WIDTH = item.width,
      HEIGHT = item.height,
      verticalAlign = item.verticalAlign || 'top',
      OFFSET_X = item.offsetx || 0,
      OFFSET_Y = item.offsety || 0,
      SPACING = 2;
    let
      tArray,
      content,
      bbox, // x0, y0,
      lineHeight,
      lines, words, word,
      tempText, tempWidth, tempHeight,
      i, li, j, lj, idx, lineLength, ltr,
      line = '',
      isLineSinglebype;

    const lineTspanY = (lineI, lineCount) => {
      let y;
      switch (verticalAlign) {
      case 'center':
        y = OFFSET_Y + (lineI - (lineCount - 1) / 2) * lineHeight;
        break;
      case 'top':
        y = OFFSET_Y + lineI * lineHeight;
        break;
      case 'bottom':
        y = OFFSET_Y - ((lineCount - 1) - lineI) * lineHeight;
        break;
      }
      return y ? y + 'px' : 0;
    };

    const lineTspanAttrs = () => {
      switch (verticalAlign) {
      case 'center':
        return '.35em';
      case 'top':
        return '1em';
      case 'bottom':
        return 0;
      }
    };

    // Check if character is single byte
    // @param c result of s.charCodeAt(i)
    //
    const isSingleByte = (c) => {
    // count character bytes according to following sites.
    // http://www.tagindex.com/kakolog/q4bbs/1001/1270.html
    // http://www.geocities.jp/scs00046/pages/2006112701.html
      let result;
      result =
        (c >= 0x0 && c < 0x81) ||
        (c === 0xf8f0) ||
        (c >= 0xff61 && c < 0xffa0) ||
        (c >= 0xf8f1 && c < 0xf8f4);
      return !! result;
    };

    content = (t && t.node() && t.text()) ? t.text().trim() : '';
    if (!content) { return; }

    bbox = t.node().getBBox();
    lineHeight = bbox.height + SPACING;
    lines = content.split(/\n/);
    // x0 = bbox.x;
    // y0 = bbox.y;
    tempHeight = lineHeight;
    tempText = '';
    tArray = [];

    LOOP: for (i = 0, li = lines.length; i < li; i++) {
      if (i > 0) {
        tArray.push(tempText);
        tempText = '';
      }
      line = lines[i];
      lineLength = line.length;
      if (0 === lineLength) {
        tempHeight += lineHeight;
        if (tempHeight > HEIGHT - lineHeight) {
          break LOOP;
        }
        tempText = '';
      } else {
        isLineSinglebype = true;
        for (idx = 0; idx < lineLength; idx++) {
          isLineSinglebype = isLineSinglebype && isSingleByte(line.charCodeAt(idx));
        }
        if (isLineSinglebype) {
          words = line.split(' ');
          for (j = 0, lj = words.length; j < lj; j++) {
            word = words[j];
            t.text(tempText + ' ' + word);
            tempWidth = t.node().getBBox().width;
            if (tempWidth > WIDTH) {
              tArray.push(tempText);
              tempText = '';
              t.text(word);
              tempHeight += lineHeight;
              if (tempHeight > HEIGHT - lineHeight) {
                tArray[tArray.length - 1] += '...';
                break LOOP;
              } else {
                tempText = word;
              }
            } else {
              tempText += ' ' + word;
            }
          }
        } else {
          for (idx = 0; idx < lineLength; idx++) {
            ltr = line.charAt(idx);
            t.text(tempText + ltr);
            tempWidth = t.node().getBBox().width;
            if (tempWidth > WIDTH) {
              tArray.push(tempText);
              tempText = '';
              t.text(ltr);
              tempHeight += lineHeight;
              if (tempHeight > HEIGHT - lineHeight) {
                tArray[tArray.length - 1] += '...';
                break LOOP;
              } else {
                tempText = ltr;
              }
            } else {
              tempText += ltr;
            }
          }
        }
      }
    }
    t.text('');

    if (tempText) {
      tArray.push(tempText.trim());
    }

    t.empty();
    const lineCount = tArray.length;
    for (let lineI = 0; lineI < lineCount; lineI++) {
      line = tArray[lineI];
      t.append('tspan')
        .attr('x', OFFSET_X)
        .attr('y', lineTspanY(lineI, lineCount))
        .attr('dy', lineTspanAttrs())
        .text(line);
    }
  }

  /** renderNode */
  renderNode(node: Node) {
    const
      self = this,
      d3node = d3.select('g.node#' + node._id),
      simNode = self.SimNodeFactory(node);
    if (!d3node || !d3node.node() || !simNode) {
      return null;
    }

    const
      editingCircle = d3.select('#Editing');
    if ('1' === editingCircle.style('opacity')) { // } && selectedNode && selectedNode._id === node._id) {
      editingCircle
        .attr('cx', simNode.x)
        .attr('cy', simNode.y);
    }

    const
      startCircle = d3.select('#Start');
    if ('1' === startCircle.style('opacity')) { // } && startNode && startNode._id === node._id) {
      startCircle
        .attr('cx', simNode.x)
        .attr('cy', simNode.y);
    }

    let x, y;
    const
      _id = node._id; // simNode.id,
      // node = self.findNodeBy_id(_id);
    if (node) {
      x = simNode.x || 0,
      y = simNode.y || 0;
      node.x = x;
      node.y = y;
    } else {
      return null;
    }

    const
      type = node.type,
      shape = node.shape,
      description = node.description,
      size = node.size,
      width = size.width || globals.defaultSize.width,
      height = size.height || globals.defaultSize.height,
      color = node.color,
      outline = node.outline,
      font = node.font,
      font_family = font.family || 'Arial',
      font_size = font.size || '10pt',
      font_color = font.color || '#303030',
      font_style = font.style,
      text_anchor =  node.text_anchor || 'middle', // start middle end
      alignment_baseline = node.alignment_baseline || 'middle', // hanging middle baseline
      thumbnail = node.thumbnail,
      // img = node.img,
      fixed = node.fixed;

    const linkCount = self.countHiddenLink(node);

    let label = node.label;
    if (label && label.length > 36) {
      label = label.substr(0, 35) + '...';
    }

    let radius = size.radius;
    if ('ROUNDED' === shape && !radius) {
      if (!isNaN(width) && !isNaN(height))  {
        if (width > height) {
          radius = height / 2;
        } else {
          radius = width / 2;
        }
      } else {
        radius = globals.defaultSize.radius;
      }
    }
    if ('CIRCLE' === shape && !radius) {
      radius = globals.defaultSize.radius;
    }

    // const d3node = d3.select('#' + node._id)
    d3node.selectAll('*').remove();

    d3node
      .attr('class', 'node')
      .attr('transform', 'translate(' + [x, y] + ')');

    // see https://stackoverflow.com/questions/27245673/svg-image-element-not-displaying-in-safari
    let href = 'href';
    if ('safari' === globals.status.browser) {
      href = 'xlink:href';
    }

    if ('CIRCLE' === shape) {
      d3node.append('circle')
        .attr('class', 'shape-node')
        .attr('r', radius)
        .attr('stroke', outline)
        .attr('fill', color);
    } else if ('RECTANGLE' === shape) {
      d3node.append('rect')
        .attr('class', 'shape-node')
        .attr('x', -width / 2)
        .attr('y', -height / 2)
        .attr('width', width)
        .attr('height', height)
        .attr('stroke', outline)
        .attr('fill', color);
    } else if ('ELLIPSE' === shape) {
      d3node.append('rect')
        .attr('class', 'shape-node')
        .attr('x', -width / 2)
        .attr('y', -height / 2)
        .attr('width', width)
        .attr('height', height)
        .attr('rx', width / 2)
        .attr('ry', height / 2)
        .attr('stroke', outline)
        .attr('fill', color);
    } else if ('ROUNDED' === shape) {
      d3node.append('rect')
        .attr('class', 'shape-node')
        .attr('x', -width / 2)
        .attr('y', -height / 2)
        .attr('width', width)
        .attr('height', height)
        .attr('rx', radius)
        .attr('ry', radius)
        .attr('stroke', outline)
        .attr('fill', color);
    } else if ('MEMO' === shape) {
      d3node.append('path')
        .attr('class', 'memo-node')
        .attr('d', 'M' + -node.size.width / 2 + ',' + -node.size.height / 2 +
            ' l0,' + 4 * node.size.height / 5 +
            ' a' + node.size.width / 10 + ',' + node.size.height / 5 + ' 0 0,0 ' + node.size.width / 10 + ',' + node.size.height / 5 +
            ' l' + node.size.width + ',0' +
            ' a' + node.size.width / 10 + ',' + node.size.height / 5 + ' 0 0,1 -' + node.size.width / 10 + ',-' + node.size.height / 5 +
            ' l0,-' + 4 * node.size.height / 5 + ' z')
        .attr('fill', 'url(#vertical-gradation)');
      d3node.append('path')
        .attr('class', 'shape-node')
        .attr('d', 'M' + -node.size.width / 2 + ',' + -node.size.height / 2 +
            ' l0,' + 4 * node.size.height / 5 +
            ' a' + node.size.width / 10 + ',' + node.size.height / 5 + ' 0 0,0 ' + node.size.width / 10 + ',' + node.size.height / 5 +
            ' l' + node.size.width + ',0' +
            ' a' + node.size.width / 10 + ',' + node.size.height / 5 + ' 0 0,1 -' + node.size.width / 10 + ',-' + node.size.height / 5 +
            ' l0,-' + 4 * node.size.height / 5 + ' z')
        .attr('filter', 'url(#dropshadow)')
        .attr('opacity', '0.3')
        .attr('fill', node.color);
    } else if ('THUMBNAIL' === shape && thumbnail) {
      d3node.append('image')
        .attr('class', 'shape-node')
        .attr('x', -width / 2)
        .attr('y', -height / 2)
        .attr('width', width)
        .attr('height', height)
        .attr(href, thumbnail);
    }

    if (/*globals.status.playing &&*/fixed) {
      const d3node = d3.select('#' + _id);
      d3node.selectAll('.shape-node, .memo-node')
        .style('filter', function(d) {
          return 'url(#fixed-shadow)';
        });
    }

    if (('THUMBNAIL' === shape || 'Content' === type) && label) {
      if ('CIRCLE' === shape) {
        d3node.append('text')
          .attr('class', 'node-label')
          .attr('x', -radius)
          .attr('y', -radius - 4)
          .attr('font-family', font_family)
          .attr('font-size', font_size)
          .attr('fill', font_color)
          .attr('text-anchor', 'start')
          .attr('alignment-baseline', 'baseline')
          .text(label);
      } else {
        d3node.append('text')
          .attr('class', 'node-label')
          .attr('x', -width / 2)
          .attr('y', -height / 2 - 4)
          .attr('font-family', font_family)
          .attr('font-size', font_size)
          .attr('fill', font_color)
          .attr('text-anchor', 'start')
          .attr('alignment-baseline', 'baseline')
          .text(label);
      }
    }

    if ('Topic' === type && 'THUMBNAIL' !== shape && label) {
      d3node.append('text')
        .attr('class', 'node-label')
        .attr('font-family', font_family)
        .attr('font-size', font_size)
        .attr('fill', font_color)
        .attr('text-anchor', text_anchor)
        .attr('alignment-baseline', alignment_baseline)
        .text(label);
    }

    const padding = { x: 4, y: 4 };
    if ('Memo' === type) {
      const
        gText = d3node.append('text')
          .attr('class', 'node-description')
          .attr('font-family', font_family)
          .attr('font-size', font_size)
          .attr('fill', font_color)
          .attr('text-anchor', 'start')
          .text(description);
      const
        item = {
          text: gText,
          width: node.size.width - 2 * padding.x,
          height: node.size.height - 2 * padding.y,
          offsetx: padding.x - node.size.width / 2,
          offsety: padding.y - node.size.height / 2,
          verticalAlign: 'top'
        };
      self.setMultipleLine(item);
      d3node.selectAll('rect.cover-description').raise();
    } else if ('Content' === type && 'THUMBNAIL' !== shape) {
      const
        gText = d3node.append('text')
          .attr('class', 'node-description')
          .attr('font-family', font_family)
          .attr('font-size', font_size)
          .attr('fill', font_color)
          .attr('text-anchor', 'start')
          .text(description);
      let item;
      if ('CIRCLE' === shape) {
        item = {
          text: gText,
          width: 2 * (node.size.radius - padding.x),
          height: 2 * (node.size.radius - padding.y),
          offsetx: padding.x - node.size.radius,
          offsety: padding.y - node.size.radius
        };
      } else {
        item = {
          text: gText,
          width: node.size.width - 2 * padding.x,
          height: node.size.height - 2 * padding.y,
          offsetx: padding.x - node.size.width / 2,
          offsety: padding.y - node.size.height / 2,
          verticalAlign: 'top'
        };
      }
      self.setMultipleLine(item);
      d3node.selectAll('rect.cover-description').raise();
    }

    const linkCountNode = d3node.append('text')
        .attr('class', 'link-count')
        .attr('font-family', font_family)
        .attr('font-size', '10pt')
        .attr('fill', '#d00000')
        .attr('stroke', 'none')
        .attr('text-anchor', 'end');
    if ('CIRCLE' === shape) {
      linkCountNode
        .attr('x', radius)
        .attr('y', -radius);
    } else {
      linkCountNode
        .attr('x', width / 2)
        .attr('y', -height / 2);
    }
    if ('THUMBNAIL' === shape || 'Content' === type) {
      linkCountNode
        .attr('text-anchor', 'start')
        .attr('x', 3 + width / 2)
        .attr('y', 11 - (height / 2));
    }
    if (linkCount > 0) {
      linkCountNode.text(linkCount);
    } else {
      linkCountNode.text('');
    }
  }

  /** Update link Path and marker
   * @param link Link
   */
  renderLink(link: Link) {
    if (!link) {
      return null;
    }
    const
      self = this,
      util = self.util,
      intersections = [],
      ref1 = 16,
      ref2 = 4;
    let
      overlays1,
      overlays2,
      color, size,
      mid,
      points;

    color = link.color || '#c0c0c0';
    size  = link.size || 2;

    // source & target
    const
      // source
      source_id = ('object' === typeof link.source)
        ? link.source.id
        : link.source || link.source_id,
      source = self.findNodeBy_id(source_id),
      // target
      target_id = ('object' === typeof link.target)
        ? link.target.id
        : link.target || link.target_id,
      target = self.findNodeBy_id(target_id);
    if (!source || !target) {
      return;
    }
    const
      sourceX = source.x,
      sourceY = source.y,
      sourceShape = source.shape,
      sourceRadius = source.size.radius,
      sourceW = source.size.width,
      sourceH = source.size.height,
      targetX = target.x,
      targetY = target.y,
      targetShape = target.shape,
      targetRadius = target.size.radius,
      targetW = target.size.width,
      targetH = target.size.height;
    if (link.straight) {
      mid = {
        x: util.precisionRound((sourceX + targetX) / 2, 3),
        y: util.precisionRound((sourceY + targetY) / 2, 3)
      };
      link.x = mid.x;
      link.y = mid.y;
      points = [
        {x: sourceX, y: sourceY},
        {x: targetX, y: targetY}
      ];
    } else {
      mid = {
        x: link.x,
        y: link.y
      };
      points = [
        {x: sourceX, y: sourceY},
        {x: mid.x, y: mid.y},
        {x: targetX, y: targetY}
      ];
    }

    let pathString, path;
    pathString = self.points2pathString(points);
    path = self.shape('path', {'d': pathString});

    let
      shape;
    switch (sourceShape) {
      case 'RECTANGLE':
      case 'ROUNDED':
      case 'THUMBNAIL':
      case 'MEMO':
        shape = self.shape('rect', {
          x: sourceX - sourceW / 2,
          y: sourceY - sourceH / 2,
          width: sourceW,
          height: sourceH});
        overlays1 = self.intersect(shape, path);
        break;
      case 'ELLIPSE':
        shape = self.shape('ellipse', {
          cx: sourceX,
          cy: sourceY,
          rx: sourceW / 2,
          ry: sourceH / 2
        });
        overlays1 = self.intersect(shape, path);
        break;
      case 'CIRCLE':
        shape = self.shape('circle', {
          cx: sourceX,
          cy: sourceY,
          r: sourceRadius
        });
        overlays1 = self.intersect(shape, path);
        break;
      default:
        shape = self.shape('rect', {
          x: sourceX - sourceW / 2,
          y: sourceY - sourceH / 2,
          width: sourceW,
          height: sourceH
        });
        overlays1 = self.intersect(shape, path);
    }
    if (overlays1 && overlays1.points && overlays1.points.length > 0) {
      intersections.push(overlays1.points[0]);
    } else {
      intersections.push({x: mid.x, y: mid.y});
    }

    switch (targetShape) {
      case 'RECTANGLE':
      case 'ROUNDED':
      case 'THUMBNAIL':
      case 'MEMO':
        shape = self.shape('rect', {
          x: targetX - targetW / 2,
          y: targetY - targetH / 2,
          width: targetW,
          height: targetH
        });
        overlays2 = self.intersect(shape, path);
        break;
      case 'ELLIPSE':
        shape = self.shape('ellipse', {cx: targetX, cy: targetY, rx: targetW / 2, ry: targetH / 2});
        overlays2 = self.intersect(shape, path);
        break;
      case 'CIRCLE':
        shape = self.shape('circle', {cx: targetX, cy: targetY, r: targetRadius});
        overlays2 = self.intersect(shape, path);
        break;
      default:
        shape = self.shape('rect', {
          x: targetX - targetW / 2,
          y: targetY - targetH / 2,
          width: targetW,
          height: targetH
        });
        overlays2 = self.intersect(shape, path);
    }

    if (overlays2 && overlays2.points && overlays2.points.length > 0) {
      intersections.push(overlays2.points[0]);
    } else {
      intersections.push({x: mid.x, y: mid.y});
    }

    if (link.straight) {
      pathString =
        'M' + [intersections[0].x, intersections[0].y] +
        ' L' + [intersections[1].x, intersections[1].y]; // + ' Z';
      link.x = Math.round((intersections[0].x + intersections[1].x) / 2);
      link.y = Math.round((intersections[0].y + intersections[1].y) / 2);
    } else {
      points = [
        {x: intersections[0].x, y: intersections[0].y},
        {x: mid.x, y: mid.y},
        {x: intersections[1].x, y: intersections[1].y}
      ];
      pathString = self.points2pathString(points);
      if (!pathString) { return; }
    }
    link.path = pathString;

    util.appendBy_id(globals.graph.links, link);

    let
      linkEl = document.getElementById(link._id),
      pathEl, markerEl;
    if (linkEl) {
      pathEl = linkEl && linkEl.querySelector('path.Path'),
      markerEl = linkEl && linkEl.querySelector('path.Marker');
    } else {
      if ('simulation' === globals.status.canvasId && link.visible && !globals.status.PreSearch) {
        const d3link = d3.select('g#simulation').append('g')
            .attr('class', 'link')
            .attr('id', link._id)
            .datum(d => link);
        d3link.append('path')
            .attr('class', 'Path')
            .attr('fill', 'none')
            .attr('opacity', 1)
            .attr('fill', link.color)
            .attr('stroke', link.color)
            .attr('stroke-width', link.size);
        d3link.append('path')
            .attr('class', 'Marker')
            .attr('fill', link.color)
            .attr('stroke', link.color)
            .attr('stroke-width', link.size);
        linkEl = document.getElementById(link._id);
        pathEl = linkEl && linkEl.querySelector('path.Path');
        markerEl = linkEl && linkEl.querySelector('path.Marker');
      } else {
        return null;
      }
    }
    let
      pathLength,
      P1, P2, alpha,
      marker_path, marker_transform;
    if (!pathEl) { return; }
    pathEl.setAttribute('d', link.path);
    pathEl.setAttribute('fill', 'none');
    pathEl.setAttribute('stroke', color);
    pathLength = (<SVGPathElement>pathEl).getTotalLength();
    P1 = (<SVGPathElement>pathEl).getPointAtLength(pathLength);
    if (pathLength > ref1 * 2) {
      P2 = (<SVGPathElement>pathEl).getPointAtLength(pathLength - ref1);
      alpha = 180 * Math.atan2(P1.y - P2.y, P1.x - P2.x) / Math.PI;
      marker_path = 'M0,0 L-' + ref1 + ', -' + ref2 + ' V' + ref2 + ' Z';
      marker_transform = 'translate(' + P1.x + ', ' + P1.y + ') rotate(' + alpha + ') ';
    } else {
      marker_path = 'M0,0 L0,1 Z';
      marker_transform = 'translate(' + P1.x + ', ' + P1.y + ')';
    }
    link.marker_path = marker_path;
    link.marker_transform = marker_transform;
    markerEl.setAttribute('d', link.marker_path);
    markerEl.setAttribute('fill', color);
    markerEl.setAttribute('stroke', color);
    markerEl.setAttribute('transform', link.marker_transform);

    return link;
  }

  pathString2points = (pathString) => {
    if (!pathString) {
      return null;
    }
    const
       util = this.util;
    let
      array, array2, array3,
      x1, y1, xC, yC, x, y, x2, y2,
      result;
    if (pathString.indexOf('Q') > 0) {
      // M x1 y1 Q xC yC x2 y2
      // x = xC/2 + (x1 + x2)/4; y = yC/2 + (y1 + y2)/4;
      // [[x1, y1], [x, y], [x2, y2]]
      array = pathString.split('Q');
      array2 = array[0].substr(1).trim().split(/[,\s]/);
      x1 = util.precisionRound(+array2[0], 3);
      y1 = util.precisionRound(+array2[1], 3);
      array3 = array[1].trim().split(/[,\s]/);
      xC = util.precisionRound(+array3[0], 3);
      yC = util.precisionRound(+array3[1], 3);
      x2 = util.precisionRound(+array3[2], 3);
      y2 = util.precisionRound(+array3[3], 3);
      x = util.precisionRound(xC / 2 + (x1 + x2) / 4, 3);
      y = util.precisionRound(yC / 2 + (y1 + y2) / 4, 3);
      result = [{x: x1, y: y1}, {x: x, y: y}, {x: x2, y: y2}];
      return result;
    } else if (pathString.indexOf('L') > 0) {
      // M x1 y1 L x2 y2
      // [[x1, y1], [x2, y2]]
      array = pathString.split('L');
      array2 = array[0].substr(1).trim().split(/[,\s]/);
      x1 = util.precisionRound(+array2[0], 3);
      y1 = util.precisionRound(+array2[1], 3);
      array3 = array[1].trim().split(/[,\s]/);
      x2 = util.precisionRound(+array3[0], 3);
      y2 = util.precisionRound(+array3[1], 3);
      result = [{x: x1, y: y1}, {x: x2, y: y2}];
      return result;
    }
    return null;
  }

  points2pathString = (points) => {
    const util = this.util;
    let
      x1, y1, x, y, x2, y2, // (x, y) is middle point
      xC, yC, result;
    if (3 === points.length) {
      // points = [[x1, y1], [x, y], [x2, y2]]
      // xC = 2*x - (x1 + x2)/2; yC = 2*y - (y1 + y2)/2;
      // result = M x1 y1 Q xC yC x2 y2
      x1 = util.precisionRound(points[0].x, 3);
      y1 = util.precisionRound(points[0].y, 3);
      x = util.precisionRound(points[1].x, 3);
      y = util.precisionRound(points[1].y, 3);
      x2 = util.precisionRound(points[2].x, 3);
      y2 = util.precisionRound(points[2].y, 3);
      xC = util.precisionRound(2 * x - (x1 + x2) / 2, 3);
      yC = util.precisionRound(2 * y - (y1 + y2) / 2, 3);
      result = 'M' + x1 + ',' + y1 + ' Q' + xC + ',' + yC + ' ' + x2 + ',' + y2;
      return result;
    } else if (2 === points.length) {
      // points = [[x1, y1], [x2, y2]]
      // result = M x1 y1 L x2 y2
      x1 = util.precisionRound(points[0].x, 3);
      y1 = util.precisionRound(points[0].y, 3);
      x2 = util.precisionRound(points[1].x, 3);
      y2 = util.precisionRound(points[1].y, 3);
      result = 'M' + x1 + ',' + y1 + ' L' + x2 + ',' + y2;
      return result;
    }
    return null;
  }

  /*points2BezierPoints = (points) => {
    let
      x1, y1, x, y, x2, y2, // (x, y) is middle point
      xC, yC, result;
    // points = [[x1, y1], [x, y], [x2, y2]]
    // xC = 2*x - (x1 + x2)/2; yC = 2*y - (y1 + y2)/2;
    // result = M x1 y1 Q xC yC x2 y2
    x1 = points[0].x;
    y1 = points[0].y;
    x  = points[1].x;
    y  = points[1].y;
    x2 = points[2].x;
    y2 = points[2].y;
    xC = 2 * x - (x1 + x2) / 2;
    yC = 2 * y - (y1 + y2) / 2;
    result = x1 + ',' + y1 + ',' + xC + ',' + yC + ',' + x2 + ',' + y2;
    return result;
  }*/

  updateLinkCount = () => {
    const
      self = this,
      nodes = globals.graph.nodes.filter(n => n.visible && !n.filterout);
    for (const node of nodes) {
      const
        linkCount = self.countHiddenLink(node),
        d3node = d3.select('g.node#' + node._id);
      if (d3node && d3node.node()) {
        node.linkCount = linkCount;
        const d3linkCount = d3node.select('.link-count');
        if (linkCount > 0) {
          d3linkCount.text(linkCount);
        } else {
          d3linkCount.text('');
        }
      }
    }
  }

  /**
   * LOAD/SAVE NOTE
   */
  initNote = () => {
    for (const idx in globals.nodeIndexer) { if (globals.nodeIndexer.hasOwnProperty(idx)) {
      delete globals.nodeIndexer[idx];
    }}
    for (const idx in globals.linkIndexer) { if (globals.linkIndexer.hasOwnProperty(idx)) {
      delete globals.linkIndexer[idx];
    }}
    for (const _id in globals.resources) { if (globals.resources.hasOwnProperty(_id)) {
      delete globals.resources[_id];
    }}
    for (const idx in globals.resourceIndexer) { if (globals.resourceIndexer.hasOwnProperty(idx)) {
      delete globals.resourceIndexer[idx];
    }}
    for (const _id in globals.annotations) { if (globals.annotations.hasOwnProperty(_id)) {
      delete globals.annotations[_id];
    }}
    for (const idx in globals.annotationIndexer) { if (globals.annotationIndexer.hasOwnProperty(idx)) {
      delete globals.annotationIndexer[idx];
    }}
    const _page = new Page({
      pp: 0,
      name: '',
      nodes: [],
      links: [],
      nodeIndexer: globals.nodeIndexer,
      linkIndexer: globals.linkIndexer,
      transform: { x: 0, y: 0, scale: 1 },
      thumbnail: null
    });
    const _note = new Note({
      _id: '_' + uuid.v4(),
      name: '',
      pages: [_page],
      currentPage: 0,
      resources: globals.resources,
      annotations: globals.annotations,
      resourceIndexer: globals.resourceIndexer,
      annotationIndexer: globals.annotationIndexer
    });
    return {
      note: _note,
      page: _page
    };
  }

  setNote = (note) => {
    this.initNote();
    const
      currentPage = note.currentPage,
      pages = note.pages,
      page = pages.filter(p => p.pp === currentPage)[0];
    globals.current.note_id = note._id;
    globals.current.note_name = note.name;
    globals.current.currentPage = currentPage;
    globals.current.page = page;
    globals.current.ownerId = note.creator_ref;
    for (const _id in note.resources) { if (note.resources.hasOwnProperty(_id)) {
      globals.resources[_id] = note.resources[_id];
    }}
    for (const idx in note.resourceIndexer) { if (note.resourceIndexer.hasOwnProperty(idx)) {
      globals.resourceIndexer[idx] = note.resourceIndexer[idx];
    }}
    for (const _id in note.annotations) { if (note.annotations.hasOwnProperty(_id)) {
      globals.annotations[_id] = note.annotations[_id];
    }}
    for (const idx in note.annotationIndexer) { if (note.annotationIndexer.hasOwnProperty(idx)) {
      globals.annotationIndexer[idx] = note.annotationIndexer[idx];
    }}
    const
      note_id = note._id,
      note_name = note.name,
      page_name = page.name,
      nodes = page.nodes,
      links = page.links;
    const _page = new Page({
      pp: currentPage,
      name: page_name || '',
      nodes: nodes,
      links: links,
      nodeIndexer: globals.nodeIndexer,
      linkIndexer: globals.linkIndexer,
      transform: { x: 0, y: 0, scale: 1 },
      thumbnail: null
    });
    const _note = this.NoteFactory(note);
    return {
      note: _note,
      page: _page
    };
  }

  /**
   * UNDO/REDO
   */
  saveCurrent = (map?) => {
    const
      self = this,
      util = self.util,
      note_id = globals.current.note_id,
      pp = globals.current.currentPage,
      user_id = self.user_id;
    let
      nodes, links, resources, annotations,
      resource, annotation,
      node_json, link_json, resource_json, annotation_json;
    if (map) {
      nodes = map.node || [],
      links = map.link || [],
      resources = map.resource || [],
      annotations = map.annotation || [];
    } else {
      nodes = globals.graph.nodes,
      links = globals.graph.links,
      resources = globals.resources,
      annotations = globals.annotations;
    }
    globals.previous.nodes = {};
    globals.previous.links = {};
    globals.previous.resources = {};
    globals.previous.annotations = {};
    for (const node of nodes) {
      if (node._id) {
        node_json = JSON.stringify(node);
        globals.previous.nodes[node._id] = node_json;
      }
    }

    for (const link of links) {
      if (link._id) {
        link_json = JSON.stringify(link);
        globals.previous.links[link._id] = link_json;
      }
    }

    for (const _id in resources) {
      if (resources.hasOwnProperty(_id)) {
        resource = resources[_id];
        if (resource) {
          resource_json = JSON.stringify(resource);
          globals.previous.resources[resource._id] = resource_json;
        }
      }
    }

    for (const _id in annotations) {
        if (annotations.hasOwnProperty(_id)) {
        annotation = annotations[_id];
        if (annotation) {
          annotation_json = JSON.stringify(annotation);
          globals.previous.annotations[annotation._id] = annotation_json;
        }
      }
    }
  }

  recordState = logRecord => {
    const
      self = this,
      util = self.util;
    if (!logRecord) {
      return null;
    }
    /* Update Matrix
     *           prevNodes prevResources nodes resources
     *           _id        index         _id    index
     * --------------------------------------------------
     * Add       null      null          Y     Y    (a)
     * Move      Y         null          Y     null (b)
     * Show/Hide Y         null          Y     null (c)
     * ---------------------------------------------------
     * Change    null      Y             null  Y    (d)
     * Remove    Y         Y             null  null (e)
     *
     * op: command({code, label}),
     * pid: projectid,
     * uid: user_id,
     * pp: page number,
     * previous: {
     *   resources: { _id: previous_resource, ... },
     *   nodes: { _id: previous_node, ... }
     * },
     * updated: {
     *   resources: { _id: resource, ... },
     *   nodes: { _id: node, ... }
     * }
     */
    let
      uid,
      pp,
      updated,
      length,
      logJSON;

    uid = logRecord.user_id;
    pp = logRecord.pp;
    updated = logRecord.updated;

    if (!globals.log[pp]) {
      globals.log[pp] = [];
    }

    length = globals.log[pp].length;
    if (length === globals.MAX_LOG) {
      globals.log[pp].shift();
    }

    logJSON = JSON.stringify(logRecord);
    if (logJSON !== globals.log[pp][length - 1]) {
      globals.log[pp].push(logJSON);
    }
  }

  createLogrecord = function  (item) {
    const
      self = this,
      // util = self.util,
      note_id = globals.current.note_id,
      pp = globals.current.currentPage,
      user_id = self.user_id,
      command = item.command,
      param = item.param,
      paramNodes = param.node || [],
      paramLinks = param.link || [],
      paramResources = param.resource || [],
      paramAnnotations = param.annotation || [],
      // graph = globals.graph,
      // nodes = graph.nodes,
      // links = graph.links,
      // resources = globals.resources,
      // annotations = globals.annotations,
      updatedNodes = {},
      updatedLinks = {},
      updatedResources = {},
      updatedAnnotations = {},
      previousNodes = {},
      previousLinks = {},
      previousResources = {},
      previousAnnotations = {};


    // START
    for (const node of paramNodes) {
      if (node) {
        const
          _id = node._id,
          _node = globals.previous.nodes[_id];
        if (_node) {
          previousNodes[_id] = JSON.parse(_node);
        } else {
          previousNodes[_id] = null;
        }
        updatedNodes[_id] = node; // globals.graph.nodes[_id] || null;
      }
    }
    for (const link of paramLinks) {
      if (link) {
        const
          _id = link._id,
          _link = globals.previous.links[_id];
        if (_link) {
          previousLinks[_id] = JSON.parse(_link);
        } else {
          previousLinks[_id] = null;
        }
        updatedLinks[_id] = link; // globals.graph.links[_id] || null;
      }
    }
    for (const resource of paramResources) {
      if (resource) {
        const
          _id = resource._id,
          _resource = globals.previous.resources[_id];
        if (_resource) {
          previousResources[_id] = JSON.parse(_resource);
        } else {
          previousResources[_id] = null;
        }
        updatedResources[_id] = resource; // globals.resources[_id] || null;
      }
    }
    for (const annotation of paramAnnotations) {
      if (annotation) {
        const
          _id = annotation._id,
          _annotation = globals.previous.annotations[_id];
        if (_annotation) {
          previousAnnotations[_id] = JSON.parse(_annotation);
        } else {
          previousAnnotations[_id] = null;
        }
        updatedAnnotations[_id] = annotation; // globals.annotations[_id] || null;
      }
    }

    const updateRecord = {
      'op': self.opLabel(command),
      'note_id': note_id,
      'user_id': user_id,
      'pp': pp,
      'previous': {
        'nodes': previousNodes,
        'links': previousLinks,
        'resources': previousResources,
        'annotations': previousAnnotations
      },
      'updated': {
        'nodes': updatedNodes,
        'links': updatedLinks,
        'resources': updatedResources,
        'annotations': updatedAnnotations
      }
    };
    return updateRecord;
  };

  storeLog = function (item) {
    if (!item || !item.command) {
      return;
    }
    const
      self = this,
      command = item.command;
    const pp = globals.current.currentPage;
    if ('DELETE' === command) { // delete log records
      self.log[pp] = [];
      self.redolog[pp] = [];
      return;
    }
    const logRecord = self.createLogrecord(item);
    self.recordState(logRecord);
  };

  opLabel = function (label) {
    function parseLabel(text) {
      /** cf. http://stackoverflow.com/questions/7225407/convert-camelcasetext-to-camel-case-text
       */
      const result = text.replace(/([A-Z]+)/g, " $1").replace(/([A-Z][a-z])/g, " $1");
      const finalResult = result.charAt(0).toUpperCase() + result.slice(1);
      /** capitalize the first letter - as an example.
       */
      return finalResult;
    }
    label = globals.nls.LANG
      ? _transform(label, globals.nls.LANG)
      : parseLabel(label);
    return label;
  };

  logTop = function (log) {
    if (log && log.length > 0) {
      return log[log.length - 1];
    }
    return null;
  };

  logDateString = function () {
    const d = new Date();
    function pad(n) {
      return n < 10 ? '0' + n : n;
    }
    return d.getUTCFullYear() + '-' + pad(d.getUTCMonth() + 1) + '-' + pad(d.getUTCDate()) +
      'T' + pad(d.getUTCHours()) + ':' + pad(d.getUTCMinutes()) + ':' + pad(d.getUTCSeconds()) + 'Z';
  };

  undoState = function () {
    /* op,
     * note_id,
     * user_id,
     * pp,
     * previous: {
     *   resources: { _id: previous_resource, ... },
     *   nodes: { _id: previous_node, ... }
     *   annotations: { _id: previous_annotation, ... },
     *   links: { _id: previous_link, ... }
     * },
     * updated: {
     *   resources: { _id: resource, ... },
     *   nodes: { _id: node, ... }
     *   annotations: { _id: annotation, ... },
     *   links: { _id: link, ... }
     * }
     */
    const
      self = this,
      util = self.util,
      note_id = globals.current.note_id,
      pp = globals.current.currentPage,
      user_id = self.user_id,
      previousResources = {},
      previousNodes = {},
      updatedResources = {},
      updatedNodes = {},
      previousAnnotations = {},
      previousLinks = {},
      updatedAnnotations = {},
      updatedLinks = {};
    let
      logRecord,
      length,
      pid, uid,
      newResource, newNode,
      updatedResource, updatedNode;

    const logJSON = globals.log[pp].pop();
    logRecord = JSON.parse(logJSON);
    if (logRecord === undefined) {
      return;
    }

    if (!globals.redoLog[pp]) {
      globals.redoLog[pp] = [];
    }

    length = globals.redoLog[pp].length;
    if (length === globals.MAX_LOG) {
      globals.redoLog[pp].shift();
    }
    globals.redoLog[pp].push(logJSON);

    pid = logRecord.note_id;
    uid = logRecord.user_id;

   // logRecord
    for (const _id in logRecord.previous.nodes) {
      if (logRecord.previous.nodes.hasOwnProperty(_id)) {
        const node = logRecord.previous.nodes[_id];
        previousNodes[_id] = node;
        updatedNodes[_id] = null;
      }
    }
    for (const _id in logRecord.updated.nodes) {
      if (logRecord.updated.nodes.hasOwnProperty(_id)) {
        const node = logRecord.updated.nodes[_id];
        if (!previousNodes[_id]) {
          previousNodes[_id] = null;
        }
        updatedNodes[_id] = node;
      }
    }
    for (const _id in logRecord.previous.links) {
      if (logRecord.previous.links.hasOwnProperty(_id)) {
        const link = logRecord.previous.links[_id];
        previousLinks[_id] = link;
        updatedLinks[_id] = null;
      }
    }
    for (const _id in logRecord.updated.links) {
      if (logRecord.updated.links.hasOwnProperty(_id)) {
        const link = logRecord.updated.links[_id];
        if (!previousLinks[_id]) {
          previousLinks[_id] = null;
        }
        updatedLinks[_id] = link;
      }
    }
    for (const _id in logRecord.previous.resources) {
      if (logRecord.previous.resources.hasOwnProperty(_id)) {
        const resource = logRecord.previous.resources[_id];
        previousResources[_id] = resource;
        updatedResources[_id] = null;
      }
    }
    for (const _id in logRecord.updated.resources) {
      if (logRecord.updated.resources.hasOwnProperty(_id)) {
        const resource = logRecord.updated.resources[_id];
        if (!previousResources[_id]) {
          previousResources[_id] = null;
        }
        updatedResources[_id] = resource;
      }
    }
    for (const _id in logRecord.previous.annotations) {
      if (logRecord.previous.annotations.hasOwnProperty(_id)) {
        const annotation = logRecord.previous.annotations[_id];
        previousAnnotations[_id] = annotation;
        updatedAnnotations[_id] = null;
      }
    }
    for (const _id in logRecord.updated.annotations) {
      if (logRecord.updated.annotations.hasOwnProperty(_id)) {
        const annotation = logRecord.updated.annotations[_id];
        if (!previousAnnotations[_id]) {
          previousAnnotations[_id] = null;
        }
        updatedAnnotations[_id] = annotation;
      }
    }

    /** Update Matrix
     *           prevNodes prevResources  updatedNodes updatedResources
     *           node      resource       newNode      newResource
     *           _id        index          _id           index         node resource
     * ---------------------------------------------------------------------------
     * Add       null      null           Y            Y       (a)    x    x
     * Remove    Y         Y              null         null    (e)    x    x
     * ---------------------------------------------------------------------------
     * Move      Y         null           Y            null    (b)    x    -
     * Show/Hide Y         null           Y            null    (c)    x    -
     * ---------------------------------------------------------------------------
     * Change    null      Y              null         Y       (d)    -    x
     *
     * Resource
     * updated ---> previous resource
     */
    for (const _id in previousResources) {
      if (previousResources.hasOwnProperty(_id)) {
        const
          _resource = previousResources[_id],
          resource = _resource ? self.ResourceFactory(_resource) : null;
        if (!resource) { // (a) Add --> Remove
          newResource = updatedResources[_id];
          if (newResource) {
            self.deleteResource({ _id: _id });
          }
        } else { // (d) Change, (e) Remove
          resource.changed = true;
          updatedResource = updatedResources[_id];
          if (updatedResource) { // (d) Change
            self.updateResource(resource);
          } else { // (e) Remove ---> Add
            self.createResource(resource);
          }
        }
      }
    }
    /** Node
     * updated ---> previous node
     */
    for (const _id in previousNodes) {
      if (previousNodes.hasOwnProperty(_id)) {
        const
          _node = previousNodes[_id],
          node = _node ? self.NodeFactory(_node) : null;
        if (!node) { // (a) Add ---> Remove
          newNode = updatedNodes[_id];
          if (newNode) {
            self.removeNode({ _id: _id });
          }
        } else {
          node.changed = true;
          updatedNode = updatedNodes[_id];
          if (updatedNode) { // (b) Move (c) Show/Hide
            self.updateNode(node);
            /*self.messageService.updateModel(JSON.stringify({
              command: 'update',
              param: {
                node: node
              }
            }));*/
          } else { // (e) Remove ---> Add
            self.createNode(node);
          }
        }
      }
    }
    /** Annotation
     * updated ---> previous annotation
     */
    for (const _id in previousAnnotations) {
      if (previousAnnotations.hasOwnProperty(_id)) {
        const
          _annotation = previousAnnotations[_id],
          annotation = _annotation ? self.AnnotationFactory(_annotation) : null;
        if (!annotation) { // (a) Add --> Remove
          const newAnnotation = updatedAnnotations[_id];
          if (newAnnotation) {
            self.deleteAnnotation({ _id: _id });
          }
        } else { // (d) Change, (e) Remove
          annotation.changed = true;
          const updatedAnnotation = updatedAnnotations[_id];
          if (updatedAnnotation) { // (d) Change
            self.updateAnnotation(annotation);
          } else { // (e) Remove ---> Add
            self.createAnnotation(annotation);
          }
        }
      }
    }
    /** Link
     * updated ---> previous link
     */
    for (const _id in previousLinks) {
      if (previousLinks.hasOwnProperty(_id)) {
        const
          _link = previousLinks[_id],
          link = self.LinkFactory(_link);
        if (!link) { // (a) Add ---> Remove
          const newLink = updatedLinks[_id];
          if (newLink) {
            self.removeLink(_id);
          }
        } else {
          const _id = link._id;
          link.changed = true;
          const updatedLink = updatedLinks[_id];
          if (updatedLink) { // (b) Move (c) Show/Hide
            self.renderLink(link);
            /*self.messageService.updateModel(JSON.stringify({
              command: 'update',
              param: {
                link: link
              }
            }));*/
          } else { // (e) Remove ---> Add
            self.createLink(link);
          }
        }
      }
    }
    self.updateLinkCount();
  };

  redoState = function () {
    /* op: command,
     * pid: projectid,
     * uid: user_id,
     * pp: page number,
     * previous: {
     *   resources: { _id: previous_resource },
     *   nodes: { _id: previous_node }
     * },
     * updated: {
     *   resources: { _id: resource, ... },
     *   nodes: { _id: node, ... }
     * }
     */
    const
      self = this,
      util = self.util,
      note_id = globals.current.note_id,
      pp = globals.current.currentPage,
      user_id = self.user_id,
      previousResources = {},
      previousNodes = {},
      updatedResources = {},
      updatedNodes = {},
      previousAnnotations = {},
      previousLinks = {},
      updatedAnnotations = {},
      updatedLinks = {},
      undoRecord = {};
    let
      logJSON,  logRecord,
      length,
      pid, uid;

    logJSON = globals.redoLog[pp].pop();
    logRecord = JSON.parse(logJSON);

    if (logRecord === undefined) { return; }

    util.copyObject(logRecord, undoRecord);

    length = globals.log[pp].length;
    if (length === globals.MAX_LOG) {
      globals.log[pp].shift();
    }

    globals.log[pp].push(logJSON); // undoRecord);
    pid = logRecord.pid;
    uid = logRecord.uid;

    /** logRecord resource & node
     */
    for (const _id in logRecord.previous.nodes) {
      if (logRecord.previous.nodes.hasOwnProperty(_id)) {
        const node = logRecord.previous.nodes[_id];
        previousNodes[_id] = node;
        updatedNodes[_id] = null;
      }
    }
    for (const _id in logRecord.updated.nodes) {
      if (logRecord.updated.nodes.hasOwnProperty(_id)) {
        if (!previousNodes[_id]) {
          previousNodes[_id] = null;
        }
        const node = logRecord.updated.nodes[_id];
        updatedNodes[_id] = node;
      }
    }
    for (const _id in logRecord.previous.resources) {
      if (logRecord.previous.resources.hasOwnProperty(_id)) {
        const resource = logRecord.previous.resources[_id];
        previousResources[_id] = resource;
        updatedResources[_id] = null;
      }
    }
    for (const _id in logRecord.updated.resources) {
      if (logRecord.updated.resources.hasOwnProperty(_id)) {
        if (!previousResources[_id]) {
          previousResources[_id] = null;
        }
        const resource = logRecord.updated.resources[_id];
        updatedResources[_id] = resource;
      }
    }
    /** logRecord annotation & link
     */
    for (const _id in logRecord.previous.links) {
      if (logRecord.previous.links.hasOwnProperty(_id)) {
        const link = logRecord.previous.links[_id];
        previousLinks[_id] = link;
        updatedLinks[_id] = null;
      }
    }
    for (const _id in logRecord.updated.links) {
      if (logRecord.updated.links.hasOwnProperty(_id)) {
        if (!previousLinks[_id]) {
          previousLinks[_id] = null;
        }
        const link = logRecord.updated.links[_id];
        updatedLinks[_id] = link;
      }
    }
    for (const _id in logRecord.previous.annotations) {
      if (logRecord.previous.annotations.hasOwnProperty(_id)) {
        const annotation = logRecord.previous.annotations[_id];
        previousAnnotations[_id] = annotation;
        updatedAnnotations[_id] = null;
      }
    }
    for (const _id in logRecord.updated.annotations) {
      if (logRecord.updated.annotations.hasOwnProperty(_id)) {
        if (!previousAnnotations[_id]) {
          previousAnnotations[_id] = null;
        }
        const annotation = logRecord.updated.annotations[_id];
        updatedAnnotations[_id] = annotation;
      }
    }

    /* Update Matrix              ----->
     *           prevNodes prevResources  updatedNodes updatedResources
     *           prevNode  prevResource   node         resource
     *           _id        index          _id           index        node resource
     * --------------------------------------------------------------------------
     * Add       null      null           Y            Y       (a)   x    x
     * Remove    Y         Y              null         null    (e)   x    x
     * --------------------------------------------------------------------------
     * Move      Y         null           Y            null    (b)   x    -
     * Show/Hide Y         null           Y            null    (c)   x    -
     * --------------------------------------------------------------------------
     * Change    null      Y              null         Y       (d)   -    x
     *
     * Resource
     * previous ---> updated resource
     */
    for (const _id in updatedResources) {
      if (updatedResources.hasOwnProperty(_id)) {
        const
          _resource = updatedResources[_id],
          resource = _resource ? self.ResourceFactory(_resource) : null, // element.data;
          prevResource = previousResources[_id];
        if (!prevResource) { // (a) Add
          if (resource) {
            self.createResource(resource);
          }
        } else { // (d) Change, (e) Remove
          if (resource) { // (d) Change
            self.updateResource(resource);
          } else { // (e) Remove, resource is Empty
            self.deleteResource({ _id: _id });
          }
        }
      }
    }
    /** Node
     * previous ---> updated node
     */
    for (const _id in updatedNodes) {
      if (updatedNodes.hasOwnProperty(_id)) {
        const
          _node = updatedNodes[_id],
          node = _node ? self.NodeFactory(_node) : null, // element.data;
          prevNode = previousNodes[_id];
        if (!prevNode) { // (a) Add
          if (node) {
            self.createNode(node);
          }
        } else { // prevNode is not empty.
          if (node) { // (b) Move (c) Show/Hide
            self.updateNode(node);
            /*self.messageService.updateModel(JSON.stringify({
              command: 'update',
              param: {
                node: node
              }
            }));*/
          } else { // (e) Remove, node is Empty
            self.removeNode({ _id: _id });
          }
        }
      }
    }
    /** Annotation
     * previous ---> updated annotation
     */
    for (const _id in updatedAnnotations) {
      if (updatedAnnotations.hasOwnProperty(_id)) {
        const
          _annotation = updatedAnnotations[_id],
          annotation = _annotation ? self.AnnotationFactory(_annotation) : null, // element.data;
          prevAnnotation = previousAnnotations[_id];
        if (!prevAnnotation) { // (a) Add
          if (annotation) {
            self.createAnnotation(annotation);
          }
        } else { // (d) Change, (e) Remove
          if (annotation) { // (d) Change
            self.updateAnnotation(annotation);
          } else { // (e) Remove, annotation is Empty
            self.deleteAnnotation({ _id: _id });
          }
        }
      }
    }
    /** Link
     * previous ---> updated link
     */
    for (const _id in updatedLinks) {
      if (updatedLinks.hasOwnProperty(_id)) {
        const
          _link = updatedLinks[_id],
          link = _link ? self.LinkFactory(_link) : null, // element.data;
          prevLink = previousLinks[_id];
        if (!prevLink) { // (a) Add
          if (link) {
            self.createLink(link);
          }
        } else { // prevLink is not empty.
          if (link) { // (b) Move (c) Show/Hide
            self.renderLink(link);
            /*self.messageService.updateModel(JSON.stringify({
              command: 'update',
              param: {
                link: link
              }
            }));*/
          } else { // (e) Remove, link is Empty
            self.removeLink(_id);
          }
        }
      }
    }
    self.updateLinkCount();
  };

}
