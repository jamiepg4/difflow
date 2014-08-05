var Screenshot = require('../models/Screenshot');
var screenshotTimeline = require('./screenshotTimeline');

var fs = require('fs');

exports.databaseScreenshot = function(req, res, next){
    console.log('Creating screenshot in Mongo');
    console.log(req);
    Screenshot.create(
        {
            testName: req.name,
            screenshotName: req.screenshotName,
            screenshotImage: {
                path: req.path,
                image: fs.readFileSync(req.path),
            },
            browser: req.browser,
            browserVersion: req.browser_short_version,
            os: req.os,
            functionalTestPassed: req.passed
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
};


module.exports = exports;

