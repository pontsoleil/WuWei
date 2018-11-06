import { Injectable } from '@angular/core';
import { Http,
         Headers,
         RequestOptions,
         URLSearchParams
} from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import * as globals from '../model/wuwei-globals';

@Injectable()
export class FileService {

  private headers = new Headers({
    'Content-Type': 'application/json',
    'charset':      'UTF-8'
  });

  private options = new RequestOptions({ headers: this.headers });

  constructor(
    private http: Http
  ) { }

  getFiles(): Observable<any> {
    // if (!globals.status.isOnline) { return null; }
    return this.http.get('/api/files').map(res => res.json());
  }

  getFeatures( floc ): Observable<any> {
    // if (!globals.status.isOnline) { return null; }
    const
      params: URLSearchParams = new URLSearchParams(),
      requestOptions = new RequestOptions();
    params.set('floc', floc);
    requestOptions.search = params;
    return this.http
      .get('/api/features/', requestOptions)
      .map(res => {
        return res.json();
      });
  }

  upload(file): Observable<any> {
    if (!globals.status.isOnline) { return null; }
    return this.http.post('/api/upload', JSON.stringify(file), this.options);
  }

  getFile(file): Observable<any> {
    if (!globals.status.isOnline) { return null; }
    return this.http.get(`/api/file/${file._id}`).map(res => res.json());
  }

  editFile(file): Observable<any> {
    if (!globals.status.isOnline) { return null; }
    return this.http.put(`/api/file/${file._id}`, JSON.stringify(file), this.options);
  }

  deleteFile(file): Observable<any> {
    if (!globals.status.isOnline) { return null; }
    return this.http.delete(`/api/file/${file._id}`, this.options);
  }

}
