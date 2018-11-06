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
import { MatDialog } from '@angular/material';
import { Subscription } from 'rxjs/Subscription';
// import { UploadS3Component } from '../shared/upload-s3/upload-s3.component';
import { UploadFile, UploadInput, UploadOutput } from '../mdb-type/pro/file-input';
import { humanizeBytes } from '../mdb-type/pro/file-input';
import { ToastService } from '../mdb-type/pro/alerts';
import { LinksComponent } from '../mdb-type/free/navbars/links.component';
import {
  // faCoffee,
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
import { PageComponent } from '../page';
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

@Component({
  selector: 'app-note',
  templateUrl: './note.component.html',
  styleUrls: ['./note.component.scss']
})
export class NoteComponent implements OnInit {

  @Output() noteEvent = new EventEmitter<any>();

  notes: Note[];

  loading = true;
  lang;

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

  open(currentUser) {
    const
      self = this,
      model = this.model;
    self.notes = [];
    if (globals.status.isOnline) {
      self.noteService.getNotes(currentUser).subscribe(
        data => {
          for (const item of data) {
            // console.log('getNotes', item);
            const _note = model.NoteFactory(item);
            if (!_note.currentPage) {
              _note.currentPage = _note.pages[0].pp;
            }
            self.notes.push(_note);
          }
          this.loading = false;
          setTimeout(() => {
            for (const note of self.notes) {
              const miniature = document.querySelector('#img' + note._id);
              miniature.setAttribute('src', note.thumbnail);
            }
          }, 100);
        },
        error => console.log(error)
      );
    } else {
      self.toastMessage('INTERNET DISCONNECTED', 'error');
    }
  }

  loadNote(note) {
    const self = this;
    self.loading = true;
    if (globals.status.isOnline) {
      self.noteService.getNote(note).subscribe(
        data => {
          this.noteEvent.emit(JSON.stringify({
            command: 'loadNote',
            param: {
              note: data
            }
          }));
        },
        error => console.log(error)
      );
    } else {
      self.loading = false;
      this.toastMessage('INTERNET DISCONNECTED', 'error');
    }
  }

  deleteNote(note) {
    if (globals.status.isOnline) {
      this.noteService.deleteNote(note).subscribe(
        res => {
          if (200 === res.status) {
            this.toastMessage((note.name || note._id) + ' deleted successfully.', 'success');
            (<HTMLElement>document.querySelector('#note' + note._id)).style.display = 'none';
          } else {
            this.toastMessage((note.name || note._id) + ' failed to delete.', 'error');
          }
        },
        error => console.log(error)
      );
    } else {
      this.toastMessage('INTERNET DISCONNECTED', 'error');
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
