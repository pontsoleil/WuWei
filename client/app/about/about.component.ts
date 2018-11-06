import { Component } from '@angular/core';
import { TranslatePipe } from '../services';
import * as globals from '../model/wuwei-globals';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss']
})
export class AboutComponent {
  expanded = false;
  languages;
  lang;

  constructor(
    private translate: TranslatePipe
  ) {
    const self = this;
    self.languages = globals.nls.label;
    const _language = localStorage.getItem('language');
    if (_language) {
      globals.nls.LANG = _language;
    }
    self.lang = globals.nls.LANG;
  }
}
