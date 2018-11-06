import { Injectable     } from '@angular/core';
import { Http,
         Headers,
         RequestOptions } from '@angular/http';
import { Observable     } from 'rxjs/Observable';
import 'rxjs/add/operator/map';

// import { AuthService } from '../services/auth.service';
import * as globals from '../model/wuwei-globals';

@Injectable()
export class AgentService {

  private headers = new Headers({
    'Content-Type': 'application/json',
    'charset':      'UTF-8'
  });

  // private auth = new AuthService();
  private options = new RequestOptions({ headers: this.headers });

  constructor(
    private http: Http
  ) { }

  getAgents(currentUser): Observable<any> {
    if (!globals.status.isOnline) { return null; }
    const params = JSON.stringify({
      creator_ref: currentUser._id
    });
    return this.http
      .post('/api/agents', params, this.options)
      .map(res => res.json());
  }

  countAgents(currentUser): Observable<any> {
    if (!globals.status.isOnline) { return null; }
    const params = JSON.stringify({
      creator_ref: currentUser._id
    });
    return this.http
      .post('/api/agents/count', params, this.options)
      .map(res => res.json());
  }

  addAgent(agent): Observable<any> {
    if (!globals.status.isOnline) { return null; }
    return this.http.post('/api/agent', JSON.stringify(agent), this.options);
  }

  getAgent(agent): Observable<any> {
    if (!globals.status.isOnline) { return null; }
    return this.http.get(`/api/agent/${agent._id}`).map(res => res.json());
  }

  editAgent(agent): Observable<any> {
    if (!globals.status.isOnline) { return null; }
    agent.modified = new Date().toISOString();
    return this.http.put(`/api/agent/${agent._id}`, JSON.stringify(agent), this.options);
  }

  deleteAgent(agent): Observable<any> {
    if (!globals.status.isOnline) { return null; }
    return this.http.delete(`/api/agent/${agent._id}`, this.options);
  }

}
