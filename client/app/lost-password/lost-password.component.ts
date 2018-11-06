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

@Component({
  selector: 'app-lost-password',
  templateUrl: './lost-password.component.html',
  styleUrls: ['./lost-password.component.scss']
})
export class LostPasswordComponent implements OnInit {

  // currentUser = { name: null };

  public lostForm: FormGroup;
  name = new FormControl('', [
    Validators.required,
  ]);
  get name_() { return this.lostForm.get('name'); }

  public resetForm: FormGroup;
  // public name2 = new FormControl('', [
  //   Validators.required,
  // ]);
  password = new FormControl('', [
    Validators.required,
    // Validators.minLength(8), // minLength doesn't work
    Validators.pattern('^(?=.*[a-z])(?=.*[A-Z])(?!.*\s).{8,}$') // MUST contain both upper and lower case letter
  ]);
  resetcode = new FormControl('', [
    Validators.required
  ]);
  // get name2_() { return this.resetForm.get('name2'); }
  get password_() { return this.resetForm.get('password'); }
  get resetcode_() { return this.resetForm.get('resetcode'); }

  constructor(
    public fb: FormBuilder,
    private toast: ToastService,
    private router: Router,
    private auth: CognitoUserService, // WpUserService,
    private messageService: MessageService
  ) { }

  ngOnInit() {
    this.initForm();
    const tab1 = document.querySelector('.nav-item a[href="#panel1"]');
    const tab2 = document.querySelector('.nav-item a[href="#panel2"]');
    const panel1 = document.getElementById('panel1');
    const panel2 = document.getElementById('panel2');
    tab1.addEventListener('click', (e) => {
      e.preventDefault();
      panel1.classList.add('active');
      panel2.classList.remove('active');
    }, false);
    tab2.addEventListener('click', (e) => {
      e.preventDefault();
      panel1.classList.remove('active');
      panel2.classList.add('active');
    }, false);
  }

  // onAfterViewInit() {
  //   this.getUser();
  // }

  initForm() {
    this.lostForm = this.fb.group({
      'name': this.name // ['', Validators.required]
    });
    this.resetForm = this.fb.group({
      // 'name2': this.name2,
      'password': this.password,
      'resetcode': this.resetcode
    });
  }

  // getUser() {
  //   this.auth
  //     .isAuthenticated()
  //     .then(res => {
  //       this.currentUser = this.auth.currentUser;
  //       console.log(res);
  //     })
  //     .catch((err) => {
  //       this.toastMessage('you are not logged in!', 'error');
  //       return console.log(err) || this.router.navigate(['/signin']);
  //     });
  // }

  passwordLost(value: any) {
    const
      name = value.name;
    this.auth.lostPassword(name);
  }

  passwordReset(value: any) {
    const
      name2 = value.name2,
      password = value.password,
      resetcode = value.resetcode;
    this.auth.resetPassword(name2, password, resetcode);
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
