import { Injectable } from '@angular/core';
import {
  Http,
  Headers,
  RequestOptions,
  RequestOptionsArgs
} from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';

import { BLOG_ENV } from 'assets/config/environment.blog';
import { WuweiModel } from '../model/wuwei/wuwei.model';
import { Resource } from '../model/resource';
import * as globals from '../model/wuwei-globals';

@Injectable()
export class WpPostService {
  private baseUrl;
  private api = BLOG_ENV.rest_api.wuwei;

  setHeader(token) {
    const _wpApiSettings = localStorage.getItem('wpApiSettings');
    let nonce, headers;
    if (_wpApiSettings) {
      const wpApiSettings = JSON.parse(_wpApiSettings);
      if (wpApiSettings) {
        this.baseUrl = wpApiSettings.root;
        nonce = wpApiSettings.nonce;
        headers = new Headers({
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token,
          'X-WP-Nonce': nonce,
          'Accept' : '*/*'
        });
      }
    } else {
      this.baseUrl = BLOG_ENV.baseUrl;
      headers = new Headers({
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token,
        'Accept' : '*/*'
      });
    }
    const options = new RequestOptions({
      headers: headers
    });
    return options;
  }

  constructor(
    private http: Http,
    private model: WuweiModel
  ) { }

  addContent(token, resource): Observable<any> {
    if (!globals.status.isOnline) { return null; }
    const
      data = JSON.stringify(resource),
      options = this.setHeader(token);
    return this.http.post(this.baseUrl + this.api + '/resource', data, options );
  }

  getContent(token, resource?): Observable<any> {
    if (!globals.status.isOnline) { return null; }
    const
      options = this.setHeader(token);
    return this.http
      .get(this.baseUrl + this.api + `/resource/${resource._id}`)
      .map(res => res.json())
      .map(item => this.contentFactory(item));
  }

  editContent(token, resource): Observable<any> {
    if (!globals.status.isOnline) { return null; }
    const
      data = JSON.stringify(resource),
      options = this.setHeader(token);
    return this.http.put(this.baseUrl + this.api + `/resource/${resource._id}`, data, options);
  }

  deleteContent(token, resource?): Observable<any> {
    if (!globals.status.isOnline) { return null; }
    const
      data = JSON.stringify(resource),
      options = this.setHeader(token);
    return this.http.delete(this.baseUrl + this.api + `/resource/${resource._id}`, options);
  }

  getContents(token): Observable<any> {
    if (!globals.status.isOnline) { return null; }
    const
      options = this.setHeader(token),
      params = JSON.stringify({});
    return this.http
      .post(this.baseUrl + this.api + '/resources', params, options)
      .map(res => res.json())
      .map(items => {
        return items.map(
          item => this.contentFactory(item)
        );
      });
  }

  countContents(token): Observable<any> {
    if (!globals.status.isOnline) { return null; }
    const
      options = this.setHeader(token),
      params = JSON.stringify({});
    return this.http
      .post(this.baseUrl + this.api + '/resources/count', params, options)
      .map(res => res.json());
  }

  contentFactory(item: any): Resource {
    if (!item) {
      return null;
    }
    return this.model.ResourceFactory(item);
  }

  addNote(token, note): Observable<any> {
    if (!globals.status.isOnline) { return null; }
    const
      uuid = 'urn:uuid:' + note._id.substr(1),
      model = JSON.stringify(note),
      data = JSON.stringify({
        name: note.name,
        description: note.description,
        uuid: uuid,
        thumbnail: note.thumbnail,
        model: model
      }),
      options = this.setHeader(token);
    return this.http.post(this.baseUrl + this.api + '/note', data, options);
  }

}
