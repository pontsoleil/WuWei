import {
  Component,
  Input,
  OnInit,
  AfterViewInit,
  ViewChild
} from '@angular/core';
// import { MatSnackBar } from '@angular/material';
// import { ToastComponent } from '../shared/toast/toast.component';
import { Http } from '@angular/http';
import { Subscription } from 'rxjs/Subscription';
import { ToastService } from '../mdb-type/pro/alerts';
import {
  NodeService,
  LinkService,
  MessageService,
  ResourceService,
  AnnotationService,
  NoteService
} from '../services';
import {
  Annotation,
  Link,
  Node,
  Note,
  Page,
  Resource,
  WuweiModel
} from '../model';

import * as globals from '../model/wuwei-globals';
import { GraphComponent } from './visuals/graph';
import { FilterComponent } from '../filter';
import { SearchComponent } from '../search';
import { InfoComponent } from '../info';
import { EditComponent } from '../edit';
import { MenuComponent } from '../menu';
import { CONF } from 'assets/config/environment.host';
import * as d3 from 'd3';
import * as uuid from 'uuid';

import {
  CognitoUserService,
  WpUserService,
  WuweiService
} from '../services';
import { LibraryService } from '../googleBook';

// import CONFIG from './draw.config';
import DATA from '../simulate/shared/test-data';

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

@Component({
  selector: 'app-draw',
  templateUrl: './draw.component.html',
  styleUrls: ['./draw.component.scss']
})
export class DrawComponent implements OnInit, AfterViewInit {

  @ViewChild(FilterComponent) filterComponent: FilterComponent;
  @ViewChild(SearchComponent) searchComponent: SearchComponent;
  @ViewChild(GraphComponent) graphComponent: GraphComponent;
  @ViewChild(InfoComponent) infoComponent: InfoComponent;
  @ViewChild(EditComponent) editComponent: EditComponent;
  @ViewChild(MenuComponent) menuComponent: MenuComponent;

  CD1Window = null; // Open window
  CD2Window = null;

  subscription: Subscription;

  private nodeService: NodeService;
  private linkService: LinkService;
  private resourceService: ResourceService;
  private annotationService: AnnotationService;

  note: Note;
  page: Page;

  nodes: Node[] = [];
  links: Link[] = [];

  selectedNode: Node;
  selectedResource: Resource;

  editingNode: Node;
  editingResource: Resource;

  searching = false;
  filtering = false;

  ngOnInit() {
    const map = this.model.initNote();
    this.note = map.note;
    this.page = map.page;
  }

  ngAfterViewInit() {
    globals.status.svgId = 'graph';
    globals.status.canvasId = 'draw';
  }

  constructor(
    private http: Http,
    private toast: ToastService,
    private auth: WpUserService,
    private util: WuweiService,
    private model: WuweiModel,
    private messageService: MessageService,
    private libraryService: LibraryService
  ) {
    const self = this;

    this.nodeService = new NodeService(http, model);
    this.linkService = new LinkService(http, model);
    this.resourceService = new ResourceService(http, model);
    this.annotationService = new AnnotationService(http, model);

    this.initNote();

    this.subscription = messageService.modelUpdate$.subscribe(
      json => {
        const
          self = this,
          parsed = JSON.parse(json),
          command = parsed.command,
          param = parsed.param,
          node = param.node,
          resource = param.resource,
          link = param.link,
          annotation = param.annotation;
        if ('update' === command) {
          self.refresh();
        }
      },
      err => {
        alert('DrawComponent' + JSON.stringify(err));
      }
    );

    this.subscription = messageService.screenRefresh$.subscribe(
      json => {
        const
          self = this,
          parsed = JSON.parse(json),
          command = parsed.command;
        if (command && 'refreshScreen' === command) {
          self.refresh();
        }
      },
      err => {
        alert('DrawComponent' + JSON.stringify(err));
      }
    );
  }

  testDraw = () => {
    const
      self = this,
      model = self.model,
      nodeService = self.nodeService,
      linkService = self.linkService,
      resourceService = self.resourceService,
      annotationService = self.annotationService;
    /*if (globals.graph.nodes.length > 0) {
      globals.graph.nodes.map(node => {
        const resource = model.findResourceById(node.idx);
        model.addNode({node: node, resource: resource});
      });
      globals.graph.links.map(link => {
        const annotation = model.findAnnotationById(link.idx);
        model.addLink({link: link, annotation: annotation});
      });
      return;
    }*/
    const
      a = <{node: Node, resource: Resource}>model.addSimpleTopic(),
      aNode = a.node,
      aResource = a.resource;
    aNode.shape = 'CIRCLE';
    aNode.size = {
      radius: 24
    };
    aNode.color = '#87CEEB';
    aNode.label = 'A';
    aResource.name = aNode.label;
    aResource.type = 'TextualBody';
    aResource.value = '';

    const
      b = <{node: Node, resource: Resource}>model.addSimpleContent(),
      bNode = b.node,
      bResource = b.resource;
    bNode.shape = 'THUMBNAIL';
    bNode.size = {
      width: globals.defaultSize.width,
      height: globals.defaultSize.width
    };
    // bNode.color = 'lime';
    bNode.label = '国家';
    bNode.thumbnail = 'http://books.google.com/books/content?id=hC9UQQAACAAJ&printsec=frontcover&img=1&zoom=1&imgtk=AFLRE71K2QIkZTGfybx80qh6SnDN7qbV3KDzKEV8i-GQcYzR2WJpjqFf63rqSvf830Q-KeN4IPLwy5zhrSjU4fgs7QSGAKYLtM_bMLYwcaHB-1CUsZ8iozCNp9bAEyH-Ba5A03v2PiWz&source=gbs_api';
    bNode.description = 'ソクラテスの口を通じて語られた理想国における哲人統治の主張にひきつづき対話は更に展開する。では、その任に当る哲学者は何を学ぶべきか。この問いに対して善のイデアとそこに至る哲学的認識の在り方があの名高い「太陽」「線分」「洞窟」の比喩によって説かれ、終極のところ正義こそが人間を幸福にするのだと結論される。';
    bResource.name = '国家';
    bResource.id = '/assets/『夢十夜』.pdf';
    bResource.thumbnail = 'http://books.google.com/books/content?id=hC9UQQAACAAJ&printsec=frontcover&img=1&zoom=1&imgtk=AFLRE71K2QIkZTGfybx80qh6SnDN7qbV3KDzKEV8i-GQcYzR2WJpjqFf63rqSvf830Q-KeN4IPLwy5zhrSjU4fgs7QSGAKYLtM_bMLYwcaHB-1CUsZ8iozCNp9bAEyH-Ba5A03v2PiWz&source=gbs_api';
    bResource.type = 'Book';
    bResource.value = 'ソクラテスの口を通じて語られた理想国における哲人統治の主張にひきつづき対話は更に展開する。では、その任に当る哲学者は何を学ぶべきか。この問いに対して善のイデアとそこに至る哲学的認識の在り方があの名高い「太陽」「線分」「洞窟」の比喩によって説かれ、終極のところ正義こそが人間を幸福にするのだと結論される。';
    bResource.format = 'n/a';
    bResource.creator = 'プラトン';
    bResource.generator = '岩波書店';

    const
      c = <{node: Node, resource: Resource}>model.addSimpleTopic(),
      cNode = c.node,
      cResource = c.resource;
    cNode.shape = 'ELLIPSE';
    cNode.size = {
      width: 100,
      height: 40
    };
    cNode.color = '#FFFF00';
    cNode.label = 'C';
    cResource.name = cNode.label;
    cResource.type = 'TextualBody';
    cResource.value = '';

    const
      d = <{node: Node, resource: Resource}>model.addSimpleMemo(),
      dNode = d.node,
      dResource = d.resource;
    dNode.description = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec in arcu diam. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Sed sit amet urna velit. Duis tempor sit amet quam elementum tincidunt. Etiam nisi tellus, condimentum ac nunc sed, efficitur accumsan diam. Maecenas et ex ut tortor faucibus euismod et vel lectus. Suspendisse sagittis commodo nisl, a dictum elit convallis non. Fusce vitae magna quis lectus luctus volutpat. Nam mattis, nisi a commodo maximus, mauris augue scelerisque arcu, nec gravida tellus leo eget augue.';
    dResource.value = '<h3>Lorem ipsum</h3><p>dolor sit amet, consectetur adipiscing elit. Donec in arcu diam.</p><p>Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Sed sit amet urna velit. Duis tempor sit amet quam elementum tincidunt. Etiam nisi tellus, condimentum ac nunc sed, efficitur accumsan diam. Maecenas et ex ut tortor faucibus euismod et vel lectus. Suspendisse sagittis commodo nisl, a dictum elit convallis non. Fusce vitae magna quis lectus luctus volutpat. Nam mattis, nisi a commodo maximus, mauris augue scelerisque arcu, nec gravida tellus leo eget augue.</p>';

    const
      e = this.addYouTube(DATA.youtube[1]),
      eNode = e.node,
      eResource = e.resource;

    aNode.visible = true;
    bNode.visible = true;
    cNode.visible = true;
    dNode.visible = true;
    eNode.visible = true;
    aNode.linkCount = 0;
    bNode.linkCount = 0;
    cNode.linkCount = 0;
    dNode.linkCount = 0;
    eNode.linkCount = 0;

    const
      a_b = <{link: Link, annotation: Annotation}>model.connect(aNode, bNode),
      a_c = <{link: Link, annotation: Annotation}>model.connect(aNode, cNode),
      a_d = <{link: Link, annotation: Annotation}>model.connect(aNode, dNode),
      b_c = <{link: Link, annotation: Annotation}>model.connect(bNode, cNode),
      b_e = <{link: Link, annotation: Annotation}>model.connect(bNode, eNode);
    a_b.link.visible = true;
    a_c.link.visible = true;
    a_d.link.visible = true;
    b_c.link.visible = true;
    b_e.link.visible = true;

    this.nodes = [];
    this.links = [];
    // setTimeout(() => {
    model.addNode({node: aNode, resource: aResource});
    // }, 2000);
    // setTimeout(() => {
    model.addNode({node: bNode, resource: bResource});
    model.addNode({node: cNode, resource: cResource});
    model.addLink({link: a_b.link, annotation: a_b.annotation});
    model.addLink({link: a_c.link, annotation: a_c.annotation});
    // }, 4000);
    // setTimeout(() => {
    model.addNode({node: dNode, resource: dResource});
    model.addLink({link: a_d.link, annotation: a_d.annotation});
    // }, 6000);
    // setTimeout(() => {
    model.addLink({link: b_c.link, annotation: b_c.annotation});
    // }, 9000);
    // setTimeout(() => {
    model.addNode({node: eNode, resource: eResource});
    model.addLink({link: b_e.link, annotation: b_e.annotation});

    this.refresh();
  }

/*  test = () => {
    const
      self = this,
      model = self.model,
      util = self.util;

      const
      _node = model.addSimpleContent(),
      node = _node.node,
      resource = _node.resource;

    const
      _node2 = model.addSimpleTopic(),
      node2 = _node2.node,
      resource2 = _node2.resource;

    node2.shape = 'ROUNDED';
    node2.size.rx = node2.size.height / 2;
    node2.size.ry = node2.size.height / 2;

    const
      _annotation = <{link: Link, annotation: Annotation}>model.connect(node._id, node2._id),
      link = _annotation.link,
      annotation = _annotation.annotation;

    const
      _node3 = model.addSimpleMemo(),
      node3 = _node3.node,
      resource3 = _node3.resource;

    util.appendBy_id(self.nodes, node);
    self.model.createNode(node);
    self.model.createResource(resource);

    util.appendBy_id(self.nodes, node2);
    self.model.createNode(node2);
    self.model.createResource(resource2);

    util.appendBy_id(self.links, link);
    self.model.createLink(link);
    self.model.createAnnotation(annotation);

    util.appendBy_id(self.nodes, node3);
    self.model.createNode(node3);
    self.model.createResource(resource3);
  }
*/

  initNote() {
    this.model.initNote();
    this.nodes = [];
    this.links = [];
  }

  loadNote(_note) {
    this.initNote();
    const
      map = this.model.setNote(_note);
    this.note = map.note;
    this.page = map.page;
    globals.graph.nodes = this.page.nodes.filter(n => undefined !== n.visible);
    globals.graph.links = this.page.links.filter(l => undefined !== l.visible);
    this.refresh();
  }

  infoOpen(param) {
    const
      self = this,
      model = self.model,
      type = param.type,
      _id = param._id;
    let node, resource;
    if ('node' === type) {
      node = model.findNodeBy_id(_id);
      resource = model.findResourceById(node.idx);
    } else {
      node = param.node;
      resource = param.resource;
    }
    self.editingNode = undefined; // *ngIf in template
    self.editingResource = undefined;
    let infoOpened = false;
    if (resource.id &&
        // resource.id.indexOf('http://localhost:4200') < 0 &&
        resource.id.indexOf(CONF.host) < 0) {
      self.openWindow(resource.id);
      infoOpened = true;
    }
    if (resource.value) {
      self.selectedNode = node; // *ngIf in template
      self.selectedResource = resource;
      infoOpened = true;
    }
    if (!infoOpened) {
      self.toastMessage('No additional information', 'info');
    }
  }

  editOpen(param, map) {
    const
      self = this,
      model = self.model,
      type = param.type;
    if ('node' === type) {
      const
        _id = param.node._id,
        node = model.findNodeBy_id(_id ),
        resource = model.findResourceById(node.idx),
        json = map;
      self.selectedNode = undefined; // *ngIf in template
      self.selectedResource = undefined;
      self.editingNode = node; // *ngIf in template
      self.editingResource = resource;
      setTimeout(() => {
        self.messageService.openEdit(json);
      }, 500);
    }
  }

  addYouTube(data) {
    if (!data) { return; }
    const
      self = this,
      model = self.model,
      nodeService = self.nodeService,
      resourceService = self.resourceService,
      r = this.model.addSimpleContent(),
      node = <Node>r.node,
      resource = <Resource>r.resource;
    if ('FROM_CEXT' === data.type) {
      const
        type = data.type,
        info = data.info,
        tab = data.tab;
      let isFavicon, code = '';
      resource.name = tab.title || info.selectionText || 'YouTube';
      let url = info.pageUrl || info.linkUrl || tab.url;
      url = url.replace(/ /g, '');
      if (url.indexOf('www.youtube.com') > 0) {
        if (url.indexOf('watch?v=')) {
          code = url.split('watch?v=')[1].split('&')[0];
        }
      }
      url = 'https://www.youtube.com/embed/' + code;
      // e.g.       https://youtu.be/sJl_sk8Jrm0
      if ( 0 === url.indexOf('https://youtu.be/')) {
        code = url.split('https://youtu.be/').pop();
        if (code) {
          url = 'https://www.youtube.com/embed/' + code;
        }
      }
      // url = 'http://wuwei.space/free/ba-simple-proxy.php?url=' + url + '&mode=native',
      resource.id = url;
      resource.value = info.selectionText || '';
      if (info.srcUrl) {
        url = info.srcUrl;
        resource.thumbnail = url.replace(/ /g, '');
        isFavicon = false;
      } else if (url) {
        // https://www.youtube.com/watch?v=7QW43tmTZGA&list=RD-qKy7qagHJw&index=3
        // https://i.ytimg.com/vi/7QW43tmTZGA/hqdefault.jpg
        if (code) {
          resource.thumbnail = 'https://i.ytimg.com/vi/' + code + '/hqdefault.jpg';
          isFavicon = false;
        } else {
          resource.thumbnail = 'https://s.ytimg.com/yts/img/favicon_32-vflOogEID.png';
          isFavicon = true;
        }
      } else {
        resource.thumbnail = 'https://s.ytimg.com/yts/img/favicon_32-vflOogEID.png';
        isFavicon = true;
      }
      resource.type = 'Video';
      resource.format = '';

      // if (resource.name.length < 32) {
      node.label = resource.name;
      /*} else {
        node.label = resource.name.substr(0, 31) + '...';
        }*/
      node.thumbnail = resource.thumbnail;
      node.shape = 'THUMBNAIL';
      // node.description = resource.value;
      if (isFavicon) {
        node.size = {
          width: 32,
          height: 32
        };
      }
      return r;
    } else {
      /**
      snippet: {
        publishedAt: string, // "2018-03-23T10:00:02.000Z",
        title: string, // "BiSH / PAiNT it BLACK[OFFICIAL VIDEO]",
        description: string, // "Major 3rd Single “PAiNT it BLACK” 2018.03.28 OUT!! http://amzn.to/2IJlL2A \"\"楽器を持たないパンクバンド\"\"BiSHのニューシングル テレビアニメ「ブラッククロ...",
        thumbnails: {
            default: {
                url: string, // "https://i.ytimg.com/vi/OaXiTwgkDAw/default.jpg",
                width: number, // 120,
                height: number // 90
         },
        },
        channelTitle: string, // "avex"
      }
      */
      const
        id = data.id,
        video = data.video,
        snippet = video.snippet,
        thumbnails = snippet.thumbnails;
        node.label = snippet.title;
      node.shape = 'THUMBNAIL';
      node.label = snippet.title;
      // node.description = snippet.description;
      node.thumbnail = thumbnails.default.url;
      resource.type = 'Video';
      resource.id = 'https://www.youtube.com/embed/' + id;
      resource.thumbnail = thumbnails.medium.url;
      resource.value = snippet.description;
      resource.creator = snippet.channelTitle;
    }
    // node.visible = true;
    model.addNode({node: node, resource: resource});
    this.refresh();
    return r;
  }

  addGoogkeBook(param) {
    const
      self = this,
      model = self.model,
      nodeService = self.nodeService,
      linkService = self.linkService,
      resourceService = self.resourceService,
      annotationService = self.annotationService,
      google_book = param.book,
      categories = {};
    self.nodes
      .filter(node => 'category' === node.group)
      .map(node => {
        categories[node.label] = node;
      });
    const
      c = model.addSimpleContent(),
      book = c.node,
      bookResource = c.resource;
    // node
    book.label = google_book.title;
    book.shape = 'THUMBNAIL';
    book.description = google_book.description;
    book.thumbnail = google_book.smallThumbnail;
    // resource
    bookResource.id = google_book.id;
    bookResource.type = 'Book';
    bookResource.format = 'n/a';
    bookResource.creator = google_book.authors.join(' ');
    bookResource.generator = google_book.publisher;

    model.addNode({node: book, resource: bookResource});

    if (google_book.categories) {
      for (const _category of google_book.categories) {
        if ('N/A' !== _category) {
          if (!categories[_category]) {
            const
              categoryTopic = model.addSimpleTopic(),
              category = categoryTopic.node,
              categoryResource = categoryTopic.resource;

            category.label = _category;
            category.group = 'category';
            category.shape = 'CIRCLE';
            category.size.radius = 40;
            category.color = '#EFEFEF';

            categories[_category] = category;

            model.addNode({node: category, resource: categoryResource});
          }
          const
            a = model.connect(categories[_category], book),
            link = a['link'],
            annotation = a['annotation'];

          model.addLink({link: link, annotation: annotation});
        }
      }
    }

    this.refresh();
  }

  addPC295(param) {
    const
      self = this,
      util = self.util,
      model = self.model,
      key = param.key,
      keys = param.keys;
    self.clearSearch();
    let by = '';
    if (key) {
      by = 'key';
    } else if (keys) {
      by = 'keys';
    }
    for (const _node of globals.graph.nodes) {
      if ('key' === by && _node.key === key ||
          'keys' === by && keys.indexOf(_node.key) >= 0) {
        const logData = Promise.resolve(_node)
          .then((_node) => {
            _node.visible = true;
            self.nodes.push(_node); // render for PC295
            return _node;
          })
          .then((_node) => {
            if ('key' === by) {
              const _logData = this.model.expand([_node]);
              return _logData;
            }
            // log
            const logData = {
              command: 'expand',
              param: {
                node: self.nodes,
                link: self.links
              }
            };
            return logData;
          })
          .then((_logData) => {
            if ('key' === by) {
              for (const n of _logData.param.node) {
                n.visible = true;
                util.appendBy_id(self.nodes, n);
              }
              for (const l of _logData.param.link) {
                l.visible = true;
                util.appendBy_id(self.links, l);
              }
            }
            return _logData;
          })
          .then((_logData) => {
            self.refresh();
            return _logData;
          });
        // break;
      }
    }
  }

  refresh() {
    const
      self = this,
      model = self.model,
      nodeService = self.nodeService;
    // hide ContextMenu
    document.getElementById('ContextMenu').classList.add('collapsed');
    // update
    self.nodes = globals.graph.nodes
      .filter(node => {
        return node.visible && !node.filterout;
      })
      .map(node => {
        return <Node>node;
      });
    setTimeout(() => {
      self.links = globals.graph.links
        .filter(link => {
          return link.visible && !link.filterout;
        })
        .map(link => {
          model.renderLink(link);
          return <Link>link;
        });
      model.renderMultipleLines(self.nodes, nodeService);
      model.updateLinkCount();
      globals.current.page.nodes = self.nodes;
      globals.current.page.links = self.links;
      const transform = self.util.getTransform('g#' + globals.status.canvasId);
      if (transform) {
        globals.current.page.transform = {
          x: transform.x,
          y: transform.y,
          scale: transform.scale
        };
      } else {
        globals.current.page.transform = { x: 0, y: 0, scale: 1 };
      }
    }, 200);
  }


  storeNote() {
    const self = this;
    this.page = new Page({
      pp: globals.current.page.pp,
      nodes: globals.current.page.nodes,
      links: globals.current.page.links,
      nodeIndexer: null,
      linkIndexer: null,
      transform: {
        x: (globals.current.page.transform && globals.current.page.transform.x) || 0,
        y: (globals.current.page.transform && globals.current.page.transform.y) || 0,
        scale: globals.current.page.transform.scale || 1,
      },
      thumbnail: null
    });
    Promise.resolve(this.page)
      .then(
        (page: Page) => {
          page.nodes = globals.graph.nodes;
          page.links = globals.graph.links;
          page.nodeIndexer = globals.nodeIndexer;
          page.linkIndexer = globals.linkIndexer;
          return page;
        },
        (err) => console.error(err)
      )
      .then(
        (page: Page) => {
          page.links = globals.graph.links;
          return page;
        }
      )
      .then(
        (page: Page) => {
          const note = new Note({
            _id: globals.current.note_id,
            pages: [page],
            currentPage: globals.current.currentPage,
            resources: globals.resources,
            annotations: globals.annotations,
            resourceIndexer: globals.resourceIndexer,
            annotationIndexer: globals.annotationIndexer,
          });
          note.creator_ref = this.auth.currentUser ? this.auth.currentUser._id : null;
          localStorage.setItem('note', JSON.stringify(note));
        },
        err => { alert('DrawComponent' + JSON.stringify(err)); }
      )
      .catch((err) => console.error(err));
  }

  nodeEvent(map: string) {
    console.log('- DrawComponent _nodeEvent map:', map);
    const
      self = this,
      model = self.model,
      parsed = JSON.parse(map),
      command = parsed.command,
      param = parsed.param,
      nodeService = self.nodeService,
      linkService = self.linkService,
      resourceService = self.resourceService,
      annotationService = self.annotationService;
    if ('dragstart' === command) {
      self.menuComponent.hoveredNode = undefined; // closeContextMenu();
    }
    let
      node: Node[], link: Link[], resource: Resource[], annotation: Annotation[];
    if (param) {
      if (param.node) {
        node = param.node.map((n) => self.model.NodeFactory(n));
      }
      if (param.resource) {
        resource = param.resource.map((r) => self.model.ResourceFactory(r));
      }
      if (param.link) {
        link = param.link.map((l) => self.model.LinkFactory(l));
      }
      if (param.annotation) {
        annotation = param.annotation.map((a) => self.model.AnnotationFactory(a));
      }
    }
    // console.log(globals.graph.nodes);
    if (['addContent', 'addTopic', 'addMemo'].indexOf(command) >= 0) {
      model.addNode({node: node[0], resource: resource[0]});
      model.addLink({link: link[0], annotation: annotation[0]});
    } else if (['addLink', 'connect'].indexOf(command) >= 0) {
      model.addLink({link: link[0], annotation: annotation[0]});
    } else if (['addSimpleContent', 'addSimpleTopic', 'addSimpleMemo'].indexOf(command) >= 0) {
      model.addNode({node: node[0], resource: resource[0]});
    } else if (['collapse', 'hide', 'root'].indexOf(command) >= 0) {
      model.hideNodes(node);
      model.hideLinks(link);
    } else if (['expand'].indexOf(command) >= 0) {
      model.showNodes(node);
      model.showLinks(link);
    } else if (['erase'].indexOf(command) >= 0) {
      model.eraseNodes(node);
      model.eraseLinks(link);
    } else if (['undoState', 'redoState'].indexOf(command) >= 0) {
      // TODO
    }
    self.refresh();
  }

  menuEvent(map: string) {
    console.log('- DrawComponent menuEvent map:', map);
    const
      self = this,
      model = self.model,
      parsed = JSON.parse(map),
      command = parsed.command,
      param = parsed.param;
    d3.selectAll('.pulldown').attr('style', 'display: none;');
    /* if ('play' === command) {
      if (param.playing) {
        // self.nodes.map((node: Node) =>
        for (const node of self.nodes) {
          node.fixed = false;
          node.fx = null;
          node.fy = null;
        }
      } else {
        // self.nodes.map((node: Node) =>
        for (const node of self.nodes) {
          node.fixed = true;
          node.fx = node.x;
          node.fy = node.y;
        }
        return;
      }
    } else */
    if ('hideIconMenu' === command) {
      if (param) {
        const side = param.side;
        if ('miniature' === side) {
          const open_miniature: HTMLElement = <HTMLElement>document.querySelector('#open_miniature');
          open_miniature.style.display = 'none';
        } else {
          this.hideIconMenu(side);
        }
      } else {
        this.hideIconMenu();
      }
    } else if ('showIconMenu' === command) {
        this.showIconMenu();
    } else if ('fixedNode' === command) {
      const node = model.findNodeBy_id(param._id);
      if (param.fixed) {
        node.fixed = true;
        node.fx = node.x;
        node.fy = node.y;
      } else {
        node.fixed = false;
        node.fx = null;
        node.fy = null;
      }
    } else if ('openInfo' === command) {
      if ('node' === param.type) {
        const
          node = model.findNodeBy_id(param._id),
          resource = model.findResourceById(node.idx);
        // const
        //   info = d3.select('app-info'),
        //   search = d3.select('app-search'),
        //   infoDismiss = d3.select('#infoDismiss'),
        //   searchDismiss = d3.select('#searchDismiss');
        self.editingNode = undefined; // *ngIf in template
        self.editingResource = undefined;
        self.selectedNode = node; // *ngIf in template
        self.selectedResource = resource;
      }
    } else if ('openEdit' === command) {
      // const
      //   statusEl: HTMLElement = <HTMLElement>document.querySelector('#status'),
      //   languageEl: HTMLElement = <HTMLElement>document.querySelector('#language');
      // statusEl.style.display = 'none';
      // languageEl.style.display = 'none';
      if ('node' === param.type) {
        const
          node = model.findNodeBy_id(param.node._id ),
          resource = model.findResourceById(node.idx),
          edit = d3.select('app-edit'),
          dismiss = d3.select('#editDismiss'),
          json = JSON.stringify({
            command: command,
            param: {
              node: node,
              resource: resource
            }
          });
        // self.searching = undefined;
        self.selectedNode = undefined;
        self.selectedResource = undefined;
        self.editingNode = node;
        self.editingResource = resource;
        // this is required to keep initial data of node and resource
        setTimeout(() => {
          self.messageService.openEdit(json);
        }, 500);
        // self.openEditpane(edit, dismiss);
      }
    } else if ('filterMenu' === command) {
      self.filtering = true; // *ngIf in template
      self.searching = false;
    } else if ('searchMenu' === command) {
      // const
      //   info = d3.select('app-info'),
      //   search = d3.select('app-search'),
      //   infoDismiss = d3.select('#infoDismiss'),
      //   searchDismiss = d3.select('#searchDismiss');
      self.selectedNode = undefined;
      self.searching = true;
    } else if ('closeScreen' === command) {
      self.storeNote();
    } else if ('initNote' === command) {
      self.initNote();
    } else if ('loadNote' === command) {
      self.loadNote(param.note);
    }
    this.refresh();
  }

  drawEvent(map: string) {
    // console.log('- DrawComponent drawEvent map:', map);
    const
      self = this,
      model = self.model,
      nodeService = self.nodeService,
      linkService = self.linkService,
      resourceService = self.resourceService,
      annotationService = self.annotationService,
      parsed = JSON.parse(map),
      command = parsed.command,
      param = parsed.param;
    d3.selectAll('.pulldown')
      .attr('style', 'display: none;');
    let
      node: Node[], link: Link[];
    if (param) {
      if (param.node) {
        node = param.node.map(n => model.findNodeBy_id(n._id));
      }
      if (param.link) {
        link = param.link.map(l => model.findLinkBy_id(l._id));
      }
    }
    if (['addContent', 'addTopic', 'addMemo'].indexOf(command) >= 0) {
      const
        _node = node[0],
        _resource = model.findResourceById(_node.idx),
        _link = link[0],
        _annotation = model.findAnnotationById(_link.idx);
      model.addNode({node: _node, resource: _resource});
      model.addLink({link: _link, annotation: _annotation});
    } else if (['addLink', 'connect'].indexOf(command) >= 0) {
      const
        _link = link[0],
        _annotation = model.findAnnotationById(_link.idx);
      model.addLink({link: _link, annotation: _annotation});
    } else if (['addSimpleContent', 'addSimpleTopic', 'addSimpleMemo'].indexOf(command) >= 0) {
      const
        _node = node[0],
        _resource = model.findResourceById(_node.idx);
      model.addNode({node: _node, resource: _resource});
    } else if (['collapse', 'hide', 'root'].indexOf(command) >= 0) {
      model.hideNodes(node);
      model.hideLinks(link);
    } else if (['expand'].indexOf(command) >= 0) {
      model.showNodes(node);
      model.showLinks(link);
    }
    this.refresh();
  }

  infoEvent(map: string) {
    console.log('- DrawComponent infoEvent map:', map);
    const
      self = this,
      model = self.model,
      parsed = JSON.parse(map),
      command = parsed.command,
      param = parsed.param;
    d3.selectAll('.pulldown')
      .attr('style', 'display: none;');
    if ('infoDismiss' === command) {
      self.showIconMenu('right');
      self.selectedNode = undefined;
      self.selectedResource = undefined;
    } else if ('showIconMenu' === command) {
      self.showIconMenu('right');
    } else if ('hideIconMenu' === command) {
      self.hideIconMenu('right');
    } else if ('editOpen' === command) {
      self.editingNode = self.selectedNode; // *ngIf in template
      self.editingResource = self.selectedResource;
      self.selectedNode = undefined; // *ngIf in template
      self.selectedResource = undefined;
    }
  }

  editEvent(map: string) {
    console.log('- DrawComponent editEvent map:', map);
    const
      self = this,
      model = self.model,
      nodeService = self.nodeService,
      linkService = self.linkService,
      resourceService = self.resourceService,
      annotationService = self.annotationService,
      parsed = JSON.parse(map),
      command = parsed.command,
      param = parsed.param;
    d3.selectAll('.pulldown')
      .attr('style', 'display: none;');
    if ('editDismiss' === command) {
      self.showIconMenu('right');
      self.editingNode = undefined;
      self.editingResource = undefined;
    } else if ('showIconMenu' === command) {
      self.showIconMenu('right');
    } else if ('hideIconMenu' === command) {
      self.hideIconMenu('right');
    } else if ('infoOpen' === command) {
      self.selectedNode = self.editingNode; // *ngIf in template
      self.selectedResource = self.editingResource;
      self.editingNode = undefined; // *ngIf in template
      self.editingResource = undefined;
    } else if ('nodeChange' === command) {
      const
        _id = param.node._id,
        _node = param.node;
      let attribute = param.attribute;
      if ('*' === attribute) {
        self.editingNode = model.NodeFactory(_node);
      } else if (0 === attribute.indexOf('font')) {
        attribute = attribute.split('_')[1];
        self.editingNode.font[attribute] = _node.font[attribute];
      } else if (['width', 'height', 'radius'].indexOf(attribute) >= 0) {
        self.editingNode.size[attribute] = _node.size[attribute];
      } else {
        self.editingNode[attribute] = _node[attribute];
        if ('shape' === attribute) {
          self.editingNode.size = _node.size;
        }
        if ('description' === attribute && 'Topic' !== _node.type && 'THUMBNAIL' !== _node.shape) {
          model.renderMultipleLines([self.editingNode], nodeService);
        }
      }
    } else if ('resourceChange' === command) {
      const
        _id = param._id,
        attribute = param.attribute,
        _resource = param.resource;
      if ('*' === attribute) {
        self.editingResource = model.ResourceFactory(_resource);
      } else {
        self.editingResource[attribute] = _resource[attribute];
      }
      model.updateResource(self.editingResource);
    }
    if (self.editingNode) {
      model.updateNode(self.editingNode);
    }
    self.refresh();
  }

  filterEvent(map: string) {
    console.log('- DrawComponent filterEvent map:', map);
    const
      self = this,
      // model = self.model,
      parsed = JSON.parse(map),
      command = parsed.command,
      param = parsed.param;
    d3.selectAll('.pulldown').attr('style', 'display: none;');
    if ('openInfo' === command) {
      self.infoOpen(param);
    } else if ('filterDismiss' === command) {
      self.filtering = undefined; // *ngIf in template
      self.showIconMenu('left');
    } else if ('showIconMenu' === command) {
      self.showIconMenu('left');
    } else if ('hideIconMenu' === command) {
      self.hideIconMenu('left');
    } else if ('filter' === command) {
      if ('showAll' === param) {
        self.nodes = globals.graph.nodes.map(node => {
          if (undefined !== node.visible && !node.visible) {
            node.visible = false;
          }
          return <Node>node;
        });
        self.links = globals.graph.links.map(link => {
          if (undefined !== link.visible && !link.visible) {
            link.visible = false;
          }
          return <Link>link;
        });
      } else if ('hideAll' === param) {
        self.nodes = globals.graph.nodes.map(node => {
          if (undefined !== node.visible && node.visible) {
            node.visible = false;
          }
          return <Node>node;
        });
        self.links = globals.graph.links.map(link => {
          if (undefined !== link.visible && link.visible) {
            link.visible = false;
          }
          return <Link>link;
        });
      } else {
        self.filterOut(param);
      }
      self.refresh();
    } else if ('searchOpen' === command) {
      self.searching = true; // *ngIf in template
      self.filtering = undefined; // *ngIf in template
      self.showIconMenu('right');
      self.hideIconMenu('left');
    }
  }

  searchEvent(map: string) {
    console.log('- DrawComponent searchEvent map:', map);
    const
      self = this,
      // model = self.model,
      parsed = JSON.parse(map),
      command = parsed.command,
      param = parsed.param;
    d3.selectAll('.pulldown').attr('style', 'display: none;');
    if ('openInfo' === command) {
      self.infoOpen(param);
    } else if ('searchDismiss' === command) {
      self.searching = undefined; // *ngIf in template
      self.showIconMenu('left');
    } else if ('showIconMenu' === command) {
      self.showIconMenu('left');
    } else if ('hideIconMenu' === command) {
      self.hideIconMenu('left');
    } else if ('bookmark' === command) {
      console.log('bookmark ' + param);
      self.addGoogkeBook(param);
    } else if ('videorecord' === command) {
      console.log('videorecord ' + param);
      self.addYouTube(param);
    } else if ('addPC295' === command) {
      self.addPC295(param);
    } else if ('clearSearch' === command) {
      self.clearSearch();
    } else if ('filterOpen' === command) {
      self.filtering = true; // *ngIf in template
      self.searching = undefined; // *ngIf in template
      self.hideIconMenu('left');
      self.showIconMenu('right');
    }
  }

  // Menu
  hideIconMenu = (side?) => {
    const hideRight = () => {
      // const open_miniature: HTMLElement = <HTMLElement>document.querySelector('#open_miniature');
      // open_miniature.style.display = 'none';
      const notenameEl: HTMLElement = <HTMLElement>document.querySelector('#note_name');
      notenameEl.style.display = 'none';
      const langEl: HTMLElement = <HTMLElement>document.querySelector('#language');
      langEl.style.display = 'none';
      const statEl: HTMLElement = <HTMLElement>document.querySelector('#status');
      statEl.style.display = 'none';
    };

    const hideLeft = () => {
      const menuEl: HTMLElement = <HTMLElement>document.querySelector('.heading-menu');
      menuEl.style.display = 'none';
      const icons = menuEl.querySelectorAll('a');
      for (let i = 0; i < icons.length; i++) {
        const icon: HTMLElement = <HTMLElement>icons[i];
        icon.style.display = 'none';
      }
      const open_controls: HTMLElement = <HTMLElement>document.querySelector('#open_controls');
      open_controls.style.display = 'none';
      const controls = document.querySelectorAll('#controls div');
      for (let i = 0; i < controls.length; i++) {
        const control: HTMLElement = <HTMLElement>controls[i];
        control.style.display = 'none';
      }
    };

    if ('right' === side) {
      hideRight();
    } else if ('left' === side) {
      hideLeft();
    }else if (undefined === side) {
      hideRight();
      hideLeft();
    }
  }

  showIconMenu = (side?) => {
    const showRight = () => {
      // const open_miniature: HTMLElement = <HTMLElement>document.querySelector('#open_miniature');
      // open_miniature.style.display = 'block';
      const notenameEl: HTMLElement = <HTMLElement>document.querySelector('#note_name');
      notenameEl.style.display = 'block';
      const langEl: HTMLElement = <HTMLElement>document.querySelector('#language');
      langEl.style.display = 'block';
      const statEl: HTMLElement = <HTMLElement>document.querySelector('#status');
      statEl.style.display = 'block';
    };

    const showLeft = () => {
      const menuEl: HTMLElement = <HTMLElement>document.querySelector('.heading-menu');
      menuEl.style.display = 'block';
      const icons = menuEl.querySelectorAll('a');
      for (let i = 0; i < icons.length; i++) {
        const icon: HTMLElement = <HTMLElement>icons[i];
        icon.style.display = 'block';
      }
      const open_controls: HTMLElement = <HTMLElement>document.querySelector('#open_controls');
      open_controls.style.display = 'block';
      const controls = document.querySelectorAll('#controls div');
      for (let i = 0; i < controls.length; i++) {
        const control: HTMLElement = <HTMLElement>controls[i];
        control.style.display = 'block';
      }
    };

    if ('right' === side) {
      showRight();
    } else if ('left' === side) {
      showLeft();
    } else if (undefined === side) {
      showRight();
      showLeft();
    }
  }

  filterOut(param) {
    console.log(param);
    const
      self = this,
      util = this.util,
      model = this.model,
      groupsSelect = param.groupsSelect
        .filter(group => group.checked)
        .map(group => group.value || 'undefined'),
      rolesSelect = param.rolesSelect
        .filter(role => role.checked)
        .map(role => role.value || 'undefined');
    for (const node of globals.graph.nodes) {
      const group = node.group ? 'g_' + node.group : 'g_undefined';
      if (groupsSelect.indexOf(group) < 0) {
        node.filterout = true;
      } else {
        node.filterout = false;
      }
      if (!node.filterout && node.visible) {
        util.appendBy_id(self.nodes, node);
      } else {
        for (let i = 0; i <  self.nodes.length; i++) {
          const _node = self.nodes[i];
          if (node._id === _node._id) {
            self.nodes.splice(i, 1);
          }
        }
      }
    }
    for (const link of globals.graph.links) {
      const
        model = this.model,
        role = link.role ? 'r_' + link.role : 'r_undefined',
        source = model.findNodeBy_id(link.source_id),
        target = model.findNodeBy_id(link.target_id),
        sourceGroup = source.group ? 'g_' + source.group : 'g_undefined',
        targetGroup = target.group ? 'g_' + target.group : 'g_undefined';
      link.filterout = false;
      if (rolesSelect.indexOf(role) < 0) {
        link.filterout = true;
      }
      if (groupsSelect.indexOf(sourceGroup) < 0) {
        link.filterout = true;
      }
      if (groupsSelect.indexOf(targetGroup) < 0) {
        link.filterout = true;
      }
      if (!link.filterout && link.visible) {
        util.appendBy_id(self.links, link);
      } else {
        for (let i = 0; i <  self.links.length; i++) {
          const _link = self.links[i];
          if ((link.source_id === _link.source_id && link.target_id === _link.target_id) ||
              (link.source_id === _link.source && link.target_id === _link.target) ||
              (link.source_id === _link.source.id && link.target_id === _link.target.id)
          ) {
            self.links.splice(i, 1);
          }
        }
      }
    }
  }

  clearSearch() {
    const
      self = this;
      // force = self.forceComponent.getForceDirectedGraph();
    self.nodes = [];
    self.links = [];
    this.refresh();
    // force.restart({ nodes: [], links: [] });
  }

  openWindow(url1, url2?) {
    if (url2) {
      this.openCD1Window(url1);
      this.openCD2Window(url2);
    } else {
      this.closeCD1Window();
      const features = 'width=500,height=600,top=80,left=80';
      this.CD1Window = window.open(url1, 'wuwei', features);
    }
  }

  openCD1Window(url) {
    this.closeCD1Window();
    if (!url) {
      return;
    }
    const features = 'width=500, height=710, top=30, left=4';
    this.CD1Window = window.open(url, 'PC295_CD1', features);
    if (this.CD2Window) {
      this.CD2Window.focus();
    }
  }

  openCD2Window(url) {
    this.closeCD2Window();
    if (!url) {
      return;
    }
    const features = 'width=500, height=710, top=30, left=480';
    this.CD2Window = window.open(url, 'PC295_CD2', features);
    if (this.CD1Window) {
      this.CD1Window.focus();
    }
  }

  closeCD1Window() {
    if (this.CD1Window) {
      this.CD1Window.close();
    }
  }

  closeCD2Window() {
    if (this.CD2Window) {
      this.CD2Window.close();
    }
  }

  /*listener = function(event) {
    event.stopPropagation();
    const
      self = this,
      model = this.model,
      data = event.data;
    if (data && data.type) {
      console.log('--- event listener', data.type, data);
      if (data.type === "FROM_CEXT" ||
          data.type === "FROM_SFEX" ||
          data.type === "NEW_OCCURRENCE") {
        model.newNode(data);
        self.refresh();
        // wuwei.tao.newoccurrence( data );
      } else if (data.type === "NEW_OCCURRENCES") {
        // wuwei.tao.newoccurrences( data );
      }
      return;
    }
  };*/

  toastMessage(message: string, action: string) {
    const
      options = {
        closeButton: true,
        positionClass: 'toast-bottom-center'
      };
    this.toast[action](message, action.toUpperCase(), options);
  }

}
