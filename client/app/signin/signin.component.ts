import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { letProto } from 'rxjs/operator/let';
import { ToastService } from '../mdb-type/pro/alerts';
import { AWS_ENV } from 'assets/config/environment.aws';
import * as globals from '../model/wuwei-globals';
import { urlencoded } from 'express';
import {
  CognitoUserService,
  MessageService,
  WpUserService
} from '../services';

function htmlDecode(input) {
  const e = document.createElement('div');
  e.innerHTML = input;
  // handle case of empty input
  return e.childNodes.length === 0 ? '' : e.childNodes[0].nodeValue;
}

@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.scss']
})
export class SigninComponent implements OnInit {
  // @Output() tokenChange = new EventEmitter<string>();
  currentUser;

  public signinForm: FormGroup;
  public name = new FormControl('', [
    Validators.required,
  ]);
  public password = new FormControl('', [
    Validators.required
  ]);
  // see https://www.concretepage.com/angular-2/angular-2-4-pattern-validation-example#formControl
  // and https://regex101.com/r/uE5lT4/4 for testing
  get name_() { return this.signinForm.get('name'); }
  get password_() { return this.signinForm.get('password'); }

  constructor(
    private toast: ToastService,
    private fb: FormBuilder,
    private router: Router,
    private auth: CognitoUserService, // WpUserService,
    private messageService: MessageService
  ) {
    this.auth
      .isAuthenticated()
      .then((res) => {
        return console.log(res); // || this.router.navigate(['/upload']);
      })
      .catch((err) => {
        return console.log(err); // || this.router.navigate(['/signin']);
      });
  }

  ngOnInit() {
    this.initForm();
  }

  initForm() {
    this.signinForm = this.fb.group({
      'name': this.name,
      'password': this.password
    });
  }

  onSignin(value: any) {
    const
      name = value.name,
      password = value.password;
    if (!navigator.onLine) {
      this.toastMessage('You have no internet connection!', 'warning');
      return;
    }
    this.auth.signin(name, password)
      .then((currentUser) => {
        // const _currentUser = localStorage.getItem('currentUser');
        // localStorage.setItem('currentUser', JSON.stringify(currentUser));
        // this.messageService.tokenChanged(_currentUser); // Wordpress
        console.log(currentUser);
        globals.status.loggedIn = true;
        globals.status.currentUser = currentUser;
        this.currentUser = globals.status.currentUser;
        this.toastMessage(
          'You are successfully signed in' +
            (this.currentUser && this.currentUser.nickname ? ' as ' + this.currentUser.nickname : ''),
          'success');
        return this.router.navigate(['/']);
      })
      .catch((err) => {
        this.toastMessage(err.message, 'error');
        console.log(err);
      });
  }

  close() {
    return this.router.navigate(['/']);
    // document.querySelector('app-signin .card').remove();
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
