var ScreenshotTimeline = require('../models/ScreenshotTimeline');
var Screenshot = require('../models/Screenshot');
var DiffImage = require('../models/DiffImage');

var resemble = require('node-resemble').resemble;
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
        Screenshot.findById(timeline.baselineScreenshot, function(err, shot){
            var baselineImage = shot.screenshotImage.path;
            console.log(baselineImage);
            console.log(testImage);
            console.log('Baseline ' + typeof(fs.readFile(baselineImage)));
            console.log('Test Image ' + typeof(testImage));
            console.log(typeof(fs.readFile(baselineImage)) == typeof(testImage))
            var diff = resemble(fs.readFile(baselineImage)).compareTo(testImage).onComplete(function(data){
                console.log('image diffed')
                console.log(data);
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

            diffImage(newScreenshot);

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

