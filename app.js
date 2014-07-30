var express = require('express');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var multer = require('multer');
var mongoose = require('mongoose');

var app = express();
var router = express.Router();


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(multer({dest:'./public/images'}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

mongoose.connect('mongodb://localhost/data/db')
mongoose.connection.on('open', function(){


var screenshotController = require('./controllers/screenshot');

router.route('/screenshot')
    .post(screenshotController.uploadScreenshot);
});




var saucelabs = require('./SauceLabs');
var sauceUsername = 'zhawtof';
var saucePassword = '502dffd5-0274-4416-b8bf-c623d3be754f';

var myAccount = new saucelabs({
    username: sauceUsername,
    password: saucePassword
});

var https = require('https');

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
        myAccount.getJobs(function (err, jobs) {
        // Get a list of all your jobs
            for (var k = 0 ; k < (Math.min(1, jobs.length)); k++) {
                myAccount.showJobAssets(jobs[k].id, function(err, assets) {

                    var str = jobs[k].name + " : ";
                    for (var m = 0; m < assets.screenshots.length; m++) {

                        str += "\n     " + assets.screenshots[m];
                        myAccount.getJobAssets(jobs[k].id, assets.screenshots[m], function(err, img){

                            res.json(img);

                        })
                    }
                    console.log(str);
                })
            }
        });
    })

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
