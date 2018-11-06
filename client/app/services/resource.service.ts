import { Injectable } from '@angular/core';
import {
  Http,
  Headers,
  RequestOptions,
  RequestOptionsArgs
} from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';

// import { AuthService } from '../services/auth.service';
import { WuweiModel } from '../model/wuwei/wuwei.model';
import { Resource } from '../model/resource';
import * as globals from '../model/wuwei-globals';

@Injectable()
export class ResourceService {

  private headers = new Headers({
    'Content-Type': 'application/json',
    'charset': 'UTF-8'
  });

  // private auth = new AuthService();
  private options = new RequestOptions({ headers: this.headers });

  constructor(
    private http: Http,
    private model: WuweiModel
  ) { }

  addResource(resource): Observable<any> {
    if (!globals.status.isOnline) { return null; }
    return this.http.post('/api/resource', JSON.stringify(resource), this.options);
  }

  getResource(resource): Observable<any> {
    if (!globals.status.isOnline) { return null; }
    return this.http
      .get(`/api/resource/${resource._id}`)
      .map(res => res.json())
      .map(item => this.resourceFactory(item));
  }

  editResource(resource): Observable<any> {
    if (!globals.status.isOnline) { return null; }
    return this.http.put(`/api/resource/${resource._id}`, JSON.stringify(resource), this.options);
  }

  deleteResource(resource): Observable<any> {
    if (!globals.status.isOnline) { return null; }
    return this.http.delete(`/api/resource/${resource._id}`, this.options);
  }

  getResources(currentUser): Observable<any> {
    if (!globals.status.isOnline) { return null; }
    const params = JSON.stringify({
      creator_ref: currentUser._id
    });
    return this.http
      .post('/api/resources', params, this.options)
      .map(res => res.json())
      .map(items => {
        return items.map(
          item => this.resourceFactory(item)
        );
      });
  }

  countResources(currentUser): Observable<any> {
    if (!globals.status.isOnline) { return null; }
    const params = JSON.stringify({
      creator_ref: currentUser._id
    });
    return this.http
      .post('/api/resources/count', params, this.options)
      .map(res => res.json());
  }

  resourceFactory(item: any): Resource {
    if (!item) {
      return null;
    }
    return this.model.ResourceFactory(item);
  }

}
