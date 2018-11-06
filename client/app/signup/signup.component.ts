import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { CognitoUserService } from '../services';
import { ToastService } from '../mdb-type/pro/alerts';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent implements OnInit {
  public signupForm: FormGroup;
  public successfullySignup: boolean;
  public name = new FormControl('', [
    Validators.required,
  ]);
  public nickname = new FormControl('', [
    Validators.required,
  ]);
  public email = new FormControl('', [
    Validators.required,
    Validators.pattern('^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$')
  ]);
  public password = new FormControl('', [
    Validators.required,
    // Validators.minLength(8), // minLength doesn't work
    Validators.pattern('^(?=.*[a-z])(?=.*[A-Z])(?!.*\s).{8,}$') // MUST contain both upper and lower case letter
  ]);
  // see https://www.concretepage.com/angular-2/angular-2-4-pattern-validation-example#formControl
  // and https://regex101.com/r/uE5lT4/4 for testing
  get name_() { return this.signupForm.get('name'); }
  get nickname_() { return this.signupForm.get('nickname'); }
  get email_() { return this.signupForm.get('email'); }
  get password_() { return this.signupForm.get('password'); }

  public confirmationForm: FormGroup;
  public name2 = new FormControl('', [
    Validators.required,
  ]);
  public confirmationCode = new FormControl('', [
    Validators.required,
  ]);
  get name2_() { return this.signupForm.get('name2'); }
  get confirmationCode_() { return this.signupForm.get('confirmationCode'); }

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private toast: ToastService,
    private auth: CognitoUserService
  ) { }

  ngOnInit() {
    this.initForm();
    const tab1 = document.querySelector('.nav-item a[href="#panel1"]');
    const tab2 = document.querySelector('.nav-item a[href="#panel2"]');
    const panel1 = document.getElementById('panel1');
    const panel2 = document.getElementById('panel2');
    tab1.addEventListener('click', (evt) => {
      evt.preventDefault();
      panel1.classList.add('active');
      panel2.classList.remove('active');
    }, false);
    tab2.addEventListener('click', (evt) => {
      evt.preventDefault();
      panel1.classList.remove('active');
      panel2.classList.add('active');
    }, false);
  }

  initForm() {
    this.signupForm = this.fb.group({
      'name': this.name,
      'nickname': this.nickname,
      'email': this.email,
      'password': this.password
    });
    this.confirmationForm = this.fb.group({
      'name2': this.name2,
      'confirmationCode': this.confirmationCode
    });
  }

  onSubmitSignup(value: any) {
    const
      name = value.name,
      nickname = value.nickname,
      email = value.email,
      password = value.password;
    this.auth
      .signUp(name, nickname, email, password)
      .then((result) => {
        console.log(result);
        this.toastMessage('Register finished.', 'success');
        this.successfullySignup = true;
      })
      .catch((err) => {
        this.toastMessage(err.message, 'error');
        console.log(err);
      });
  }

  onSubmitConfirmation(value: any) {
    const
      name2 = value.name2,
      confirmationCode = value.confirmationCode;
    console.log(name2);
    this.auth
      .confirmation(name2, confirmationCode)
      .then((result) => {
        return console.log(result) || this.router.navigate(['/signin']);
      })
      .catch((err) => {
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
