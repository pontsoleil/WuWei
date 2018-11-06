import {
  Component,
  Directive,
  OnInit,
  AfterViewInit,
  Input
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormControl,
  Validators,
  NgControl
} from '@angular/forms';
import { Router } from '@angular/router';
import { CognitoUserService } from '../services';
import { AWS_ENV } from 'assets/config/environment.aws';
import {
  MatDialogModule,
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA
} from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ToastService } from '../mdb-type/pro/alerts';
import { MessageService } from '../services';

import * as globals from '../model/wuwei-globals';

// Disabling Form Controls When Working With Reactive Forms in Angular
// see https://netbasal.com/disabling-form-controls-when-working-with-reactive-forms-in-angular-549dd7b42110
@Directive({
  selector: '[disableControl]'
})
export class DisableControlDirective {

  @Input() set disableControl( condition: boolean ) {
    const action = condition ? 'disable' : 'enable';
    this.ngControl.control[action]();
  }

  constructor(
    private ngControl: NgControl
  ) { }
}

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss']
})
export class ChangePasswordComponent implements OnInit, AfterViewInit {

  currentUser = {};
  disable = true;

  public changePasswordForm: FormGroup;
  public name = new FormControl('',
    // { value: this.currentUser['name'], disabled: true },
    Validators.required
  );
  public currentPassword = new FormControl('', Validators.required);
  public newPassword = new FormControl('', [
    Validators.required,
    Validators.pattern('^(?=.*[a-z])(?=.*[A-Z])(?!.*\s).{8,}$') // MUST contain both upper and lower case letter
  ]);
  get name_() { return this.changePasswordForm.get('name'); }
  get currentPassword_() { return this.changePasswordForm.get('currentPassword'); }
  get newPassword_() { return this.changePasswordForm.get('newPassword'); }

  constructor(
    private snackBar: MatSnackBar,
    private fb: FormBuilder,
    private dialog: MatDialog,
    private toast: ToastService,
    private router: Router,
    private auth: CognitoUserService
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

  ngAfterViewInit() {
    this.getUser();
  }

  initForm() {
    this.changePasswordForm = this.fb.group({
      'name': this.name,
      'currentPassword': this.currentPassword,
      'newPassword': this.newPassword
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
        this.toastMessage('you are not logged in!', 'error');
        return console.log(err) || this.router.navigate(['/signin']);
      });
  }

  onChangePassword(value: any) {
    const
      name = this.currentUser['name'],
      currentPassword = value.currentPassword,
      newPassword = value.newPassword;
    if (!navigator.onLine) {
      this.toastMessage('You have no internet connection!', 'warning');
      return;
    }
    this.auth
      .changePassword(name, currentPassword, newPassword)
      .then((result) => {
        this.toastMessage('Successfully changed password for ' + name, 'success');
        return console.log(result) || this.router.navigate(['/']);
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
