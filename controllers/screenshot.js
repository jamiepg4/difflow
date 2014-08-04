var Screenshot = require('../models/Screenshot');
var screenshotTimeline = require('./screenshotTimeline');

var fs = require('fs');

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
                        path: req.files.image.path,
                        image: fs.readFileSync(req.files.image.path),
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

