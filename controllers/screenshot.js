var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = mongoose.Types.ObjectId;

var screenshotSchema = new Schema({
    testName: {
        type: String,
    },
    screenshotName: {
        type: String,
    },
    screenshotImage: {
        image: {
            type: Buffer
        },
        encoding: {
            type: String
        },
        contentType: {
            type: String
        }
    },
    browser: {
        type: String
    },
    browserVersion: {
        type: String
    },
    os: {
        type: String
    },
    createdDate: {
        type: Date
    },
    functionalTestPassed: {
        type: Boolean
    }
})
var Screenshot = mongoose.model('Screenshot', screenshotSchema);

var fs = require('fs');

screenshotTimeline = require('./screenshotTimeline');

exports.uploadScreenshot = function(req, res, next){

    console.log('post screenshot');
    var query = {
        screenshotName: req.files.image.name,
        testName: req.files.testName, 
        browser: req.files.browser,
        browserVersion: req.files.browserVersion,
        os: req.files.os
    };

    Screenshot.findOne(query, function(err, shot){
        if (err) {
            console.log(err);
            res.end(err);
        };

        console.log('Query find the screenshot? ...' + !!shot);

        if (!shot) {
            console.log('screenshot not in system');

            Screenshot.create(
                {
                    testName: req.files.testName,
                    screenshotName: req.files.image.name,
                    screenshotImage: {
                        image: fs.readFileSync(req.files.image.path),
                        encoding: req.files.image.encoding,
                        contentType: req.files.image.mimetype
                    },
                    browser: req.files.browser,
                    browserVersion: req.files.browserVersion,
                    os: req.files.os,
                    functionalTestPassed: req.files.passed
                }, 
                function(err, product, numberAffected){
                    if (err){
                        console.log(err);
                        res.end(err)
                    }
                    console.log(product);
                    screenshotTimeline.saveTimeline(product, res, err);
                }
            );

        } else {
            console.log('screenshot ' + shot.screenshotName + ' in system.')
        	screenshotTimeline.saveTimeline(shot, res, err);
        };
    });
}

exports.upload = function(){
    this.uploadScreenshot;
    res.end('uploaded');
}

module.exports = exports;

