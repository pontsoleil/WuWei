import {
  Component,
  OnInit
} from '@angular/core';
import {
  CognitoUserService,
  WpUserService
} from '../services';
import { Router } from '@angular/router';
import { ToastService } from '../mdb-type/pro/alerts';
import * as globals from '../model/wuwei-globals';

@Component({
  selector: 'app-signout',
  template: '',
  styles:  ['']
})
export class SignoutComponent implements OnInit {

  constructor(
    private toast: ToastService,
    private router: Router,
    private auth: CognitoUserService // WpUserService
  ) { }

  ngOnInit() {
    globals.status.loggedIn = false;
    globals.status.currentUser = { _id: '', name: '', nickname: '', email: '' };
    this.auth.signout();
    this.toastMessage('You are signed out.', 'info');
    this.router.navigate(['/']);
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
