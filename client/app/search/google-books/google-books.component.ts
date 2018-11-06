import {
  Component,
  OnInit,
  EventEmitter,
  Output
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/do';
import { MessageService } from '../../services/message.service';
import { GoogleBooksSearchService } from './shared/search.service';
import { GoogleBooksItem } from '../../model/items/google-books-item';

@Component({
  selector: 'search-google-books',
  templateUrl: './google-books.component.html',
  styleUrls: ['./google-books.component.scss']
})
export class SearchGoogleBooksComponent implements OnInit {

  @Output()
  googleEvent = new EventEmitter<any>();

  @Output()
  infoEvent = new EventEmitter<any>();

  public loading: boolean = false;
  public results: Observable<GoogleBooksItem[]>;
  public searchField: FormControl;

  constructor(
    private messageService: MessageService,
    private googleBooks: GoogleBooksSearchService
  ) { }

  ngOnInit() {
    this.searchField = new FormControl();
    this.results = this.searchField.valueChanges
        .debounceTime(500)
        .distinctUntilChanged()
        .do(_ => this.loading = true)
        .switchMap(term => this.googleBooks.search(term))
        .do(_ => this.loading = false);
  }

  doSearch(term: string) {
    this.googleBooks.search(term);
  }

  showDetail(book) {
    console.log(book);
    /*
        public title: string,
        public subTitle: string,
        public authors: string[],
        public publisher: string,
        public publishDate: string,
        public description: string,
        public categories: string[],
        public thumbnail: string,
        public smallThumbnail: string
    */
    const json = JSON.stringify({
      command: 'openInfo',
      param: {
        node: {
          label: book.title,
          thumbnail: book.thumbnail,
          description: book.description
        },
        resource: {
          creator: book.authors.join(' '),
          generator: book.publisher
        }
      }
    });
    this.googleEvent.emit(json);
    // this.messageService.openSidebar(json);
  }

  bookmark(id, book) {
    const
      self = this,
      json = JSON.stringify({
        command: 'bookmark',
        param: {
          id: id,
          book: book
        }
      });
    // const
    //   bookmark = d3.select('#book_' + id),
    //   selected = bookmark.classed('selected');
    // bookmark.classed('selected', !selected);
    self.googleEvent.emit(json);
  }
}
