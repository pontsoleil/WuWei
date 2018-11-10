import { Injectable, Output, EventEmitter } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import * as uuid from 'uuid';
import { BLOG_ENV } from 'assets/config/environment.blog';
// import * as globals from '../model/wuwei-globals';

@Injectable()
export class WpUserService {
  private baseUrl = BLOG_ENV.baseUrl; // 'https://www.wuwei.cloud/blog/wp-json/wuwei/v1';
  private jwt_auth = BLOG_ENV.rest_api.jwt_auth;

  public currentUser;
  public loggedIn = false;
  private token;

  constructor(
    private http: HttpClient
  ) {
    // set token if saved in local storage
    let currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
      currentUser = JSON.parse(currentUser);
      if (currentUser) {
        this.currentUser = currentUser;
      } else {
        this.currentUser = {};
      }
    } else {
      this.currentUser = {};
    }
    this.token = this.currentUser && this.currentUser.token;
  }

  login(login: string, password: string) {
    return this.http
      .post(this.baseUrl + this.jwt_auth + '/token', {
        username: login,
        password: password
      })
      .map((response: Response) => { // login successful if there's a jwt token in the response
        /* {
          "token":"eyJ0eXAiOiJK5zOjAh8w1a9zyFLGkn3PAj55dEsw",
          "user_email":"test@email.com",
          "user_nicename":"test",
          "user_display_name":"test"}
        */
        if (response['token']) { // if token is returned
          this.currentUser = {
            username: login,
            email: response['user_email'],
            nice_name: response['user_nicename'],
            display_name: response['user_display_name'],
            token: response['token']
          };
          localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
          return true;
        } else {
          return false;
        }
      });
  }

  logout() {
    this.token = null;
    const json = JSON.stringify({
      token: this.token
    });
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    return Observable.of(null);
  }

  /*signUp(name: string, nickname: string, email: string, password: string): Observable<any> {
    const params = JSON.stringify({
      username: name,
      password: password,
      email: email
    });
    return this.http
      .post(this.baseUrl + '/create_user', params, this.options)
      .map(
        res => { return res; }
      );
  }*/

  signin(username: string, password: string): Observable<boolean> {
    const params = new HttpParams()
      .append('username', username)
      .append('password', password);
    const headers = new HttpHeaders()
      .append('Content-Type', 'application/x-www-form-urlencoded');
    const options = {
      headers: headers
    };
    return this.http
      .post(this.baseUrl + '/login', params, options)
      .map((response: Response) => { // login successful if there's a jwt token in the response
        const token = response && response['authenticated'];
        const user = response && response['user'];
        if (token) { // set token property
          this.token = token;
          const user_data = user['data'];
          const display_name = user_data['display_name'];
          this.currentUser = {
            username: username,
            display_name: display_name,
            token: token
          };
          // store username and jwt token in local storage to keep user logged in between page refreshes
          localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
          // return true to indicate successful login
          return true;
        } else {
          // return false to indicate failed login
          return false;
        }
      }
    );
  }

  signout(): void {
    // clear token remove user from local storage to sign user out
    this.token = null;
    localStorage.removeItem('currentUser');
  }

  changePassword(username: string, currentPassword: string, newPassword: string): Observable<any> {
    const headers = new HttpHeaders()
      // .append('Access-Control-Allow-Origin', '*')
      .append('Content-Type', 'application/x-www-form-urlencoded');
    const params = new HttpParams()
      .append('username', username)
      .append('current', currentPassword)
      .append('password', newPassword);
    const options = {
      headers: headers
    };
    return this.http
      .post(this.baseUrl + '/change_password', params, options)
      .map((response: Response) => {
        // change password successful if there's a jwt token in the response
        const token = response && response['authenticated'];
        if (token) {
          // set token property
          this.token = token;
          this.currentUser.token = token;
          // store user name and jwt token in local storage to keep user logged in between page refreshes
          localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
          // return true to indicate successful login
          return true;
        } else {
          // return false to indicate failed login
          return false;
        }
      });
  }

  isAuthenticated(): Observable<boolean> {
    let result;
    this.currentUser = localStorage.getItem('localStorage');
    this.token = this.currentUser && this.currentUser.token;
    if (this.token) {
      result = true;
    } else {
      result = false;
    }
    return Observable.of(result);
  }

  accountSetting(name: string, _attributeList: any[]): Observable<any> {
    const attributeList = [];
    const userData = {
      Username: name,
    };
    return Observable.of(true);
  }

}
