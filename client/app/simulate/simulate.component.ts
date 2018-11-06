import {
  Component,
  Input, OnInit,
  AfterViewInit,
  ViewChild,
  CUSTOM_ELEMENTS_SCHEMA
} from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { ToastService } from '../mdb-type/pro/alerts';

import {
  CognitoUserService,
  MessageService,
  WpUserService,
  WuweiService
} from '../services';
import {
  LibraryService
} from '../googleBook';
import {
  Annotation,
  Resource
} from '../model';
import {
  Link,
  Node,
  Note,
  Page,
  SimLink,
  SimNode,
  WuweiModel
} from '../model/wuwei';
import { ForceComponent } from './visuals';
import { FilterComponent } from '../filter';
import { SearchComponent } from '../search';
import { InfoComponent } from '../info';
import { EditComponent } from '../edit';
import { MenuComponent } from '../menu';
import { CONF } from 'assets/config/environment.host';
import { FORCE } from 'assets/config/environment.force';

import * as d3 from 'd3';
import * as uuid from 'uuid';
import * as globals from '../model/wuwei-globals';

import CONFIG from './simulate.config';
import DATA from './shared/test-data';
import { WorkDocs } from 'aws-sdk';
import { AsyncAction } from 'rxjs/scheduler/AsyncAction';
// import * as PC295_CONFIG from '../../assets/config/pc295-config';

@Component({
  selector: 'app-simulate',
  templateUrl: './simulate.component.html',
  styleUrls: ['./simulate.component.scss']
})
export class SimulateComponent implements OnInit, AfterViewInit {

  @ViewChild(FilterComponent) filterComponent: FilterComponent;
  @ViewChild(SearchComponent) searchComponent: SearchComponent;
  @ViewChild(ForceComponent) forceComponent: ForceComponent;
  @ViewChild(InfoComponent) infoComponent: InfoComponent;
  @ViewChild(EditComponent) editComponent: EditComponent;
  @ViewChild(MenuComponent) menuComponent: MenuComponent;

  playing;
  CD1Window = null; // Open window
  CD2Window = null;

  subscription: Subscription;

  modalSpinner = false;

  loggedIn;
  currentUser;

  note: Note;
  page: Page;
  pages: Page[];
  nodes: Node[];
  links: Link[];

  nodeIndexer;
  linkIndexer;

  hoveredNode: Node;
  hoveredLink: Link;

  selectedNode: Node;
  selectedResource: Resource;

  editingNode: Node;
  editingResource: Resource;

  filtering: boolean;
  searching: boolean;

  ngOnInit() {
    window.addEventListener('message', (event) => {
      console.log(event);
      this.listener(event);
    }, false);
    const map = this.model.initNote();
    this.note = map.note;
    this.page = map.page;
  }

  ngAfterViewInit() {
    globals.status.svgId = 'force';
    globals.status.canvasId = 'simulation';
    // this.testForce();
  }

  constructor(
    private auth: WpUserService,
    private toast: ToastService,
    private util: WuweiService,
    private model: WuweiModel,
    private messageService: MessageService,
    private libraryService: LibraryService
  ) {
    const self = this;

    globals.status.svgId = 'force';
    globals.status.canvasId = 'simulation';
    globals.module.util = this.util;
    globals.module.forceComponent = this.forceComponent;

    self.nodes = [];
    self.links = [];
    self.nodeIndexer = {};
    self.linkIndexer = {};

    self.selectedNode = undefined;
    self.selectedResource = undefined;

    self.subscription = messageService.screenRefresh$.subscribe(
      json => {
        const
          self = this,
          force = self.forceComponent.getForceDirectedGraph(),
          parsed = JSON.parse(json),
          command = parsed.command;
        if (command && 'refreshScreen' === command) {
          // d3.selectAll('g.node').remove();
          // d3.selectAll('g.link').remove();
          self.nodes = globals.graph.nodes.filter(n => n.visible && !n.filterout);
          self.links = globals.graph.links.filter(l => l.visible && !localStorage.filterout);
          force.restart({ nodes: self.nodes, links: self.links });
        }
      },
      err => { alert('SimulateComponent' + JSON.stringify(err)); }
    );

    this.subscription = messageService.modelUpdate$.subscribe(
      json => {
        const
          self = this,
          force = self.forceComponent.getForceDirectedGraph(),
          parsed = JSON.parse(json),
          command = parsed.command;
        if ('update' === command) {
          // d3.selectAll('g.node').remove();
          // d3.selectAll('g.link').remove();
          self.nodes = globals.graph.nodes.filter(n => n.visible && !n.filterout);
          self.links = globals.graph.links.filter(l => l.visible && !localStorage.filterout);
          force.restart({ nodes: self.nodes, links: self.links });
        }
      },
      err => {
        alert('SimulateComponent' + JSON.stringify(err));
      }
    );

    this.subscription = messageService.playPause$.subscribe(
      json => {
        const
          self = this,
          model = self.model,
          force = self.forceComponent.getForceDirectedGraph(),
          parsed = JSON.parse(json),
          state = parsed.state;
        console.log('-subecribe- playPause$ in SimulateComponent state=' + state);
        if (state && 'play' === state) {
          FORCE.SIMULATE = true;
          globals.status.playing = true;
          const logData = model.shuffle({ nodes: self.nodes, links: self.links });
        } else if (state && 'pause' === state) {
          FORCE.SIMULATE = false;
          globals.status.playing = false;
        }
        force.restart({ nodes: self.nodes, links: self.links });
        return false;
      },
      err => { alert('SimulateComponent' + JSON.stringify(err)); }
    );

  }

  testForce = () => {
    const
      self = this,
      model = self.model,
      force = self.forceComponent.getForceDirectedGraph();
    const
      a = <{node: Node, resource: Resource}>model.addSimpleTopic(), // new Node('a');
      aNode = a.node,
      aResource = a.resource;
    aNode.visible = true;
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
      b = <{node: Node, resource: Resource}>model.addSimpleContent(), // new Node('b');
      bNode = b.node,
      bResource = b.resource;
    bNode.visible = true;
    bNode.shape = 'THUMBNAIL';
    bNode.size = {
      width: globals.defaultSize.width,
      height: globals.defaultSize.width
    };
    bNode.label = '国家';
    bNode.thumbnail = 'http://books.google.com/books/content?id=hC9UQQAACAAJ&printsec=frontcover&img=1&zoom=1&imgtk=AFLRE71K2QIkZTGfybx80qh6SnDN7qbV3KDzKEV8i-GQcYzR2WJpjqFf63rqSvf830Q-KeN4IPLwy5zhrSjU4fgs7QSGAKYLtM_bMLYwcaHB-1CUsZ8iozCNp9bAEyH-Ba5A03v2PiWz&source=gbs_api';
    bResource.name = '国家';
    bResource.id = '/assets/『夢十夜』.pdf';
    bResource.thumbnail = 'http://books.google.com/books/content?id=hC9UQQAACAAJ&printsec=frontcover&img=1&zoom=1&imgtk=AFLRE71K2QIkZTGfybx80qh6SnDN7qbV3KDzKEV8i-GQcYzR2WJpjqFf63rqSvf830Q-KeN4IPLwy5zhrSjU4fgs7QSGAKYLtM_bMLYwcaHB-1CUsZ8iozCNp9bAEyH-Ba5A03v2PiWz&source=gbs_api';
    bResource.type = 'Book';
    bResource.value = 'ソクラテスの口を通じて語られた理想国における哲人統治の主張にひきつづき対話は更に展開する。では、その任に当る哲学者は何を学ぶべきか。この問いに対して善のイデアとそこに至る哲学的認識の在り方があの名高い「太陽」「線分」「洞窟」の比喩によって説かれ、終極のところ正義こそが人間を幸福にするのだと結論される。';
    bResource.format = 'n/a';
    bResource.creator = 'プラトン';
    bResource.generator = '岩波書店';
    // this.nodeIndexer[bNode._id] = bNode;
    const
      c = <{node: Node, resource: Resource}>model.addSimpleTopic(), // new Node('c');
      cNode = c.node,
      cResource = c.resource;
    cNode.visible = true;
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
      d = <{node: Node, resource: Resource}>model.addSimpleMemo(), // new Node('d');
      dNode = d.node,
      dResource = d.resource;
    dNode.visible = true;
    dNode.description = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec in arcu diam. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Sed sit amet urna velit. Duis tempor sit amet quam elementum tincidunt. Etiam nisi tellus, condimentum ac nunc sed, efficitur accumsan diam. Maecenas et ex ut tortor faucibus euismod et vel lectus. Suspendisse sagittis commodo nisl, a dictum elit convallis non. Fusce vitae magna quis lectus luctus volutpat. Nam mattis, nisi a commodo maximus, mauris augue scelerisque arcu, nec gravida tellus leo eget augue.';
    dResource.value = '<h3>Lorem ipsum</h3><p>dolor sit amet, consectetur adipiscing elit. Donec in arcu diam.</p><p>Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Sed sit amet urna velit. Duis tempor sit amet quam elementum tincidunt. Etiam nisi tellus, condimentum ac nunc sed, efficitur accumsan diam. Maecenas et ex ut tortor faucibus euismod et vel lectus. Suspendisse sagittis commodo nisl, a dictum elit convallis non. Fusce vitae magna quis lectus luctus volutpat. Nam mattis, nisi a commodo maximus, mauris augue scelerisque arcu, nec gravida tellus leo eget augue.</p>';

    const
      e = this.addYouTube(DATA.youtube[1]),
      eNode = e.node,
      eResource = e.resource;

    const
      a_b = model.connect(aNode, bNode)['link'],
      a_c = model.connect(aNode, cNode)['link'],
      a_d = model.connect(aNode, dNode)['link'],
      b_c = model.connect(bNode, cNode)['link'],
      b_e = model.connect(bNode, eNode)['link'];

    self.nodes = [];
    self.links = [];
    force.restart({ nodes: self.nodes, links: self.links });
    setTimeout(() => {
      self.showNode([aNode]);
      force.restart({ nodes: self.nodes, links: self.links });
    }, 500);
    setTimeout(() => {
      self.showNode([bNode, cNode]);
      self.showLink([a_b, a_c]);
      force.restart({ nodes: self.nodes, links: self.links });
    }, 1000);
    setTimeout(() => {
      self.showNode([dNode]); // this.nodes = [a, b, c, d];
      self.showLink([a_d]);   // this.links = [a_b, a_c, a_d];
      force.restart({ nodes: self.nodes, links: self.links });
    }, 1500);
    setTimeout(() => {
      self.showLink([b_c]); // this.links = [a_b, a_c, a_d, b_c];
      force.restart({ nodes: self.nodes, links: self.links });
    }, 2000);
    setTimeout(() => {
      self.showNode([eNode]);
      self.showLink([b_e]);
      force.restart({ nodes: self.nodes, links: self.links });
    }, 2500);
  }

  initNote() {
    this.model.initNote();
    this.nodes = [];
    this.links = [];
  }

  loadNote(_note) {
    this.initNote();
    const
      model = this.model,
      map = model.setNote(_note);
    this.note = map.note;
    this.nodes = this.page.nodes;
    this.links = this.page.links;
    const
      note = _note,
      pp = note.currentPage,
      page = note.pages.filter(p => pp === p.pp )[0],
      nodes = page.nodes,
      links = page.links;
    this.page = page;
    if (nodes) {
      for (const n of nodes) {
        const node = model.NodeFactory(n);
        this.addNode(node);
      }
    }
    if (links) {
      for (const l of links) {
        const link = model.LinkFactory(l);
        this.addLink(link);
      }
    }
    model.updateLinkCount();
  }

  addPage(page) {
    this.openPage(page);
  /*  const
      model = this.model,
      nodes = page.nodes,
      links = page.links;
    this.page = page;
    this.nodes = nodes;
    this.links = links;
    if (nodes) {
      for (const n of nodes) {
        const node = model.NodeFactory(n);
        this.addNode(node);
      }
    }
    if (links) {
      for (const l of links) {
        const link = model.LinkFactory(l);
        this.addLink(link);
      }
    }
    model.updateLinkCount();*/
  }

  openPage(page) {
    const
      model = this.model,
      nodes = page.nodes,
      links = page.links;
    this.page = page;
    this.nodes = nodes;
    this.links = links;
    if (nodes) {
      for (const n of nodes) {
        const node = model.NodeFactory(n);
        this.addNode(node);
      }
    }
    if (links) {
      for (const l of links) {
        const link = model.LinkFactory(l);
        this.addLink(link);
      }
    }
    model.updateLinkCount();
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
      force = self.forceComponent.getForceDirectedGraph(),
      r = self.model.addSimpleContent(),
      node = <Node>r.node,
      resource = <Resource>r.resource;
    node.visible = true;
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
      // url = 'https://www.youtube.com/embed/' + code;
      if ( 0 === url.indexOf('https://youtu.be/')) {
        code = url.split('https://youtu.be/').pop(); // e.g. https://youtu.be/sJl_sk8Jrm0
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
      } else {
        resource.thumbnail = 'https://s.ytimg.com/yts/img/favicon_32-vflOogEID.png';
        isFavicon = true;
      }
      resource.type = 'Video';
      resource.format = '';

      if (resource.name.length < 32) {
        node.label = resource.name;
      } else {
        node.label = resource.name.substr(0, 31) + '...';
      }
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
        thumbnails = snippet.thumbnails,
        thumbnail = thumbnails.default;
      node.visible = true;
      node.label = snippet.title;
      node.shape = 'THUMBNAIL';
      node.size.width = thumbnail.width;
      node.size.height = thumbnail.height;
      node.thumbnail = thumbnail.url;
      resource.type = 'Video';
      resource.name = snippet.title;
      resource.id = 'https://www.youtube.com/embed/' + id;
      resource.thumbnail = thumbnails.medium.url;
      resource.value = snippet.description;
      resource.creator = snippet.channelTitle;
    }
    self.util.appendBy_id(self.nodes, node);
    self.util.appendBy_id(globals.graph.nodes, node);
    force.restart({ nodes: self.nodes, links: self.links });
    return r;
  }

  addGoogleBook(param) {
    const
      self = this,
      model = self.model,
      force = self.forceComponent.getForceDirectedGraph(),
      google_book = param.book,
      categories = {};
    self.nodes
      .filter(node => {
        const _node = model.findNodeBy_id(node._id);
        return 'category' === _node.group;
      })
      .map(node => {
        const _node = model.findNodeBy_id(node._id);
        categories[_node.label] = _node;
      });
    const
      c = model.addSimpleContent(),
      book = c.node,
      bookResource = c.resource;
    // node
    book.visible = true;
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

    self.util.appendBy_id(self.nodes, book);
    self.util.appendBy_id(globals.graph.nodes, book);

    force.restart({ nodes: self.nodes, links: self.links });

    if (google_book.categories) {
      for (const _category of google_book.categories) {
        if ('N/A' !== _category) {
          if (!categories[_category]) {
            const
              categoryTopic = model.addSimpleTopic(),
              category = categoryTopic.node;

            category.visible = true;
            category.label = _category;
            category.group = 'category';
            category.shape = 'CIRCLE';
            category.size.radius = 40;
            category.color = CONFIG.ShapeColor.Category;

            categories[_category] = category;

            self.util.appendBy_id(self.nodes, category);
            self.util.appendBy_id(globals.graph.nodes, category);
          }
          const
            a = model.connect(categories[_category], book),
            link = a['link'],
            annotation = a['annotation'];
          self.showLink(link);
          self.util.appendBy_id(self.links, link);
          self.util.appendBy_id(globals.graph.links, link);

          force.restart({ nodes: self.nodes, links: self.links });
        }
      }
    }
  }

  addPC295(param) {
    const
      self = this,
      util = self.util,
      model = self.model,
      force = self.forceComponent.getForceDirectedGraph(),
      clusterName = param.cluster && param.cluster.title,
      mbNCName = param.mbNC && param.mbNC.label,
      clauseName = param.clause && param.clause.label,
      key = param.key,
      keys = param.keys;

    let by = '';
    if (key) {
      by = 'key';
    } else if (keys) {
      by = 'keys';
      self.clearSearch();
    }

    let count = 0;
    const nodes = globals.graph.nodes.filter(node => {
      if (('key' === by && node.key === key) ||
          ('keys' === by && keys.indexOf(node.key) >= 0)) {
        count++;
        if (count <= globals.MAX_EXPANDS) {
          return true;
        }
        return false;
      }
      return false;
    });

    self.modalSpinner = true;

    const logData = Promise.resolve(nodes)
      .then((nodes) => {
        nodes.map(node => {
          node.visible = true;
          util.appendBy_id(self.nodes, node); // render for PC295
        });
        return nodes;
      })
      .then((nodes) => {
        let logData = null;
        if ('key' === by) {
          logData = this.model.expand(nodes);
          return logData;
        }
        if ('keys' === by) {
          let resource = null;
          if (clusterName) {
            resource = model.findResourceByName(clusterName);
          }
          if (mbNCName) {
            resource = model.findResourceByName(mbNCName);
          }
          if (clauseName) {
            resource = model.findResourceByName(clauseName);
          }
          if (resource) {
            const node = model.addCtypeNode(resource);
            node.visible = true;
            util.appendBy_id(self.nodes, node);
            logData = this.model.expand([node]);
            return logData;
          }
        }
        // log
        logData = {
          command: 'expand',
          param: {
            node: self.nodes,
            link: self.links
          }
        };
        return logData;
      })
      .then((logData) => {
        logData.param.node.map(node => {
          node.visible = true;
          util.appendBy_id(self.nodes, node);
        });
        logData.param.link.map(link => {
          link.visible = true;
          util.appendBy_id(self.links, link);
        });
        return logData;
      })
      .then((logData) => {
        force.restart({ nodes: self.nodes, links: self.links });
        setTimeout(() => {
          self.modalSpinner = false;
        }, 100);
        return logData;
      });
  }

  menuEvent(map: string) {
    // console.log('- SimulateComponent menuEvent map:', map);
    const
      self = this,
      model = self.model,
      force = self.forceComponent.getForceDirectedGraph(),
      parsed = JSON.parse(map),
      command = parsed.command,
      param = parsed.param;
    force.stop();
    let doRestart = false;
    d3.selectAll('.pulldown')
      .attr('style', 'display: none;');
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
    } else if ('play' === command) {
      doRestart = true;
      if (param.playing) {
        for (const node of self.nodes) {
          const _node = model.findNodeBy_id(node._id);
          _node.fixed = false;
          _node.fx = null;
          _node.fy = null;
        }
      } else {
        for (const node of self.nodes) {
          const _node = model.findNodeBy_id(node._id);
          _node.fixed = true;
          _node.fx = node.x;
          _node.fy = node.y;
        }
      }
    } else if ('fixedNode' === command) {
      doRestart = true;
      const
        node = self.nodes.filter(n => n._id === param._id)[0];
      if (param.fixed) {
        node.fixed = true;
      } else {
        node.fixed = false;
      }
    } else if ('openInfo' === command) {
      self.infoOpen(param);
    } else if ('openEdit' === command) {
      self.editOpen(param, map);
    } else if ('filterMenu' === command) {
      self.filtering = true; // *ngIf in template
      self.searching = false;
    } else if ('searchMenu' === command) {
      self.searching = true; // *ngIf in template
      self.filtering = false;
    // } else if ('initNote' === command) {
    } else if ('loadNote' === command) {
      if (param && param.note) {
        doRestart = true;
        this.loadNote(param.note);
      }
    } else if ('addPage' === command) {
      if (param && param.page) {
        doRestart = true;
        this.addPage(param.page);
      }
    } else if ('openPage' === command) {
      if (param && param.page) {
        doRestart = true;
        this.openPage(param.page);
      }
    }
    if (doRestart) {
      force.restart({ nodes: self.nodes, links: self.links });
    }
  }

  nodeEvent(map: string) {
    // console.log('- SimulateComponent nodeEvent map:', map);
    const
      self = this,
      model = self.model,
      parsed = JSON.parse(map),
      command = parsed.command,
      param = parsed.param,
      force = self.forceComponent.getForceDirectedGraph();
    if ('dragstart' === command) {
      self.menuComponent.hoveredNode = undefined; // closeContextMenu();
    }
    let doRestart = false;
    d3.selectAll('.pulldown').attr('style', 'display: none;');
    let
      node: Node[], link: Link[];
    if (param) {
      if (param.node) {
        node = param.node.map(n => model.NodeFactory(n)); // findNodeBy_id(n._id));
      }
      if (param.link) {
        link = param.link.map(l => model.LinkFactory(l)); // findLinkBy_id(l._id));
      }
    }
    if (['addContent', 'addTopic', 'addMemo'].indexOf(command) >= 0) {
      doRestart = true;
      this.addNode(node[0]);
      this.addLink(link[0]);
    } else if (['addLink', 'connect'].indexOf(command) >= 0) {
      doRestart = true;
      this.addLink(link[0]);
    } else if (['addSimpleContent', 'addSimpleTopic', 'addSimpleMemo'].indexOf(command) >= 0) {
      doRestart = true;
      this.addNode(node[0]);
    } else if (['collapse', 'hide', 'root'].indexOf(command) >= 0) {
      doRestart = true;
      const
        visibleNodes = node.filter(n => n.visible),
        visibleLinks = link.filter(l => l.visible),
        hiddenNodes = node.filter(n => !n.visible),
        hiddenLinks = link.filter(l => !l.visible);
      self.showNode(visibleNodes);
      self.showLink(visibleLinks);
      self.hideNode(hiddenNodes);
      self.hideLink(hiddenLinks);
    } else if (['expand'].indexOf(command) >= 0) {
      doRestart = true;
      self.showNode(node);
      self.showLink(link);
    } else if (['undoState', 'redoState'].indexOf(command) >= 0) {
      doRestart = true;
      self.nodes = globals.graph.nodes.filter(n => n.visible && !n.filterout);
      self.links = globals.graph.links.filter(l => l.visible && !l.filterout);
    }
    if (doRestart) {
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
      force.restart({ nodes: self.nodes, links: self.links });
    }
  }

  infoEvent(map: string) {
    // console.log('- SimulateComponent infoEvent map:', map);
    const
      self = this,
      parsed = JSON.parse(map),
      command = parsed.command,
      param = parsed.param;
    d3.selectAll('.pulldown')
      .attr('style', 'display: none;');
    if ('infoDismiss' === command) {
      self.selectedNode = undefined; // *ngIf in template
      self.selectedResource = undefined;
      self.showIconMenu('right');
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
    // console.log('- SimulateComponent editEvent map:', map);
    const
      self = this,
      model = self.model,
      force = self.forceComponent.getForceDirectedGraph(),
      parsed = JSON.parse(map),
      command = parsed.command,
      param = parsed.param;
    d3.selectAll('.pulldown').attr('style', 'display: none;');
    if ('editDismiss' === command) {
      self.editingNode = undefined; // *ngIf in template
      self.editingResource = undefined;
      self.showIconMenu('right');
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
        attribute = param.attribute,
        _node = model.NodeFactory(param.node);
      if (self.editingNode[attribute] !== _node[attribute]) {
        self.editingNode[attribute] = _node[attribute];
        if ('shape' === attribute) {
          self.editingNode.size = _node.size;
        }
      }
      self.showNode([_node]);
      // const
      //   simNode = model.SimNodeFactory(_node),
      //   d3node = d3.select('g#' + _node._id);
      // d3node.datum(simNode);
      self.model.renderNode(_node);
    } else if ('resourceChange' === command) {
      const
        _id = param._id,
        attribute = param.attribute,
        _resource = param.resource;
      if (self.editingResource[attribute] !== _resource[attribute]) {
        self.editingResource[attribute] = _resource[attribute];
        model.updateResource(self.editingResource);
      }
    }
  }

  filterEvent(map: string) {
    console.log('- SimulateComponent filterEvent map:', map);
    const
      self = this,
      model = self.model,
      force = self.forceComponent.getForceDirectedGraph(),
      parsed = JSON.parse(map),
      command = parsed.command,
      param = parsed.param;
    d3.selectAll('.pulldown').attr('style', 'display: none;');
    let doRestart = false;
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
          node.visible = true;
          return <Node>node;
        });
        self.links = globals.graph.links.map(link => {
          link.visible = true;
          return <Link>link;
        });
      } else if ('hideAll' === param) {
        self.nodes = globals.graph.nodes.map(node => {
          if (node.visible) {
            node.visible = false;
          }
          return <Node>node;
        });
        self.links = globals.graph.links.map(link => {
          link.visible = false;
          return <Link>link;
        });
      } else {
        self.filterOut(param);
      }
      // self.filterOut(param);
      doRestart = true;
    } else if ('searchOpen' === command) {
      self.searching = true; // *ngIf in template
      self.filtering = undefined; // *ngIf in template
      self.showIconMenu('right');
      self.hideIconMenu('left');
    }
    if (doRestart) {
      force.restart({ nodes: self.nodes, links: self.links });
    }
  }

  searchEvent(map: string) {
    console.log('- SimulateComponent searchEvent map:', map);
    const
      self = this,
      model = self.model,
      force = self.forceComponent.getForceDirectedGraph(),
      parsed = JSON.parse(map),
      command = parsed.command,
      param = parsed.param;
    d3.selectAll('.pulldown').attr('style', 'display: none;');
    let doRestart = false;
    if ('modalSpinner' === command && param) {
      const
        state = param.state,
        top = param.top,
        left = param.left;
      setTimeout(() => {
        if ('start' === state) {
          self.modalSpinner = true;
        } else if ('stop' === state) {
          self.modalSpinner = false;
        }
      }, 10);
      setTimeout(() => {
        const modalSpinnerEl = <HTMLElement>document.getElementById('modalSpinner');
        modalSpinnerEl.style.top = top || '300px';
        // modalSpinnerEl.style.left = left || '300px';
      }, 100);
    } else if ('openInfo' === command) {
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
      this.addGoogleBook(param);
      doRestart = true;
    } else if ('videorecord' === command) {
      console.log('videorecord ' + param);
      this.addYouTube(param);
      doRestart = true;
    } else if ('addPC295' === command) {
      this.addPC295(param);
      // doRestart = true;
    } else if ('clearSearch' === command) {
      this.clearSearch();
      doRestart = true;
    } else if ('filterOpen' === command) {
      self.filtering = true; // *ngIf in template
      self.searching = undefined; // *ngIf in template
      self.hideIconMenu('left');
      self.showIconMenu('right');
    }
    if (doRestart) {
      force.restart({ nodes: self.nodes, links: self.links });
    }
  }

  // Menu
  hideIconMenu = (side?) => {
    const hideRight = () => {
      const drawmodeEl: HTMLElement = <HTMLElement>document.querySelector('#draw_mode');
      drawmodeEl.style.display = 'none';
      const notenameEl: HTMLElement = <HTMLElement>document.querySelector('#note_name');
      if (notenameEl) {
        notenameEl.style.display = 'none';
      }
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
    } else {
      hideRight();
      hideLeft();
    }
  }

  showIconMenu = (side?) => {
    const showRight = () => {
      const drawmodeEl: HTMLElement = <HTMLElement>document.querySelector('#draw_mode');
      drawmodeEl.style.display = 'block';
      const notenameEl: HTMLElement = <HTMLElement>document.querySelector('#note_name');
      if (notenameEl) {
        notenameEl.style.display = 'block';
      }
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

  addNode(node: Node) {
    const
      self = this,
      model = self.model,
      idx = node.idx,
      resource = model.findResourceById(idx),
      key = resource.key;
    self.util.appendBy_id(self.nodes, node);
    self.util.appendBy_id(globals.graph.nodes, node);
    if (key) {
      globals.nodeIndexer[key] = node;
    }
    globals.nodeIndexer[idx] = node;
  }

  addLink(link: Link) {
    const
      self = this,
      model = self.model,
      idx = link.idx,
      annotation = model.findAnnotationById(idx),
      key = annotation.key;
    self.util.appendBy_id(self.links, link);
    self.util.appendBy_id(globals.graph.links, link);
    if (key) {
      globals.linkIndexer[key] = link;
    }
    globals.linkIndexer[idx] = link;
    // setTimeout(() => {
      // model.renderLink(link);
    // }, 500);
  }

  hideNode(nodes: Node[]) {
    const self = this;
    for (const node of nodes) {
      node.visible = false;
      for (let i = 0; i <  self.nodes.length; i++) {
        const _node = self.nodes[i];
        if (node._id === _node._id) {
          self.nodes.splice(i, 1);
        }
      }
    }
  }

  hideLink(links: Link[]) {
    const self = this;
    for (const link of links) {
      link.visible = false;
      for (let i = 0; i <  self.links.length; i++) {
        const _link = self.links[i];
        if (link.source_id === _link.source_id ||
            link.target_id === _link.target_id
        ) {
          self.links.splice(i, 1);
        }
      }
    }
  }

  showNode(nodes: Node[]) {
    const
      self = this,
      util = self.util;
    for (const node of nodes) {
      // node.changed = true;
      node.visible = true;
      console.log('showNodes node:', node);
      this.addNode(node);
      // util.appendBy_id(self.nodes, node);
      // util.appendBy_id(globals.graph.nodes, node);
    }
  }

  showLink(links: Link[]) {
    const
      self = this,
      util = self.util,
      model = self.model;
    for (const link of links) {
      // const d3link = d3.select('#' + link._id);
      link.visible = true;
      this.addLink(link);
      model.renderLink(link);
      model.updateLinkCount();
      // util.appendBy_id(self.links, link);
      // util.appendBy_id(globals.graph.links, link);
    }
  }

  filterOut(param) {
    console.log(param);
    const
      self = this,
      util = this.util,
      model = this.model;
    const
      groupsSelect = param.groupsSelect
        .filter(group => group.checked)
        .map(group => group.value || 'undefined'),
      rolesSelect = param.rolesSelect
        .filter(role => role.checked)
        .map(role => role.value || 'undefined');
    for (const node of globals.graph.nodes) {
      const group = node.group || 'undefined';
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
        role = link.role || 'undefined',
        source = model.findNodeBy_id(link.source_id),
        target = model.findNodeBy_id(link.target_id),
        sourceGroup = source.group || 'undefined',
        targetGroup = target.group || 'undefined';
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
      self = this,
      force = self.forceComponent.getForceDirectedGraph();
    globals.graph.nodes.map(node => {
      if (node.visible) {
        node.visible = false;
      }
    });
    globals.graph.links.map(link => {
      if (link.visible) {
        link.visible = false;
      }
    });
    self.nodes = [];
    self.links = [];
    force.restart({ nodes: self.nodes, links: self.links });
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

  toastMessage(message: string, action: string) {
    const
      options = {
        closeButton: true,
        positionClass: 'toast-bottom-center'
      };
    this.toast[action](message, action.toUpperCase(), options);
  }

  listener = function(event) {
    event.stopPropagation();
    const
      data = event.data;
    if (data && data.type) {
      console.log('--- event listener', data.type, data);
      if (data.type === "FROM_CEXT" ||
          data.type === "FROM_SFEX" ||
          data.type === "NEW_OCCURRENCE") {
        // wuwei.tao.newoccurrence( data );
      } else if (data.type === "NEW_OCCURRENCES") {
        // wuwei.tao.newoccurrences( data );
      }
      return;
    }
  };

}
