
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material';
import {
  CognitoUserService,
  S3Service,
  WpUserService
} from '../services';
import { AWS_ENV } from 'assets/config/environment.aws';
import * as globals from '../model/wuwei-globals';

@Component({
  selector: 'app-upload-s3',
  templateUrl: './upload-s3.component.html',
  styleUrls: ['./upload-s3.component.scss']
})
export class UploadS3Component implements OnInit {
  private prefix: string;
  private uploadFile: any;
  public uploadResult: string;

  constructor(
    private router: Router,
    private snackBar: MatSnackBar,
    private auth: WpUserService,
    private s3: S3Service
  ) {
    this.uploadResult = '';
    this.auth
      .isAuthenticated()
      .toPromise()
      .then(res => console.log(res))
      .catch((err) => {
        return console.log(err) || this.router.navigate(['/signin']);
      });
  }

  ngOnInit() {
  }

  onInputChange(event: any) {
    const files = event.target.files;
    this.uploadFile = files[0];
  }

  onClickUpload() {
    if (this.uploadFile) {
      this.s3
        .uploadFile(this.uploadFile)
        .then((data) => {
          if (data) {
            this.uploadResult = 'Upload completed.';
          }
        })
        .catch((err) => {
          console.log(err);
        });
    } else {
      this.uploadResult = 'File is not selected.';
    }
  }

  onClickSignout() {
    this.auth.signout();
    this.router.navigate(['/signin']);
  }

  openSnackBar(message: string, action: string) {
    const actionColor = globals.actionColor;
    const
      background = actionColor[action].background,
      color = actionColor[action].color;
    this.snackBar.open(message, action, {
      duration: 5000,
      extraClasses: ['snack-bar-container-background-' + action]
    });
    // see https://github.com/Microsoft/TypeScript/issues/16920
    // Property 'style' does not exist on type 'Element' #16920
    // const snackBarContainer = document.querySelector('snack-bar-container');
    const bars = document.getElementsByClassName('snack-bar-container-background-' + action) as HTMLCollectionOf<HTMLElement>;
    bars[0].style.background = background;
    const actions = bars[0].getElementsByClassName('mat-simple-snackbar-action') as HTMLCollectionOf<HTMLElement>;
    actions[0].style.background = color;
    actions[0].style.color = '#fff';
  }

}
