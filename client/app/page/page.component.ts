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
import { MatDialog, PageEvent } from '@angular/material';
import { Subscription } from 'rxjs/Subscription';
// import { UploadS3Component } from '../shared/upload-s3/upload-s3.component';
import { UploadFile, UploadInput, UploadOutput } from '../mdb-type/pro/file-input';
import { humanizeBytes } from '../mdb-type/pro/file-input';
import { ToastService } from '../mdb-type/pro/alerts';
import { LinksComponent } from '../mdb-type/free/navbars/links.component';
import {
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
  WuweiService
} from '../services';
import { UploadComponent } from '../upload';
import { AWS_ENV } from 'assets/config/environment.aws';
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
import * as globals from '../model/wuwei-globals';
import * as d3 from 'd3';
import * as uuid from 'uuid';
import { stringList } from '../../../node_modules/aws-sdk/clients/datapipeline';

@Component({
  selector: 'app-page',
  templateUrl: './page.component.html',
  styleUrls: ['./page.component.scss']
})
export class PageComponent implements OnInit {

  @Output() pageEvent = new EventEmitter<any>();

  pages: Page[];

  loading = true;
  lang;

  editing = false;
  original_name: string;

  // Font awesome icons
  faBookOpen = faBookOpen;

  constructor(
    private router: Router,
    private toast: ToastService,
    private dialog: MatDialog,
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
    // private wpPostService: WpPostService,
    // private s3: S3Service,
    private translate: TranslatePipe
    // private uploadS3Component: UploadS3Component
    // private drawService: DrawService
  ) {
    const self = this;
    // self.languages = globals.nls.label;
    // const _language = localStorage.getItem('language');
    // if (_language) {
    //   globals.nls.LANG = _language;
    // }
    self.lang = globals.nls.LANG;
    // globals.module.wuweiModel = model;
    // globals.module.messageService = messageService;
    // self.isOnline = globals.status.isOnline;
    // self.playing = globals.status.playing;

    // self.currentUser = self.getCurrentUser();
    // self.token = self.currentUser.token; // this.getToken();
  }

  ngOnInit() { }

  open(pages) {
    const
      self = this,
      util = self.util,
      model = this.model;
    self.pages = pages;
    this.loading = false;
    setTimeout(() => {
      for (const page of self.pages) {
        page.thumbnail = util.createThumbnail({
          miniSvg: 'pageMiniSvg',
          miniCanvas: 'pageMiniCanvas',
          nodes: page.nodes,
          links: page.links
        });
        const thumbnail = document.getElementById('img_' + page.pp);
        thumbnail.setAttribute('src', page.thumbnail);
      }
    }, 100);
  }

  addPage() {
    const
      self = this,
      model = self.model;
    let pp = 1;
    for (const page of globals.current.pages) {
      if (page.pp > pp) {
        pp = page.pp;
      }
    }
    globals.graph.nodes = [];
    globals.graph.links = [];
    for (const idx in globals.nodeIndexer) { if (globals.nodeIndexer.hasOwnProperty(idx)) {
      delete globals.nodeIndexer[idx];
    }}
    for (const idx in globals.linkIndexer) { if (globals.linkIndexer.hasOwnProperty(idx)) {
      delete globals.linkIndexer[idx];
    }}
    const
      newPp = pp + 1,
      newPage = model.PageFactory({
        pp: newPp,
        name: '',
        nodes: [],
        links: [],
        nodeIndexer: {},
        linkIndexer: {},
        transform: { x: 0, y: 0, scale: 1 },
        thumbnail: null
      });
    setTimeout(() => {
      this.openPage(newPage);
    }, 100);
    return newPage;
  }

  openPage(page) {
    globals.current.page = page;
    globals.current.currentPage = page.pp;
    globals.graph.nodes = globals.current.page.nodes;
    globals.graph.links = globals.current.page.links;
    for (const idx in globals.nodeIndexer) { if (globals.nodeIndexer.hasOwnProperty(idx)) {
      delete globals.nodeIndexer[idx];
    }}
    for (const node of globals.current.page.nodes) {
      if (node.key) {
        globals.nodeIndexer[node.key] = node;
      }
      globals.nodeIndexer[node._id] = node;
    }
    for (const idx in globals.linkIndexer) { if (globals.linkIndexer.hasOwnProperty(idx)) {
      delete globals.linkIndexer[idx];
    }}
    for (const link of globals.current.page.links) {
      if (link.key) {
        globals.linkIndexer[link.key] = link;
      }
      globals.linkIndexer[link._id] = link;
    }
    this.pageEvent.emit(JSON.stringify({
      command: 'openPage',
      param: {
        page: page
      }
    }));
  }

  deletePage(page) {

  }

  editName(page) {
    this.editing = true;
    this.original_name = page.name;
  }

  saveEdit(page) {
    this.editing = false;
    this.pageEvent.emit(JSON.stringify({
      command: 'editName',
      param: {
        page: page
      }
    }));
  }

  cancelEdit(page) {
    this.editing = false;
    page.name = this.original_name;
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

