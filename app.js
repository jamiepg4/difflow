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




var Schema = mongoose.Schema;
var ObjectId = mongoose.Types.ObjectId;

var screenshotSchema = new Schema({
    screenshotName: String,
    screenshotImage: {
        image: Buffer,
        encoding: String,
        contentType: String
    }
})
var Screenshot = mongoose.model('Screenshot', screenshotSchema);


var screenshotTimelineSchema = new Schema({
    testName: {
        type: String,
    },
    screenshotName: {
        type: String,
    },
    screenshots: {
        type: [Schema.ObjectId],
    },
    baselineScreenshot: {
        type: Schema.ObjectId,
    },
    baselineLastChanged: {
        type: Date,
        default: Date.now
    },
    os: String,
    browser: {
        type: String,
        enum: ['chrome', 'firefox', 'internet explorer', 'phantomjs']
    },
    browserVersion: String,
    sauceLabs: {
        type: Boolean,
    },
    dateCreated: {
        type: Date,
        default: Date.now
    },
    testLastRun: {
        type: Date,
    }
});

var ScreenshotTimeline = mongoose.model('ScreenshotTimeline', screenshotTimelineSchema);


var fs = require('fs');


router.route('/screenshot')
    .post(function(req, res, next){

        console.log('post call');

        var query = {screenshotName: req.files.image.originalname};

        Screenshot.findOne(query, function(err, shot){
            if (err) throw err;

            console.log('Query find the screenshot? ...' + !!shot);

            if (!shot) {
                console.log('screenshot not in system');

                var newScreenshot = new Screenshot();
                newScreenshot.screenshotName = req.files.image.originalname;
                newScreenshot.screenshotImage.image = fs.readFileSync(req.files.image.path);
                newScreenshot.screenshotImage.encoding = req.files.image.encoding;
                newScreenshot.screenshotImage.contentType = req.files.image.mimetype;


                newScreenshot.save(function(err){
                    if (err){
                        console.log(err);
                        res.end(JSON.stringify(err))
                    }
                    console.log('saved screenshot');
                });

                var query = {testName: newScreenshot.screenshotName}
                ScreenshotTimeline.findOne(query, function(err, timeline){
                    if (err) throw err;

                    console.log('Query find the timeline? ...' + !!shot);

                    if (!timeline){

                        console.log('timeline does not exist');

                        var newScreenshotTimeline = new ScreenshotTimeline();
                        newScreenshotTimeline.testName = newScreenshot.screenshotName;
                        newScreenshotTimeline.screenshots = [newScreenshot._id];        
                        newScreenshotTimeline.save(function(err,doc){
                            if (err){
                                console.log(err);
                                res.end(JSON.stringify(err))
                            }
                            console.log('saved timeline');
                        })
                    } else {
                        var update = { $addToSet: { screenshots: newScreenshot._id }, $currentDate: { testLastRun: true } }
                        ScreenshotTimeline.findOneAndUpdate(query, update);
                        console.log('updated timeline');
                    }
                });
                res.end(JSON.stringify(newScreenshot));
            } else {
                console.log('screenshot in system') //+ query.screenshotName)
                res.send('screenshot in system')//+ query.screenshotName);
            };
        });
    });
});





app.use('/', router)


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

module.exports = app;
