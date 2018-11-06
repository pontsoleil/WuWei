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
import { ToastService } from '../../mdb-type/pro/alerts';
import { Resource, Annotation } from '../../model';
import { Node, Link } from '../../model/wuwei';
import { WuweiModel } from '../../model/wuwei/wuwei.model';
import {
  AnnotationService,
  MessageService,
  NodeService,
  ResourceService,
  TranslatePipe,
  WpPostService,
  WpUserService,
  WuweiService
} from '../../services';

import * as globals from '../../model/wuwei-globals';
import { PC295Item } from '../../model/items/pc295-item';
import * as d3 from 'd3';
import * as uuid from 'uuid';

/**
 * CKEditor
 * see https://stackoverflow.com/questions/41816263/how-to-integrate-ckeditor-in-angular-2
 */
import { CkeditorConfigService } from '../../services/internal/ckeditor-config.service';
declare const CKEDITOR;

import { AnyLengthString } from 'aws-sdk/clients/comprehend';

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
  selector: 'edit-pc295',
  templateUrl: 'pc295.component.html',
  styleUrls: ['pc295.component.scss'],
  providers: [
    CkeditorConfigService
  ]
})
export class EditPC295Component
  implements OnInit, AfterContentInit, AfterViewInit, OnDestroy {

  @Input() node: Node;
  @Input() resource: Resource;

  @Output() pc295Event = new EventEmitter<any>();

  @ViewChild('saveModal') saveModal;
  @ViewChild('resourceValue') resourceValue;

  private subscription: Subscription;

  ckeditorConfig;
  ckeditorShortConfig;

  private token;
  private online;
  private viewWindow;
  pc295Item: PC295Item;

  lang;
  changed;

  node_label;
  node_shape; // select
  width;
  height;
  radius;
  color;
  group;
  font_size; // select
  font_color;
  font_family;
  name;
  value;
  rights;
  creator;
  id;
  thumbnail;
  type; // select
  format;
  purpose; // select

  language;

  public copyrights;
  public isCreativeCommons;
  public creativeCommons;
  public isCitation;
  citation;

  shapes: Array<any>;
  fontSizes: Array<any>;
  // memoColors = [];
  types: Array<any>;
  purposes: Array<any>;

  form: FormGroup;

  ngOnInit() {
    const
      _node = this.node,
      _resource = this.resource;

    this.pc295Item = _resource.value;

    this.form = this.fb.group({
      // node
      shape: null,
      width: null,
      height: null,
      radius: null,
      color: null,
      font_size: null,
      font_color: null,
      thumbnail: null,
      group: null,
      // resource
      id: null,
      name: null,
      rights: null,
      creator: null,
      // value: null,
      type: null,
      format: null,
      language: null,
      purpose: null
    });
    this.shapes = globals.shapes;
    this.fontSizes = globals.fontSizes;
    this.purposes = globals.motivations;
    this.types = globals.resourceTypes;
    setTimeout(() => {
      this.setEditForm(_node, _resource);
      // see https://stackoverflow.com/questions/39787038/how-to-manage-angular2-expression-has-changed-after-it-was-checked-exception-w
      this.cdRef.detectChanges();
    });
  }

  ngAfterContentInit() {
    this.setEditForm(this.node, this.resource);
    // see https://stackoverflow.com/questions/39787038/how-to-manage-angular2-expression-has-changed-after-it-was-checked-exception-w
    this.cdRef.detectChanges();
  }

  ngAfterViewInit() {
    const json = JSON.stringify({
        command: 'hideIconMenu'
      });
    this.pc295Event.emit(json);
  }

  ngOnDestroy() {
    globals.status.editNode = null;
    const json = JSON.stringify({
        command: 'showIconMenu'
      });
    this.pc295Event.emit(json);
  }

  constructor(
    public  toast: ToastService,
    private cdRef: ChangeDetectorRef,
    private messageService: MessageService,
    private nodeService: NodeService,
    private resourceService: ResourceService,
    private annotationService: AnnotationService,
    private ckService: CkeditorConfigService,
    private wpPostService: WpPostService,
    private auth: WpUserService,
    private fb: FormBuilder,
    private sanitizer: DomSanitizer,
    private util: WuweiService,
    private model: WuweiModel,
    private translate: TranslatePipe
  ) {
    const self = this;
    const _language = localStorage.getItem('language');
    if (_language) {
      globals.nls.LANG = _language;
    }
    this.lang = globals.nls.LANG;
    this.creativeCommons = globals.nls.creativeCommons[this.lang];
    this.copyrights = globals.nls.copyrights[this.lang];
    this.setCkeditorConfig();

    localStorage.removeItem('init_edit');

    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
      const _currentUser = JSON.parse(currentUser);
      this.token = _currentUser.token;
    }

    this.subscription = messageService.editOpen$.subscribe(
      json => {
        const
          self = this,
          model = self.model,
          parsed = JSON.parse(json),
          command = parsed.command,
          param = parsed.param,
          _node = param.node,
          _resource = param.resource;
        const _language = localStorage.getItem('language');
        if (_language) {
          globals.nls.LANG = _language;
        }
        this.lang = globals.nls.LANG;
        this.copyrights = globals.nls.copyrights[this.lang];
        this.setCkeditorConfig();
        const _init_edit = localStorage.getItem('init_edit');
        if (!_init_edit) {
          const init_node = globals.graph.nodes;
          const init_resource = [];
          for (const _id in globals.resources) {
            if (globals.resources.hasOwnProperty(_id)) {
              init_resource.push(globals.resources[_id]);
            }
          }
          model.saveCurrent({
            node: init_node,
            resource: init_resource
          });
        }

        localStorage.setItem('init_edit', JSON.stringify({
          'node': _node,
          'resource': _resource
        }));

        self.setEditForm(_node, _resource);

        const
          canvas = document.getElementById(globals.status.canvasId),
          editingCircle = document.getElementById('Editing');
        canvas.appendChild(editingCircle);
        editingCircle.style.opacity = '1';
        editingCircle.setAttribute('cx', '' + self.node.x);
        editingCircle.setAttribute('cy', '' + self.node.y);
        d3.select('#Editing').datum(() => self.node);
      },
      err => {
        this.toastMessage('EditComponent' + JSON.stringify(err), 'error');
      }
    );

  }

  setCkeditorConfig() {
    switch (this.lang) {
      case 'cn':
        this.ckeditorConfig = this.ckService.getConfigCN(400, 1024);
        this.ckeditorShortConfig = this.ckService.getConfigCN(200, 1024);
        break;
      case 'en':
        this.ckeditorConfig = this.ckService.getConfigEN(400, 1024);
        this.ckeditorShortConfig = this.ckService.getConfigEN(200, 1024);
        break;
      case 'ja':
        this.ckeditorConfig = this.ckService.getConfigJA(400, 1024);
        this.ckeditorShortConfig = this.ckService.getConfigJA(200, 1024);
        break;
      case 'kr':
        this.ckeditorConfig = this.ckService.getConfigKR(400, 1024);
        this.ckeditorShortConfig = this.ckService.getConfigKR(200, 1024);
        break;
      case 'tw':
        this.ckeditorConfig = this.ckService.getConfigTW(400, 1024);
        this.ckeditorShortConfig = this.ckService.getConfigTW(200, 1024);
        break;
      default:
        this.ckeditorConfig = this.ckService.getConfigJA(400, 1024);
        this.ckeditorShortConfig = this.ckService.getConfigJA(200, 1024);
    }
  }

  setEditForm(_node, _resource) {
    this.online = globals.status.isOnline;
    this.node = _node;
    this.node_label = _node.label;
    this.node_shape = _node.shape;
    this.width = _node.size.width;
    this.height = _node.size.height;
    this.radius = _node.size.radius;
    this.color = _node.color;
    this.thumbnail = _node.thumbnail || '';
    this.font_size =  (undefined === _node.font.size) ? '12pt' : _node.font.size;
    this.resource = _resource;
    this.id = _resource.id || '';
    this.name = _resource.name || '';
    this.value = _resource.value || '';
    this.rights = _resource.rights || '';
    this.format = _resource.format || '';
    this.creator = _resource.creator || '';
    this.language = _resource.language || '';
    this.type = (undefined === _resource.type) ? 'other' : _resource.type;
    this.purpose = (undefined === _resource.purpose) ? 'none' : _resource.purpose;
    setTimeout(() => {
      this.setSelectValue(_node, _resource);
    }, 10);
  }

  setSelectValue(node, resource) {
    this.node_shape = node.shape;
    this.font_size = node.font.size;
    this.type = (undefined === resource.type) ? '' : resource.type;
    this.purpose = (undefined === resource.purpose) ? '' : resource.purpose;
  }

  // infoOpen() {
  //   const json = JSON.stringify({
  //       command: 'infoOpen',
  //     });
  //   this.pc295Event.emit(json);
  // }

  // editDismiss() {
  //   this.changed = this.checkChanged();
  //   if (this.changed) {
  //     this.saveModal.show();
  //   } else {
  //     this.closeEdit();
  //   }
  // }

  onSelectChange($event, attribute) {
    this.checkChanged();
    const
      value = $event.value;
    if ('shape' === attribute) {
      this.node_shape = this.node.shape = value;
      this.updateSize(this.node);
      this.emitNodeChange(this.node, 'shape');
    } else if ('font_size' === attribute) {
      this.font_size = this.node.font.size = value;
      this.emitNodeChange(this.node, 'font_size');
    } else if ('purpose' === attribute) {
      this.purpose = this.resource.purpose = value;
      this.emitResourceChange(this.resource, 'purpose');
    } else if ('type' === attribute) {
      this.type = this.resource.type = value;
      this.emitResourceChange(this.resource, 'type');
    } else if ('rights' === attribute) {
      this.rights = this.resource.rights = value;
      this.emitResourceChange(this.resource, 'rights');
    }
  }

  updateSize(node) {
    this.checkChanged();
    if ('RECTANGLE' === node.shape || 'THUMBNAIL' === node.shape) {
      if (undefined === node.size.width) {
        if (node && node.size.radius) {
          node.size.width = 4 * node.size.radius;
        } else { // in case node is absent
          node.size.width = globals.defaultSize.width;
        }
      }
      if (undefined === node.size.height) {
        if (node && node.size.radius) {
          node.size.height = 2 * node.size.radius;
        } else { // in case node is absent
          node.size.height = globals.defaultSize.height;
        }
      }
      delete node.size.radius;
      delete node.size.rx;
      delete node.size.ry;
    } else if ('CIRCLE' === node.shape) {
      if (undefined === node.size.radius) {
        if (node.size.width > node.size.height) {
          node.size.radius = this.util.precisionRound(node.size.height / 2, 3);
        } else {
          node.size.radius = this.util.precisionRound(node.size.width / 2, 3);
        }
      }
    } else if ('ROUNDED' === node.shape) {
      if (undefined === node.size.width) {
        if (node && node.size.radius) {
          node.size.width = 4 * node.size.radius;
        } else { // in case node is absent
          node.size.width = globals.defaultSize.width;
        }
      }
      if (undefined === node.size.height) {
        if (node && node.size.radius) {
          node.size.height = 2 * node.size.radius;
        } else { // in case node is absent
          node.size.height = globals.defaultSize.height;
        }
      }
      if (node.size.width > node.size.height) {
        node.size.rx = node.size.ry = this.util.precisionRound(node.size.height / 2, 3);
      } else {
        node.size.rx = node.size.ry = this.util.precisionRound(node.size.width / 2, 3);
      }
      delete node.size.radius;
    } else if ('ELLIPSE' === node.shape) {
      if (undefined === node.size.width) {
        if (node && node.size.radius) {
          node.size.width = 4 * node.size.radius;
        } else { // in case node is absent
          node.size.width = globals.defaultSize.width;
        }
      }
      if (undefined === node.size.height) {
        if (node && node.size.radius) {
          node.size.height = 2 * node.size.radius;
        } else { // in case node is absent
          node.size.height = globals.defaultSize.height;
        }
      }
      node.size.rx = this.util.precisionRound(node.size.width / 2, 3);
      node.size.ry = this.util.precisionRound(node.size.height / 2, 3);
      delete node.size.radius;
    }
  }

  onNodeChange($event, attribute) {
    this.checkChanged();
    const
      value = $event.target.value,
      _id = this.node._id;
    if ('thumbnail' === attribute) {
      this.node.thumbnail = this.thumbnail = value;
      this.emitNodeChange(this.node, attribute);
      this.resource.smallThumbnail = value;
      this.emitResourceChange(this.resource, 'smallThumbnail');
    } else if (['radius', 'width', 'height'].indexOf(attribute) >= 0) {
      this.node.size[attribute] = this[attribute] = +value;
      this.updateSize(this.node);
      this.emitNodeChange(this.node, attribute);
    } else if (attribute.indexOf('font_') === 0) { // font_size, font_color
      const key = attribute.substr(5);
      this.node.font[key] = this[attribute] = value;
      this.emitNodeChange(this.node, attribute);
    } else {
      this.node[attribute] = value;
      this.emitNodeChange(this.node, attribute);
    }
    this.messageService.editMade(JSON.stringify({
      command: 'editMade'
    }));
  }

  onResourceChange($event, attribute) {
    this.checkChanged();
    const
      value = $event.target.value;
    if ('name' === attribute) {
      this.name = value;
      this.node.label = value;
      this.emitNodeChange(this.node, 'label');
    }
    this[attribute] = value;
    this.resource[attribute] = value;
    this.emitResourceChange(this.resource, attribute);
    this.messageService.editMade(JSON.stringify({
      command: 'editMade'
    }));
  }

  onEditorChange($event, attribute) {
    this.checkChanged();
    console.log($event, attribute);
    const util = this.util;
    let value, nodeAttribute;
    if ('value' === attribute) {
      value = $event;
      this.value = value;
      this.resource.value = value;
      let str = util.escapeLineFeed(value);
      str = util.toText(str);
      // if (str.length > 256) { str = str.substr(0, 256) + '...'; }
      this.node.description = util.unescapeLineFeed(str);
      nodeAttribute = 'description';
      this.emitResourceChange(this.resource, attribute);
      this.emitNodeChange(this.node, nodeAttribute);
      this.messageService.editMade(JSON.stringify({
        command: 'editMade'
      }));
    } else if ('isCitation' === attribute) {
      value = $event.target.checked;
      this.isCitation = value;
    } else if ('isCreativeCommons' === attribute) {
      value = $event.target.checked;
      this.isCreativeCommons = value;
    }
  }

  emitNodeChange(node, attribute) {
    const json = JSON.stringify({
      command: 'nodeChange',
      param: {
        _id: node._id,
        attribute: attribute,
        node: node
      }
    });
    this.pc295Event.emit(json);
  }

  emitResourceChange(resource, attribute) {
    const json = JSON.stringify({
      command: 'resourceChange',
      param: {
        _id: resource._id,
        attribute: attribute,
        resource: resource
      }
    });
    this.pc295Event.emit(json);
  }

  checkChanged() {
    const
      model = this.model,
      init_edit = JSON.parse(localStorage.getItem('init_edit'));
    this.changed = false;
    if (!init_edit || !init_edit.node || !init_edit.resource) {
      this.changed = true;
      return this.changed;
    }
    const
      init_node = model.NodeFactory(init_edit.node),
      init_resource = model.ResourceFactory(init_edit.resource);
    for (const key in init_node) { if (init_node.hasOwnProperty(key)) {
      if ('object' === typeof init_node[key]) {
        for (const attr in init_node[key]) { if (init_node[key].hasOwnProperty(attr)) {
          if (this.node[key][attr] !== init_node[key][attr]) {
            this.changed = true;
            break;
          }
        }}
      } else {
        if (this.node[key] !== init_node[key]) {
          this.changed = true;
          break;
        }
      }
    }}
    for (const key in init_resource) { if (init_resource.hasOwnProperty(key)) {
      if ('object' === typeof init_resource[key]) {
        for (const attr in init_resource[key]) { if (init_resource[key].hasOwnProperty(attr)) {
          if (this.resource[key][attr] !== init_resource[key][attr]) {
            this.changed = true;
            break;
          }
        }}
      } else {
        if (this.resource[key] !== init_resource[key]) {
          this.changed = true;
          break;
        }
      }
    }}
    return this.changed;
  }

  cancelEdit() {
    console.log('cancel edit');
    const
      model = this.model,
      init_edit = JSON.parse(localStorage.getItem('init_edit'));
    if (init_edit) {
      this.node = model.NodeFactory(init_edit.node);
      this.emitNodeChange(this.node, '*');
      this.resource = model.ResourceFactory(init_edit.resource);
      this.emitResourceChange(this.resource, '*');
      localStorage.removeItem('init_edit');
    }
    setTimeout(() => {
      const cancel = true;
      this.closeEdit(cancel);
    }, 500);
  }

  saveEdit() {
    console.log('save edit resource:', this.resource);
    this.wpPostService.addContent(
      this.token,
      {
        // uuid: 'urn:uuid:a01e36e3-f226-4bad-82ed-c896453d3605',
        name: this.resource.name,
        description: this.resource.value,
        id: this.resource.id,
        rights: this.resource.rights,
        creator: this.resource.creator,
        type: this.resource.type,
        format: this.resource.format,
        language: this.resource.language,
        purpose: this.resource.purpose
      }
    )
    .toPromise()
    .then( response => {
      console.log(response);
    })
    .catch( error => {
      console.log(error);
    });

    setTimeout(() => {
      this.closeEdit();
    }, 500);
  }

  closeEdit(cancel?: boolean) {
    if (!cancel) {
      const node = globals.graph.nodes;
      const resource = [];
      for (const _id in globals.resources) {
        if (globals.resources.hasOwnProperty(_id)) {
          resource.push(globals.resources[_id]);
        }
      }
      const logData = {
        command: 'saveEdit',
        param: {
          node: node,
          resource: resource
        }
      };
      this.model.storeLog(logData);
      this.messageService.undoRedo(JSON.stringify({
        action: 'edit'
      }));
    }

    localStorage.removeItem('init_edit');

    const editingCircle = document.getElementById('Editing');
    editingCircle.style.opacity = '0';
    const json = JSON.stringify({
      command: 'editDismiss'
    });
    this.pc295Event.emit(json);
    this.saveModal.hide();
  }

  editDismiss() {
    this.changed = this.checkChanged();
    if (this.changed) {
      this.saveModal.show();
    } else {
      this.closeEdit();
    }
  }

  openWindow(url, w, h) {
    this.closeWindow();
    const features = 'height=' + h + ',width=' + w + ',top=80,left=80';
    this.viewWindow = window.open(url, 'wuwei', features);
  }

  closeWindow() {
    if (this.viewWindow) {
      this.viewWindow.close();
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
