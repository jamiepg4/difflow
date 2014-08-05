var ScreenshotTimeline = require('../models/ScreenshotTimeline');
var Screenshot = require('../models/Screenshot');
var DiffImage = require('../models/DiffImage');

var path = require('path');
var gm = require('gm');
var fs = require('fs');

function diffImage(testImage, res, next){
    console.log('diffing image');

    var query = {
        testName: testImage.testName, 
        screenshotName: testImage.screenshotName, 
        browser: testImage.browser, 
        browserVersion: testImage.browserVersion,
        os: testImage.os
    }
    ScreenshotTimeline.findOne(query, function(err, timeline){
        Screenshot.findById(timeline.baselineScreenshot, function(err, baseShot){

            baselineImagePath = path.join(path.dirname(__dirname), path.normalize(baseShot.screenshotImage.path))
            testImagePath = path.join(path.dirname(__dirname), path.normalize(testImage.screenshotImage.path))

            console.log(baselineImagePath);
            console.log(testImagePath);

            var options = {
                file: './public/images/diffs/' + timeline.screenshotName // required
            };
            gm.compare(baselineImagePath, testImagePath, options, function (err, isEqual, equality, raw) {
                if (err) throw err;
                console.log('The images are equal: %s', isEqual);
                console.log('Actual equality: %d', equality)
                console.log('Raw output was: %j', raw);
            });
        });
    });
}

exports.diffImage = diffImage;

exports.saveTimeline = function(newScreenshot, res, err){

    console.log('checking for timeline');

    var query = {
        testName: newScreenshot.testName, 
        screenshotName: newScreenshot.screenshotName, 
        browser: newScreenshot.browser, 
        browserVersion: newScreenshot.browserVersion,
        os: newScreenshot.os
    }
    ScreenshotTimeline.findOne(query, function(err, timeline){
        if (err) {
            console.log('ScreenshotTimeline Query Error');
            throw new Error('ScreenshotTimeline Query Error');
        };

        console.log('Query find the timeline? ...' + !!timeline);

        if (!timeline){

            console.log('timeline does not exist');

            ScreenshotTimeline.create(
                {
                    testName: newScreenshot.testName,
                    screenshotName: newScreenshot.screenshotName,
                    screenshots: [newScreenshot._id],
                    browser: newScreenshot.browser,
                    browserVersion: newScreenshot.browserVersion,
                    os: newScreenshot.os,
                    testLastRun: newScreenshot.createdDate,
                    dateCreated: newScreenshot.createdDate,
                    baselineScreenshot: newScreenshot._id
                }, 
                function(err,doc){
                    if (err){
                        console.log(err);
                        res.end(err);
                    }
                    console.log('saved timeline');
                    console.log('doc');
                }
            )

        } else {
            var info = { $addToSet: { screenshots: newScreenshot._id }, $currentDate: { testLastRun: true } };
            timeline.update(info, null, function(err, numberAffected, raw){
                if (err || numberAffected > 1){
                    console.log(err);
                    console.log(numberAffected + ' timelines affected.');
                    res.end(err);
                }
            });
            console.log('updated timeline');

            diffImage(newScreenshot);
        }
    });
}

