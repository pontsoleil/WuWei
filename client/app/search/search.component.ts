import {
  Component,
  Output, EventEmitter,
  OnInit, AfterViewInit, AfterViewChecked,
  ViewChild,
  OnDestroy,
} from '@angular/core';
import { TranslatePipe } from '../services';
import { SearchPC295Component } from './pc295';
import * as globals from '../model/wuwei-globals';

@Component({
  selector: 'app-search',
  templateUrl: 'search.component.html',
  styleUrls: ['search.component.scss']
})
export class SearchComponent implements OnInit, AfterViewInit, OnDestroy {

  @Output() searchEvent = new EventEmitter<any>();

  lang;
  selectedSearch: string = '';

  ngOnInit() {
    /**
     * see https://github.com/angular/angular/issues/22304
     * ExpressionChangedAfterItHasBeenCheckedError is thrown when you try to modify
     * a component's state after the change detection algorithm ended.
     * Your issue is that ngAfterViewInit happens, as the name suggests after the change
     * detection algorithm ended. At that point, Angular expects nothing else to change
     * in the component's state until the next tick. However, it does, because you set
     * the value of the properties to false. You can't something that would trigger a new
     * change detection after a change detection has ended.
     * You can do those assignments in ngOnInit and Angular won't complain.
     */
    /**
     * check if searching
     */
    if (globals.status.selectedSearch && globals.status.selectedSearch.length > 0) {
      globals.status.Searching = true;
      this.selectedSearch = globals.status.selectedSearch;
    }
  }

  ngAfterViewInit() {
    const json = JSON.stringify({
        command: 'hideIconMenu'
      });
    this.searchEvent.emit(json);
  }

  ngOnDestroy() {
    const json = JSON.stringify({
        command: 'showIconMenu'
      });
    this.searchEvent.emit(json);
  }

  constructor(
    private translate: TranslatePipe
  ) {
    const self = this;
    const _language = localStorage.getItem('language');
    if (_language) {
      globals.nls.LANG = _language;
    }
    this.lang = globals.nls.LANG; }

  clicked(menu) {
    const icons = document.querySelectorAll('.menu a');
    for (let i = 0; i < icons.length; i++) {
      icons[i].classList.remove('selected');
    }
    const classList = document.querySelector('#' + menu).classList;
    classList.add('selected');
    if ('ISO_PC295' === menu) {
      this.selectedSearch = 'ISO_PC295';
    } else if ('youTube' === menu) {
      this.selectedSearch = 'youTube';
    } else if ('googleBooks' === menu) {
      this.selectedSearch = 'googleBooks';
    } else if ('iTunes' === menu) {
      this.selectedSearch = 'iTunes';
    }
    globals.status.selectedSearch = this.selectedSearch;
  }

  searchDismiss() {
    globals.status.Searching = false;
    globals.status.selectedSearch = null;
    const json = JSON.stringify({
        command: 'searchDismiss'
      });
    this.searchEvent.emit(json);
  }

  itunesEvent(map: string) {
    // console.log('- SearchComponent itunesEvent map:', map);
    const
      parsed = JSON.parse(map),
      command = parsed.command;
    console.log(command);
    this.searchEvent.emit(map);
  }

  googleEvent(map: string) {
    // console.log('- SearchComponent googleEvent map:', map);
    const
      parsed = JSON.parse(map),
      command = parsed.command;
    console.log(command);
    this.searchEvent.emit(map);
  }

  youtubeEvent(map: string) {
    // console.log('- SearchComponent youtubeEvent map:', map);
    const
      parsed = JSON.parse(map),
      command = parsed.command;
    console.log(command);
    this.searchEvent.emit(map);
  }

  pc295Event(map: string) {
    // console.log('- SearchComponent pc295Event map:', map);
    const
      parsed = JSON.parse(map),
      command = parsed.command;
    console.log(command);
    this.searchEvent.emit(map);
  }

  filterOpen() {
    const json = JSON.stringify({
        command: 'filterOpen',
      });
    this.searchEvent.emit(json);
  }

}
