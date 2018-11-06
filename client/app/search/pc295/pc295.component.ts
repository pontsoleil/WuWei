import {
  Component,
  OnInit,
  EventEmitter,
  Output
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { Http } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/catch';
import { Subscription } from 'rxjs/Subscription';
import { ToastService } from '../../mdb-type/pro/alerts';
import { WuweiModel } from '../../model/wuwei/wuwei.model';
import { MessageService } from '../../services/message.service';
import { PC295SearchService } from './shared/search.service';
import { PC295Comment } from '../../model/items/pc295-item';
// import * as PC295_CONFIG from '../../../assets/config/environment.pc295';
import { CONF } from 'assets/config/environment.host';
import * as globals from '../../model/wuwei-globals';
// import { LexRuntime } from '../../../../node_modules/aws-sdk';

@Component({
  selector: 'search-pc295',
  templateUrl: './pc295.component.html',
  styleUrls: ['./pc295.component.scss']
})
export class SearchPC295Component implements OnInit {

  @Output()
  pc295Event = new EventEmitter<any>();

  private model: WuweiModel;
  private subscription: Subscription;

  public loading: boolean = true;
  public results: PC295Comment[];
  public searchField: FormControl;

  public searchBy;
  public docs;
  public mbNCs;
  public clauses;
  public clusters;
  public mbNcArray;
  public clauseArray;
  public clusterArray;

  public searchCD;

  public selected = [];

  constructor(
    private toast: ToastService,
    private messageService: MessageService,
    private http: Http,
    private PC295: PC295SearchService
  ) {
    this.model = globals.module.wuweiModel;
  }

  ngOnInit() {
    // this.toggleModal('stop');
    this.searchField = new FormControl();
    this.searchField.valueChanges
        .debounceTime(500)
        .distinctUntilChanged()
        .do(_ => {
          /*console.log('ngOninit searchField.valueChanges modalSpinner START');
          const json = JSON.stringify({
            command: 'modalSpinner',
            param: {
              state: 'start',
              top: window.innerHeight / 2,
              left: 130
            }
          });
          this.pc295Event.emit(json);*/
          this.loading = true;
        })
        .switchMap(term => {
          const apiURL = CONF.assetsUrl + 'temp/solr_clustering.json';
          // const apiURL = 'http://localhost:4200/assets/temp/solr_clustering.json';
          return this.http.get(apiURL)
            .map(item => {
              const res = item.json();
              const docs = res['response']['docs'];
              return <PC295Comment[]>docs.filter(doc => doc.comment.join(' ').toLowerCase().indexOf(term.trim().toLowerCase()) >= 0);
            });
        })
        .do(_ => {
          /*console.log('ngOninit searchField.valueChanges modalSpinner STOP');
          const json = JSON.stringify({
            command: 'modalSpinner',
            param: {
              state: 'stop'
            }
          });
          this.pc295Event.emit(json);*/
          this.loading = false;
        })
        .subscribe(results => {
          // console.log(results);
          this.searchBy = 'Term';
          this.results = results;
        });
    this.searchCD = 'CD2';
    this.preSearch(this.searchCD);
  }

  sortNum = (_a, _b) => {
    let result = 0;
    const
      a = +_a, b = +_b;
    if (a > b) {
      result = 1;
    } else if (a < b) {
      result = -1;
    }
    return result;
  }

  sortDoc = (_a, _b) => {
    let result = 0;
    const
      a = +_a.id, b = +_b.id;
    if (a > b) {
      result = 1;
    } else if (a < b) {
      result = -1;
    }
    return result;
  }

  sortmbNC = (_a, _b) => {
    let result = 0;
    const
      index_a = _a.index,
      a = +index_a.substr(6, index_a.length - 6),
      index_b = _b.index,
      b = +index_b.substr(6, index_b.length - 6);
    if (a > b) {
      result = 1;
    } else if (a < b) {
      result = -1;
    }
    return result;
  }

  sortClause = (_a, _b) => {
    let result = 0;
    const
      a = _a.index.split('_').map(v => +v),
      b = _b.index.split('_').map(v => +v);
    if (1 === a.length) {
      a.push(0);
      a.push(0);
    } else if (2 === a.length) {
      a.push(0);
    }
    if (1 === b.length) {
      b.push(0);
      b.push(0);
    } else if (2 === b.length) {
      b.push(0);
    }
    if (a[0] > b[0]) {
      result = 1;
    } else if (a[0] < b[0]) {
      result = -1;
    } else {
      if (a[1] > b[1]) {
        result = 1;
      } else if (a[1] < b[1]) {
        result = -1;
      } else {
        if (a[2] > b[2]) {
          result = 1;
        } else if (a[2] < b[2]) {
          result = -1;
        }
      }
    }
    return result;
  }

  preSearch(CD) {
    const model = this.model;
    // console.log('preSearch modalSpinner START');
    /*const json = JSON.stringify({
      command: 'modalSpinner',
      param: {
        state: 'start',
        top: window.innerHeight / 2,
        left: '130px'
      }
    });
    this.pc295Event.emit(json);*/
    this.loading = true;
    this.searchBy = '';
    let args = 'q=*:*&rows=500';
    if ('CD1' === CD) {
      args = 'q=document:CD1&rows=500';
    } else if ('CD2' === CD) {
      args = 'q=document:CD2&rows=500';
    } else if ('Both' === CD) {
      args = 'q=*:*&rows=500';
    }
    this.PC295.search(args)
      .subscribe(item => {
        const
          response = item['response'];
        let
          docs = response.docs,
          clusters = item['clusters'];
        // console.log(clusters);
        this.clusters = {};
        this.docs = {};
        let i = 0;
        Promise.resolve({ clusters: clusters, docs: docs })
          .then(param => {
            clusters = param.clusters;
            docs = param.docs;
            const _docs = {};
            for (const doc of docs) {
              _docs[doc.id] = doc;
            }
            return { clusters: clusters, docs: _docs };
          })
          .then(param => {
            clusters = param.clusters;
            docs = param.docs;
            const _clusters = [];
            for (const cluster of clusters) {
              const
                _id = i++,
                _title = cluster.labels.join(' '),
                _score = 0 + cluster.score,
                _docs = [];
              cluster.docs = cluster.docs.sort(this.sortNum);
              for (const id of cluster.docs) {
                if (_score > 0) {
                  _docs.push(docs[id]);
                }
              }
              _clusters.push({
                id: _id,
                title: _title,
                score: _score,
                docs: _docs
              });
            }
            return { clusters: _clusters, docs: docs };
          })
          .then(param => {
            // setTimeout(() => {
              /*console.log('preSearch modalSpinner STOP');
              const json = JSON.stringify({
                command: 'modalSpinner',
                param: {
                  state: 'stop'
                }
              });
              this.pc295Event.emit(json);*/
            // }, 100);
            globals.status.PreSearch = true;

            this.clusters = param.clusters;
            this.docs = param.docs;
            return model.addPC295comments({
              clusters: this.clusters,
              docs: this.docs
            });
          })
          .then(result => {
            this.loading = false;
            this.clauses = result.clauses;
            // this.tables = result.tables;
            this.mbNCs = result.mbNCs;
          });
      });
  }

  onCDcheck($event, CD) {
    this.searchCD = CD;
    this.preSearch(CD);
  }

  doSearch(term) {
    const self = this;
    self.searchBy = term;
    globals.status.PreSearch = false;

    const json = JSON.stringify({
      command: 'clearSearch'
    });
    this.pc295Event.emit(json);

    if ('mbNC' === this.searchBy) {
      const mbNCs = this.mbNCs;
      this.mbNcArray = [];
      for (const index in mbNCs) {
        if (mbNCs.hasOwnProperty(index)) {
          const
            mbNC = mbNCs[index].resource,
            name = mbNC.name,
            docs = [];
          let _docs = mbNCs[index].docs;
          _docs = _docs.sort(this.sortNum);
          for (const id of _docs) {
            docs.push(this.docs[id]);
          }
          this.mbNcArray.push({
            index: index,
            label: name,
            mbNC: mbNC,
            docs: docs
          });
        }
      }
      this.mbNcArray.sort(this.sortmbNC);
    }
    if ('Clause' === this.searchBy) {
      let clauses = null;
      let clauses2 = null;
      if ('CD1' === this.searchCD) {
        clauses = this.clauses.CD1;
      } else if ('CD2' === this.searchCD) {
        clauses = this.clauses.CD2;
      } else if ('Both' === this.searchCD) {
        clauses = this.clauses.CD1;
        clauses2 = this.clauses.CD2;
      }
      this.clauseArray = [];
      for (const index in clauses) {
        if (clauses.hasOwnProperty(index)) {
          const
            clause = clauses[index].resource,
            name = clause.name,
            docs = [];
          let _docs = clauses[index].docs;
          if ('Both' === this.searchCD) {
            const
              _docs1 = _docs,
              _docs2 = clauses2[index] && clauses2[index].docs;
            if (_docs2) {
              _docs = _docs1.concat(_docs2);
            }
          }
          _docs = _docs.sort(this.sortNum);
          for (const id of _docs) {
            docs.push(this.docs[id]);
          }
          this.clauseArray.push({
            index: index.replace(/\./g, '_'),
            label: name,
            clause: clause,
            docs: docs
          });
        }
      }
      this.clauseArray.sort(this.sortClause);
    }
  }

  getMbNC = (mb_nc) => {
    let mbNC = mb_nc.trim().split('/')[0];
    if ('China' === mbNC) {
      mbNC = 'CN';
    } else if ('NEN' === mbNC) {
      mbNC = 'NL';
    } else if ('JISC' === mbNC) {
      mbNC = 'JP';
    }
    return mbNC;
  }

  showDetail(doc) {
    const mb_nc = this.getMbNC(doc.mb_nc); // .split('/')[0].toLowerCase();
    let doc_id, json;
    for (const node of globals.graph.nodes) {
      if (node.key === 'comment|' + mb_nc + '|' + doc.id) {
        node.visible = true;
        doc_id = node._id;
        json = JSON.stringify({
          command: 'addPC295',
          param: {
            key: node.key
          }
        });
        this.pc295Event.emit(json);
        json = JSON.stringify({
          command: 'openInfo',
          param: {
            type: 'node',
            _id: doc_id
          }
        });
        this.pc295Event.emit(json);
      }
    }
  }

  toggleCluster(id) {
    const
      clusterLi = document.querySelector('#cluster_' + id);
    const
      icon = clusterLi.querySelector('div.title i:first-child'),
      clusterUl = clusterLi.querySelector('ul.cluster');
    clusterUl.classList.toggle('open');
    if (clusterUl.classList.contains('open')) {
      icon.classList.remove('fa-angle-down');
      icon.classList.add('fa-angle-up');
    } else {
      icon.classList.remove('fa-angle-up');
      icon.classList.add('fa-angle-down');
    }
  }

  togglembNC(mbNC) {
    const
      clusterLi = document.querySelector('#' + mbNC);
    const
      icon = clusterLi.querySelector('div.title i:first-child'),
      clusterUl = clusterLi.querySelector('ul.mbNC');
    clusterUl.classList.toggle('open');
    if (clusterUl.classList.contains('open')) {
      icon.classList.remove('fa-angle-down');
      icon.classList.add('fa-angle-up');
    } else {
      icon.classList.remove('fa-angle-up');
      icon.classList.add('fa-angle-down');
    }
  }

/*  toggleTable(table_no) {
    const
      clusterLi = document.querySelector('#' + table_no);
    const
      icon = clusterLi.querySelector('div.title i:first-child'),
      clusterUl = clusterLi.querySelector('ul.table');
    clusterUl.classList.toggle('open');
    if (clusterUl.classList.contains('open')) {
      icon.classList.remove('fa-angle-down');
      icon.classList.add('fa-angle-up');
    } else {
      icon.classList.remove('fa-angle-up');
      icon.classList.add('fa-angle-down');
    }
  }
*/
  toggleClause(index) {
    const
      // self = this,
      clauseLi = document.querySelector('#clause_' + index);
    const
      icon = clauseLi.querySelector('div.angle i:first-child'),
      clauseUl = clauseLi.querySelector('ul.clause');
    if (!icon) {
      return;
    }
    clauseUl.classList.toggle('open');
    if (clauseUl.classList.contains('open')) {
      icon.classList.remove('fa-angle-down');
      icon.classList.add('fa-angle-up');
    } else {
      icon.classList.remove('fa-angle-up');
      icon.classList.add('fa-angle-down');
    }
  }

  getKey(doc) {
    const
      mb_nc = this.getMbNC(doc.mb_nc), // .trim().split('/')[0].toLowerCase(),
      key = 'comment|' + mb_nc + '|' + doc.id;
    return key;
  }

  renderCluster(cluster) {
    const
      self = this,
      docs = cluster.docs,
      keys = docs.map(doc => this.getKey(doc));
    const
      json = JSON.stringify({
        command: 'addPC295',
        param: {
          cluster: cluster,
          keys: keys
        }
      });
    self.pc295Event.emit(json);
    /*json = JSON.stringify({
      command: 'modalSpinner',
      param: {
        state: 'start',
        top: window.innerHeight / 2,
        left: '130px'
      }
    });
    this.pc295Event.emit(json);*/
  }

  renderMBNC(mbNC) {
    const
      self = this,
      docs = mbNC.docs,
      keys = docs.map(doc => this.getKey(doc));
    const
      json = JSON.stringify({
        command: 'addPC295',
        param: {
          mbNC: mbNC,
          keys: keys
        }
      });
    self.pc295Event.emit(json);
    /*json = JSON.stringify({
      command: 'modalSpinner',
      param: {
        state: 'start',
        top: window.innerHeight / 2,
        left: '130px'
      }
    });
    this.pc295Event.emit(json);*/
  }

  renderClause(clause) {
    const
      self = this,
      docs = clause.docs,
      keys = docs.map(doc => this.getKey(doc));
    const
      json = JSON.stringify({
        command: 'addPC295',
        param: {
          clause: clause,
          keys: keys
        }
      });
    self.pc295Event.emit(json);
    /*json = JSON.stringify({
      command: 'modalSpinner',
      param: {
        state: 'start',
        top: window.innerHeight / 2,
        left: '130px'
      }
    });
    this.pc295Event.emit(json);*/
  }

/*  renderTable(table) {
    const
      self = this,
      docs = table.docs,
      keys = docs.map(doc => this.getKey(doc));
    const
      json = JSON.stringify({
        command: 'addPC295',
        param: {
          table: table,
          keys: keys
        }
      });
    self.pc295Event.emit(json);*/
    /*json = JSON.stringify({
      command: 'modalSpinner',
      param: {
        state: 'start',
        top: window.innerHeight / 2,
        left: '130px'
      }
    });
    this.pc295Event.emit(json);*/
  // }

  toastMessage(message: string, action: string) {
    const
      options = {
        closeButton: true,
        positionClass: 'toast-bottom-center'
      };
    this.toast[action](message, action.toUpperCase(), options);
  }

}
