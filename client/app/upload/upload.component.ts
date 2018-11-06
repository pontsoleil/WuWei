import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { HttpHeaders, HttpRequest, HttpClient, HttpEvent, HttpEventType } from '@angular/common/http';
import { ToastService } from '../mdb-type/pro/alerts';
import {
  CognitoUserService,
  MessageService
  // S3Service,
  // FileService,
  // WpUserService
} from '../services';
import { WuweiModel } from '../model/wuwei';
import * as moment from 'moment'; // for time handling
import { AWS_ENV } from 'assets/config/environment.aws';
import { CONF } from 'assets/config/environment.host';


function toDoubleDigits(num) {
  num += '';
  if (num.length === 1) {
    num = '0' + num;
  }
 return num;
}

// Custom startsWith function for String prototype
if (typeof String.prototype.startsWith !== 'function') {
  String.prototype.startsWith = function(str) {
    return this.indexOf(str) === 0;
  };
}

// Custom endsWith function for String prototype
if (typeof String.prototype.endsWith !== 'function') {
  String.prototype.endsWith = function(str) {
    return this.slice(-str.length) === str;
  };
}

function bytesToSize(bytes) {
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  if (bytes === 0) { return '0 B'; }
  const ii = Math.round(Math.floor(Math.log(bytes) / Math.log(1024)));
  return Math.round(bytes / Math.pow(1024, ii)) + ' ' + sizes[ii];
}

function key2Url(key) {
  // eg. key = "cognito/WuWei/ap-northeast-1:4d092035-bcb5-4a02-8cb6-1eac71bdae7c/2018/07/Scan 2.jpeg"
  // <img src="https://www.wuwei.space/ap-northeast-1%3A4d092035-bcb5-4a02-8cb6-1eac71bdae7c/2018/07/Scan_2.jpeg" width="100">
  const
    base = 'https://www.wuwei.space/',
    urlKey = key.substring(14).replace(':', '%3A'),
    url = base + urlKey;
  return url;
}

@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.scss']
})
export class UploadComponent implements OnInit, AfterViewInit {

  S3_CONFIG = {
    Region: AWS_ENV.region, // 'ap-northeast-1',
    Bucket: AWS_ENV.s3.bucketName, // 'contents.wuwei'
    Application: AWS_ENV.s3.application,
    Prefix: '',
    Delimiter: '/'
    // Marker: ''
  };

  OFFICE_MIME = [
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ];

  private currentUser;
  private uploadFile: File = null;
  private checkWindow;

  public active;

  public uploadForm: FormGroup;
  public file = new FormControl('');
  public fileName = '';
  public imgUrl = '';
  public srcUrl = '';
  public width = 100;
  public height = 100;
  public isOffice = null;
  public isFile = null;

  uploadedPrct = 0;
  uploadedPercentage = '0%';
  showMessage = false;
  uploading = false;
  message: String = '';
  featureFormat = '';
  mimeType = '';
  geometry = '';
  size = '';
  createdDate = '';

  constructor(
    private router: Router,
    private toast: ToastService,
    private auth: CognitoUserService,
    private http: HttpClient,
    private messageService: MessageService,
    private model: WuweiModel
  ) {
    this.message = '';
    this.auth
      .isAuthenticated()
      .then((res) => { // res is CognitoIdentityCredentials
        this.currentUser = this.auth.currentUser;
        if (!!this.currentUser.name) {
          this.toastMessage(
            'Authenticated. Signed in as ' + this.currentUser.name + '(' + this.currentUser.nickname + ')',
            'success'
          );
        } else {
          this.toastMessage('Please sign in.', 'info');
          console.log(res);
          this.router.navigate(['/about']);
        }
      })
      .catch((err) => {
        this.currentUser = {}; // this.auth.currentUser;
        this.toastMessage('Please sign in.', 'info');
        console.log(err);
        this.router.navigate(['/about']);
        return false;
      });
  }

  ngOnInit() { }

  ngAfterViewInit() {
    this.S3_CONFIG.Bucket = AWS_ENV.s3.bucketName;
    this.S3_CONFIG.Delimiter = AWS_ENV.s3.delimiter;
    this.S3_CONFIG.Prefix = AWS_ENV.s3.prefix;
    // delete this.S3_CONFIG.Marker;
    this.uploadedPrct = 0;
    this.uploadedPercentage = '0%';
    this.showMessage = false;
    this.uploading = false;
    this.isOffice = null;
    this.isFile = null;
  }

  onInputChange(event: any) {
    this.uploadedPrct = 0;
    this.uploadedPercentage = '0%';
    this.showMessage = false;
    this.imgUrl = '';
    this.srcUrl = '';
    this.width = 100;
    this.height = 100;
    this.isOffice = null;
    this.isFile = null;
    const
      files = event.target.files;
    this.uploadFile = <File>files[0];
    this.fileName = <string>this.uploadFile.name;
    (<HTMLFormElement>document.querySelector('input.file-path')).value = this.fileName;
  }

  onUpload() {
    this.uploadedPrct = 0;
    this.uploadedPercentage = '0%';
    this.showMessage = false;
    this.uploading = true;
    this.isOffice = null;
    this.isFile = null;

    const processProgress = (event: HttpEvent<any>) => {
      if (Math.round(this.uploadedPrct) !== Math.round(event['loaded'] / event['total'] * 100)) {
        this.uploadedPrct = event['loaded'] / event['total'] * 100;
        this.uploadedPercentage = this.uploadedPrct + '%';
      }
    };

    const processHeader = (event: HttpEvent<any>) => {
      const
        status = event['status'], // 500
        statusText = event['statusText'], // "Internal Server Error"
        url = event['url'], // "http://localhost:4200/api/upload"
        message = 'status:' + status + ' ' + statusText + ' ' + url;
      if (200 !== status) {
        this.showMessage = true;
        this.uploading = false;
        this.message = message;
      }
      console.log(event);
    };

    const processResponse = (event: HttpEvent<any>) => {
      this.showMessage = true;
      const
        event_body = event['body'];
      if (!event_body) {
        const type = event.type;
        if (HttpEventType.DownloadProgress === type) {
          console.log(event);
          return;
        }
      }
      const
        error_code = event_body.erroe_code,
        error_desc = event_body.error_desc,
        process_desc = event_body.process_desc,
        result_desc = event_body.result_desc,
        dstKey = result_desc.dstKey,
        features = result_desc.features,
        resized = result_desc.resized,
        stats = result_desc.stats;
      console.log('error_code=' + error_code, process_desc || result_desc || error_desc);
      if (process_desc) {
        this.uploading = true;
        this.message = process_desc;
        return;
      } else if (result_desc) {
        this.uploading = false;
        this.message = 'Uploaded Successfully.';
      } else {
        this.uploading = false;
        this.message = error_desc || 'Something went wrong.';
        return;
      }
      this.imgUrl = dstKey ? key2Url(dstKey) : '';
      this.srcUrl = key2Url(srcKey);
      if (resized.width) {
        this.width = resized.width;
      }
      if (resized.height) {
        this.height = resized.height;
      }
      if (features) {
        this.featureFormat = features['format'];
        this.mimeType = features['mime type'];
        this.geometry = features['geometry'];
      }
      this.createdDate = stats.birthtime;
      this.size = bytesToSize(stats.size);

      if (this.mimeType.indexOf('audio') >= 0) {
        this.isFile = 'audio';
      } else if (this.mimeType.indexOf('image') >= 0) {
        this.isFile = 'image';
      } else if (this.mimeType.indexOf('text') >= 0) {
        this.isFile = 'text';
      } else if (this.mimeType.indexOf('video') >= 0) {
        this.isFile = 'video';
      } else if ('application/msword' === this.mimeType ||
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document' === this.mimeType) {
        this.isOffice = 'Word';
      } else if ('application/vnd.ms-powerpoint' === this.mimeType ||
          'application/vnd.openxmlformats-officedocument.presentationml.presentation' === this.mimeType) {
        this.isOffice = 'Powerpoint';
      } else if ('application/vnd.ms-excel' === this.mimeType ||
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' === this.mimeType) {
        this.isOffice = 'Excel';
      } else {
        this.isFile = '';
      }

      const
        self = this,
        model = self.model,
        ICON_SIZE = 64,
        r = model.addSimpleContent(),
        node = r.node,
        resource = r.resource;
      node.visible = true;
      node.label = this.fileName;
      // resource.option = 'UPLOADED_FILE';
      resource.id = this.srcUrl;
      resource.name = this.fileName;
      resource.thumbnail = this.imgUrl;
      resource.format = this.mimeType;
      resource.value = {
        featureFormat: this.featureFormat,
        geometry: this.geometry,
        stats: stats,
        features: features
      };
      if (this.isOffice) {
        node.shape = 'THUMBNAIL';
        node.size = {
          width: ICON_SIZE,
          height: ICON_SIZE
        };
        this.imgUrl = '';
        // see https://products.office.com/en/office-online/view-office-documents-online
        this.srcUrl = 'https://view.officeapps.live.com/op/view.aspx?src=' + encodeURIComponent(this.srcUrl);
        if (this.isOffice === 'Word') {
          node.thumbnail = CONF.assetsUrl + 'office_icon/Word.png';
        } else if (this.isOffice === 'Powerpoint') {
          node.thumbnail = CONF.assetsUrl + 'office_icon/PowerPoint.png';
        } else if (this.isOffice === 'Excel') {
          node.thumbnail = CONF.assetsUrl + 'office_icon/Excel.png';
        } else {
          node.thumbnail = CONF.assetsUrl + 'office_icon/Windows.png';
        }
      } else if (this.imgUrl) {
        node.shape = 'THUMBNAIL';
        node.size = {
          width: this.width,
          height: this.height
        };
        node.thumbnail = this.imgUrl;
      } else {
        node.shape = 'THUMBNAIL';
        node.size = {
          width: ICON_SIZE,
          height: ICON_SIZE
        };
        if ('audio' === this.isFile) {
          node.thumbnail = CONF.assetsUrl + 'file_icon/file-audio-o.png';
        } else if ('image' === this.isFile) {
          node.thumbnail = CONF.assetsUrl + 'file_icon/file-image-o.png';
        } else if ('text' === this.isFile) {
          node.thumbnail = CONF.assetsUrl + 'file_icon/file-text-o.png';
        } else if ('video' === this.isFile) {
          node.thumbnail = CONF.assetsUrl + 'file_icon/file-video-o.png';
        } else if ('' === this.isFile) {
          node.thumbnail = CONF.assetsUrl + 'file_icon/file-o.png';
        }
      }
      if ('audio' === this.isFile) {
        resource.type = 'Sound';
      } else if ('image' === this.isFile) {
        resource.type = 'Image';
      } else if ('text' === this.isFile) {
        resource.type = 'Text';
      } else if ('video' === this.isFile) {
        resource.type = 'Video';
      } else if ('' === this.isFile) {
        resource.type = 'Dataset';
      }
      const
        logData = {
          'command': 'addSimpleContent',
          'param': {
            node: [node],
            resource: [resource]
          }
        },
        json = JSON.stringify(logData);
      self.messageService.notifyDrawing(json);
      // log
      model.storeLog(logData);
    };

    //
    // START HERE
    //
    console.log('fileName=' + this.fileName);
    const
      today = new Date(),
      year = '' + today.getFullYear(),
      month = toDoubleDigits(today.getMonth() + 1),
      formData = new FormData(),
      srcBucket = this.S3_CONFIG.Bucket,
      dstBucket = srcBucket + 'resized',
      Prefix = this.S3_CONFIG.Prefix + year + '/' + month,
      Delimiter = this.S3_CONFIG.Delimiter,
      _fileName = this.fileName.replace(/ /g, '_'),
      srcKey = Prefix + Delimiter + _fileName,
      dstKey = Prefix + Delimiter + 'resized_' + _fileName;

    formData.append('file', this.uploadFile, _fileName);
    const _headers = {
      uid: '' + this.currentUser._id,
      srcBucket: srcBucket,
      srcKey: encodeURIComponent(srcKey),
      dstBucket: dstBucket,
      dstKey: encodeURIComponent(dstKey)
    };
    console.log('fileName=' + this.fileName + ' headers:', _headers);
    this.http.post(`/api/upload`, formData, {
      headers: _headers,
      reportProgress: true,
      observe: 'events'
    }).subscribe( (event: HttpEvent<any>) => {
      switch (event.type) {
        // 0: "Sent"
        // 1: "UploadProgress"
        // 2: "ResponseHeader"
        // 3: "DownloadProgress"
        // 4: "Response"
        // 5: "User"
        case HttpEventType.Sent: // 0
          break;
        case HttpEventType.UploadProgress: // 1
          processProgress(event);
          break;
        case HttpEventType.ResponseHeader: // 2
          processHeader(event);
          break;
        case HttpEventType.DownloadProgress: // 3
          processResponse(event);
          break;
        case HttpEventType.Response: // 4
          processResponse(event);
          break;
      }
    },
    error => {
      console.log(error);
      this.message = error.error_desc || 'Something went wrong.';
      this.showMessage = true;
    });
  }

  resetValues() {
    this.uploadedPrct = 0;
    this.uploadedPercentage = '0%';
    this.showMessage = false;
    this.imgUrl = '';
    this.srcUrl = '';
    this.width = 100;
    this.height = 100;
    this.isOffice = null;
    this.isFile = null;
    this.fileName = '';
    (<HTMLFormElement>document.querySelector('input.file-path')).value = this.fileName;
  }

  openWindow(url) {
    this.closeWindow();
    if (!url) {
      return;
    }
    const features = 'width=500, height=500, top=30, left=30';
    this.checkWindow = window.open(url, 'upload', features);
    if (this.checkWindow) {
      this.checkWindow.focus();
    }
  }

  closeWindow() {
    if (this.checkWindow) {
      this.checkWindow.close();
    }
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
