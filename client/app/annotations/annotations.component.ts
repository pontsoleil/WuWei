import {
  Component,
  OnInit
} from '@angular/core';
import {
  FormGroup,
  FormControl,
  Validators,
  FormBuilder
} from '@angular/forms';
import { AnnotationService } from '../services/annotation.service';
import { ResourceService } from '../services/resource.service';
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
  selector: 'app-annotations',
  templateUrl: './annotations.component.html',
  styleUrls: ['./annotations.component.scss']
})

export class AnnotationsComponent implements OnInit {

  currentUser;

  isLoading = true;
  isEditing = false;
  isAdding = false;

  annotation = {
    _id: null,
    id: '',
    type: 'Annotation',
    creator_ref: null,
    created: null,
    generator_ref: null,
    generated: null,
    modified: null,
    audience: null,
    motivation: null,
    rights: null,
    body_ref: null,
    target_ref: null
  };
  annotations = [];
  bodys = [];
  targets = [];
  motivations = [];
  motivationId = null;
  localhost = window.location.protocol + '://' + window.location.host;
  currentUser_id = this.auth.currentUser._id;

  addAnnotationForm: FormGroup;
  id = new FormControl('');
  type = 'Annotation';
  audience = new FormControl('');
  motivation = new FormControl('');
  rights = new FormControl('');
  body = new FormControl('');
  target = new FormControl(''); // , [ Validators.required ]);
  creator_ref = new FormControl('');
  created = new FormControl('');
  modifier_ref = new FormControl('');
  modified = new FormControl('');
  generator_ref = new FormControl('');
  generated = new FormControl('');

  countries = [];
  country = null;

  constructor(
    private annotationService: AnnotationService,
    private resourceService: ResourceService,
    private auth: CognitoUserService,
    private fb: FormBuilder,
    public  toast: ToastService
  ) { }

  ngOnInit() {
    this.getAnnotations();
    this.addAnnotationForm = this.fb.group({
      id: this.id,
      type: this.type,
      creator_ref: this.creator_ref,
      created: this.created,
      generator_ref: this.generator_ref,
      generated: this.generated,
      modifier_ref: this.modifier_ref,
      modified: this.modified,
      audience: this.audience,
      motivation: this.motivation,
      rights: this.rights,
      body: this.body,
      target: this.target
    });
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
    this.getBodys();
    this.body = null;
    this.getTargets();
    this.target = null;
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
    this.motivationId = null;
  }

  getBodys() {
    // let key, item;
    this.resourceService
      .getResources(this.currentUser)
      .subscribe(
        data => {
          this.bodys = data;
        },
        error => console.log(error)
      );
  }

  getTargets() {
    // let key, item;
    this.resourceService
      .getResources(this.currentUser)
      .subscribe(
        data => {
          this.targets = data.filter((item) => {
            return ('TextualBody' !== item.type);
          });
        },
        error => console.log(error)
      );
  }

  getAnnotations() {
    this.annotationService
      .getAnnotations(this.currentUser)
      .subscribe(
        data => {
          this.annotations = data.map((item) => {
            return item;
          });
        },
        error => console.log(error),
        () => this.isLoading = false
      );
  }

  addAnnotation() {
    const ctrl = this;
    const formValue = ctrl.addAnnotationForm.value;
    const uuidV4 = uuid.v4();
    if (notEmpty(formValue)) {
      ctrl.annotation = {
        _id: uuidV4,
        id: ctrl.localhost + '/' + uuidV4,
        type: 'Annotation',
        creator_ref: ctrl.auth.currentUser._id,
        created: new Date().toISOString(),
        generator_ref: formValue.generatorId,
        generated: formValue.generated,
        modified: formValue.modified,
        audience: formValue.audience,
        motivation: formValue.motivation.name,
        rights: formValue.rights,
        body_ref: formValue.body._id || '',
        target_ref: formValue.target._id || ''
      };
      ctrl.annotationService.addAnnotation(ctrl.annotation).subscribe(
        res => {
          const newAnnotation = res.json();
          console.log(newAnnotation);
          ctrl.annotations.push(newAnnotation);
          ctrl.addAnnotationForm.reset();
          ctrl.toastMessage(newAnnotation.name + ' added successfully.', 'success');
        },
        error => console.log(error)
      );
      // reload the annotations to reset the editing
      ctrl.getAnnotations();
    }
  }

  enableAdding() {
    const ctrl = this;
    ctrl.isEditing = false;
    ctrl.isAdding = true;
    setTimeout( () => {
      const selects = document.getElementsByTagName('select');
      const w = window.innerWidth / selects.length - 100;
      for (const key in selects) { if (selects.hasOwnProperty(key)) {
        selects[key].setAttribute('style', 'width: ' + w + 'px');
      }}
    }, 200);
  }

  enableEditing(annotation) {
    const ctrl = this;
    ctrl.isEditing = true;
    ctrl.isAdding = false;
    ctrl.annotation = annotation;
  }

  cancelEditing() {
    const ctrl = this;
    ctrl.isEditing = false;
    ctrl.isAdding = false;
    ctrl.annotation = {
      _id: null,
      id: '',
      type: 'Annotation',
      creator_ref: null,
      created: null,
      generator_ref: null,
      generated: null,
      modified: null,
      audience: null,
      motivation: null,
      rights: null,
      body_ref: null,
      target_ref: null
    };
    ctrl.toastMessage('item editing cancelled.', 'warning');
    // reload the annotations to reset the editing
    ctrl.getAnnotations();
  }

  editAnnotation(annotation) {
    const ctrl = this;
    ctrl.body = annotation.body_ref;
    ctrl.resourceService.editResource(ctrl.body).subscribe(
      res => {
        const editedAnnotation = res.json();
        console.log(editedAnnotation);
        ctrl.toastMessage(JSON.stringify(res.body) + ' edited successfully.', 'success');
      },
      error => console.log(error)
    );
    annotation.body_ref = annotation.body_ref._id;
    annotation.target_ref = annotation.target_ref._id;
    annotation.modified = new Date().toISOString();
    ctrl.annotationService.editAnnotation(annotation).subscribe(
      res => {
        ctrl.isEditing = false;
        ctrl.annotation = annotation;
        ctrl.toastMessage(JSON.stringify(annotation) + ' edited successfully.', 'success');
      },
      error => console.log(error)
    );
  }

  deleteAnnotation(annotation) {
    // const ctrl = this;
    if (window.confirm('Are you sure you want to permanently delete ctrl item?')) {
      this.annotationService.deleteAnnotation(annotation).subscribe(
        res => {
          const pos = this.annotations.map(elem => { return elem._id; }).indexOf(annotation._id);
          this.annotations.splice(pos, 1);
          this.toastMessage('item deleted successfully.', 'success');
        },
        error => console.log(error)
      );
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
