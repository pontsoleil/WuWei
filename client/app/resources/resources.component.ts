import { Component,
         ViewChild,
         ElementRef,
         OnInit       } from '@angular/core';
import { FormGroup,
         FormControl,
         Validators,
         FormBuilder  } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';

import { ResourceService   } from '../services/resource.service';
import { AnnotationService } from '../services/annotation.service';
import { CognitoUserService } from '../services';
import { ToastService } from '../mdb-type/pro/alerts';

import * as uuid from 'uuid';

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
  selector: 'app-resources',
  templateUrl: './resources.component.html',
  styleUrls: ['./resources.component.scss']
})
export class ResourcesComponent implements OnInit {

  currentUser;

  resource = {
    _id: null,
    id: '',
    name: '',
    type: null,
    format: null,
    language: null,
    processingLanguage: null,
    textDirection: null,
    accessibility: null,
    rights: null,
    value: '',
    purpose: null,
    creator_ref: null,
    created: null,
    modifier_ref: null,
    modified: null,
    generator_ref: null,
    generated: null
  };
  resources = [];
  selectedItem = null;
  target = null;
  body = null;
  annotation = null;
  motivations = [];
  types = [];
  isLoading = true;
  isEditing = false;
  isAnnotating = false;
  isAdding = false;
  typeIs = '';
  localhost = window.location.protocol + '://' + window.location.host;
  sourceUrl = null;
  safeUrl = null;
  currentUser_id = this.auth.currentUser._id;

  @ViewChild('player')
  private playerRef: ElementRef;

  @ViewChild('video')
  private videoRef: ElementRef;

  // @ViewChild('iframe')
  // private iframeRef: ElementRef;

  addContentForm: FormGroup;
  id = new FormControl('');
  name = new FormControl('');
  type = new FormControl('');
  format = new FormControl('');
  language = new FormControl('');
  processingLanguage = new FormControl('');
  textDirection = new FormControl('');
  accessibility = new FormControl('');
  rights = new FormControl('');
  value = new FormControl('');
  purpose = new FormControl('');
  motivation = new FormControl('');

  constructor(
    public  toast: ToastService,
    private resourceService: ResourceService,
    private annotationService: AnnotationService,
    private auth: CognitoUserService,
    private fb: FormBuilder,
    private sanitizer: DomSanitizer
  ) { }

  ngOnInit() {
    let currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
      currentUser = JSON.parse(currentUser);
      if (currentUser) {
        this.currentUser = currentUser;
      } else {
        this.currentUser = {};
      }
    } else {
      this.currentUser = {};
    }
    this.getResources();
    this.addContentForm = this.fb.group({
      id: this.id,
      name: this.name,
      type: this.type,
      format: this.format,
      language: this.language,
      processingLanguage: this.processingLanguage,
      textDirection: this.textDirection,
      accessibility: this.accessibility,
      rights: this.rights,
      value: this.value,
      purpose: this.purpose,
      motivation: this.motivation
    });
    this.motivations = [
      {id: 'bookmarking', name: 'bookmarking'},
      {id: 'tagging', name: 'tagging'},
      {id: 'highlighting', name: 'highlighting'},
      {id: 'commenting', name: 'commenting'},
      {id: 'describing', name: 'describing'},
      {id: 'linking', name: 'linking'},
      {id: 'classifying', name: 'classifying'},
      {id: 'assessing', name: 'assessing'},
      {id: 'identifying', name: 'identifying'},
      {id: 'editing', name: 'editing'},
      {id: 'moderating', name: 'moderating'},
      {id: 'questioning', name: 'questioning'},
      {id: 'replying', name: 'replying'}
    ];
    // this.motivationId = null;
    this.types = [
      {id: 'Text', name: 'Text'},
      {id: 'Image', name: 'Image'},
      {id: 'Video', name: 'Video'},
      {id: 'Sound', name: 'Sound'},
      {id: 'Dataset', name: 'Dataset'}
    ];
  }

  getResources() {
    this.resourceService.getResources(this.currentUser).subscribe(
      data => {
        this.resources = data.map((item) => {
          if (item.creator_ref) {
            item.creator = item.creator_ref;
            item.creator_id = item.creator_ref._id;
          } else {
            item.creator = { name: ''};
          }
          return item;
        });
      },
      error => console.log(error),
      () => this.isLoading = false
    );
  }

  addContent() {
    const formValue = this.addContentForm.value;
    formValue.creator_ref = this.currentUser_id;
    formValue.created = new Date().toISOString();

    let newResource = {};
    if (!this.isAnnotating) {
      formValue._id = uuid.v4();
      // formValue.type = formValue.type.id;
      this.resourceService.addResource(formValue).subscribe(
        res => {
          newResource = res.json();
          if (isEmpty(newResource)) {
            this.toastMessage('Nothing added.', 'warning');
          } else {
            this.resources.push(newResource);
            this.addContentForm.reset();
            this.toastMessage('New Content added successfully.', 'success');
          }
        },
        error => console.log(error)
      );
    } else {
      this.body = {};
      this.body._id = uuid.v4();
      this.body.id = this.localhost + '/' + this.body._id;
      this.body.type = 'TextualBody';
      this.body.value = formValue.value;
      this.body.purpose = formValue.purpose;
      this.body.creator_ref = formValue.creator_ref;
      this.resourceService.addResource(this.body).subscribe(
        resR => {
          newResource = resR.json();
          console.log(newResource);
          if (isEmpty(newResource)) {
            this.toastMessage('Nothing added.', 'warning');
          } else {
            if (this.target._id) {
              this.annotation = {};
              this.annotation.id = formValue.id || this.localhost + '/' + uuid.v4();
              this.annotation.type = formValue.type;
              this.annotation.motivation = formValue.purpose;
              this.annotation.creator_ref = formValue.creator_ref;
              this.annotation.body_ref = this.body._id;
              this.annotation.target_ref = this.target._id;
              console.log(this.annotation);
              this.annotationService.addAnnotation(this.annotation).subscribe(
                resA => {
                  this.resources.push(newResource);
                  const newAnnotation = resA.json();
                  this.addContentForm.reset();
                  this.toastMessage('TextualBody added successfully.', 'success');
                  // reload the resources to reset the editing
                  this.getResources();
                },
                error => console.log(error)
              );
            }
          }
          this.addContentForm.reset();
        },
        error => {
          console.log(error);
          this.addContentForm.reset();
        }
      );
    }
  }

  enableEditing(resource) {
    if (null == resource.id) {
      return;
    }
    this.isEditing = true;
    this.isAdding = false;
    this.isAnnotating = false;
    this.resource = resource;
    this.sourceUrl = resource.id;
    setTimeout(() => {
      const audioPlayer: HTMLAudioElement = this.playerRef.nativeElement;
      const videoPlayer: HTMLVideoElement = this.videoRef.nativeElement;
      // const iFrame: HTMLElement = this.iframeRef.nativeElement;
      const body = document.getElementById('editingBody');
      if (body) {
        const
          video = body.getElementsByTagName('video')[0],
          player = body.getElementsByTagName('audio')[0],
          iframe = body.getElementsByTagName('iframe')[0],
          // scrollW = iframe.contentWindow.document.body.scrollWidth,
          // scrollH = iframe.contentWindow.document.body.scrollHeight,
          form = body.getElementsByTagName('form')[0],
          w = Number(body.getAttribute('width')) / 2;
        form.setAttribute('style', 'width: ' + (window.innerWidth / 2) + 'px');
        const formGroup = body.getElementsByClassName('form-group');
        for (const key in formGroup) { if (formGroup.hasOwnProperty(key)) {
          formGroup[key].setAttribute('style', 'text-align:left');
        }}
        if (player && 'Audio' === resource.type) {
          video.setAttribute( 'style', 'display: none');
          iframe.setAttribute('style', 'display: none');
        } else if (video && 'Video' === resource.type) {
          player.setAttribute('style', 'display: none');
          iframe.setAttribute('style', 'display: none');
        } else if ('TextualBody' === resource.type) {
          video.setAttribute( 'style', 'display: none');
          player.setAttribute('style', 'display: none');
          iframe.setAttribute('style', 'display: none');
        } else if (iframe) {
          video.setAttribute( 'style', 'display: none');
          player.setAttribute('style', 'display: none');
        }
        setTimeout(() => {
          if (resource.id) {
            this.safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(resource.id);
          } else {
            this.safeUrl = '';
          }
        }, 200);
      }
    }, 100);
  }

  cancelEditing() {
    this.isEditing = false;
    this.isAnnotating = false;
    this.isAdding = false;
    this.resource = {
      _id: null,
      id: '',
      name: '',
      type: null,
      format: null,
      language: null,
      processingLanguage: null,
      textDirection: null,
      accessibility: null,
      rights: null,
      value: '',
      purpose: null,
      creator_ref: null,
      created: null,
      modifier_ref: null,
      modified: null,
      generator_ref: null,
      generated: null
    };
    this.toastMessage('item editing cancelled.', 'warning');
    // reload the resources to reset the editing
    this.getResources();
  }

  editResource(resource) {
    resource.modified = new Date().toISOString();
    resource._modifier = this.currentUser_id;
    this.resourceService.editResource(resource).subscribe(
      res => {
        this.isEditing = false;
        this.resource = resource;
        this.toastMessage((resource.name || resource.id) + ' edited successfully.', 'success');
      },
      error => console.log(error)
    );
  }

  deleteResource(resource) {
    if (window.confirm('Are you sure you want to permanently delete this item?')) {
      this.resourceService.deleteResource(resource).subscribe(
        res => {
          const pos = this.resources.map(elem => { return elem._id; }).indexOf(resource._id);
          this.resources.splice(pos, 1);
          this.toastMessage('item deleted successfully.', 'success');
        },
        error => console.log(error)
      );
    }
  }

  onChange(val) {
    this.typeIs = val;
  }

  enableAnnotating(resource) {
    this.isEditing = false;
    this.isAnnotating = true;
    this.isAdding = false;
    this.target = resource;
    // reload the resources to reset the editing
    this.getResources();
  }

  enableAdding() {
    this.isEditing = false;
    this.isAnnotating = false;
    this.isAdding = true;
  }

  updateUrl(resource) {
    const audioPlayer: HTMLAudioElement = this.playerRef.nativeElement;
    const videoPlayer: HTMLVideoElement = this.videoRef.nativeElement;
    // const iFrame: HTMLElement = this.iframeRef.nativeElement;
    // alert(resource.id);
    if (resource.id) {
      this.safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(resource.id);
    } else {
      this.safeUrl = ';';
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
