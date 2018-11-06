import { Injectable } from '@angular/core';
import {
  Http,
  Headers,
  RequestOptions
} from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';

// import { AuthService } from '../services/auth.service';
import { Link } from '../model/wuwei/shared/link';
import { WuweiModel } from '../model/wuwei/wuwei.model';
import * as globals from '../model/wuwei-globals';

@Injectable()
export class LinkService {

  private headers = new Headers({
    'Content-Type': 'application/json',
    'charset': 'UTF-8'
  });

  // private auth = new AuthService();
  private options = new RequestOptions({headers: this.headers});

  constructor(
    private http: Http,
    private model: WuweiModel
  ) { }

  getLinks(currentUser): Observable<any> {
    if (!globals.status.isOnline) { return null; }
    const params = JSON.stringify({
      creator_ref: currentUser._id
    });
    return this.http
      .post('/api/links', params, this.options)
      .map(res => res.json())
      .map(items => {
        return items.map(
          item => this.linkFactory(item)
        );
      });
  }

  countLinks(currentUser): Observable<any> {
    if (!globals.status.isOnline) { return null; }
    const params = JSON.stringify({
      creator_ref: currentUser._id
    });
    return this.http
      .post('/api/links/count', params, this.options)
      .map(res => res.json());
  }

  addLink(link, currentUser): Observable<any> {
    if (!globals.status.isOnline) { return null; }
    return this.http.post('/api/link', JSON.stringify(link), this.options);
  }

  getLink(link, currentUser): Observable<any> {
    if (!globals.status.isOnline) { return null; }
    return this.http
      .get(`/api/link/${link._id}`)
      .map(res => res.json())
      .map(item => this.linkFactory(item));
  }

  editLink(link, currentUser): Observable<any> {
    if (!globals.status.isOnline) { return null; }
    return this.http.put(`/api/link/${link._id}`, JSON.stringify(link), this.options);
  }

  deleteLink(link, currentUser): Observable<any> {
    if (!globals.status.isOnline) { return null; }
    return this.http.delete(`/api/link/${link._id}`, this.options);
  }

  linkFactory(item: any): Link {
    return this.model.LinkFactory(item);
  }
}
