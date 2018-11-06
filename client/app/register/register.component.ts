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
import { UserService } from '../services';
import { ToastService } from '../mdb-type/pro/alerts';
import * as uuid from 'uuid';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {

  formValue = null;

  registerForm: FormGroup;
  username = new FormControl('', [Validators.required,
                                  Validators.minLength(2),
                                  Validators.maxLength(30),
                                  Validators.pattern('[a-zA-Z0-9_-\\s]*')]);
  email    = new FormControl('', [Validators.required,
                                  Validators.minLength(3),
                                  Validators.maxLength(100)]);
  password = new FormControl('', [Validators.required,
                                  Validators.minLength(6)]);
  role     = new FormControl('', [Validators.required]);

  constructor(
    public  toast:       ToastService,
    private fb: FormBuilder,
    private router:      Router,
    private userService: UserService
  ) { }

  ngOnInit() {
    this.registerForm = this.fb.group({
      username: this.username,
      email:    this.email,
      password: this.password,
      role:     this.role || 'user'
    });
  }

  setClassUsername() {
    return { 'has-danger': !this.username.pristine && !this.username.valid };
  }
  setClassEmail() {
    return { 'has-danger': !this.email.pristine && !this.email.valid };
  }
  setClassPassword() {
    return { 'has-danger': !this.password.pristine && !this.password.valid };
  }

  register() {
    this.formValue     = this.registerForm.value;
    this.formValue._id = uuid.v4();
    alert('register(): ' + JSON.stringify(this.formValue));
    // this.registerForm.value._id = uuid.v4();
    this.userService.register(this.formValue).subscribe(
      res => {
        this.toastMessage('you successfully registered!', 'success');
        this.router.navigate(['/login']);
      },
      error => this.toastMessage('email already exists', 'danger')
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
