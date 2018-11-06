import {
  Component,
  Input, Output, EventEmitter,
  OnInit, AfterViewInit, AfterViewChecked,
  OnDestroy,
} from '@angular/core';
import { TranslatePipe } from '../services';
import { Resource, Annotation } from '../model';
import { Node, Link } from '../model/wuwei';
import * as globals from '../model/wuwei-globals';

@Component({
  selector: 'app-info',
  templateUrl: 'info.component.html',
  styleUrls: ['info.component.scss']
})
export class InfoComponent
  implements OnInit, AfterViewInit, OnDestroy {

  @Input() node: Node;
  @Input() resource: Resource;

  @Output() infoEvent = new EventEmitter<any>();

  selectedInfo: string = '';
  infoMode: string = '';
  nodeOnScreen: boolean;
  lang;

  ngOnInit() {
    globals.status.infoNode = this.node;
    this.infoMode = this.resource.option;
    const node = globals.graph.nodes.filter(_node => _node._id === this.node._id);
    this.nodeOnScreen = node && node.length === 1;
  }

  ngAfterViewInit() {
    const json = JSON.stringify({
        command: 'hideIconMenu'
      });
    this.infoEvent.emit(json);
  }

  ngOnDestroy() {
    globals.status.infoNode = null;
    const json = JSON.stringify({
        command: 'showIconMenu'
      });
    this.infoEvent.emit(json);
  }

  constructor(
    private translate: TranslatePipe
  ) {
    const self = this;
    const _language = localStorage.getItem('language');
    if (_language) {
      globals.nls.LANG = _language;
    }
    this.lang = globals.nls.LANG;
 }

  editOpen() {
    const json = JSON.stringify({
        command: 'editOpen',
      });
    this.infoEvent.emit(json);
  }

  infoDismiss() {
    const
      json = JSON.stringify({
        command: 'infoDismiss'
      });
    this.infoEvent.emit(json);
  }

  genericEvent(map: string) {
    console.log('- InfoComponent genericEvent map:', map);
    const
      parsed = JSON.parse(map),
      command = parsed.command;
    console.log(command);
    this.infoEvent.emit(map);
  }

  pc295Event(map: string) {
    console.log('- InfoComponent pc295Event map:', map);
    const
      parsed = JSON.parse(map),
      command = parsed.command;
    console.log(command);
    this.infoEvent.emit(map);
  }
}
