import {
  Component,
  Input,
  Output,
  // ChangeDetectorRef,
  // HostListener,
  // ChangeDetectionStrategy,
  ViewChild,
  OnInit,
  AfterViewInit,
  EventEmitter
} from '@angular/core';
import {
  FormGroup,
  FormControl,
  Validators,
  FormBuilder
} from '@angular/forms';
import { Router } from '@angular/router';
// import { MatDialog } from '@angular/material';
import { Subscription } from 'rxjs/Subscription';
// import { UploadS3Component } from '../shared/upload-s3/upload-s3.component';
import { UploadFile, UploadInput, UploadOutput } from '../mdb-type/pro/file-input';
import { humanizeBytes } from '../mdb-type/pro/file-input';
import { ToastService } from '../mdb-type/pro/alerts';
// import { LinksComponent } from '../mdb-type/free/navbars/links.component';
import {
  faArrowsAlt,
  faPencilRuler,
  faBookOpen
} from '@fortawesome/free-solid-svg-icons';
import {
  AnnotationService,
  CognitoUserService,
  LinkService,
  MessageService,
  NodeService,
  NoteService,
  ResourceService,
  S3Service,
  TranslatePipe,
  WpPostService,
  // WpUserService,
  WuweiService
} from '../services';
import { NoteComponent } from '../note';
import { PageComponent } from '../page';
import { UploadComponent } from '../upload';
// import { AWS_ENV } from 'assets/config/environment.aws';

import { GraphComponent } from '../draw/visuals/graph/graph.component';
import {
  Annotation,
  Resource
} from '../model';
import {
  Link,
  Node,
  Note,
  Page,
  WuweiModel
} from '../model/wuwei';
import { FORCE } from 'assets/config/environment.force';
import * as globals from '../model/wuwei-globals';
import * as d3 from 'd3';
import * as uuid from 'uuid';

declare function escape(s: string): string;
declare function unescape(s: string): string;

function updateWifi() {
  const el = document.querySelector('#status');
  if (el && globals.status.isOnline) {
    if (el.classList.contains('wifi')) {
      el.classList.remove('wifi');
      el.classList.add('wifi_1');
    } else if (el.classList.contains('wifi_1')) {
      el.classList.remove('wifi_1');
      el.classList.add('wifi_2');
    } else if (el.classList.contains('wifi_2')) {
      el.classList.remove('wifi_2');
      el.classList.add('wifi_3');
    } else if (el.classList.contains('wifi_3')) {
      el.classList.remove('wifi_3');
      el.classList.add('wifi');
    }
    return el;
  }
  return null;
}

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss']
})
export class MenuComponent implements OnInit, AfterViewInit {

  @Input()
  supportedOperations = [];

  @Output()
  menuEvent = new EventEmitter<any>();

  @ViewChild('saveModal') saveModal;
  @ViewChild('noteModal') noteModal;
  @ViewChild('pageModal') pageModal;
  @ViewChild('uploadModal') uploadModal;

  @ViewChild(NoteComponent) noteComponent: NoteComponent;
  @ViewChild(PageComponent) pageComponent: PageComponent;
  @ViewChild(UploadComponent) uploadComponent: UploadComponent;

  saveConfig = {
    backdrop: true,
    keyboard: true
  }; // menu.component.html required property

  private simulate;
  private token;

  // Font awesome icons
  faArrowsAlt = faArrowsAlt;
  faPencilRuler = faPencilRuler;
  faBookOpen = faBookOpen;

  lang; // nls translation
  languages: Array<any>; // for select option

  graphComponent: GraphComponent;
  subscription: Subscription;

  menuTimer;
  MENU_TIMEOUT = 1000;

  isOnline;
  playing;

  notes: Note[];
  note: Note;
  page: Page;

  note_id = globals.current.note_id;
  note_name = globals.current.note_name;
  currentPage = globals.current.currentPage;
  page_name: string = '';

  transform = globals.current.page.transform;
  scale = this.transform.scale;
  translation = { x: this.transform.x, y: this.transform.y } || { x: 0, y: 0 };

  ownerId = null;
  userRole = '';
  loggedIn = false;
  currentUser;

  allNodes = [];
  hoveredNode;
  selectedNode;
  editingNode;
  connecting = false;

  canvasEl;
  menuEl;
  startCircle;
  editingCircle;

  modal = null;
  modalText: string;
  modalDescription: string;

  saveForm: FormGroup;
  name = new FormControl('', Validators.required);
  description = new FormControl('');

  svgId;
  POST;
  NoteSaveMode;
  hasNode;

  private prefix: string;
  private uploadFile: any;
  public uploadResult: string = '';

  formData: FormData;
  files: UploadFile[];

  uploadInput: EventEmitter<UploadInput>;
  humanizeBytes: Function;
  dragOver: boolean;

  constructor(
    private router: Router,
    private toast: ToastService,
    // private dialog: MatDialog,
    private fb: FormBuilder,
    private messageService: MessageService,
    private auth: CognitoUserService,
    private noteService: NoteService,
    // private nodeService: NodeService,
    // private linkService: LinkService,
    // private resourceService: ResourceService,
    // private annotationService: AnnotationService,
    private util: WuweiService,
    private model: WuweiModel,
    // private graphComponent: GraphComponent,
    private wpPostService: WpPostService,
    private s3: S3Service,
    // private uploadS3Component: UploadS3Component
    // private drawService: DrawService
    private translate: TranslatePipe
  ) {
    const self = this;
    self.languages = globals.nls.label;
    const _language = localStorage.getItem('language');
    if (_language) {
      globals.nls.LANG = _language;
    }
    self.lang = globals.nls.LANG;

    self.simulate = FORCE.SIMULATE;

    globals.module.wuweiModel = model;
    globals.module.messageService = messageService;

    self.isOnline = globals.status.isOnline;
    // self.playing = globals.status.playing;

    self.currentUser = self.getCurrentUser();
    self.token = self.currentUser.token; // this.getToken();

    self.svgId = globals.status.svgId;
    self.files = [];
    self.uploadInput = new EventEmitter<UploadInput>();
    self.humanizeBytes = humanizeBytes;

    self.subscription = messageService.undoRedo$.subscribe(
      json => {
        const
          parsed = JSON.parse(json),
          action = parsed.action;
        self.updateUndoRedoButton();
      },
      err => {
        self.toastMessage('MenuComponent' + JSON.stringify(err), 'error');
      }
    );

    self.subscription = messageService.statusNotify$.subscribe(
      json => {
        const
          parsed = JSON.parse(json),
          status = parsed.net;
        self.isOnline = globals.status.isOnline || 'online' === status;
      },
      err => {
        self.toastMessage('MenuComponent' + JSON.stringify(err), 'error');
      }
    );

    self.subscription = messageService.mouseOver$.subscribe(
      json => {
        const
          model = self.model,
          util = self.util,
          parsed = JSON.parse(json);
        const data = {
          node: null,
          link: null,
          position: null
        };

        clearTimeout(self.menuTimer);

        if (parsed.position) {
          data.position = parsed.position;
        }
        if (parsed.node) {
          data.node = self.hoveredNode = model.NodeFactory(parsed.node);
        }
        if (parsed.link) {
          data.link = self.hoveredNode = model.LinkFactory(parsed.link);
        }

        self.openContextMenu(data);

        // const menu = d3.select('#ContextMenu');
        // menu
        //   .on('mouseover', () => {
        //     clearTimeout(self.menuTimer);
        //   })
        //   .on('mouseout', () => {
        //     self.menuTimer = setTimeout(function() {
        //       self.hoveredNode = undefined;
        //       self.closeContext();
        //     }, self.MENU_TIMEOUT);
        //   });
      },
      err => {
        self.toastMessage('MenuComponent' + JSON.stringify(err), 'error');
      }
    );

    self.subscription = messageService.mouseOut$.subscribe(
      json => {
        self.menuTimer = setTimeout(() => {
          // Close #ContextMenu only when operation list is not shown
          const
            menuCMND = d3.select('#contextCMND'),
            menuEDIT = d3.select('#contextEDIT');
          let
            menuVisible = false,
            menuCMND_node = null, menuCMND_collapsed = null,
            menuEDIT_node = null, menuEDIT_collapsed = null;
          if (menuCMND) {
            menuCMND_node = menuCMND.node();
            if (menuCMND_node) {
              menuCMND_collapsed = menuCMND.attr('collapsed');
              if (!menuCMND_collapsed) {
                menuVisible = true;
              }
            }
          }
          if (menuEDIT) {
            menuEDIT_node = menuEDIT.node();
            if (menuEDIT_node) {
              menuEDIT_collapsed = menuEDIT.attr('collapsed');
              if (!menuEDIT_collapsed) {
                menuVisible = true;
              }
            }
          }
          if (!menuVisible) {
            self.hoveredNode = undefined;
            self.closeContext();
          }
          d3.select('#ContextMenu').classed('collapsed', true);
        }, self.MENU_TIMEOUT);
      },
      err => {
        self.toastMessage('MenuComponent' + JSON.stringify(err), 'error');
      }
    );

    self.subscription = messageService.closeMenu$.subscribe(
      json => {
        // console.log('messageService.closeMenu$');
        self.hoveredNode = null;
        self.closeContext();
        d3.select('#ContextMenu').classed('collapsed', true);
      },
      err => {
        self.toastMessage('MenuComponent' + JSON.stringify(err), 'error');
      }
    );

    self.subscription = messageService.editMade$.subscribe(
      json => {
        self.updateUndoRedoButton();
      },
      err => {
        self.toastMessage('MenuComponent' + JSON.stringify(err), 'error');
      }
    );

    self.saveForm = self.fb.group({
      name: self.name,
      description: self.description
    });
    // this.intervalID = window.setInterval(updateWifi, 4000);
  }

  ngOnInit() {
    // this.auth.isAuthenticated();
    const
      self = this,
      map = self.model.initNote();
    self.note = map.note;
    self.page = map.page;
  }

  ngAfterViewInit() {
    this.checkSignedin();
    /** menu icon */
    const menu = document.getElementsByClassName('menu-icon')[0];
    menu.addEventListener('mouseover', (event) => {
      menu.classList.add('active');
    });
    menu.addEventListener('mouseout', (event) => {
      menu.classList.remove('active');
    });
    setTimeout(() => {
      const langSelect: HTMLElement = <HTMLElement>document.querySelector('#language .mat-select-value-text span');
      if (langSelect && langSelect.style) {
        langSelect.style.fontSize = '10pt';
        langSelect.style.color = '#d0d0d0';
      }
    }, 500);
    /** upload modal */
  }

  // ------------------- BEGIN METHODS ------------------
  getCurrentUser() {
    let currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
      currentUser = JSON.parse(currentUser);
      if (currentUser) {
        this.currentUser = currentUser;
        return this.currentUser;
      }
    }
    this.currentUser = {};
    return this.currentUser;
  }

  getToken() {
    let currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
      currentUser = JSON.parse(currentUser);
      if (currentUser) {
        return currentUser['token'];
      }
    }
    return null;
  }

  checkSignedin() {
    // const token = this.getToken();
    // return !! token;
    this.auth
      .isAuthenticated()
      .then((res) => {
        this.loggedIn = this.auth.loggedIn;
        this.currentUser = this.auth.currentUser;
        return console.log(res);
      })
      .catch((err) => {
        this.loggedIn = false;
        this.currentUser = this.auth.currentUser;
        return console.log(err);
      });
  }

  toggleDrawMode() {
    FORCE.SIMULATE = !FORCE.SIMULATE;
    this.simulate = FORCE.SIMULATE;
    d3.selectAll('g.node')
      .select('.shape-node, .memo-node')
      .style('filter', function(d) { return null; }); // remove fixed shadow
    d3.selectAll('g.node').style('opacity', 1);
    d3.selectAll('g.link').style('opacity', 1);
  }

  isObject(val) { return typeof val === 'object'; }

  Operations = {
    // operations are defined as 'method', 'display name', 'optional rule', 'style', 'icon'
    type : {
      'Node' : [
        'expand',
        'collapse',
        'root',
        'hide'
      ],
      'EditNode': [
        'edit',
        'addContent',
        'addTopic',
        'addMemo',
        'copy',
        'paste',
        'cancelCopy',
        'erase'
      ],
      'EditLink': [
        'reverse',
        'copy',
        'paste',
        'clone',
        'cancelCopy',
        'erase'
      ],
      'Link' : [
        'hide'
      ]
    },
    list : this.util.OperationsList, // allNodes are all selected nodes
    isSupported : function(operation, nodes, context, util) {
      // const util = self.util;
      let operations;
      if (util.isEmpty(nodes)) {return true; }
      for (let i = 0; i < nodes.length; i += 1) {
        if (util.notEmpty(nodes[i])) {
          let type = '';
          if ('EDIT' === context) {
            if ('Link' === nodes[i].type) {
              type = 'EditLink';
            } else {
              type = 'EditNode';
            }
          } else {
            if ('Link' === nodes[i].type) {
              type = 'Link';
            } else {
              type = 'Node';
            }
          }
          operations = this.type[type];
          if (util.isEmpty(operations) || ! util.contains(operations, operation)) {
            return false;
          }
        }
      }
      return true;
    },
    getSupported: function(allNodes, context, util) {
      const
        self = this,
        // allNodes = [hoveredNode],
        hoveredNode = allNodes[0],
        supportedOperations = [];
      let operations;
      if ('CMND' === context) {
        if ('Link' === hoveredNode.type) {
          operations = self.type['Link'];
        } else {
          operations = self.type['Node'];
        }
      } else if ('EDIT' === context) {
        if ('Link' === hoveredNode.type) {
          operations = self.type['EditLink'];
        } else {
          operations = self.type['EditNode'];
        }
      }
      for (const operation of operations) { // } self.Operations.type[hoveredNode.type]) {
        const _operation = self.list[operation];
        if (_operation) {
          const operationList = [ operation ];
          operationList[1] = _operation[0];
          operationList[2] = _operation[1];
          operationList[3] = _operation[2] || null;
          operationList[4] = _operation[3] || null;
          if (self.isSupported(operation, allNodes, context, util)) {
            const validator = operationList[2];
            if (validator) {
              if (validator(allNodes, util)) {
                supportedOperations.push(operationList);
              }
            } else {
              supportedOperations.push(operationList);
            }
          }
          /* if (globals.status.Copying) {
            if (copyingOperation.indexOf(operation) >= 0) {
              operationList[5] = true;
            } else {
              operationList[5] = false;
            }
          } else {
            if (copyingOperation.indexOf(operation) < 0) {
              operationList[5] = true;
            } else {
              operationList[5] = false;
            }
          }*/
        }
      }
      // console.log(supportedOperations);
      return supportedOperations;
    }
  };

  onSelectChange($event, attribute) {
    const
      value = $event.value;
    if ('lang' === attribute) {
      this.lang = value;
      globals.nls.LANG = this.lang;
      localStorage.setItem('language', this.lang);
    }
  }

  saveNoteState() {
    const
      self = this,
      util = self.util;
    globals.current.page.thumbnail = util.createThumbnail();

   this.savePageState();

    self.note = new Note({
      _id: '_' + uuid.v4(),
      pages: globals.current.pages,
      currentPage: globals.current.currentPage,
      resources: globals.resources,
      annotations: globals.annotations,
      resourceIndexer: globals.resourceIndexer,
      annotationIndexer: globals.annotationIndexer
    });
    self.note.creator_ref = self.currentUser ? self.currentUser._id : null;
    if (self.note_id) { self.note._id = self.note_id; }
    self.note.name = self.note_name;
    self.note.thumbnail = globals.current.page.thumbnail;
    self.note.created = new Date().toISOString();

    return self.note.thumbnail;
  }

  savePageState() {
    const
      self = this,
      util = self.util;
    globals.current.page.thumbnail = util.createThumbnail();

    globals.current.page.transform = {
      x: self.translation.x || 0,
      y: self.translation.y || 0,
      scale: self.scale || 1.0
    };

    const page = new Page({
      pp: globals.current.currentPage,
      nodes: globals.graph.nodes,
      links: globals.graph.links,
      nodeIndexer: globals.nodeIndexer,
      linkIndexer: globals.linkIndexer,
      transform: globals.current.page.transform,
      thumbnail: globals.current.page.thumbnail
    });

    if (!globals.current.pages || globals.current.pages.length === 0) {
      globals.current.pages = [page];
    } else {
      globals.current.pages = globals.current.pages.map(_page => {
        if (page.pp === _page.pp) {
          return page;
        } else {
          return _page;
        }
      });
    }
  }

  openModal(id: string) {
    const modal = d3.select('#' + id);
    modal.attr('style', 'display:block');
  }

  closeModal(id: string) {
    const modal = d3.select('#' + id);
    modal.attr('style', 'display:none');
  }

  clicked(command) {
    switch (command) {
      case 'copy':
        // this.copyClicked();
        break;
      // case 'showAll':
      //   this.showallClicked();
      //   break;
      // case 'hideAll':
      //   this.hideallClicked();
      //   break;
      // case 'closeFilter':
      //   this.closefilterClicked();
      //   break;
      // case 'closeSearch':
      //   this.closesearchClicked();
      //   break;
      // case 'play-pause':
      //   this.playPauseClicked();
      //   break;
      default:
        this.toastMessage(command + ' clicked', 'info');
    }
    return false;
  }

  menuOpen(menu) {
    const
      pulldown = document.getElementsByClassName('pulldown'),
      display = menu.getAttribute('style').match(/display:\s[a-z]+;/g)[0].match(/[\w\.\-]+/g)[1],
      len = pulldown.length;
    for (let i = 0; i < len; i++) {
      pulldown[i].setAttribute('style', 'display: none;');
    }
    if ('none' === display) {
      menu.setAttribute('style', 'display: block;');
    } else {
      menu.setAttribute('style', 'display: none;');
    }
  }

  // --- zoomin
  zoominClicked() {
    const json = JSON.stringify({'command': 'zoomin'});
    this.messageService.notifyDrawing(json);
  }
  // --- zoomout
  zoomoutClicked() {
    const json = JSON.stringify({'command': 'zoomout'});
    this.messageService.notifyDrawing(json);
  }
  // --- zoom reset to 1.0
  reset_viewClicked() {
    const json = JSON.stringify({'command': 'reset_view'});
    this.messageService.notifyDrawing(json);
  }

  mouseoverPulldown(menuId) {
    const
      menu = document.getElementById(menuId),
      header = menu.getElementsByClassName('header')[0],
      toggler = header.getElementsByTagName('i')[0];
    toggler.className = 'fa fa-times fa-fw';
    // toggler.classList.add('fa-times');
  }

  mouseoutPulldown(menuId, classname) {
    const
      menu = document.getElementById(menuId),
      header = menu.getElementsByClassName('header')[0],
      toggler = header.getElementsByTagName('i')[0];
    // toggler.classList.remove('fa-cog');
    toggler.classList.remove('fa-times');
    toggler.classList.add(classname);
  }

  closePulldown(menuId) {
    const
      menu = document.getElementById(menuId);
    menu.setAttribute('style', 'display: none;');
  }

  listNoteModal() {
    this.noteModal.show();
    this.noteComponent.open(this.currentUser);
  }

  newNote(note) {
    this.note_id = '_' + uuid.v4();
    this.note_name = note.name;
    this.initNote();
    note._id = this.note_id;
    note.name = this.note_name;
  }

  saveNoteModal(mode) {
    this.NoteSaveMode = mode;
    this.saveNoteState();
    const note = this.note;
    if (globals.graph.nodes.length > 0) {
      this.hasNode = true;
      setTimeout(() => {
        d3.select('#noteMiniature').attr('src', globals.current.page.thumbnail);
      }, 100);
    } else {
      this.hasNode = false;
    }
    if ('new' !== mode) {
      this.saveNoteState();
    }
    this.saveModal.show();
  }

  onNoteNameChange($event) {
    const
      note_name = $event.target.value,
      current_note_name = this.note_name;
    if (!this.note.name) {
      this.NoteSaveMode = 'new';
      this.note.name = note_name;
      this.newNote(this.note);
    } else if (current_note_name !== this.note.name) {
      this.NoteSaveMode = 'save_as';
    } else {
      this.NoteSaveMode = 'save';
    }
  }

  saveNote(note) {
    const token = this.getToken();
    note.modified = new Date().toISOString();
    if (globals.status.isOnline) {
      if (token) {
        this.wpPostService.addNote(token, note).subscribe(
          res => {
            if (200 === res.status) {
              this.toastMessage((note.name || note._id) + ' saved successfully.', 'success');
            } else {
              this.toastMessage((note.name || note._id) + ' failed to save.', 'error');
            }
            this.saveModal.hide();
          },
          error => {
            console.log(error);
            this.toastMessage((note.name || note._id) + ' failed to save.', 'error');
          }
        );
      }
      if ('new' === this.NoteSaveMode || 'save_as' === this.NoteSaveMode) {
        this.noteService.addNote(note).subscribe(
          res => {
            if (200 === res.status) {
              this.toastMessage((note.name || note._id) + ' saved successfully.', 'success');
            } else {
              this.toastMessage((note.name || note._id) + ' failed to edit.', 'error');
            }
          },
          error => console.log(error)
        );
      } else {
        this.noteService.editNote(note).subscribe(
          res => {
            if (200 === res.status) {
              this.toastMessage((note.name || note._id) + ' saved successfully.', 'success');
            } else {
              this.toastMessage((note.name || note._id) + ' failed to edit.', 'error');
            }
            this.saveModal.hide();
          },
          error => console.log(error)
        );
      }
    } else {
      this.toastMessage('INTERNET DISCONNECTED', 'error');
    }
    setTimeout(() => {
      this.saveModal.hide();
    }, 500);
  }

/*  saveNoteAs(note) {
    note._id = '_' + uuid.v4();
    note.created = new Date().toISOString();
    if (globals.status.isOnline) {
      this.noteService.addNote(note).subscribe(
        res => {
          if (200 === res.status) {
            this.toastMessage((note.name || note._id) + ' saved successfully.', 'success');
          } else {
            this.toastMessage((note.name || note._id) + ' failed to save.', 'error');
          }
        },
        error => console.log(error)
      );
    } else {
      this.toastMessage('INTERNET DISCONNECTED', 'error');
    }
  }
*/

  listPageModal() {
    this.pageModal.show();
    let pages = globals.current.pages;
    if (!pages || pages.length === 0) {
      pages = [globals.current.page];
    }
    this.pageComponent.open(pages);
  }

  addPage() {
    const self = this;

    self.savePageState();

    const page = self.pageComponent.addPage();
    globals.current.page = page;
    globals.current.pages.push(page);
    self.menuEvent.emit(JSON.stringify({
      command: 'addPage',
      param: {
        page: page
      }
    }));
  }

  openContextMenu = (data) => {
    if (globals.status.dragging) {
      return;
    }
    clearTimeout(this.menuTimer);
    this.selectedNode = null;
    this.canvasEl = document.getElementById(globals.status.canvasId);
    this.editingCircle = document.getElementById('Editing');
    this.canvasEl.appendChild(this.editingCircle);
    this.startCircle = document.getElementById('Start'),
    this.canvasEl.appendChild(this.startCircle);
    const
      self = this,
      model = self.model;

    Promise.resolve(data)
      .then(data => {
        const
          node = data.node,
          link = data.link,
          position = data.position;
        if (node) {
          self.hoveredNode = node;
          const d3node = d3.select('g.node#' + node._id);
          if (d3node) {
            d3node.raise();
          }
        } else if (link) {
          self.hoveredNode = link;
          const d3link = d3.select('g.link#' + link._id);
          if (d3link) {
            d3link.raise();
          }
        }
        return data;
      })
      .then(data => {
        const
          node = data.node,
          link = data.link;
        self.menuEl = document.getElementById('ContextMenu');
        if (self.menuEl) {
          self.canvasEl.appendChild(self.menuEl);
          let x, y;
          if (node) {
            if (Number.isFinite(node.x) && Number.isFinite(node.y)) {
              x = node.x;
              y = node.y;
            }
          } else if (link) {
            if (Number.isFinite(link.x) && Number.isFinite(link.y)) {
              x = link.x;
              y = link.y;
            }
          }
          if (Number.isFinite(x) && Number.isFinite(y)) {
            self.menuEl.setAttribute('transform', 'translate(' + [x, y] + ')');
          }
        }
        return data;
      })
      .then(data => {
        const
          node = data.node,
          link = data.link;
        const
          menu = d3.select('#ContextMenu'),
          hovered = d3.select('#Hovered'),
          pin = d3.select('#MenuPIN'),
          sel = d3.select('#MenuSEL'),
          cmnd = d3.select('#MenuCMND'),
          edit = d3.select('#MenuEDIT'),
          info = d3.select('#MenuINFO');

        menu.classed('collapsed', false);
        sel.classed('collapsed', true);
        cmnd.classed('collapsed', true);
        edit.classed('collapsed', true);
        info.classed('collapsed', true);

        // menu
        menu
          .on('mouseover', () => {
            clearTimeout(self.menuTimer);
          })
          .on('mouseout', () => {
            self.menuTimer = setTimeout(function() {
              self.hoveredNode = undefined;
              self.closeContext();
            }, self.MENU_TIMEOUT);
          });

        // hoveredCircle
        if (node) {
          hovered.attr('class', node._id);
        } else if (link) {
          hovered.attr('class', link._id);
        }

        // Selected circle
        let selected = d3.select('#Selected');
        if (!selected || !selected.node()) {
          selected = menu.append('circle')
            .attr('id', 'Selected');
        }
        if (node) {
          selected
            .attr('class', 'node')
            .attr('r', 32)
            .attr('fill', 'none')
            .attr('stroke', globals.Color.outerSelected)
            .attr('stroke-width', 8)
            .datum(node);
        } else if (link) {
          selected
            .attr('class', 'link') // link._id)
            .attr('r', 8)
            .attr('fill', globals.Color.innerSelected)
            .attr('stroke', 'none')
            .datum(link);
          }

        // ContextSEL
        if (node) {
          sel
            .classed('collapsed', false)
            .on('mousedown', d => {
              const
                d3event = d3.event,
                id = hovered.attr('class'),
                node = model.findNodeBy_id(id);
              d3event.stopPropagation();
              if (!globals.status.Connecting) {
                globals.status.Connecting = true;
                sel
                  .text('\uf14a') // checked
                  .attr('fill', '#87ceeb');
                self.startCircle.style.opacity = '1';
                self.startCircle.setAttribute('cx', '' + node.x);
                self.startCircle.setAttribute('cy', '' + node.y);
                globals.status.startNode = node;
              } else {
                if (globals.status.startNode._id) {
                  if (id === globals.status.startNode._id) {
                    globals.status.Connecting = false;
                    globals.status.startNode = null;
                  } else { // connect
                    const
                      source_node = globals.status.startNode,
                      target_node = node,
                      body_resource = model.findResourceById(source_node.idx),
                      target_resource = model.findResourceById(target_node.idx);
                    model.saveCurrent({
                      node: [source_node, target_node],
                      resource: [body_resource, target_resource]
                    });
                    const
                      _annotation = <{link: Link, annotation: Annotation}>model.connect(globals.status.startNode, node);
                    let link, annotation, param, json;
                    link = _annotation.link;
                    link.visible = true;
                    annotation = _annotation.annotation;
                    // logData
                    const
                      logData = {
                        command: 'connect',
                        param: {
                          node: [source_node, target_node],
                          resource: [body_resource, target_resource],
                          link: [link],
                          annotation: [annotation]
                        }
                      };
                    model.storeLog(logData);
                    // notify
                    param = {
                      link: [link],
                      annotation: [annotation]
                    };
                    json = JSON.stringify({
                      command: 'connect',
                      param: param
                    });
                    self.messageService.notifyDrawing(json);
                  }
                }
                globals.status.Connecting = false;
                globals.status.startNode = null;
                sel.text('\uf046'); // check
                self.startCircle.style.opacity = '0';
              }
            })
            .raise();
          if (globals.status.Connecting && globals.status.startNode) {
            if (node._id === globals.status.startNode._id) {
              sel.text('\uf14a') // checked
                .attr('fill', '#87ceeb');
            } else {
              sel.text('\uf0c1'); // link
            }
          } else {
            sel.text('\uf046'); // check
          }
        }

        // ContextPIN
        if (node && node.fixed && FORCE.SIMULATE) {
          pin
            .on('mousedown', () => {
              let json;
              d3.event.stopPropagation();
              node.fixed = !node.fixed;
              const d3node = d3.select('g.node#' + node._id);
              if (node.fixed) {
                document.querySelector('g.node#' + node._id).classList.add('fixed');
                d3node
                  .select('.shape-node, .memo-node')
                  .style('filter', function(d) { return 'url(#fixed-shadow)'; });
              } else {
                document.querySelector('g.node#' + node._id).classList.remove('fixed');
                d3node
                  .select('.shape-node, .memo-node')
                  .style('filter', function(d) { return null; });
              }
              json = JSON.stringify({
                'command': 'fixedNode',
                'param': {
                  _id: node._id,
                  fixed: node.fixed
                }
              });
              // console.log('menuComponent pin mousedown', json);
              if (!node.fixed) {
                node.fx = null;
                node.fy = null;
                node.fixed = false;
                self.menuEvent.emit(json);
              } else {
                node.fx = node.x;
                node.fy = node.y;
                node.fixed = true;
                self.menuEvent.emit(json);
              }
              // self.messageService.closeMenu('{}');
              d3.select('#ContextMenu').classed('collapsed', true);
              d3.selectAll('.contextMenu').classed('collapsed', true);
              return false;
            })
            .on('mouseover', () => {
              pin.attr('fill', '#87ceeb');
            })
            .on('mouseout', () => {
              pin.attr('fill', '#808080');
            })
            .raise();
        }

        // ContextCMND
        if (!globals.status.Connecting) {
          cmnd
            .classed('collapsed', false)
            .on('mousedown', d => {
              const event = d3.event;
              event.stopPropagation();
              d3.select('#contextEDIT')
                .classed('collapsed', true);
              if (node) {
                self.ContextCMND(node, event);
              } else if (link) {
                self.ContextCMND(link, event);
              }
            })
            .raise();
          setTimeout(() => {
            const menuCMND = d3.select('#contextCMND');
            menuCMND
              .on('mouseover', d => {
                clearTimeout(self.menuTimer);
              })
              .on('mouseout', d => {
                self.menuTimer = setTimeout(() => {
                  self.hoveredNode = undefined;
                  d3.select('#contextCMND')
                    .classed('collapsed', true);
                }, self.MENU_TIMEOUT);
              });
            }, 500);
        } else {
          cmnd.classed('collapsed', true);
        }

        // ContextMenuEDIT
        if (!globals.status.Connecting) {
          edit
            .classed('collapsed', false)
            .on('mousedown', d => {
              const event = d3.event;
              event.stopPropagation();
              d3.select('#contextCMND')
                .classed('collapsed', true);
          if (node) {
                self.editingNode = node;
                self.ContextEDIT(node, event);
              } else if (link) {
                self.editingNode = link;
                self.ContextEDIT(link, event);
              }
            })
            .raise();
          setTimeout(() => {
            const menuEDIT = d3.select('#contextEDIT');
            menuEDIT
              .on('mouseover', d => {
                clearTimeout(self.menuTimer);
              })
              .on('mouseout', d => {
                self.menuTimer = setTimeout(() => {
                  self.hoveredNode = null;
                  d3.select('#contextEDIT')
                    .classed('collapsed', true);
                }, self.MENU_TIMEOUT);
              });
            }, 500);
        } else {
          edit.classed('collapsed', true);
        }

        // ContextMenuINFO
        if (!globals.status.Connecting) {
          if (node) {
            info
              .classed('collapsed', false)
              .on('mousedown', () => {
                d3.event.stopPropagation();
                const json = JSON.stringify({
                  command: 'openInfo',
                  param: {
                    type: 'node',
                    _id: node._id
                  }
                });
                self.menuEvent.emit(json);
                return false;
              })
            .on('mouseover', () => {
              info.attr('fill', '#87ceeb');
            })
            .on('mouseout', () => {
              info.attr('fill', '#808080');
            })
            .raise();
          } else {
            info.classed('collapsed', true);
          }
        } else {
          info.classed('collapsed', true);
        }

        menu.raise();
      });
  }

  closeContext = (MENU?) => {
    if (MENU) {
      d3.select('#context' + MENU)
        .classed('collapsed', true);
    } else {
      d3.selectAll('.contextMenu') // both #contextCMND, #contextEDIT
        .classed('collapsed', true);
    }
  }

  ContextCMND(hoveredNode, event) {
    const
      self = this,
      util = self.util;
    if (globals.status.Connecting) {
      return null;
    }
    clearTimeout(self.menuTimer); // cancel #ContextMenu close timer
    globals.status.hoveredNode = hoveredNode;
    globals.status.modal = true;

    d3.select('#contextEDIT')
      .classed('collapsed', true);

    self.hoveredNode = hoveredNode;
    self.allNodes = [hoveredNode];
    self.supportedOperations = self.Operations.getSupported(self.allNodes, 'CMND', util);

    const contextCMND = d3.select('#contextCMND');
    setTimeout(() => {
      contextCMND.classed('collapsed', false);
      self.contextUpdatePosition('CMND', hoveredNode, event);
    }, 200);

    return contextCMND;
  }

  ContextEDIT(hoveredNode, event) {
    const
      self = this,
      util = self.util;
    if (globals.status.Connecting) {
      return null;
    }
    clearTimeout(self.menuTimer); // cancel #ContextMenu close timer
    globals.status.hoveredNode = hoveredNode;
    globals.status.modal = true;

    d3.select('#contextCMND')
      .classed('collapsed', true);

    self.hoveredNode = hoveredNode;
    self.allNodes = [hoveredNode];
    self.supportedOperations = self.Operations.getSupported(self.allNodes, 'EDIT', util);

    const contextEDIT = d3.select('#contextEDIT');
    setTimeout(() => {
      contextEDIT.classed('collapsed', false);
      self.contextUpdatePosition('EDIT', hoveredNode, event);
    }, 200);

    return contextEDIT;
  }

  Context_Operate(method) {
    const
      self = this,
      model = self.model,
      util = self.util,
      nodes = [],
      links = [];
    let
      node,
      resource,
      json;
    // console.log(globals.graph.nodes);
    if ('edit' === method) {
      // d3.select(this.editingCircle).datum(() => node);
      node = self.hoveredNode;
      resource = model.findResourceById(node.idx);
      // const editingCircle = document.getElementById('Editing');
      // canvasEl.appendChild(editingCircle);
      this.editingCircle.style.opacity = '1';
      this.editingCircle.setAttribute('cx', '' + node.x);
      this.editingCircle.setAttribute('cy', '' + node.y);
      const json = JSON.stringify({
        command: 'openEdit',
        param: {
          type: 'node',
          node: node,
          resource: resource
        }
      });
      this.menuEvent.emit(json);

      self.allNodes = [];
      self.hoveredNode = undefined;
      self.updateUndoRedoButton();
      return;
    }

    if (model.hasOwnProperty(method)) {
      node = self.hoveredNode;
      if (!node) {
        return;
      }
      if ('Link' === node.type) {
        util.appendBy_id(links, node);
      } else {
      // if ('Resource' === node.type || 'Topic' === node.type || 'Memo' === node.type) {
        util.appendBy_id(nodes, node);
        const _links = model.findLinksByNode(node).links;
        for (const _link of _links) {
          util.appendBy_id(links, _link);
        }
      }
      if (['expand', 'hide', 'erase'].indexOf(method) >= 0) {
        model.saveCurrent({
          node: nodes,
          link: links
        });
      } else { // } if (['collapse', 'root'].indexOf(method) >= 0) {
        model.saveCurrent();
      }
      Promise.resolve({ method: method, allNodes: self.allNodes })
        .then(param => {
          const
            method = param.method,
            allNodes = param.allNodes;
          // operate
          // 'addContent', 'addTopic', 'addMemo', 'addLink', 'connect', 'collapse', 'expand'
          return model[method](allNodes);

        })
        .then(logData => {
          // logData contains all of the related nodes/links including hidden ones
          // 'addContent', 'addTopic', 'addMemo', 'addLink', 'connect' left visible unset
          console.log(method, logData, globals.graph.nodes);

          if (['addContent', 'addTopic', 'addMemo', 'addLink', 'connect'].indexOf(method) >= 0) {
            logData.param.node.map(node => {
              node.visible = true;
            });
            logData.param.link.map(link => {
              link.visible = true;
              model.renderLink(link);
            });
          }

          model.storeLog(logData);

          self.allNodes = [];
          self.hoveredNode = undefined;
          self.updateUndoRedoButton();

          json = JSON.stringify(logData);
          self.messageService.notifyDrawing(json);
          /** GraphComponent/ForceComponent subscribe this message
           *  and emit nodeEvent to DrawComponent/SimulateComponent
           */
        });
    } else {
      this.toastMessage('Model does not have method ' + method, 'warning');
    }
  }

  contextUpdatePosition(MENU, hoveredNode, event) {
    if (!hoveredNode) {
      return;
    }
    const
      self = this,
      menu = document.getElementById('context' + MENU);
    if (!menu) {
      hoveredNode = null;
      return;
    }
    const
      thisWidth = menu.offsetWidth,
      thisHeight = menu.offsetHeight,
      windowWidth = window.innerWidth,
      windowHeight = window.innerHeight,
      xMax = windowWidth - thisWidth - 4,
      yMax = windowHeight - thisHeight - 4;
    let
      x = event.layerX - 12,
      y = event.layerY - 12;
    menu.style.backgroundColor = '#ffffff';
    menu.style.boxShadow = '4px 8px 8px #808080';
    if (thisWidth === 0) {
      setTimeout(() => {
        self.contextUpdatePosition(MENU, hoveredNode, event);
      }, 50);
    }
    if (x > xMax) {
      x = xMax;
    }
    if (y > yMax) {
      y = yMax;
    }
    menu.style.left = x + 'px';
    menu.style.top = y + 'px';
  }

  mouseoverContext(MENU) {
    const
      menu = document.getElementById('context' + MENU),
      toggler = menu.getElementsByTagName('i')[0];
    if ('CMND' === MENU) {
      toggler.classList.remove('fa-cog');
    } else if ('EDIT' === MENU) {
      toggler.classList.remove('fa-pencil-square-o');
    }
    toggler.classList.add('fa-times');
    d3.select(toggler).on('mousedown', () => {
      menu.classList.add('collapsed');
    });
  }

  mouseoutContext(MENU) {
    const
      menu = document.getElementById('context' + MENU),
      toggler = menu.getElementsByTagName('i')[0];
    toggler.classList.remove('fa-times');
    if ('CMND' === MENU) {
      toggler.classList.add('fa-cog');
    } else if ('EDIT' === MENU) {
      toggler.classList.add('fa-pencil-square-o');
    }
  }

/*  mouseoverContextCMND() {
    const
      menu = document.getElementById('contextCMND'),
      toggler = menu.getElementsByTagName('i')[0];
    toggler.classList.remove('fa-cog');
    toggler.classList.add('fa-times');
    d3.select(toggler).on('mousedown', () => {
      menu.classList.add('collapsed');
    });
  }

  mouseoutContextCMND() {
    const
      menu = document.getElementById('contextCMND'),
      toggler = menu.getElementsByTagName('i')[0];
    toggler.classList.remove('fa-times');
    toggler.classList.add('fa-cog');
  }
*/
/*  mouseoverContextEDIT() {
    const
      menu = document.getElementById('contextEDIT'),
      toggler = menu.getElementsByTagName('i')[0];
    toggler.classList.remove('fa-cog');
    toggler.classList.add('fa-times');
    d3.select(toggler).on('mousedown', () => {
      menu.classList.add('collapsed');
    });
  }

  mouseoutContextEDIT() {
    const
      menu = document.getElementById('contextEDIT'),
      toggler = menu.getElementsByTagName('i')[0];
    toggler.classList.remove('fa-times');
    toggler.classList.add('fa-cog');
  }
*/

// --- menu
  mainMenuClicked() {
    const util = this.util;
    let url = this.util.router_previous_url;
    if ('/simulate' === url) {
      url = '/';
    }
    this.menuEvent.emit(JSON.stringify({
      command: 'closeScreen'
    }));
    globals.current.page.thumbnail = util.createThumbnail();
    this.util.router_url = '/draw';
    this.util.onscreen = false;
    this.router.navigate([url]);
    return false;
  }
  // --- note
  noteClicked() {
    const menu = document.getElementById('noteMenu');
    // this.NoName = this.note.name === '';
    this.menuOpen(menu);
    return false;
  }
  // --- page
  pageClicked() {
    const menu = document.getElementById('pageMenu');
    this.menuOpen(menu);
    return false;
  }
  // --- new
  newClicked() {
    const menu = document.getElementById('newMenu');
    this.menuOpen(menu);
    return false;
  }
  topicClicked() {
    const
      model = this.model,
      topic = model.addSimpleTopic(),
      node = topic.node,
      resource = topic.resource;
    node.visible = true;
    const
      logData = {
        'command': 'addSimpleTopic',
        'param': {
          node: [node],
          resource: [resource]
        }
      },
      json = JSON.stringify(logData);
    this.messageService.notifyDrawing(json);
    // log
    model.storeLog(logData);
    this.updateUndoRedoButton();
  }
  contentClicked() {
    const
      self = this,
      model = self.model,
      r = model.addSimpleContent(),
      node = r.node,
      resource = r.resource;
    node.visible = true;
    const
      logData = {
        'command': 'addSimpleContent',
        'param': {
          node: [node],
          resource: [resource]
        }
      },
      json = JSON.stringify(logData);
    self.messageService.notifyDrawing(json);
    // log
    model.storeLog(logData);
    self.updateUndoRedoButton();
  }
  memoClicked() {
    const
      self = this,
      model = this.model,
      m = model.addSimpleMemo(),
      node = m.node,
      resource = m.resource;
    node.visible = true;
    const
      logData = {
        'command': 'addSimpleMemo',
        'param': {
          node: [node],
          resource: [resource]
        }
      },
      json = JSON.stringify(logData);
    this.messageService.notifyDrawing(json);
    // log
    model.storeLog(logData);
    self.updateUndoRedoButton();
  }

  uploadClicked() {
    this.uploadModal.show();
    document.querySelector('#uploadModal .modal-content')
      .appendChild(
        document.getElementById('uploadModalClose')
      );
  }

  // see https://mdbootstrap.com/angular/components/inputs/
  showFiles() {
    let files = '';
    for (let i = 0; i < this.files.length; i++) {
      files += this.files[i].name;
      if (!(this.files.length - 1 === i)) {
        files += ', ';
      }
    }
    return files;
  }

/*  startUpload(): void {
    const event: UploadInput = {
      type: 'uploadAll',
      url: '/upload',
      method: 'POST',
      data: { foo: 'bar' },
      concurrency: 1
    };
    this.uploadInput.emit(event);
  }
*/
/*  cancelUpload(id: string): void {
    // this.uploadInput.emit({ type: 'cancel', id: id });
  }
*/
  onUploadOutput(output: UploadOutput | any): void {
    if (output.type === 'allAddedToQueue') {
    } else if (output.type === 'addedToQueue') {
      this.files.push(output.file); // add file to array when added
    } else if (output.type === 'uploading') {
      // update current data in files array for uploading file
      const index = this.files.findIndex(file => file.id === output.file.id);
      this.files[index] = output.file;
    } else if (output.type === 'removed') {
      // remove file from array when removed
      this.files = this.files.filter((file: UploadFile) => file !== output.file);
    } else if (output.type === 'dragOver') {
      this.dragOver = true;
    } else if (output.type === 'dragOut') {
    } else if (output.type === 'drop') {
      this.dragOver = false;
    }
    this.showFiles();
  }

  onInputChange(event: any) {
    const files = event.target.files;
    this.uploadFile = files[0];
  }

/*  upload() {
    // if (this.files.length > 0) { // this.uploadFile) {
      // this.uploadResult = '';
      // for (const _file of this.files) {
    // if (this.files.length > 0) {
    //   const _file = this.files[0];
    this.s3
      .uploadFile(this.uploadFile)
      .then((data) => {
        const
          result = data.key.split('/').pop(),
          url = data.Location;
        this.uploadResult = result + ' upload completed.';
        return url;
      })
      // .then((url) => {
      // })
      .catch((err) => {
        this.uploadResult = err.message;
        console.log(err);
      });
        // }
    // } else {
    //   this.uploadResult = 'File is not selected.';
    // }
  }
*/

  dismissUpload() {
    this.uploadComponent.resetValues();
    setTimeout(() => {
      this.uploadModal.hide();
    }, 1000);
  }
  closenewClicked() {
    const menu = document.getElementById('newMenu');
    menu.setAttribute('style', 'display: none;');
  }
  // --- flock
  flockClicked() {
    this.toastMessage('flockClicked', 'info');
  }
  // --- copy
  copyClicked() {
    this.toastMessage('copyClicked', 'info');
  }
  // --- style
  styleClicked() {
    this.toastMessage('styleClicked', 'info');
  }
  // --- filter
  filterClicked() {
    const
      self = this,
      menuEvent = self.menuEvent,
      menu = document.getElementById('filterMenu');
    const json = JSON.stringify({command: 'filterMenu'});
    menuEvent.emit(json);
    return false;
  }
  // closefilterClicked() {
  //   const menu = document.getElementById('filterMenu');
  //   menu.setAttribute('style', 'display: none;');
  // }
  // --- search
  searchClicked() {
    const
      self = this,
      menuEvent = self.menuEvent,
      menu = document.getElementById('searchMenu');
    const json = JSON.stringify({command: 'searchMenu'});
    menuEvent.emit(json);
    return false;
  }
  // closesearchClicked() {
  //   const menu = document.getElementById('searchMenu');
  //   menu.setAttribute('style', 'display: none;');
  // }

  // --- play / pause
  playPauseClicked() {
    if (globals.status.playing) {
      console.log('--- messageService.playPause play in MenuComponent playPauseClicked()');
      // this.playing = false;
      this.messageService.playPause(
        JSON.stringify({ state: 'pause' })
      );
    } else {
      console.log('--- messageService.playPause pause in MenuComponent playPauseClicked()');
      // this.playing = true;
      this.messageService.playPause(
        JSON.stringify({ state: 'play' })
      );
    }
  }
  // --- open_controls
  openControlsClicked($event) {
    const
      self = d3.select('#open_controls'),
      controls = d3.select('#controls'),
      contrilsEl = controls.node();
    $event.stopPropagation();
    if (contrilsEl && contrilsEl.classList.contains('anchored')) {
      self.html('&#9650');
      controls
        .attr('class', 'hidden')
        .transition()           // apply a transition
        .duration(3000)         // apply it over 3000 milliseconds
        .attr('style', 'bottom: -5rem;'); // new vertical position
    } else {
      self.html('&#9660');
      controls
        .attr('class', 'anchored')
        .transition()           // apply a transition
        .duration(1000)         // apply it over 1000 milliseconds
        .attr('style', 'bottom: 0.2rem;'); // new vertical position
    }
    return false;
  }

  openMiniatureClicked($event) {
    const
      self = d3.select('#open_miniature'),
      miniature = d3.select('#miniature');
    $event.stopPropagation();
    if (miniature.node().classList.contains('open')) {
      self
        .html('&#9660')
        .attr('class', 'close');
      miniature
        .attr('class', 'close')
        .transition()           // apply a transition
        .duration(3000)         // apply it over 3000 milliseconds
        .attr('style', 'top: -20rem;'); // new vertical position
    } else {
      self
        .html('&#9650')
        .attr('class', 'open');
      miniature
        .attr('class', 'open')
        .transition()           // apply a transition
        .duration(1000)         // apply it over 1000 milliseconds
        .attr('style', 'top: 0.5rem;'); // new vertical position
    }
    return false;
  }

  updateUndoRedoButton = function () {
    const
      self = this,
      model = self.model,
      pp = globals.current.currentPage,
      // --- undo
      undo_div = document.getElementById('undo'),
      undo_icon = undo_div.getElementsByTagName('i')[0],
      undo_p = document.getElementById('p_undo'),
      undoJSON = model.logTop(globals.log[pp]),
      undoRecord = JSON.parse(undoJSON),
      // --- redo
      redo_div = document.getElementById('redo'),
      redo_icon = redo_div.getElementsByTagName('i')[0],
      redo_p = document.getElementById('p_redo'),
      redoJSON = model.logTop(globals.redoLog[pp]),
      redoRecord = JSON.parse(redoJSON);
    // --- undo
    if (undoRecord && undoRecord.op) {
      undo_div.classList.add('active');
      const undoOperation = undoRecord.op; // model.opLabel(undoRecord.op.label);
      undo_p.innerHTML = undoOperation;
    } else {
      undo_div.classList.remove('active');
      undo_p.innerHTML = '';
    }
    // --- redo
    if (redoRecord && redoRecord.op) {
      redo_div.classList.add('active');
      const redoOperation = redoRecord.op; // model.opLabel(redoRecord.op.label);
      redo_p.innerHTML = redoOperation;
    } else {
      redo_div.classList.remove('active');
      redo_p.innerHTML = '';
    }
  };

  // --- undo
  undoClicked() {
    const
      self = this,
      util = self.util,
      model = self.model,
      // drawing = self.drawing,
      note_id = globals.current.note_id,
      pp = globals.current.currentPage,
      undo_div = document.getElementById('undo'),
      undo_icon = undo_div.getElementsByTagName('i')[0],
      undo_p = document.getElementById('p_undo'),
      redo_div = document.getElementById('redo'),
      redo_icon = redo_div.getElementsByTagName('i')[0],
      redo_p = document.getElementById('p_redo');

    if (!undo_div.classList.contains('active')) {
      return;
    }
    if (util.isEmpty(globals.log[pp]) || globals.log[pp].length === 0) {
      undo_div.classList.remove('active');
      this.toastMessage('Empty undo log, buffer depth is ' + globals.MAX_LOG, 'warning');
      return;
    }

    undo_div.classList.add('active');

    model.undoState();
    const json = JSON.stringify({'command': 'undoState'});
    this.messageService.notifyDrawing(json);
    self.updateUndoRedoButton();
  }

  // --- redo
  redoClicked() {
    const
      self = this,
      util = self.util,
      model = self.model,
      note_id = globals.current.note_id,
      pp = globals.current.currentPage,
      undo_div = document.getElementById('undo'),
      undo_icon = undo_div.getElementsByTagName('i')[0],
      undo_p = document.getElementById('p_undo'),
      redo_div = document.getElementById('redo'),
      redo_icon = redo_div.getElementsByTagName('i')[0],
      redo_p = document.getElementById('p_redo');

    if (!redo_div.classList.contains('active')) {
      return;
    }
    if (util.isEmpty(globals.redoLog[pp]) || globals.redoLog[pp].length === 0) {
      redo_div.classList.remove('active');
      this.toastMessage('Empty redo log, buffer depth is ' + globals.MAX_LOG, 'warning');
      return;
    }

    redo_div.classList.add('active');

    model.redoState();
    const json = JSON.stringify({'command': 'redoState'});
    this.messageService.notifyDrawing(json);

    self.updateUndoRedoButton();
  }

  initNote() {
    this.menuEvent.emit(JSON.stringify({
      command: 'initNote'
    }));
  }

  noteEvent(map: string) {
    console.log('- MenuComponent noteEvent map:', map);
    const
      self = this,
      model = self.model,
      parsed = JSON.parse(map),
      command = parsed.command,
      param = parsed.param;
    if ('loadNote' === command) {
      const
        note = param.note,
        currentPage = note.currentPage,
        pages = note.pages,
        thumbnail = note.thumbnail;
      model.setNote(note);
      this.currentPage = currentPage;
      this.note_name = globals.current.note_name;
      self.noteModal.hide();
      self.menuEvent.emit(JSON.stringify({
        command: 'loadNote',
        param: {
          note: note,
          currentPage: currentPage,
          pages: pages,
          thumbnail: thumbnail
        }
      }));
      self.menuEvent.emit(JSON.stringify({
        command: 'showIconMenu'
      }));
    }
  }

  pageEvent(map: string) {
    console.log('- MenuComponent pageEvent map:', map);
    const
      self = this,
      parsed = JSON.parse(map),
      command = parsed.command,
      param = parsed.param;
    if ('openPage' === command) {
      const page = param.page;
      this.currentPage = page.pp;
      if (globals.current.pages.length > 1 || page.name) {
        this.page_name = 'Page ' + this.currentPage + (
          page.name
            ? ' (' + page.name + ')'
            : ''
        );
      }
      this.pageModal.hide();
      self.menuEvent.emit(JSON.stringify({
        command: 'openPage',
        param: {
          page: page
        }
      }));
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

}
