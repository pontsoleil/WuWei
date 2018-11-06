import {
  Component,
  ViewChild,
  ElementRef,
  OnInit,
  Input,
  NgModule
} from '@angular/core';
import {
  DomSanitizer,
  SafeUrl,
  SafeResourceUrl,
  BrowserModule
} from '@angular/platform-browser';
import {
  FileUploadModule,
  FileSelectDirective,
  FileUploader
} from 'ng2-file-upload';
// import the native angular http and respone libraries
import { Http, Response } from '@angular/http';
// import the do function to be used with the http library.
import 'rxjs/add/operator/do';
// import the map function to be used with the http library
import 'rxjs/add/operator/map';

// import { ToastComponent } from '../shared/toast/toast.component';

import {
  CognitoUserService,
  FileService,
  UploadService,
  WpUserService
} from '../services';

const href = window.location.href;
const URL = 'http://localhost:3000/upload';
/* href.substr(0, href.indexOf('/', 9)) +*/
// const URL = 'http://wuwei.space/free/uploads.php';

// declare var jquery: any;
// declare var $: any;
// declare var spectrum: any; // this doesn't work

@Component({
  selector: 'app-contents',
  templateUrl: './contents.component.html',
  styleUrls: ['./contents.component.scss'],
  providers: [ FileService, UploadService ]
})
export class ContentsComponent implements OnInit {

  url          = null;
  videoUrl     = null;
  videoId      = null;
  soundUrl     = null;
  safeUrl      = null;
  iframeUrl    = null;
  iframeStyle  = null;
  safeSoundUrl = null;

  file = {
    dir: null,
    name: null,
    url: null,
    thumb: null,
    size: null,
    floc: null,
    stats : {
      atime: null,
      birthtime: null,
      blksize: null,
      blocks: null,
      ctime: null,
      dev: null,
      gid: null,
      ino: null,
      mode: null,
      mtime: null,
      nlink: null,
      rdev: null,
      size: null,
      uid: null
    }
  };
  files = [];
  features = null;
  isLoading   = true;
  // isUploading = false;
  // doingFiles  = false;

  viewWindow = null;


// declare a property called fileuploader and assign it to an instance of a new fileUploader.
// pass in the Url to be uploaded to, and pass the itemAlais, which would be the name of the
// file input when sending the post request.
// public uploader;
  public uploader: FileUploader = new FileUploader({url: URL, itemAlias: 'file'});
  public hasBaseDropZoneOver = false;
  public hasAnotherDropZoneOver = false;

  @ViewChild('player') private playerRef: ElementRef;
  @ViewChild('contentsIframe') private iframeRef: ElementRef;

// declare a constroctur, so we can pass in some properties to the class, which can be
// accessed using the this variable
  constructor(
    private http: Http,
    private el: ElementRef,
    private sanitizer: DomSanitizer,
    private auth: WpUserService,
    // public  toast: ToastComponent,
    private fileService: FileService,
    private uploadService: UploadService
  ) { }

  onChange(event) {
    console.log('onChange');
    const files = event.srcElement.files;
    console.log(files);
    this.uploadService
      .makeFileRequest(URL, [], files)
      .subscribe(() => {
        console.log('sent');
      }
    );
  }

  ngOnInit() {
    // javascript: URLs are dangerous if attacker controlled.
    // Angular sanitizes them in data binding, but you can
    // explicitly tell Angular to trust this value:
    // this.url     = 'javascript:alert("Hi there")';
    // this.safeUrl = this.sanitizer.bypassSecurityTrustUrl(this.url);
    // this.videoId = '';
    // this.updateVideoUrl();
    this.uploader.onAfterAddingFile = (file) => {
      this.getFiles();
    };
    // overide the onCompleteItem property of the uploader so we are
    // able to deal with the server response.
    this.uploader.onCompleteItem = (item: any, response: any, status: any, headers: any) => {
      console.log('Uploaded:', item.file, status, response);
        /*JSON.stringify( item.file ) +
        JSON.stringify( status ) +
        JSON.stringify( response)
      );*/
    };
    this.isLoading = false;
    this.getFiles();
  }

  getFiles() {
    this.fileService
      .getFiles()
      .subscribe(
        data  => {
          this.files = data.map((item) => {
            let size = item.stats.size;
            if (size > 100 * 1024 * 1024 * 1024) {
              size = Math.round(size / 1024 / 1024 / 1024) + 'GB';
            } else if (size > 10 * 1024 * 1024 * 1024) {
              size = Math.round(10 * size / 1024 / 1024 / 1024) / 10 + 'GB';
            } else if (size > 1024 * 1024 * 1024) {
              size = Math.round(100 * size / 1024 / 1024 / 1024) / 100 + 'GB';
            } else if (size > 100 * 1024 * 1024) {
              size = Math.round(size / 1024 / 1024) + 'MB';
            } else if (size > 10 * 1024 * 1024) {
              size = Math.round(10 * size / 1024 / 1024) / 10 + 'MB';
            } else if (size > 1024 * 1024) {
              size = Math.round(100 * size / 1024 / 1024) / 100 + 'MB';
            } else if (size > 1024) {
              size = Math.round(size / 1024) + 'KB';
            } else {
              size = size + 'B';
            }
            return {
              dir: item.dir,
              name: item.name,
              url: item.url,
              thumb: item.thumb,
              size: size,
              floc: item.floc,
              stats: {
                atime: item.stats.atime,
                birthtime: item.stats.birthtime,
                blksize: item.stats.blksize,
                blocks: item.stats.blocks,
                ctime: item.stats.ctime,
                dev: item.stats.dev,
                gid: item.stats.gid,
                ino: item.stats.ino,
                mode: item.stats.mode,
                mtime: item.stats.mtime,
                nlink: item.stats.nlink,
                rdev: item.stats.rdev,
                size: item.stats.size,
                uid: item.stats.uid
              }
            };
          });
        },
        error => console.log(error)
        ,
        () => this.isLoading = false
      );
  }

  // the function which handles the file upload without using a plugin.
  upload() {
    // locate the file element meant for the file upload.
    const inputEl: HTMLInputElement = this.el.nativeElement.querySelector('#file');
    // get the total amount of files attached to the file input.
    const fileCount: number = inputEl.files.length;
    // check if the filecount is greater than zero, to be sure a file was selected.
    if (fileCount > 0) { // a file was selected
      // create a new fromdata instance
      const formData = new FormData();
      // append the key name 'file' with the first file in the element
      const fileData = inputEl.files.item(0);
      formData.append('file', fileData);
      // call the angular http method
      // post the form data to the URL defined above and map the response. Then subscribe
      // to initiate the post. if you don't subscribe, angular wont post.
      this.http
        .post(URL, formData)
        .map((res: Response) => {
          return res.json();
        })
        .subscribe(
          // map the success function and alert the response
          (success: any) => {
            alert(JSON.stringify(success));
          },
          (error) => {
            alert(error);
          }
        );
    }
  }

  openWindow(url) {
    this.closeWindow();
    const features = 'height=400,width=400,top=80,left=80';
    this.viewWindow = window.open(url, 'wuwei', features);
  }

  closeWindow() {
    if (this.viewWindow) {
      this.viewWindow.close();
    }
  }

  // updateSoundUrl() {
    /*const audioPlayer: HTMLAudioElement = this.playerRef.nativeElement;
    this.soundUrl = 'http://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';
    this.safeSoundUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.soundUrl);
    */
  // }

  // updateVideoUrl() {
    // Appending an ID to a YouTube URL is safe.
    // Always make sure to construct SafeValue objects as
    // close as possible to the input data so
    // that it's easier to check if the value is safe.
    /*const videoPlayer: HTMLVideoElement = this.iframeRef.nativeElement;
    this.videoUrl = 'https://www.youtube.com/embed/' + this.videoId;
    this.iframeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.videoUrl);
    */
  // }

  /*doUpload() {
    this.isLoading   = false;
    this.isUploading = true;
    this.doingFiles  = false;
  }

  doFiles() {
    this.isLoading   = false;
    this.isUploading = false;
    this.doingFiles  = true;
    this.getFiles();
  }*/

  viewURL(file) {
    this.fileService.getFeatures( file.floc ).subscribe(
      features  => {
        this.iframeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(file.url);
        this.features  = features;
        const
          geometry = features.geometry,
          size   = geometry.split('+')[0].split('x'),
          featureWidth  = + size[0],
          featureHeight = + size[1],
          doc    = this.iframeRef &&
            ( this.iframeRef.nativeElement.contentDocument ||
              this.iframeRef.nativeElement.contentWindow ),
          body_  = doc.body,
          html_  = doc.documentElement,
          height = Math.max(
            body_.scrollHeight,
            body_.offsetHeight,
            html_.clientHeight,
            html_.scrollHeight,
            html_.offsetHeight ),
          width  = Math.max(
            body_.scrollWidth,
            body_.offsetWidth,
            html_.clientWidth,
            html_.scrollWidth,
            html_.offsetWidth ),
          scale  = Math.round(100 * width / featureWidth) / 100;
        this.iframeStyle = '-webkit-transform: Scale(' + scale + ') ' +
          ' -webkit-transform-origin: 0 0' +
          ' width:'  + width +
          ' height;' + (featureHeight * scale);
      },
      error => console.log(error)
    );
  }
}
