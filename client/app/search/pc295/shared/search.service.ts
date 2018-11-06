import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import { ToastService } from '../../../mdb-type/pro/alerts';
import { PC295Item } from '../../../model/items/pc295-item';
// import { CONF } from 'assets/config/environment.host';
import * as globals from '../../../model/wuwei-globals';

@Injectable()
export class PC295SearchService {

  private apiRoot = 'https://www.wuwei.space/solr/pc295';
  private apiCommand = 'clustering';
  private apiArgs = 'q=*:*&rows=500';

  constructor(
    private http: HttpClient,
    private toast: ToastService,
  ) { }

  search(args?): Observable<PC295Item[]> {
    if (globals.status.isOnline) {
      const
        apiArgs = args || this.apiArgs,
        apiURL = `${this.apiRoot}/${this.apiCommand}?${apiArgs}`;
        // apiURL = CONF.assetsUrl + 'temp/solr_clustering.json';
      return this.http.get<PC295Item[]>(apiURL);
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
