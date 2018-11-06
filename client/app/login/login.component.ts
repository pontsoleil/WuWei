import {
  Component,
  OnInit
} from '@angular/core';
import { Router } from '@angular/router';
import {
  FormGroup,
  FormControl,
  Validators,
  FormBuilder
} from '@angular/forms';
import { WpUserService } from '../services';
import { ToastService } from '../mdb-type/pro/alerts';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  loginForm: FormGroup;
  email = new FormControl('', [
    Validators.required,
    Validators.minLength(3),
    Validators.maxLength(100)
  ]);
  password = new FormControl('', [
    Validators.required,
    Validators.minLength(6)
  ]);

  constructor(
    private auth: WpUserService,
    private fb: FormBuilder,
    private router: Router,
    public  toast: ToastService
  ) {}

  ngOnInit() {
    if (this.auth.loggedIn) {
      this.router.navigate(['/']);
    }
    this.loginForm = this.fb.group({
      email: this.email,
      password: this.password
    });
  }

  setClassEmail() {
    return { 'has-danger': !this.email.pristine && !this.email.valid };
  }

  setClassPassword() {
    return { 'has-danger': !this.password.pristine && !this.password.valid };
  }

  login() {
    this.auth
      .login(this.email.value, this.password.value)
      .subscribe(
        res => this.router.navigate(['/']),
        error => this.toastMessage('invalid email or password!', 'danger')
      );
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
