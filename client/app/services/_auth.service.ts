import { Injectable } from '@angular/core';
import { AWS_ENV } from 'assets/config/environment.aws';
import {
  CognitoUserPool,
  CognitoUserAttribute,
  CognitoUser,
  AuthenticationDetails
} from 'amazon-cognito-identity-js';
import * as AWS from 'aws-sdk';
import * as uuid from 'uuid';
import * as globals from '../model/wuwei-globals';

@Injectable()
export class AuthService {
  private userPool: CognitoUserPool;
  private poolData: any;
  public currentUser;
  public loggedIn = false;

  constructor() {
    AWS.config.region = AWS_ENV.region;
    AWS.config.credentials = new AWS.CognitoIdentityCredentials({
      IdentityPoolId: AWS_ENV.identityPoolId
    });
    this.poolData = {
      UserPoolId: AWS_ENV.userPoolId,
      ClientId: AWS_ENV.clientId
    };
    this.userPool = new CognitoUserPool(this.poolData);
    this.currentUser = { _id: '', name: '', nickname: '', email: '' };
  }

  signUp(name: string, nickname: string, email: string, password: string): Promise<any> {
    const attributeList = [];
    const attributeName = new CognitoUserAttribute({
      Name: 'name',
      Value: name
    });
    attributeList.push(attributeName);
    const attributeNickname = new CognitoUserAttribute({
      Name: 'nickname',
      Value: nickname
    });
    attributeList.push(attributeNickname);
    const attributeEmail = new CognitoUserAttribute({
      Name: 'email',
      Value: email
    });
    attributeList.push(attributeEmail);
    const attributeUUID = new CognitoUserAttribute({
      Name: 'custom:uuid',
      Value: uuid.v4()
    });
    attributeList.push(attributeUUID);
    return new Promise((resolve, reject) => {
      this.userPool.signUp(name, password, attributeList, null, (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  }

  confirmation(name: string, confirmation_code: string): Promise<any> {
    const userData = {
      Username: name,
      Pool: this.userPool
    };
    const cognitoUser = new CognitoUser(userData);
    return  new Promise((resolve, reject) => {
      cognitoUser.confirmRegistration(confirmation_code, true, (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  }

  signin(name: string, password: string): Promise<any> {
    // see https://docs.aws.amazon.com/cognito/latest/developerguide/using-amazon-cognito-user-identity-pools-javascript-examples.html
    const userData = {
      Username: name,
      Pool: this.userPool
    };
    const cognitoUser = new CognitoUser(userData);
    const authenticationData = {
      Username : name,
      Password : password
    };
    const authenticationDetails = new AuthenticationDetails(authenticationData);
    return new Promise((resolve, reject) => {
      cognitoUser.authenticateUser(authenticationDetails, {
        onSuccess: (result) => {
          const creds = this.buildCognitoCreds(result);
          // without refresh credentials returns an error.
          // 'Token is not from a supported provider of this identity pool'
          (<AWS.CognitoIdentityCredentials>creds).refresh((err) => {
            if (err) {
              reject(err);
            } else {
              console.log('-- signin & Refresh success', creds);
              this.loggedIn = true;
              globals.status.loggedIn = true;
              this.setUserAttributes(cognitoUser);
              AWS.config.credentials = creds;
              resolve(creds);
            }
          });
        },
        onFailure: (err) => {
          reject(err);
        }
      });
    });
  }

  changePassword(name: string, currentPassword: string, newPassword: string): Promise<any> {
    // see https://docs.aws.amazon.com/cognito/latest/developerguide/using-amazon-cognito-user-identity-pools-javascript-examples.html
    const userData = {
      Username: name,
      Pool: this.userPool
    };
    const cognitoUser = new CognitoUser(userData);
    // const authenticationData = {
    //   Username : name,
    //   Password : currentPassword
    // };
    // const authenticationDetails = new AuthenticationDetails(authenticationData);
    return new Promise((resolve, reject) => {
      cognitoUser.getSession((err, session) => {
        if (err) {
          reject(err);
        } else {
          const creds = this.buildCognitoCreds(session);
          cognitoUser.changePassword(currentPassword, newPassword, function(err, result) {
            if (err) {
                reject(err);
                return;
            }
            AWS.config.credentials = creds;
            resolve(cognitoUser);
          });
        }
      });
    });
  }

  accountSetting(name: string, _attributeList: any[]): Promise<any> {
    const attributeList = [];
    for (const _attribute of _attributeList) {
      // _attribute = { Name : 'nickname', Value : 'joe' };
      const attribute = new CognitoUserAttribute(_attribute);
      attributeList.push(attribute);
    }
    // see https://docs.aws.amazon.com/cognito/latest/developerguide/using-amazon-cognito-user-identity-pools-javascript-examples.html
    const userData = {
      Username: name,
      Pool: this.userPool
    };
    const cognitoUser = new CognitoUser(userData);
    return new Promise((resolve, reject) => {
      cognitoUser.getSession((err, session) => {
        if (err) {
          reject(err);
        } else {
          const creds = this.buildCognitoCreds(session);
          cognitoUser.updateAttributes(attributeList, function(err, result) {
            if (err) {
              reject(err);
              return;
            }
            AWS.config.credentials = creds;
            resolve(cognitoUser);
          });
        }
      });
    });
  }

  buildCognitoCreds(session: any): AWS.CognitoIdentityCredentials {
    const logins: AWS.CognitoIdentity.LoginsMap = {};
    const url = `cognito-idp.${AWS_ENV.region}.amazonaws.com/${AWS_ENV.userPoolId}`;
    logins[url] = session.getIdToken().getJwtToken();
    return new AWS.CognitoIdentityCredentials({
      IdentityPoolId: AWS_ENV.identityPoolId,
      Logins: logins
    });
  }

  signout() {
    this.loggedIn = false;
    globals.status.loggedIn = false;
    this.currentUser = { _id: '', name: '', nickname: '', email: '' };
    const cognitoUser = this.userPool.getCurrentUser();
    if (cognitoUser) {
      cognitoUser.signOut();
    }
  }

  getCredentials(): Promise<AWS.CognitoIdentityCredentials> {
    const cognitoUser = this.userPool.getCurrentUser();
    return new Promise((resolve, reject) => {
      if (cognitoUser === null) { reject(cognitoUser); }
      cognitoUser.getSession((err, session) => {
        if (err) {
          reject(err);
        } else {
          this.loggedIn = true;
          globals.status.loggedIn = true;
          const creds = this.buildCognitoCreds(session);
          // without refresh credentials returns an error.
          // 'Token is not from a supported provider of this identity pool'
          (<AWS.CognitoIdentityCredentials>creds).refresh((err) => {
            if (err) {
              reject(err);
            } else {
              console.log('-- getCredentials & Refresh success', creds);
              this.setUserAttributes(cognitoUser);
              AWS.config.credentials = creds;
              resolve(creds);
            }
          });
        }
      });
    });
  }

  setUserAttributes(cognitoUser) {
    const self = this;
    cognitoUser.getUserAttributes(function(err, result) {
      if (err && 200 !== err.statusCode) {
        alert('AuthService' + JSON.stringify(err));
        return;
      }
      if (err && 200 === err.statusCode && !result) {
        // This is the second loop and just ignore this.
        return;
      }
      AWS_ENV.s3.identityId = (<AWS.CognitoIdentityCredentials>AWS.config.credentials).identityId;
      AWS_ENV.s3.username = cognitoUser.getUsername();
      AWS_ENV.s3.prefix = 'cognito/' + AWS_ENV.s3.application + '/' + AWS_ENV.s3.identityId + '/';
      for (let i = 0; i < result.length; i++) {
        const
          name = result[i].getName(),
          value = result[i].getValue();
        // console.log('attribute ' + name + ' has value ' + value);
        if ('custom:uuid' === name) {
          self.currentUser._id = value;
        } else if ('name' === name) {
          self.currentUser.name = value;
        } else if ('nickname' === name) {
          self.currentUser.nickname = value;
        } else if ('email' === name) {
          self.currentUser.email = value;
        }
      }
    });
  }

  isAuthenticated(): Promise<any> {
    const cognitoUser = this.userPool.getCurrentUser();
    return new Promise((resolve, reject) => {
      if (cognitoUser === null) {
        resolve({});
      }
      cognitoUser.getSession((err, session) => {
        if (err) {
          reject(err);
        } else {
          if (!session.isValid()) {
            reject(session);
          } else {
            this.loggedIn = true;
            globals.status.loggedIn = true;
            const creds = this.buildCognitoCreds(session);
            if (globals.status.isOnline) {
              // without refresh credentials returns an error.
              // 'Token is not from a supported provider of this identity pool'
              (<AWS.CognitoIdentityCredentials>creds).refresh((err) => {
                if (err) {
                  reject(err);
                } else {
                  console.log('-- isAuthenticated & Refresh success', creds);
                  this.setUserAttributes(cognitoUser);
                  AWS.config.credentials = creds;
                  resolve(creds);
                }
              });
            } else {
              console.log('-- isAuthenticated OFFLINE', creds);
              if (creds.expired) {
                reject(creds);
              } else {
                resolve(creds);
              }
            }
          }
        }
      });
    });
  }
}
