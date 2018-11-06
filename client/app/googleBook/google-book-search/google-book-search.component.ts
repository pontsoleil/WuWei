import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { GoogleBooksService } from '../shared/google-books.service';
// import {Book} from '../../services/book';

@Component({
  selector: 'app-google-book-search',
  templateUrl: './google-book-search.component.html',
  styleUrls: ['./google-book-search.component.scss']
})
export class GoogleBookSearchComponent implements OnInit {

  public term = '';

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    public googleBooksService: GoogleBooksService
  ) {
    this.route.params.subscribe(params => {
      console.log(params);
      if (params['term']) {
        this.term = params['term'];
        this.onSearch(this.term);
      }
    });
  }

  doSearch() {
    this.router.navigate(['googlebook-search', {term: this.term}]);
  }

  onSearch(term: string) {
    this.googleBooksService.searchBooks(term);
  }

  ngOnInit() { }

}
