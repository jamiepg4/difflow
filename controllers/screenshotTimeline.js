var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var screenshotTimelineSchema = new Schema({
    testName: {
        type: String,
    },
    screenshotName: {
        type: String,
    },
    screenshots: {
        type: [{type: Schema.ObjectId, ref: 'Screenshot'}],
    },
    baselineScreenshot: {
        type: Schema.ObjectId,
        ref: 'Screenshot'
    },
    baselineLastChanged: {
        type: Date,
        default: Date.now
    },
    os: String,
    browser: {
        type: String,
        enum: ['googlechrome', 'firefox', 'internet explorer', 'phantomjs']
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
        default: Date.now
    }
});

var ScreenshotTimeline = mongoose.model('ScreenshotTimeline', screenshotTimelineSchema);


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
                    baseline: newScreenshot._id
                }, 
                function(err,doc){
                    if (err){
                        console.log(err);
                        res.end(err);
                    }
                    console.log('saved timeline');
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
        }
    });
}

