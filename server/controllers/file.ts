// import * as fs from 'fs';
import * as path from 'path';
import * as multer from 'multer';
import * as AWS from 'aws-sdk';
import { ContentType } from './ContentType';
import { resolve } from 'url';
import { promise } from '../../node_modules/@types/selenium-webdriver';

const fs = require('fs');
const async = require('async');
const PDFImage = require('pdf-image').PDFImage;
const im = require('imagemagick');
const gm = require('gm').subClass({ imageMagick: true }); // Enable ImageMagick integration.
const util = require('util');

const MAX_RESIZED = 128;

let
  srcBucket, srcKey, dstBucket, dstKey,
  directory, fileName, fileType, contentType,
  features,
  width = MAX_RESIZED, height = MAX_RESIZED,
  floc, outloc,
  stats;

function nameEndwith(name, str) {
  if (!name) {
    return null;
  }
  return name.slice(-str.length) === str;
}

function suffixReplace(name, suffix, str) {
  if (!name) {
    return null;
  }
  if (nameEndwith(name, suffix)) {
    return name.substring(0, name.length - suffix.length) + str;
  }
  return name;
}

// Convert cars/vw/golf.png to golf.png
function fullpath2filename(path) {
  if (!path) {
    return null;
  }
  return path.replace(/^.*[\\\/]/, '');
}

export default class FileCtrl {

  uploadFile = (req, res, next) => {
    const
      headers = req.headers,
      // uid = headers.uid,
      s3 = new AWS.S3({ apiVersion: '2006-03-01' }),
      start =  Date.now();

    srcBucket = headers.srcbucket,
    srcKey = decodeURIComponent(headers.srckey),
    dstBucket = headers.dstbucket,
    dstKey = decodeURIComponent(headers.dstkey);

    console.log('uploadFile(req, res, next) in files.ts called by app.route(\'/upload\').post()'); // req.headers:', headers);
    console.log('srcBucket:' + srcBucket + ' srcKey*' + srcKey + ' dstBucket:' + dstBucket + ' dstKey:' + dstKey);

    let current = start;
    function logTime() {
      const now = Date.now();
      console.log('*-- elapsed:' + (now - current) / 1000);
      current = now;
    }

    function logTotalTime() {
      const now = Date.now();
      console.log('*-- Total elapsed:' + (now - start) / 1000);
    }

    function uploadWithMulter(next) {
      logTime();
      directory = path.join(__dirname, '../../uploads');
      console.log('-1- uploadWithMulter upload file to directory:' + directory);

      let userDir = srcKey.substring( // e.g. cognito/WuWei/ap-northeast-1:4xxx2xxx-bxxx-4xx2-8xx6-1xxx7xxxaxxx/2018/07/Scan.jpeg
          srcKey.indexOf(
            srcKey.substr(14, srcKey.indexOf(':') - 14) // ap-northeast-1
          )
        ).substring(15, 51);
      userDir = path.join(directory, userDir);
      if (!fs.existsSync(userDir)) {
        fs.mkdirSync(userDir);
      }
      directory = userDir;
      console.log('directory=' + directory);

      const storage = multer.diskStorage({ // multers disk storage settings
        destination: function(r, file, cb) {
          cb(null, directory);
        },
        filename: function(r, file, cb) {
          fileName = file.originalname;
          cb(null, fileName);
        }
      });

      const uploader = multer({ // multer settings
        storage: storage
      }).single('file');

      uploader(req, res, function(err) {
        if (err) {
          res.json({ error_code: 1, err_desc: 'Failed to write with ' + err });
          return;
        }
        // Sanity check: validate that source and destination are different buckets.
        if (srcBucket === dstBucket) {
          res.json({ error_code: 1, err_desc: 'Source and destination buckets are the same:' + srcBucket });
          return;
        }
        console.log('-1- execute uploader');
        next(null, null);
        // the first null is error data,
        // the second null is next function for the following function
        // if remove the second null will cause next undefined in the following function.
      });
    }

    function getStats(data, next) {
      logTime();
      floc = directory + '/' + fileName;
      features = null;
      console.log('-2- get stats of file ' + floc);
      console.log(next);
      stats = fs.statSync(floc);
      console.log('-2.1- stats.birthtime:', stats.birthtime);
      fs.stat(floc, function(err, data) { // see https://nodejs.org/api/fs.html#fs_fs_statsync_path_options
        if (err) {
          console.log('* fs.stat() error');
          stats = null;
        }
        stats = data;
        console.log('-2.1- stats.birthtime:', stats.birthtime);
        next(null, stats);
      });
    }

    function getImageFeature(data, next) {
      logTime();
      console.log('-3- get identify of file type=' + fileType);
      im.identify( // see https://dev.to/oddmutou/node-imagemagick-5o3/
        floc,
        (err, _features) => {
          if (err) {
            console.log('-3.1- im.identify() error:', err);
          } else if (_features && _features.format && _features.geometry) {
            console.log('-3.1- im.identify() features format=' + _features.format + ' geometory=' + _features.geometry);
            features = _features;
            const
              geometry = features.geometry,
              pos1 = geometry.indexOf('x'),
              pos2 = geometry.indexOf('+'),
              _width = geometry.substr(0, pos1),
              _height = geometry.substr(pos1 + 1, pos2 - pos1 - 1),
              scalingFactor = Math.sqrt((MAX_RESIZED * MAX_RESIZED) / (_width * _height));
            width = Math.round(scalingFactor * _width);
            height = Math.round(scalingFactor * _height);
          }
          contentType = features['mime type'] || ContentType[fileType];
          console.log('width=' + width + ' height=' + height + ' fileType=' + fileType + ' contentType=' + contentType);
          next(null, features);
        }
      );
    }

    function getFeature(data, next) {
      logTime();
      console.log('-4- set feature.contentType');
      contentType = ContentType[fileType];
      features = {
        'mime type': contentType
      };
      console.log('    contentType=' + contentType);
      next(null, null);
    }

    function uploadS3(features, next) {
      logTime();
      console.log('-4- Upload file at ' + floc + ' to ' + srcBucket);
      fs.readFile(floc, function(err, data) {
        if (err) {
          next(err);
        }
        const base64data = new Buffer(data, 'binary');
        // console.log(base64data);
        // Stream the transformed image to a source S3 bucket.
        const param = {
          Bucket: srcBucket,
          Key: srcKey,
          Body: base64data,
          ContentType: contentType,
          ACL: 'public-read'
        };
        console.log(param);
        s3.putObject(
          param,
          function(err, data) {
            if (err) {
              console.log(err);
              next(err);
            } else {
              next(null, param);
            }
          }
        );
      });
    }

    function resizeImage(response, next) {
      logTime();
      console.log('-5- Transform(resize) image file');
      gm(response.Body)
        .resize(width, height)
        .toBuffer(fileType, function(err, buffer) {
          if (err) {
            console.log(err);
            next(err);
          } else {
            next(null, buffer);
          }
        });
    }

    function resizePdf(param, next) {
      logTime();
      console.log('-7- Transform pdf file to resized png resize width=' + width);
      const pdfImage = new PDFImage(floc, {
        convertOptions: {
          '-resize': '' + width,
          // '-density': '400',
          // '-quality': '90',
          '-background': 'white' // default is transparent
        }
      });
      pdfImage
        .convertPage(0)
        .then(imagePath => {
          fs.readFile(imagePath, function(err, data) {
            if (err) {
              console.log(err);
              next(err);
            } else {
              dstKey = suffixReplace(dstKey, 'pdf', 'png');
              contentType = 'image/png';
              console.log(' dstKey=' + dstKey + ' contentType=' + contentType);
              const buffer = new Buffer(data, 'binary');
              // console.log(buffer);
              next(null, buffer);
            }
          });
        })
        .catch(err => {
          console.log(err);
          next(err);
        });
    }

    function resizedS3(buffer, next) {
      logTime();
      console.log('-8- resized to S3');
      if (buffer) {
        console.log('    Upload resized file at ' + dstKey + ' contentType=' + contentType);
        // Stream the transformed image to a target S3 bucket.
        const param = {
          Bucket: dstBucket,
          Key: dstKey,
          Body: buffer,
          ContentType: contentType,
          ACL: 'public-read'
        };
        console.log(param);
        s3.putObject(
          param,
          function(err, data) {
            if (err) {
              console.log(err);
              next(err);
            } else {
              next(null, param);
            }
          }
        );
      }
    }

    function resizedSize(param, next) {
      outloc = directory + '/' + fullpath2filename(suffixReplace(dstKey, '.png', '-0.png')).substr(8);
      console.log('-9- outloc=' + outloc);
      if ('pdf' === fileType) {
        console.log('-9.1- im.identify() for PDF start');
        im.identify(
          outloc,
          (err, _features) => {
            if (err) {
              console.log('-9.2- im.identify() error:', err);
            } else if (_features && _features.format && _features.geometry) {
              console.log('-9.2- im.identify() pdf features format=' + _features.format + ' geometory=' + _features.geometry);
              const
                geometry = _features.geometry,
                pos1 = geometry.indexOf('x'),
                pos2 = geometry.indexOf('+'),
                _width = geometry.substr(0, pos1),
                _height = geometry.substr(pos1 + 1, pos2 - pos1 - 1),
                scalingFactor = Math.sqrt((MAX_RESIZED * MAX_RESIZED) / (_width * _height));
              width = Math.round(scalingFactor * _width);
              height = Math.round(scalingFactor * _height);
            }
            console.log('width=' + width + ' height=' + height + ' fileType=' + fileType + ' contentType=' + contentType);
            next(null, features);
          }
        );
      } else {
        console.log('-9.1- skip not pdf');
        next(null, param);
      }
    }

    function deleteFile(data, next) {
      logTime();
      console.log('-10- Delete file');
      if (fs.existsSync(floc)) {
        fs.unlink(floc, (err) => {
          if (err) {
            next(err);
          } else {
            next(null, null);
          }
        });
      } else {
        console.log(outloc + ' not exists');
        next(null, null);
      }
    }

    function deleteResized(data, next) {
      logTime();
      console.log('-11- Delete resized', outloc);
      if (fs.existsSync(outloc)) {
        fs.unlink(outloc, function(err) {
          if (err) {
            next(err);
          } else {
            next(null, null);
          }
        });
      } else {
        console.log(outloc + ' not exists');
        next(null, null);
      }
    }

    const typeMatch = srcKey.match(/\.([^.]*)$/);
    // console.log('srcKey=' + srcKey + ' typeMatch', typeMatch);
    if (!typeMatch) {
      console.log('Could not determine the file type.');
      res.json({
        error_code: 1,
        err_desc: 'Could not determine the file type.'
      });
      return;
    }
    fileType = typeMatch[1];
    fileType = fileType.toLowerCase();
    if ([
      'jpg', 'jpeg', 'png', 'tiff',
      'pdf',
      'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'
    ].indexOf(fileType) < 0) {
      dstKey = null; // don't upload resized to S3
    }
    console.log('srcKey=' + srcKey + ' typeMatch=' + typeMatch + ' fileType=' + fileType);

    let process = null;
    if (['jpg', 'jpeg', 'png', 'tiff'].indexOf(fileType) >= 0) {
      console.log('*** process image');
      process = [
        uploadWithMulter,
        getStats,
        getImageFeature,
        uploadS3,
        resizeImage,
        resizedS3,
        deleteFile,
        deleteResized
      ];
    } else if (['pdf'].indexOf(fileType) >= 0) {
      console.log('*** process pdf');
      process = [
        uploadWithMulter,
        getStats,
        getFeature,
        uploadS3,
        resizePdf,
        resizedS3,
        resizedSize,
        deleteFile,
        deleteResized
      ];
    } else {
      console.log('*** process other');
      process = [
        uploadWithMulter,
        getStats,
        getFeature,
        uploadS3,
        deleteFile
      ];
    }


    async.waterfall(
      process,
      function(err) {
        logTime();
        logTotalTime();
        let message = '';
        if (err) {
          console.log('*** error');
          if (dstKey) {
            message =
              'Unable to resize ' + fullpath2filename(srcKey) +
              ' and upload to ' + fullpath2filename(dstKey) +
              ' due to an error: ' + JSON.stringify(err);
          } else {
            message = 'Error: ' + JSON.stringify(err);
          }
          res.json({
            error_code: 1,
            err_desc: message
            }
          );
        } else {
          console.log('*** all done');
          if (dstKey) {
            message =
              'Successfully uploaded and resized ' + fullpath2filename(srcKey) +
              ' and uploaded to ' + fullpath2filename(dstKey);
          } else {
            message = 'Successfully uploaded ' + fullpath2filename(srcKey);
          }
          res.json({
            error_code: 0,
            result_desc: {
              message: message,
              srcBucket: srcBucket,
              srcKey: srcKey,
              dstBucket: dstBucket,
              dstKey: dstKey,
              features: features,
              stats: stats,
              resized: {
                width: width,
                height: height
              },
              fileType: fileType
            }
          });
        }
      }
    );
  }

  getAll = (req, res) => {
    const DIR = path.join(__dirname, '../../uploads');
    const files = this.getFiles(DIR, []);
    res.json(files);
  }

  getFiles = (dir, files_) => {
    files_ = files_ || [];
    const
      self = this,
      files = fs.readdirSync(dir);
    files.forEach(function(fname) {
      const floc = dir + '/' + fname;
      if (fs.statSync(floc).isDirectory()) {
        if ('office_icon' !== fname) {
          dir = floc;
          self.getFiles(dir, files_);
        }
      } else {
        let
          thumb = '';
   // features = null;
        if (fname.indexOf('.thumb.jpg') < 0 && fname.indexOf('-0.png') < 0) {
          const stats = fs.statSync(floc);
          const extension = fname.slice((Math.max(0, fname.lastIndexOf('.')) || Infinity) + 1);
          const filename = fname.split('.' + extension)[0];
          console.log('--- filename=' + filename + ' extension=' + extension);
          if ('pdf' === extension) {
            console.log('--- convert PDF ' + floc);
            thumb = filename + '-0.png';
            const pdfImage = new PDFImage(floc);
            pdfImage.convertPage(0)
              .then(imagePath => console.log('--- pdfImage.convertPage(0) imagePath=' + imagePath))
              .catch(error => console.log(error));
          } else if (['png', 'jpg'].indexOf(extension) > -1) {
            console.log('--- im.convert ' + floc);
            thumb = filename + '.thumb.jpg';
            im.convert(
              [floc, '-resize', '64x64', dir + '/' + thumb],
              function(err, stdout) {
                if (err) {
                  console.log(err);
                  return;
                }
                console.log('stdout:', stdout);
              }
            );
          } else if (['xls', 'xlsx'].indexOf(extension) > -1) {
            thumb = 'office_icon/Excel.png';
          } else if (['doc', 'docx'].indexOf(extension) > -1) {
            thumb = 'office_icon/Word.png';
          } else if (['ppt', 'pptx'].indexOf(extension) > -1) {
            thumb = 'office_icon/PowerPoint.png';
          }
          files_.push({
            dir: dir,
            name: fname,
            url: 'http://localhost:3000/uploads/' + fname,
            thumb: thumb ? 'http://localhost:3000/uploads/' + thumb : null,
            floc: floc || '',
            stats: stats
          });
        }
      }
    });
    return files_;
  }

  getFeatures(req, res) {
    const floc = req.query.floc;
    console.log('--- getFeatures() floc=', floc);
    im.identify(
      floc,
      function(err, features) {
        if (err) { throw err; }
        const result = {
          'format': features.format, // 'PNG',
          'mime type': features['mime type'], // 'image/png',
          'geometry': features.geometry, // '4334x5364+0+0',
          'resolution': features.resolution, // '236.23x236.23',
          'print size': features['print size'] // '18.3465x22.7067'
        };
        console.log('--- getFeatures()', result);
        res.json(result);
      }
    );
  }
}
