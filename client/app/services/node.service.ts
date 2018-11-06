import { Injectable } from '@angular/core';
import {
  Http,
  Headers,
  RequestOptions
} from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';

// import { AuthService } from '../services/auth.service';
import { Node } from '../model/wuwei/shared/node';
import { WuweiModel } from '../model/wuwei/wuwei.model';
import * as globals from '../model/wuwei-globals';

@Injectable()
export class NodeService {

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

  getNodes(currentUser): Observable<any> {
    if (!globals.status.isOnline) { return null; }
    const params = JSON.stringify({
      creator_ref: currentUser._id
    });
    return this.http
      .post('/api/nodes', params, this.options)
      .map(res => res.json())
      .map(items => {
        return items.map(
          item => this.nodeFactory(item)
        );
      });
  }

  countNodes(currentUser): Observable<any> {
    if (!globals.status.isOnline) { return null; }
    const params = JSON.stringify({
      creator_ref: currentUser._id
    });
    return this.http
      .post('/api/nodes/count', params, this.options)
      .map(res => res.json());
  }

  addNode(node, currentUser): Observable<any> {
    if (!globals.status.isOnline) { return null; }
    return this.http.post('/api/node', JSON.stringify(node), this.options);
  }

  getNode(node, currentUser): Observable<any> {
    if (!globals.status.isOnline) { return null; }
    return this.http
      .get(`/api/node/${node._id}`)
      .map(res => res.json())
      .map(item => this.nodeFactory(item));
  }

  editNode(node, currentUser): Observable<any> {
    if (!globals.status.isOnline) { return null; }
    return this.http.put(`/api/node/${node._id}`, JSON.stringify(node), this.options);
  }

  deleteNode(node, currentUser): Observable<any> {
    if (!globals.status.isOnline) { return null; }
    return this.http.delete(`/api/node/${node._id}`, this.options);
  }

  nodeFactory(item: any): Node {
    return this.model.NodeFactory(item);
  }
}
