import {Injectable} from '@angular/core';
import {
  Http,
  Headers,
  RequestOptions
} from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import * as uuid from 'uuid';

// import { AuthService } from '../services/auth.service';
import { WuweiModel } from '../model/wuwei';
import { Annotation } from '../model';
import * as globals from '../model/wuwei-globals';

@Injectable()
export class AnnotationService {

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

  getAnnotations(currentUser): Observable<any> {
    if (!globals.status.isOnline) { return null; }
    const params = JSON.stringify({
      creator_ref: currentUser._id
    });
    return this.http
      .post('/api/annotations', params, this.options)
      .map(res => res.json())
      .map(items => {
        return items.map(
          item => this.annotationFactory(item)
        );
      });
  }

  countAnnotations(currentUser): Observable<any> {
    if (!globals.status.isOnline) { return null; }
    const params = JSON.stringify({
      creator_ref: currentUser._id
    });
    return this.http
      .post('/api/annotations/count', params, this.options)
      .map(res => res.json());
  }

  addAnnotation(annotation): Observable<any> {
    if (!globals.status.isOnline) { return null; }
    return this.http.post('/api/annotation', JSON.stringify(annotation), this.options);
  }

  getAnnotation(annotation): Observable<any> {
    if (!globals.status.isOnline) { return null; }
    return this.http
      .get(`/api/annotation/${annotation._id}`)
      .map(res => res.json())
      .map(item => this.annotationFactory(item));
  }

  editAnnotation(annotation): Observable<any> {
    if (!globals.status.isOnline) { return null; }
    return this.http.put(`/api/annotation/${annotation._id}`, JSON.stringify(annotation), this.options);
  }

  deleteAnnotation(annotation): Observable<any> {
    if (!globals.status.isOnline) { return null; }
    return this.http.delete(`/api/annotation/${annotation._id}`, this.options);
  }

  annotationFactory(item: any): Annotation {
    if (!item) {
      return null;
    }
    return this.model.AnnotationFactory(item);
  }
}
