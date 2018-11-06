import { Injectable } from '@angular/core';
import {
  Http,
  Headers,
  RequestOptions
} from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';

// import { AuthService } from './auth.service';
import { WuweiModel } from '../model/wuwei/wuwei.model';
import { Note } from '../model/wuwei/shared/note';
import * as globals from '../model/wuwei-globals';

@Injectable()
export class NoteService {

  private headers = new Headers({
    'Content-Type': 'application/json',
    'charset':      'UTF-8'
  });

  // private auth = new AuthService();
  private options = new RequestOptions({ headers: this.headers });

  constructor(
    private http: Http,
    private model: WuweiModel
  ) { }

  getNotes(currentUser): Observable<any> {
    if (!globals.status.isOnline) { return null; }
    const params = JSON.stringify({
      creator_ref: currentUser._id
    });
    return this.http
      .post('/api/notes', params, this.options)
      .map(res => res.json())
      .map(items => {
        return items.map(
          item => this.noteFactory(item)
        );
      });
  }

  countNotes(currentUser): Observable<any> {
    if (!globals.status.isOnline) { return null; }
    const params = JSON.stringify({
      creator_ref: currentUser._id
    });
    return this.http
      .post('/api/notes/count', params, this.options)
      .map(res => res.json());
  }

  addNote(note): Observable<any> {
    if (!globals.status.isOnline) { return null; }
    return this.http.post('/api/note', JSON.stringify(note), this.options);
  }

  getNote(note): Observable<any> {
    if (!globals.status.isOnline) { return null; }
    return this.http
      .get(`/api/note/${note._id}`)
      .map(res => res.json())
      .map(item => this.noteFactory(item));
  }

  editNote(note): Observable<any> {
    if (!globals.status.isOnline) { return null; }
    return this.http.put(`/api/note/${note._id}`, JSON.stringify(note), this.options);
  }

  deleteNote(note): Observable<any> {
    if (!globals.status.isOnline) { return null; }
    return this.http.delete(`/api/note/${note._id}`, this.options);
  }

  noteFactory(item: any): Note {
    if (!item) {
      return null;
    }
    return this.model.NoteFactory(item);
  }

}
