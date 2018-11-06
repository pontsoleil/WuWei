import {
  Component,
  OnInit
} from '@angular/core';
import {
  FormControl
} from '@angular/forms';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/do';

import { ItunesSearchService } from './shared/search.service';
import { ItunesItem } from '../../model/items/itunes-item';

@Component({
  selector: 'search-itunes',
  templateUrl: './itunes.component.html',
  styleUrls: ['./itunes.component.scss']
})
export class SearchItunesComponent implements OnInit {

  public loading: boolean = false;
  public results: Observable<ItunesItem[]>;
  public searchField: FormControl;

  constructor(
    private itunes: ItunesSearchService
  ) { }

  ngOnInit() {
    this.searchField = new FormControl();
    this.results = this.searchField.valueChanges
        .debounceTime(400)
        .distinctUntilChanged()
        .do(_ => this.loading = true)
        .switchMap(term => this.itunes.search(term))
        .do(_ => this.loading = false);
  }

  doSearch(term: string) {
    this.itunes.search(term);
  }

}
