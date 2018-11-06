import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import { ToastService } from '../../../mdb-type/pro/alerts';
import { GOOGLE_ENV } from 'assets/config/environment.google';
import { YoutubeItem } from '../../../model/items/youtube-item';
// import * as globals from '../../../model/wuwei-globals';

@Injectable()
export class YoutubeSearchService {

  private apiRoot = 'https://www.googleapis.com/youtube/v3';
  private apiSearch = 'search';
  private API_KEY = GOOGLE_ENV.API_KEY['YouTube'];

  constructor(
    private http: Http,
    private toast: ToastService,
  ) { }

  search(term): Observable<YoutubeItem[]> {
    term = term.split(' ').join('+');
    // see https://developers.google.com/youtube/v3/code_samples/javascript?hl=ja
    const
      apiURL = `${this.apiRoot}/${this.apiSearch}?q=${term}&part=snippet&maxResults=50&key=${this.API_KEY}`;
    return this.http.get(apiURL)
        .map(res => {
          const items = res.json().items;
          return items.map(item => {
            return new YoutubeItem({
              kind: item.kind, // "youtube#searchResult",
              etag: item.etag, // "\"RmznBCICv9YtgWaaa_nWDIH1_GM/Vx8fYkhs8I5jFp1wTP4FYXMmn9M\"",
              id: item.id,
              snippet: item.snippet,
              value: item
            });
          });
        })
        .catch(error => {
          const errMsg = error.json() || 'Server error';
          console.error(errMsg); // log to console instead
          return Observable.throw(errMsg);
        });
/**
{
  "kind": "youtube#searchResult",
  "etag": "\"RmznBCICv9YtgWaaa_nWDIH1_GM/Vx8fYkhs8I5jFp1wTP4FYXMmn9M\"",
  "id": {
    "kind": "youtube#video",
    "videoId": "OaXiTwgkDAw"
  },
  "snippet": {
    "publishedAt": "2018-03-23T10:00:02.000Z",
    "channelId": "UC1oPBUWifc0QOOY8DEKhLuQ",
    "title": "BiSH / PAiNT it BLACK[OFFICIAL VIDEO]",
    "description": "Major 3rd Single “PAiNT it BLACK” 2018.03.28 OUT!! http://amzn.to/2IJlL2A \"\"楽器を持たないパンクバンド\"\"BiSHのニューシングル テレビアニメ「ブラッククロ...",
    "thumbnails": {
      "default": {
        "url": "https://i.ytimg.com/vi/OaXiTwgkDAw/default.jpg",
        "width": 120,
        "height": 90
      },
      "medium": {
        "url": "https://i.ytimg.com/vi/OaXiTwgkDAw/mqdefault.jpg",
        "width": 320,
        "height": 180
      },
      "high": {
        "url": "https://i.ytimg.com/vi/OaXiTwgkDAw/hqdefault.jpg",
        "width": 480,
        "height": 360
      }
    },
    "channelTitle": "avex",
    "liveBroadcastContent": "none"
  }
}
 */
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
