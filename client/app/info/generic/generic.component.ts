import {
  Component,
  Input,
  Output,
  OnInit,
  EventEmitter
} from '@angular/core';
import { TranslatePipe } from '../../services';
import { Resource, Annotation } from '../../model';
import { Node, Link } from '../../model/wuwei';
import * as globals from '../../model/wuwei-globals';

@Component({
  selector: 'info-generic',
  templateUrl: 'generic.component.html',
  styleUrls: ['generic.component.scss']
})
export class InfoGenericComponent implements OnInit {

  @Input() node: Node;
  @Input() resource: Resource;

  @Output() genericEvent = new EventEmitter<any>();

  viewWindow = null;
  lang;

  ngOnInit() {}

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

  openWindow(url) {
    this.closeWindow();
    const features = 'width=500,height=600,top=80,left=80';
    this.viewWindow = window.open(url, 'wuwei', features);
  }

  closeWindow() {
    if (this.viewWindow) {
      this.viewWindow.close();
    }
  }

}
