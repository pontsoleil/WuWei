import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import { ToastService } from '../../../mdb-type/pro/alerts';

import { GoogleBooksItem } from '../../../model/items/google-books-item';
import * as globals from '../../../model/wuwei-globals';

@Injectable()
export class GoogleBooksSearchService {

  private apiRoot = 'https://www.googleapis.com/books/v1/volumes';

  constructor(
    private http: Http,
    private toast: ToastService,
  ) { }

  search(term): Observable<GoogleBooksItem[]> {
    if (globals.status.isOnline) {
      const apiURL = `${this.apiRoot}?q=${term}&maxResults=40`;
      return this.http.get(apiURL)
        .map(res => {
          const items = res.json().items;
          return items.map(item => {
            const imageLinks = item.volumeInfo.imageLinks || {};
            return new GoogleBooksItem({
              id: item.id,
              title: item.volumeInfo.title,
              subTitle: item.volumeInfo.subTitle,
              authors: item.volumeInfo.authors,
              publisher: item.volumeInfo.publisher,
              publishDate: item.volumeInfo.publishDate,
              description: item.volumeInfo.description,
              categories: item.volumeInfo.categories,
              thumbnail: imageLinks.thumbnail,
              smallThumbnail: imageLinks.smallThumbnail,
              value: item
            });
          });
        });
    } else {
      this.toastMessage('INTERNET DISCONNECTED', 'error');
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
