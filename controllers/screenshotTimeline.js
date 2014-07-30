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


exports.saveTimeline = function(newScreenshot, err){
    var query = {testName: newScreenshot.screenshotName}
    ScreenshotTimeline.findOne(query, function(err, timeline){
        if (err) throw err;

        console.log('Query find the timeline? ...' + !!timeline);

        if (!timeline){

            console.log('timeline does not exist');

            var newScreenshotTimeline = new ScreenshotTimeline();
            newScreenshotTimeline.testName = newScreenshot.screenshotName;
            newScreenshotTimeline.screenshots = [newScreenshot._id];        
            newScreenshotTimeline.save(function(err,doc){
                if (err){
                    console.log(err);
                    res.json(err);
                }
                console.log('saved timeline');
            })
        } else {
            var update = { $addToSet: { screenshots: newScreenshot._id }, $currentDate: { testLastRun: true } }
            ScreenshotTimeline.findOneAndUpdate(query, update);
            console.log('updated timeline');
        }
    });
}

