import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
// import 'rxjs/add/observable/bindNodeCallback';
import { AWS_ENV } from 'assets/config/environment.aws';
import {
  CognitoUserPool,
  CognitoUserAttribute,
  CognitoUser,
  AuthenticationDetails
} from 'amazon-cognito-identity-js';
import * as AWS from 'aws-sdk';
import { CognitoUserService } from './cognito-user.service';
// import { WpUserService } from './wp-user.service';

interface File {
  ETag: string;
  Key: string;
  Size: number;
}

@Injectable()
export class S3Service {
  private s3: AWS.S3;
  private filesListSubject;
  public filesList$: Observable<File[]>;

  constructor(
    private auth: CognitoUserService
  ) {
    this.filesListSubject = new BehaviorSubject([]);
    this.filesList$ = this.filesListSubject.asObservable();

    this.auth
      .getCredentials()
      .then((data) => {
        AWS.config.credentials = data;
        console.log(AWS.config.credentials);
      })
      .catch((err) => {
        console.log(err);
      });

    const clientParams: any = {
      region: AWS_ENV.region,
      apiVersion: '2006-03-01',
      params: { Bucket: AWS_ENV.s3.bucketName }
    };
    this.s3 = new AWS.S3(clientParams);
}

  uploadFile(file: any): Promise<any> {
    const params = {
      Bucket: AWS_ENV.s3.bucketName,
      Key: AWS_ENV.s3.prefix + file.name,
      ContentType: file.type,
      Body: file,
      StorageClass: 'STANDARD',
      ACL: 'private' };
    return this.s3.upload(params).promise();
  }

  getFileList(map): Promise<AWS.S3.ListObjectsOutput> {
    const params = {
      Bucket: AWS_ENV.s3.bucketName,
      Delimiter: '/'
    };
    if (map.Prefix) {
      params['Prefix'] = map.Prefix;
    } else {
      params['Prefix'] = AWS_ENV.s3.prefix;
    }
    if (map.MaxKeys) {
      params['MaxKeys'] = map.MaxKeys;
    }
    if (map.Marker) {
      params['Marker'] = map.Marker;
    }
    return this.s3.listObjects(params).promise();
  }

  getFileObservable(map) {
    const params = {
      Bucket: AWS_ENV.s3.bucketName,
      Delimiter: '/'
    };
    if (map.Prefix) {
      params['Prefix'] = map.Prefix;
    } else {
      params['Prefix'] = AWS_ENV.s3.prefix;
    }
    if (map.MaxKeys) {
      params['MaxKeys'] = map.MaxKeys;
    }
    if (map.Marker) {
      params['Marker'] = map.Marker;
    }
    return this.s3.listObjects(params, (err, data) => {
      if (err) {
        console.log(err);
      }
      const raw = data.Contents;
      const files: File[] = [];
      raw.forEach((item) => {
        files.push({
          ETag: item.ETag,
          Key: item.Key,
          Size: item.Size
        });
      });
      console.log(files.length, 'files listed.');
      this.filesListSubject.next(files);
    });
  }

  getFile(key: string): Promise<AWS.S3.GetObjectOutput> {
    const params = {
      Bucket: AWS_ENV.s3.bucketName,
      Key: key
    };
    return this.s3.getObject(params).promise();
  }
}
