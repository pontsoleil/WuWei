import 'rxjs/add/operator/map';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/toPromise';
import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { GoogleBook } from './google-book';

@Injectable()
export class GoogleBooksService {
  private API_PATH = 'https://www.googleapis.com/books/v1/volumes';
  public loading = false;
  public initialised = false;
  public totalItems = 0;
  public _page = 1;
  public pageSize = 10;
  public query = '';
  public books: GoogleBook[];

  onscreen = false;

  constructor(private http: Http) {
  }

  get startIndex() {
    return this.page * this.pageSize;
  }

  get totalPages() {
    try {
      return Math.ceil(this.totalItems / this.pageSize);
    } catch (e) {
      console.error(e);
      return 0;
    }
  }

  get page(): number {
    return this._page;
  }

  set page(val: number) {
    if (val !== this.page) {
      this._page = val;
      this.searchBooks(this.query);
    }
  }

  public searchBooks(queryTitle: string) {
    this.query = queryTitle;
    this.loading = true;
    this.initialised = true;
    this.books = [];
    this.http.get(`${this.API_PATH}?q=${this.query}&maxResults=${this.pageSize}&startIndex=${this.startIndex}`)
      .map(res => res.json())
      .do(data => {
        this.totalItems = data.totalItems;
      })
      .map(data => {
        return data.items ? data.items : [];
      })
      .map(items => {
        return items.map(item => this.bookFactory(item));
      })
      // .do(books => console.log(books))
      .do(_ => this.loading = false)
      .subscribe((books) => this.books = books);
  }

  retrieveBook(bookId: string) {
    return this.http.get(`${this.API_PATH}/${bookId}`)
      .map(res => res.json())
      .map(item => this.bookFactory(item));
  }

  private bookFactory(item: any): GoogleBook {
    const volumeInfo = item.volumeInfo;
    const imageLinks = volumeInfo.imageLinks;
    let thumbnail;
    let smallThumbnail;

    if (imageLinks) {
      thumbnail = imageLinks.thumbnail;
      smallThumbnail = imageLinks.smallThumbnail;
    } else {
      thumbnail = '';
      smallThumbnail = '';
    }

    return new GoogleBook({
      id: <string>item.id,
      title: <string>volumeInfo.title,
      subTitle: <string>volumeInfo.subTitle,
      authors: <string[]>volumeInfo.authors,
      publisher: <string>volumeInfo.publisher,
      publishDate: <string>volumeInfo.publishDate,
      description: <string>volumeInfo.description,
      categories: <string[]>volumeInfo.categories
        ? <string[]>volumeInfo.categories.map((item) => {
          return item.split('/').pop().trim();
        })
        : ['N/A'],
      thumbnail: <string>thumbnail,
      smallThumbnail: <string>smallThumbnail
    });
  }
}
