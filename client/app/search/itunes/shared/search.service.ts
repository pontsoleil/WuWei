import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import { ToastService } from '../../../mdb-type/pro/alerts';

import { ItunesItem } from '../../../model/items/itunes-item';
import * as globals from '../../../model/wuwei-globals';

@Injectable()
export class ItunesSearchService {

  private apiRoot: string = 'https://itunes.apple.com/search';

  constructor(
    private http: Http,
    private toast: ToastService,
  ) { }

  search(term: string): Observable<ItunesItem[]> {
    if (globals.status.isOnline) {
      const apiURL = `${this.apiRoot}?term=${term}&media=music&limit=20`;
      return this.http.get(apiURL)
        .map(res => {
          return res.json().results.map(item => {
            return new ItunesItem({
              track: item.trackName,
              artist: item.artistName,
              link: item.trackViewUrl,
              thumbnail: item.artworkUrl30,
              artistId: item.artistId,
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
