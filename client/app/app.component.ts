import { Component, OnInit, ViewChild } from '@angular/core';
// import { HttpClientModule, HttpClient } from '@angular/common/http';
import { Router, NavigationStart } from '@angular/router';
// import { NgForm } from '@angular/forms';
// import { Headers } from '@angular/http';
// import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
// import { MatSnackBar } from '@angular/material';
import { ToastService } from './mdb-type/pro/alerts';
import {
  // AnnotationService,
  CognitoUserService,
  // LinkService,
  MessageService,
  // NodeService,
  // NoteService,
  // ResourceService,
  WpUserService,
  WuweiService
} from './services';
import { WuweiModel } from './model';
// import { MenuComponent } from './menu/menu.component';
// import { GoogleBooksService } from './googleBook/shared/google-books.service';
// import { FilesComponent } from './files/files.component';
// import { UploadComponent } from './upload/upload.component';
import { DrawComponent } from './draw/draw.component';
import { CONF } from 'assets/config/environment.host';
import * as globals from './model/wuwei-globals';
import {
  faArchive,
  faArrowsAlt,
  faBars,
  faCubes,
  faEnvelope,
  faFolder,
  faList,
  faLock,
  faPencilRuler,
  faSearch,
  faSignInAlt,
  faSignOutAlt,
  faTag,
  faThLarge,
  faUpload,
  faUser,
  faUserPlus
} from '@fortawesome/free-solid-svg-icons';


function whichBrowser() {
  const userAgent = window.navigator.userAgent;
  const browsers = {chrome: /[Cc]hrome/i, safari: /[Ss]afari/i, firefox: /[Ff]irefox/i, ie: /internet explorer/i};
  for (const key in browsers) {
    if (browsers[key].test(userAgent)) {
      return key;
    }
  }
  return 'unknown';
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  @ViewChild('sidenav') nav;

  // Font awesome icons
  faArchive = faArchive;
  faArrowsAlt = faArrowsAlt;
  faBars = faBars;
  faCubes = faCubes;
  faEnvelope = faEnvelope;
  faFolder = faFolder;
  faList = faList;
  faLock = faLock;
  faPencilRuler = faPencilRuler;
  faSearch = faSearch;
  faSignInAlt = faSignInAlt;
  faSignOutAlt = faSignOutAlt;
  faTag = faTag;
  faThLarge = faThLarge;
  faUpload = faUpload;
  faUser = faUser;
  faUserPlus = faUserPlus;

  token = null;

  router_url: string;
  router_previous_url: string;
  subscription: Subscription;

  loggedIn = false;
  currentUser;
  onscreen = false;

  blogUrl;
  mailTo;

  breadcrumbTextDict = {
    '/': ['WuWei for Knowledge Explorer'],
    '/about': ['WuWei for Knowledge Explorer'],
    '/contents': ['Home', 'Contents', 'Contents'],
    '/simulate': ['Home', 'Drawing', 'Simulate'],
    '/draw': ['Home', 'Drawing', 'Draw'],
    '/agents': ['Home', 'Annotation', 'Agents'],
    '/resources': ['Home', 'Annotation', 'Resources'],
    '/annotations': ['Home', 'Annotation', 'Annotations'],
    '/googlebook-search': ['Home', 'Google Book', 'Search'],
    '/googlebook-library': ['Home', 'Google Book', 'Library'],
    '/signup': ['Home', 'Sign up'],
    '/signin': ['Home', 'Sign in'],
    '/account': ['Home', 'My Account'],
    '/change-password': ['Home', 'Change Password'],
    '/lost-password': ['Home', 'Lost Password'],
    '/signout': ['Home', 'Sign out'],
    '/upload': ['Home', 'Contents', 'Upload'],
    '/files': ['Home', 'Contents', 'Files'],
    '/explorer': ['Home', 'Contents', 'Explorer']
  };

  ngOnInit() {
    const preloader = document.getElementById('mdb-preloader');
    if (preloader) {
      preloader.remove();
    }

    this.blogUrl = CONF.blogUrl;
    this.mailTo = CONF.mailTo;

    window.addEventListener('offline', (e) => {
      console.log('offline');
      globals.status.isOnline = window.navigator.onLine;
      this.toastMessage('you lost internet connection!', 'warning');
      this.messageService.notifyStatus(JSON.stringify({
        net: 'offline'
      }));
    });

    window.addEventListener('online', (e) => {
      console.log('online');
      globals.status.isOnline = window.navigator.onLine;
      this.toastMessage('you got internet connection!', 'success');
      this.messageService.notifyStatus(JSON.stringify({
        net: 'online'
      }));
    });

    globals.status.isOnline = window.navigator.onLine;

    globals.status.browser = whichBrowser();
    console.log(globals.status.browser);

    this.checkSignedin();
  }

  constructor(
    private router: Router,
    private toast: ToastService,
    private auth: CognitoUserService,
    private messageService: MessageService,
    // private noteService: NoteService,
    // private nodeService: NodeService,
    // private linkService: LinkService,
    // private resourceService: ResourceService,
    // private annotationService: AnnotationService,
    private wuweiService: WuweiService,
    private model: WuweiModel
  ) {
    /**
     * see https://stackoverflow.com/questions/41444343/angular-2-window-postmessage
     */
    if (window.addEventListener) {
      window.addEventListener('message', this.listener.bind(this), false);
      window.addEventListener('contextmenu', this.no_operation.bind(this), false);
    } else {
      (<any>window).attachEvent('onmessage', this.listener.bind(this));
      (<any>window).attachEvent('oncontextmenu', this.no_operation.bind(this));
    }

    router.events.subscribe((event: any) => {
      setTimeout(() => {
        this.nav.hide();
      }, 1000);

      if (event instanceof NavigationStart) {
        if (this.router_url !== event.url) {
          this.router_previous_url = this.router_url || '/';
          this.wuweiService.router_previous_url = this.router_previous_url;
        }
        setTimeout(() => {
          if ('/signin' === this.router_previous_url) {
            this.loggedIn = this.auth.loggedIn;
            this.currentUser = this.auth.currentUser;
          } else if ('/signout' === this.router_previous_url) {
            this.loggedIn = false;
            this.currentUser = {};
          }
        }, 150);
        this.router_url = event.url;
        if ([ '/',
              '/about',
              '/signin',
              '/signup',
              '/change-password',
              '/lost-password',
              '/account'
            ].indexOf(event.url) >= 0) {
          document.querySelector('body').style.background = '#c0c0c0';
        } else {
          document.querySelector('body').style.background = '#ffffff';
        }
        if (['/simulate', '/draw'].indexOf(event.url) >= 0) {
          this.onscreen = true;
        } else {
          this.onscreen = false;
        }
        if (globals.status.simulation) {
          globals.status.simulation.stop();
        }
        const texts = this.breadcrumbTextDict[event.url];
        setTimeout(() => {
          if (texts) {
            this.updateBreadcrumbs(texts);
          } else {
            this.updateBreadcrumbs(this.breadcrumbTextDict['/']);
          }
        }, 500);
        // console.log('NavigationStart event=' + event.url + ' previous=' + this.router_previous_url);
      }
    });

    this.subscription = messageService.onscreen$.subscribe(
      json => {
        const
          self = this,
          parsed = JSON.parse(json),
          command = parsed.command,
          param = parsed.param;
        if ('onscreen' === command) {
          self.onscreen = param.onscreen;
        }
      },
      err => { alert('AppComponent' + JSON.stringify(err)); }
    );

    this.subscription = messageService.token$.subscribe(
      json => {
        const
          currentUser = JSON.parse(json),
          token = currentUser.token;
        this.loggedIn = !! currentUser;
        this.token = token;
        this.currentUser = currentUser;
      },
      err => { alert('AppComponent' + JSON.stringify(err)); }
    );
  }

  checkSignedin() {
    if (!globals.status.isOnline) {
      return false;
    }
    const MAX_TRY = 5;
    let tryCount = 0;
    this.auth
      .isAuthenticated()
      .then((res) => { // res is CognitoIdentityCredentials
        tryCount += 1;
        this.currentUser = this.auth.currentUser;
        if (!!this.currentUser.name) {
          this.loggedIn = this.auth.loggedIn;
          this.toastMessage(
            'Authenticated. Signed in as ' + this.currentUser.name + '(' + this.currentUser.nickname + ')',
            'success'
          );
        } else {
          if (tryCount <= MAX_TRY) {
            setTimeout(() => {
              this.checkSignedin();
            }, 200);
          } else {
            return false;
          }
        }
      })
      .catch((err) => {
        this.loggedIn = false;
        this.currentUser = {}; // this.auth.currentUser;
        this.toastMessage('Please sign in.', 'info');
        console.log(err);
        this.router.navigate(['/about']);
        return false;
      });
  }

/**
  <li class="breadcrumb-item"><a class="black-text" href="#">Home</a></li>
  <li class="breadcrumb-item"><a class="black-text" href="#">Library</a></li>
  <li class="breadcrumb-item active">Data</li>
*/
  updateBreadcrumbs(breadcrumbTexts) {
    const breadcrumbs = document.querySelector('logo .breadcrumbs');
    if (breadcrumbs) {
      breadcrumbs.innerHTML = '';
      for (const breadcrumbText of breadcrumbTexts) {
        const breadcrumbItem = document.createElement('li'); // Create a <li> node
        breadcrumbItem.setAttribute('class', 'breadcrumb-item');
        const whiteText = document.createElement('a');
        whiteText.setAttribute('class', 'white-text');
        // if ('Home' === breadcrumbText) {
        //   whiteText.setAttribute('routerLink', '/');
        //   whiteText.setAttribute('routerlinkactive', 'active');
        // }
        const textNode = document.createTextNode(breadcrumbText); // Create a text node
        whiteText.appendChild(textNode);
        breadcrumbItem.appendChild(whiteText);
        breadcrumbs.appendChild(breadcrumbItem);
      }
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

  no_operation: any = (event: any) => {
    event.preventDefault();
    event.stopPropagation();
    return false;
  }

  listener: any = (event: any) =>  {
    event.stopPropagation();
    console.log('-*- listener', event);
    const
      self = this,
      model = this.model,
      data = event.data;
    if (data && data.type) {
      const message_type = data.type;
      if (message_type === "FROM_CEXT" ||
          message_type === "FROM_SFEX" ||
          message_type === "NEW_OCCURRENCE") {
        const r = model.newNode(data);
        this.messageService.updateModel(JSON.stringify({
          command: 'update',
          param: {
            node: [r.node],
            resource: [r.resource]
          }
        })); // draw.refresh();
        // wuwei.tao.newoccurrence( data );
      } else if (data.type === "NEW_OCCURRENCES") {
        // wuwei.tao.newoccurrences( data );
      }
      return;
    }
  }

}
