import {
  Component,
  Input,
  Output,
  OnInit,
  OnChanges,
  EventEmitter
} from '@angular/core';
import { TranslatePipe } from '../../services';
import { Resource, Annotation } from '../../model';
import { Node, Link } from '../../model/wuwei';
import { PC295Item } from '../../model/items/pc295-item';
import * as globals from '../../model/wuwei-globals';

@Component({
  selector: 'info-pc295',
  templateUrl: 'pc295.component.html',
  styleUrls: ['pc295.component.scss']
})
export class InfoPC295Component implements OnInit, OnChanges {

  @Input() node: Node;
  @Input() resource: Resource;

  @Output() pc295Event = new EventEmitter<any>();

  lang;
  CD1Window = null;
  CD2Window = null;

  pc295value: any;

  ngOnInit() {
    if ('clause' !== this.node.group && 'table' !== this.node.group) {
      this.pc295value = this.resource.value;
    }
  }

  ngOnChanges() {
    if ('clause' !== this.node.group && 'table' !== this.node.group) {
      this.pc295value = this.resource.value;
    }
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

  openWindow(url1, url2?) {
    this.openCD1Window(url1);
    if (url2) {
      this.openCD2Window(url2);
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

}
