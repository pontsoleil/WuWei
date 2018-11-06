import {
  Component,
  Input,
  Output,
  OnInit,
  AfterViewInit,
  AfterContentInit,
  OnDestroy,
  ChangeDetectorRef,
  EventEmitter,
  ViewChild,
  ElementRef
} from '@angular/core';
import {
  FormsModule,
  FormGroup,
  FormControl,
  Validators,
  FormBuilder
} from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { MatSelectChange } from '@angular/material';
import { Subscription } from 'rxjs/Subscription';
import { ToastService } from '../mdb-type/pro/alerts';
import {
  Resource,
  Annotation,
  Node,
  Link,
  WuweiModel
} from '../model';
import {
  AnnotationService,
  MessageService,
  NodeService,
  ResourceService,
  TranslatePipe,
  WpPostService,
  WpUserService,
  WuweiService
} from '../services';
import * as globals from '../model/wuwei-globals';

@Component({
  selector: 'app-edit',
  templateUrl: 'edit.component.html',
  styleUrls: ['edit.component.scss']
})
export class EditComponent
  implements OnInit, AfterViewInit, OnDestroy {

  @Input() node: Node;
  @Input() resource: Resource;

  @Output() editEvent = new EventEmitter<any>();

  editMode: string = '';
  subscription;
  lang;

  ngOnInit() {
    globals.status.editNode = this.node;
    this.editMode = this.resource.option;
  }

  ngAfterViewInit() {
    const json = JSON.stringify({
        command: 'hideIconMenu'
      });
    this.editEvent.emit(json);
  }

  ngOnDestroy() {
    const json = JSON.stringify({
        command: 'showIconMenu'
      });
    this.editEvent.emit(json);
  }

  constructor(
    public  toast: ToastService,
  ) { }

  infoOpen() {
    const json = JSON.stringify({
        command: 'infoOpen',
      });
    this.editEvent.emit(json);
  }

  genericEvent(map: string) {
    console.log('- EditComponent genericEvent map:', map);
    const
      parsed = JSON.parse(map),
      command = parsed.command;
    console.log(command);
    this.editEvent.emit(map);
  }

  pc295Event(map: string) {
    console.log('- EditComponent pc295Event map:', map);
    const
      parsed = JSON.parse(map),
      command = parsed.command;
    console.log(command);
    this.editEvent.emit(map);
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
