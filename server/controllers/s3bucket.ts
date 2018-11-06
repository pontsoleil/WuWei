import * as fs from 'fs';
import * as path from 'path';
import * as multer from 'multer';
import * as serveStatic from 'serve-static';
// Load the AWS SDK for Node.js
import * as AWS from 'aws-sdk';
const async = require('async');
const PDFImage = require('pdf-image');
const im = require('imagemagick');
const gm = require('gm').subClass({ imageMagick: true }); // Enable ImageMagick integration.
const util = require('util');
const bucketRegion = 'ap-northeast-1';
// const IdentityPoolId = 'ap-northeast-1:edb80ba3-ea19-487a-bee0-30a1d0a54c64';
const bucketName = 'www-s3.wuwei.space';
const credentials = new AWS.SharedIniFileCredentials({ profile: 'default' });
AWS.config.credentials = credentials;
AWS.config.update({
  region: bucketRegion,
  credentials: credentials
  // credentials: new AWS.CognitoIdentityCredentials({
  //   IdentityPoolId: IdentityPoolId
  // })
});
// Create S3 service object
const s3 = new AWS.S3({
  apiVersion: '2006-03-01',
  params: {Bucket: bucketName}
});
// const s3 = new AWS.S3({apiVersion: '2006-03-01'});
const bucketParams = { Bucket: 'www-s3.wuwei.space' };
const MAX_WIDTH = 100;
const MAX_HEIGHT = 100;

export default class S3Ctrl {

  upload = (req, res, next) => {
    console.log('app.route(\'/upload\').post()');
    const storage = multer.diskStorage({ // multers disk storage settings
      destination: function (r, file, callback) {
        console.log(file);
        callback(null, path.join(__dirname, '../uploads'));
      },
      filename: function (r, file, callback) {
        callback(null, file.originalname);
      }
    });

    const upload = multer({ // multer settings
      storage: storage
    }).single('file');

    upload(req, res, function(err){
      if (err) {
        res.json({ error_code: 1, err_desc: err });
        return;
      }
      res.json({ error_code: 0, err_desc: null });
    });
  }

  // generate = (req, res) => {

  // }

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
          const extension = fname.slice((Math.max(0, fname.lastIndexOf(".")) || Infinity) + 1);
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

  handler = function(event, context, callback) {
    // Read options from the event.
    console.log("Reading options from event:\n", util.inspect(event, {depth: 5}));
    const srcBucket = event.Records[0].s3.bucket.name;
    // Object key may have spaces or unicode non-ASCII characters.
    const srcKey = decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, " "));
    const dstBucket = srcBucket + "resized";
    const dstKey = /*"resized-" +*/srcKey;

    // Sanity check: validate that source and destination are different buckets.
    if (srcBucket === dstBucket) {
      callback("Source and destination buckets are the same.");
      return;
    }

    // Infer the image type.
    const typeMatch = srcKey.match(/\.([^.]*)$/);
    if (!typeMatch) {
      callback("Could not determine the image type.");
      return;
    }
    const imageType = typeMatch[1];
    if (imageType !== "jpg" &&
        imageType !== "jpeg" &&
        imageType !== "png" &&
        imageType !== "tiff") {
      callback('Unsupported image type: ${imageType}');
      return;
    }
    // Download the image from S3, transform, and upload to a different S3 bucket.
    async.waterfall([
      function download(next) {
        // Download the image from S3 into a buffer.
        s3.getObject(
          {
            Bucket: srcBucket,
            Key: srcKey
          },
          next
        );
      },
      function transform(response, next) {
        gm(response.Body).size(function(err, size) {
          // Infer the scaling factor to avoid stretching the image unnaturally.
          const scalingFactor = Math.min(
            MAX_WIDTH / size.width,
            MAX_HEIGHT / size.height
          );
          const width = scalingFactor * size.width;
          const height = scalingFactor * size.height;
          // Transform the image buffer in memory.
          this
            .resize(width, height)
            .toBuffer(imageType, function(err, buffer) {
              if (err) {
                next(err);
              } else {
                next(null, response.ContentType, buffer);
              }
            });
        });
      },
      function upload(contentType, data, next) {
        // Stream the transformed image to a different S3 bucket.
        s3.putObject({
            Bucket: dstBucket,
            Key: dstKey,
            Body: data,
            ContentType: contentType
        },
        next);
      }],
      function (err) {
        if (err) {
          console.error(
            'Unable to resize ' + srcBucket + '/' + srcKey +
            ' and upload to ' + dstBucket + '/' + dstKey +
            ' due to an error: ' + err
          );
        } else {
          console.log(
            'Successfully resized ' + srcBucket + '/' + srcKey +
            ' and uploaded to ' + dstBucket + '/' + dstKey
          );
        }
        callback(null, "message");
      }
    );
  };
}
