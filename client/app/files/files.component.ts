import { Component, OnInit, AfterViewInit, Inject } from '@angular/core';
import { Observable } from 'rxjs/Observable';
// import { BehaviorSubject } from 'rxjs/BehaviorSubject';
// import 'rxjs/add/observable/of';
// import 'rxjs/add/observable/fromPromise';
import { Router } from '@angular/router';
import {
  CognitoUserService,
  S3Service,
  WpUserService
} from '../services';
import { AWS_ENV } from 'assets/config/environment.aws';
// import { NgbModule, NgbModal } from '@ng-bootstrap/ng-bootstrap';
// import { Subject } from 'rxjs/Subject';
import * as AWS from 'aws-sdk';
import {
  MatTableModule,
  MatTableDataSource
} from '@angular/material/table';
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA
} from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
// import { ModalComponent } from '../shared/modal/modal.component';
// import * as $ from 'jquery';
declare var $: any;
import * as moment from 'moment'; // for time handling
import { stringType } from 'aws-sdk/clients/iam';
import * as globals from '../model/wuwei-globals';

declare function escape(s: string): string;
declare function unescape(s: string): string;

function bytesToSize(bytes) {
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  if (bytes === 0) { return '0 Bytes'; }
  const ii = Math.round(Math.floor(Math.log(bytes) / Math.log(1024)));
  return Math.round(bytes / Math.pow(1024, ii)) + ' ' + sizes[ii];
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

function object2hrefvirt(bucket, object) {
  if (AWS.config.region === 'us-east-1') {
    return document.location.protocol + '//' + bucket + '.s3.amazonaws.com/' + escape(object);
  } else {
    return document.location.protocol + '//' + bucket + '.s3-' + AWS.config.region + '.amazonaws.com/' + escape(object);
  }
}

function object2hrefpath(bucket, object) {
  if (AWS.config.region === 'us-east-1') {
    return document.location.protocol + '//s3.amazonaws.com/' + bucket + '/' + escape(object);
  } else {
    return document.location.protocol + '//s3-' + AWS.config.region + '.amazonaws.com/' + bucket + '/' + escape(object);
  }
}

/*function isthisdocument(bucket, object) {
  return object === 'index.html';
}*/

function isfolder(path) {
  return path.endsWith('/');
}

// Convert cars/vw/golf.png to golf.png
function fullpath2filename(path) {
  return path.replace(/^.*[\\\/]/, '');
}

// Convert cars/vw/golf.png to cars/vw
function fullpath2pathname(path) {
  return path.substring(0, path.lastIndexOf('/') + 1);
}

// Convert cars/vw/ to vw/
function prefix2folder(prefix) {
  const parts = prefix.split('/');
  return parts[parts.length - 2] + '/';
}

// Remove Prefix from key
function removePrefix(Prefix, Key) {
  return Key.replace(Prefix, '');
}

// Remove hash from document URL
function removeHash() {
  history.pushState('', document.title, window.location.pathname + window.location.search);
}

function renderThumbnail(data) {
  const self = this;
  return 'https://s3-ap-northeast-1.amazonaws.com/contents.wuwei/' + data;
}

function renderObject(data) {
  const self = this;
  /*if (isthisdocument(self.s3_config.Bucket, data)) {
    console.log('is this document: ' + data);
    return fullpath2filename(data);
  } else*/
  if (isfolder(data)) {
    console.log('is folder: ' + data);
    // return '<a data-s3="folder" data-prefix="' + data + '" href="' + object2hrefvirt(self.s3_config.Bucket, data) + '">' +
    return  prefix2folder(data);
    // + '</a>';
  } else {
    console.log('not folder / this document: ' + data);
    // return '<a data-s3="object" href="' + object2hrefvirt(self.s3_config.Bucket, data) + '">' +
    return fullpath2filename(data);
    // + '</a>';
  }
}

function renderFolder(data) {
  return isfolder(data) ? '' : removePrefix(AWS_ENV.s3.prefix, fullpath2pathname(data));
}

interface File {
  name: string;
  folder: string;
  modified: string;
  size: string;
}

@Component({
  selector: 'app-files',
  templateUrl: './files.component.html',
  styleUrls: ['./files.component.scss']
})
export class FilesComponent implements OnInit, AfterViewInit {

  s3_config = {
    Region: 'ap-northeast-1',
    Bucket: AWS_ENV.s3.bucketName, // 'contents.wuwei'
    Prefix: '',
    Delimiter: '/',
    Marker: ''
  };
  s3_lister = null;

  displayedColumns = ['thumbnail', 'name', 'folder', 'modified', 'size'];

  private remoteFiles;
  dataSource;

  // loggedIn = false;

  constructor(
    private router: Router,
    public dialog: MatDialog,
    public snackBar: MatSnackBar,
    private auth: WpUserService,
    private s3Service: S3Service
  ) {
    const self = this;
    AWS.config.region = AWS_ENV.region;
    this.auth
      .isAuthenticated()
      .toPromise()
      .then(res => {
        // this.loggedIn = true;
        console.log(res);
      })
      .catch((err) => {
        console.log(err);
        return  this.router.navigate(['/signin']);
      });

    const ELEMENT_DATA: File[] = [
      // {name: 'Hydrogen', folder: '2018/03', modified: moment('2018-03-28').fromNow(), size: bytesToSize(10079)},
      // {name: 'Helium', folder: '2018/03', modified: moment('2018-03-28').fromNow(), size: bytesToSize(40026)},
      // {name: 'Lithium', folder: '2018/03', modified: moment('2018-03-28').fromNow(), size: bytesToSize(6941)}
    ];
    this.dataSource = new MatTableDataSource(ELEMENT_DATA);

    // Initialize the moment library (for time formatting utilities)
    moment().format();

    // Folder/Bucket radio button handler
    /*$("input:radio[name='optionsdepth']").change(function() {
      console.log('Folder/Bucket option change to ' + $(this).val());
      console.log('Change options: ' + $("input[name='optionsdepth']:checked").val());
    });*/

    AWS.config.region = AWS_ENV.region;
    console.log('AWS region=' + AWS.config.region);
    console.log('S3 bucket=' + AWS_ENV.s3.bucketName);
  }

  ngOnInit() {}

  ngAfterViewInit() {
    this.s3_config.Bucket = AWS_ENV.s3.bucketName;
    this.s3_config.Delimiter = '/';
    this.s3_config.Prefix = AWS_ENV.s3.prefix;
    if ('' === AWS_ENV.s3.prefix) { return; }
    delete this.s3_config.Marker;
    this.s3_lister = this.s3list(this.s3_config, this.s3draw);
    if (this.s3_lister) {
      this.s3_lister.go();
    }
  }

  reloadS3() {
    if (document.querySelector('#bucket-loader').classList.contains('fa-spin')) {
      // To do: We need to stop the S3 list that's going on
      this.openSnackBar('Stop is not yet supported.', 'info');
      this.s3_lister.stop();
    } else {
      delete this.s3_config.Marker;
      this.s3_lister = this.s3list(this.s3_config, this.s3draw);
      if (this.s3_lister) {
        this.s3_lister.go();
      }
    }
  }

  applyFilter(filterValue: string) {
    filterValue = filterValue.trim(); // Remove whitespace
    filterValue = filterValue.toLowerCase(); // MatTableDataSource defaults to lowercase matches
    this.dataSource.filter = filterValue;
  }

  onClickFile(item: any) {
    this.s3Service
      .getFile(item.Key)
      .then((data) => {
        const blob = new Blob([data.Body], { type: data.ContentType });
        const url = window.URL.createObjectURL(blob);
        const linkElement = document.createElement('a');
        linkElement.download = item.Key;
        linkElement.href = url;
        linkElement.click();
      })
      .catch((err) => {
        console.log(err);
      });
  }

  // We are going to generate bucket/folder breadcrumbs. The resulting HTML will
  // look something like this:
  //
  // <li>Home</li>
  // <li>Library</li>
  // <li class="active">Samples</li>
  //
  // Note: this code is a little complex right now so it would be good to find
  // a simpler way to create the breadcrumbs.
  folder2breadcrumbs = function(data) {
    const self = this;
    console.log('Bucket: ' + data.params.Bucket);
    console.log('Prefix: ' + data.params.Prefix);

    if (data.params.Prefix && data.params.Prefix.length > 0) {
      console.log('Set hash: ' + data.params.Prefix);
      window.location.hash = data.params.Prefix;
    } else {
      console.log('Remove hash');
      removeHash();
    }

    // The parts array will contain the bucket name followed by all the
    // segments of the prefix, exploded out as separate strings.
    const parts = [data.params.Bucket];

    if (data.params.Prefix) {
        parts.push.apply(parts,
            data.params.Prefix.endsWith('/') ?
            data.params.Prefix.slice(0, -1).split('/') :
            data.params.Prefix.split('/'));
    }
    console.log('Parts: ' + parts + ' (length=' + parts.length + ')');

    // Empty the current breadcrumb list
    $('#breadcrumb li').remove();

    // Now build the new breadcrumb list
    let buildprefix = '';
    $.each(parts, function(ii, part) {
      let ipart;
      // Add the bucket (the bucket is always first)
      if (ii === 0) {
        const a1 = $('<a>').attr('href', '#').text(part);
        ipart = $('<li>').append(a1);
        a1.click(function(e) {
          e.preventDefault();
          console.log('Breadcrumb click bucket: ' + data.params.Bucket);
          self.s3_config.Prefix = AWS_ENV.s3.prefix;
          this.s3_lister = this.s3list(this.s3_config, this.s3draw);
          if (this.s3_lister) {
            this.s3_lister.go();
          }
        });
        // Else add the folders within the bucket
      } else {
        buildprefix += part + '/';
        if (ii === parts.length - 1) {
          ipart = $('<li>').addClass('active').text(part);
        } else {
          const a2 = $('<a>').attr('href', '#').append(part);
          ipart = $('<li>').append(a2);
          // Closure needed to enclose the saved S3 prefix
          (function() {
            const saveprefix = buildprefix;
            // console.log('Part: ' + part + ' has buildprefix: ' + saveprefix);
            a2.click(function(e) {
              e.preventDefault();
              console.log('Breadcrumb click object prefix: ' + saveprefix);
              self.s3_config.Prefix = saveprefix;
              this.s3_lister = this.s3list(this.s3_config, this.s3draw);
              if (this.s3_lister) {
                this.s3_lister.go();
              }
            });
          })();
        }
      }
      $('#breadcrumb').append(ipart);
    });
  };

  s3draw = function(data, complete) {
    $('li.li-bucket').remove();
    this.folder2breadcrumbs(data);

    // Add each part of current path (S3 bucket plus folder hierarchy) into the breadcrumbs
    // Add S3 objects to DataTable
  };

  s3list = function(config, completecb) {
    console.log('s3list config: ' + JSON.stringify(config));
    // if (!this.loggedIn) { return null; }
    const
      self = this,
      s3Service = this.s3Service;
    const params = {
      Marker: config.Marker,
      Bucket: config.Bucket,
      Prefix: config.Prefix,
      Delimiter: config.Delimiter
    };
    const scope = {
      Contents: [],
      CommonPrefixes: [],
      params: params,
      stop: false,
      cb: null,
      completecb: completecb,
      er: null
    };

    return {
      // This is the callback that the S3 API makes when an S3 listObjects
      // request completes (successfully or in error). Note that a single call
      // to listObjects may not be enough to get all objects so we need to
      // check if the returned data is truncated and, if so, make additional
      // requests with a 'next marker' until we have all the objects.
      er: function(err) {
        console.log('Error: ' + JSON.stringify(err));
        console.log('Error: ' + err.stack);
        scope.stop = true;
        document.querySelector('#bucket-loader').classList.remove('fa-spin');
        self.openSnackBar('Error accessing S3 bucket ' + scope.params.Bucket + '. Error: ' + err, 'error');
      },

      cb: function(data) {
        console.log('Data: ' + JSON.stringify(data));
        console.log('Options: ' + $("input[name='optionsdepth']:checked").val());
        // Store marker before filtering data
        if (data.IsTruncated) {
          if (data.NextMarker) {
            scope.params.Marker = data.NextMarker;
          } else if (data.Contents.length > 0) {
            scope.params.Marker = data.Contents[data.Contents.length - 1].Key;
          }
          // Filter the folders out of the listed S3 objects
          // (could probably be done more efficiently)
          console.log('Filter: remove folders');
          data.Contents = data.Contents.filter(function(el) {
            return el.Key !== scope.params.Prefix;
          });
          // Accumulate the S3 objects and common prefixes
          scope.Contents.push.apply(scope.Contents, data.Contents);
          scope.CommonPrefixes.push.apply(scope.CommonPrefixes, data.CommonPrefixes);
          // Update badge count to show number of objects read
          $('#badgecount').text(scope.Contents.length + scope.CommonPrefixes.length);

          if (scope.stop) {
            console.log('Bucket ' + scope.params.Bucket + ' stopped');
          } else if (data.IsTruncated) {
            console.log('Bucket ' + scope.params.Bucket + ' truncated');

            s3Service
              .getFileList(scope.params)
              .then(scope.cb)
              .catch(scope.er);
          } else {
            console.log('Bucket ' + scope.params.Bucket + ' has ' + scope.Contents.length + ' objects, including ' + scope.CommonPrefixes.length + ' prefixes');
            delete scope.params.Marker;
            if (scope.completecb) {
              scope.completecb(scope, true);
            }
            document.querySelector('#bucket-loader').classList.remove('fa-spin');
          }
        } else {
          s3Service
            .getFileList(self.s3_config)
            .then((data) => {
              if (data) {
                console.log(data);
                const
                  MaxKeys = data.MaxKeys,
                  IsTruncated = data.IsTruncated,
                  NextMarker = data.NextMarker,
                  Name = data.Name,
                  Prefix = data.Prefix,
                  CommonPrefixes = data.CommonPrefixes, // Array of Prefix
                  EncodingType = data.EncodingType;
                self.remoteFiles = data.Contents.map(item => {
                  const content = {
                    Key: item['Key'],
                    LastModified: item['LastModified'],
                    ETag: item['ETag'],
                    Size: item['Size'],
                    Owner: item['Owner'] // {DisplayName. ID}
                  };
                  const
                    thumbnail = renderThumbnail(content.Key),
                    name = renderObject(content.Key),
                    folder = renderFolder(content.Key),
                    modified = moment(content.LastModified).fromNow(),
                    size = bytesToSize(content.Size);
                  return {
                    thumbnail: thumbnail,
                    name: name,
                    folder: folder,
                    modified: modified,
                    size: size
                  };
                });
                self.dataSource.data = self.remoteFiles;
                document.querySelector('#bucket-loader').classList.remove('fa-spin');
              }
            })
            .catch((err) => {
              self.er(err);
            });
        }
      },

      // Start the spinner, clear the table, make an S3 listObjects request
      go: function() {
        scope.cb = this.cb;
        scope.er = this.er;
        document.querySelector('#bucket-loader').classList.add('fa-spin');
        // DataTables.clear();
        s3Service.getFileList(scope.params)
          .then(scope.cb)
          .catch(scope.er);
        // this.s3.makeUnauthenticatedRequest('listObjects', scope.params, this.cb);
      },

      stop: function() {
        scope.stop = true;
        delete scope.params.Marker;
        if (scope.completecb) {
          scope.completecb(scope, false);
        }
        document.querySelector('#bucket-loader').classList.remove('fa-spin');
      }
    };
  };

  promptForInput(title, prompt, callback) {
    const self = this;
  /*  const dialogRef = this.dialog.open(ModalComponent, {
      width: '250px',
      data: {
        title: title,
        prompt: prompt,
        value: ''
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
      const value = result;
      return callback(value);
    });
  */
  }

  resetDepth() {
    // DataTables.column(1).visible(false);
    $('input[name="optionsdepth"]').val(['folder']);
    $('input[name="optionsdepth"][value="bucket"]').parent().removeClass('active');
    $('input[name="optionsdepth"][value="folder"]').parent().addClass('active');
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

  onClickSignout() {
    this.auth.signout();
    this.router.navigate(['/signin']);
  }

}
