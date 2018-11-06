import { Component, OnInit, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
// import { MatSnackBar } from '@angular/material';
import { ToastService } from '../mdb-type/pro/alerts';
import {
  CognitoUserService,
  WpUserService,
  UserService
} from '../services';
import * as globals from '../model/wuwei-globals';

@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss']
})
export class AccountComponent implements OnInit, AfterViewInit {

  currentUser = { name: '', email: '', nickname: ''};

  accountForm: FormGroup;
  public name = new FormControl(
    this.currentUser.name,
    Validators.required
  );
  public email = new FormControl(
    this.currentUser.email,
    Validators.required
  );
  public nickname = new FormControl(
    this.currentUser.nickname,
    Validators.required
  );
  get name_() { return this.accountForm.get('name'); }
  get email_() { return this.accountForm.get('email'); }
  get nickname_() { return this.accountForm.get('nickname'); }

  constructor(
    private router: Router,
    private toast: ToastService,
    private fb: FormBuilder,
    public auth: CognitoUserService,
    private userService: UserService
  ) { }

  ngOnInit() {
    this.initForm();
  }

  ngAfterViewInit() {
    this.getUser();
  }

  initForm() {
    this.accountForm = this.fb.group({
      'name': this.name,
      'email': this.email,
      'nickname': this.nickname
    });
  }

  getUser() {
    this.auth
      .isAuthenticated()
      .then(res => {
        this.currentUser = this.auth.currentUser;
        console.log(res);
      })
      .catch((err) => {
        this.toastMessage('Please sign in to perform this operation.', 'error');
        return console.log(err) || this.router.navigate(['/signin']);
      });
  }

  onSaveSetting(value: any) {
    const
      name = value.name,
      email = value.email,
      nickname = value.nickname,
      attributeList = [
        { Name: 'name', Value: name },
        { Name: 'email', Value: email },
        { Name: 'nickname', Value: nickname }
      ];
    if (!navigator.onLine) {
      this.toastMessage('You have no internet connection!', 'warning');
      return;
    }
    this.auth
      .accountSetting(name, attributeList)
      // .toPromise()
      .then((result) => {
        this.toastMessage('Hi ' + result.username + ', you have successfully updated settings!', 'success');
        return console.log(result) || this.router.navigate(['/account']);
      })
      .catch((err) => {
        this.toastMessage(err.message, 'error');
        console.log(err);
      });
  }

  close() {
    return this.router.navigate(['/']);
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
