import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter
} from '@angular/core';
import {
  HttpClientModule,
  HttpClient
} from '@angular/common/http';
import {
  MessageService,
  WpUserService
} from '../services';
import { BLOG_ENV } from 'assets/config/environment.blog';

@Component({
  selector: 'app-authentication',
  templateUrl: './authentication.component.html',
  styleUrls: ['./authentication.component.scss']
})
export class AuthenticationComponent implements OnInit {
  baseUrl = BLOG_ENV.baseUrl;
  jwt_auth = BLOG_ENV.rest_api.jwt_auth;

  user = {
    login: '',
    password: ''
  };

  @Input() token;
  @Output() tokenChange = new EventEmitter<string>();

  constructor(
    private http: HttpClient
  ) { }

  ngOnInit() { }

  login() {
    this.http.post(this.baseUrl + this.jwt_auth + '/token', {
      username: this.user.login,
      password: this.user.password
    })
    .toPromise()
    .then(data => {
      if (data['token']) { // if token is returned
        this.token = data['token'];
        const json = JSON.stringify({
          token: this.token
        });
        this.tokenChange.emit(this.token);
      }
    })
    .catch(error => {
      console.error( 'Error', error.data[0] || error);
    });
  }

  logout() {
    this.token = null;
    this.user = {
      login: '',
      password: ''
    };
    const json = JSON.stringify({
      token: this.token
    });
    this.tokenChange.emit(this.token);
  }

}
