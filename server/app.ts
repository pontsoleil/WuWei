import * as bodyParser from 'body-parser';
import * as dotenv from 'dotenv';
import * as express from 'express';
import * as morgan from 'morgan';
import * as mongoose from 'mongoose';
import * as path from 'path';
import * as multer from 'multer';
import * as serveStatic from 'serve-static';

const cors = require('cors');
const corsOptions = {
  origin: '*',
  optionsSuccessStatus: 200
};

import setRoutes from './routes';

// // Load the AWS SDK for Node.js
// import * as AWS from 'aws-sdk';
// // Set the region
// const bucketName = 'www-s3.wuwei.space';
// const bucketRegion = 'ap-northeast-1';
// const IdentityPoolId = 'ap-northeast-1:edb80ba3-ea19-487a-bee0-30a1d0a54c64';
// const credentials = new AWS.SharedIniFileCredentials({ profile: 'default' });
// AWS.config.credentials = credentials;
// AWS.config.update({
//   region: bucketRegion,
//   credentials: credentials
//   // credentials: new AWS.CognitoIdentityCredentials({
//   //   IdentityPoolId: IdentityPoolId
//   // })
// });
// // Create S3 service object
// const s3 = new AWS.S3({
//   apiVersion: '2006-03-01',
//   params: {Bucket: bucketName}
// });
// // const s3 = new AWS.S3({apiVersion: '2006-03-01'});
// const bucketParams = { Bucket: 'www-s3.wuwei.space' };

const app = express();

dotenv.load({ path: '.env' });

// https://stackoverflow.com/questions/19917401/error-request-entity-too-large
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));

app.set('port', (process.env.PORT || 3000));
console.log('--- Express use port ' + app.get('port'));

if (app.get('env') === 'production') {
  app.use(morgan('short'));
} else {
  app.use(morgan('dev'));
  // app.use(morgan({ format: 'dev', immediate: true }));
  // app.use(morgan('combined'));
}

app.use(cors(corsOptions));

app.use(function(req, res, next) { // allow cross origin requests
  res.setHeader('Access-Control-Allow-Methods', 'POST, PUT, OPTIONS, DELETE, GET');
  // res.header('Access-Control-Allow-Origin', 'http://localhost:4200');
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Credentials', 'true');
  next();
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use('/', express.static(path.join(__dirname, '../public')));
console.log('--- Express use static root / as ' + path.join(__dirname, '../public'));

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
console.log('--- Express use static /uploads as ' + path.join(__dirname, '../uploads'));

// app.post('/upload', function(req, res) {
/* app.route('/upload')
  .post(function(req, res, next) {
    console.log('app.route(\'/upload\').post()');
    const storage = multer.diskStorage({ // multers disk storage settings
      destination: function (r, file, cb) {
        // console.log('Express use static root / as ' + path.join(__dirname, '../public'));
        console.log(file);
        cb(null, path.join(__dirname, '../uploads'));
      },
      filename: function (r, file, cb) {
        // var datetimestamp = Date.now();
        cb(null, file.originalname);
        // file.fieldname + '-' + datetimestamp + '.' + file.originalname.split('.')[file.originalname.split('.').length -1]);
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
  });
*/

app.use(serveStatic('public')); /*, {
  maxAge: '1d',
  setHeaders: setCustomCacheControl
}));*/

app.use(serveStatic('uploads'));
/*, {
  maxAge: '1d',
  setHeaders: setCustomCacheControl
}));*/

/*function setCustomCacheControl (res, path) {
  if (serveStatic.mime.lookup(path) === 'text/html') {
    // Custom Cache-Control for HTML files
    res.setHeader('Cache-Control', 'public, max-age=0')
  }
}*/

mongoose.connect(process.env.MONGODB_URI, {
  useMongoClient: true
});

const db = mongoose.connection;

(<any>mongoose).Promise = global.Promise;

db.on('error', console.error.bind(console, 'connection error:'));

db.once('open', () => {
  console.log('--- Connected to MongoDB at MONGODB_URI=' + process.env.MONGODB_URI);

  setRoutes(app);

  app.get('/*', function(req, res) {
    console.log('--- app.get \'/*\' req.body=' + JSON.stringify(req.body));
    console.log('--- res.sendFile(\'' + path.join(__dirname, '../public/index.html') + '\')');
    res.sendFile(path.join(__dirname, '../public/index.html'));
  });

  app.listen(app.get('port'), () => {
    console.log('--- WuWei listening on port ' + app.get('port'));
  });

});

export { app };
