var express = require('express');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var multer = require('multer');
var mongoose = require('mongoose');
var fs = require('fs');

var app = express();
var router = express.Router();

var screenshotController = require('./controllers/screenshot');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(multer({dest:'./public/images'}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

mongoose.connect('mongodb://localhost/data/db');
// mongoose.connection.on('open', function(){


var saucelabs = require('saucelabs');
var request = require('request');

var sauceAuth = {
    username: 'zhawtof',
    password: '502dffd5-0274-4416-b8bf-c623d3be754f'
}

var myAccount = new saucelabs(sauceAuth);
var sauceBaseUrl = 'https://' + sauceAuth.username + ':' + sauceAuth.password + '@saucelabs.com/rest/v1/' + sauceAuth.username + '/jobs/';
var imagesPath = './public/images/'


router.route('/saucelabs')
    .all(function(req,res,next){
        myAccount.getServiceStatus(function (err, res) {
            if (err){
                res.end('SauceLabs is down');
            }
            next();
        });
    })
    .get(function(req, res, next) {

        // Get a list of all your jobs
        myAccount.getJobs(function (err, jobs) {

            if (err) {
                console.log(err);
                res.end(err);
            };

            // Iterate through each test up to bottleneck
            var bottleneck = 1,
                limit = Math.min(bottleneck || 20, jobs.length);

            for (var k = 0 ; k < limit; k++) {

                //If test is done running, collect screenshots. Otherwise, keep running to collect other tests
                if (jobs[k].status === 'complete'){

                    assetsUrl = sauceBaseUrl + jobs[k].id + '/assets/';

                    //Get a list of each jobs assets
                    request.get(assetsUrl, function(err, response, assets){

                        assets = JSON.parse(assets);

                        //Get each screenshot from given job
                        for (var m = 0; m < assets.screenshots.length; m++) {

                            imageName = assets.screenshots[m];
                            var path = imagesPath + jobs[k].start_time + imageName;

                            var file = fs.createWriteStream(path);
                            file.on('finish', function() {
                                console.log('piped to ' + path);

                                req = {
                                    files:{
                                        testName: jobs[k].name,
                                        image: {
                                            path: path,
                                            name: imageName,
                                            mimetype: 'image/png',
                                            encoding: '7bit'
                                        },
                                        browser: jobs[k].browser,
                                        browserVersion: jobs[k].browser_short_version,
                                        os: jobs[k].os,
                                        creationDate: jobs[k].creation_time,
                                        passed: jobs[k].passed
                                    }
                                };

                                //Add screenshot into MongoDB
                                screenshotController.uploadScreenshot(req, res);
                            });

                            request.get(assetsUrl + imageName).pipe(file);
                        }
                    })
                }
            }
        })
        res.send('Files Downloaded');
    })
    //POST Screenshot up to Difflow directly
    .post(screenshotController.upload);

app.use('/', router);


/// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


var debug = require('debug')('difflow2');

app.set('port', process.env.PORT || 3000);

var server = app.listen(app.get('port'), function() {
  console.log('Express server listening on port ' + server.address().port);
});

module.exports = exports = app;
