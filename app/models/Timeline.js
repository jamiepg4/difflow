var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId

var TimelineSchema = new Schema({
    testName: {
        type: String,
    },
    screenshotName: {
        type: String,
        required: true
    },
    screenshots: [{
        type: ObjectId,
        ref: 'Screenshot'
    }],
    baselineScreenshot: {
        type: ObjectId,
        ref: 'Screenshot'
    },
    browser: {
        type: String,
        enum: ['googlechrome', 'firefox', 'iexplore', 'safari', 'phantomjs']
    },
    browserVersion: {
        type: String
    },
    os: {
        type: String
    },
    sauceLabs: {
        type: Boolean,
        default: false
    },
    testLastRun: {
        type: Date,
        default: Date.now
    }
});

TimelineSchema.virtual('createdDate')
  .get(function(){
    return this._id.getTimestamp();
  });

TimelineSchema.statics.upsertTimeline = function(screenshot, job, callback) {
    var self = this;
    var query = {
        testName: job.name,
        screenshotName: screenshot.name,
        browser: job.browser,
        browserVersion: job.browserVersion,
        os: job.os,
    }
    var update = { 
        $addToSet: { screenshots: screenshot._id },
        $currentDate: { testLastRun: true } 
    }
    var options = {
        new: true,
    }
    self.findOneAndUpdate(query, update, options, function(err, timeline){
        if (err) {
            callback(err)
        }
        if (!timeline) {
            self.create({
                testName: job.name,
                screenshotName: screenshot.name,
                browser: job.browser,
                browserVersion: job.browserVersion,
                os: job.os, 
                screenshots: [screenshot._id],
                baselineScreenshot: screenshot._id,
                sauceLabs: !!job
            },
            function(err, doc){
                if (err){
                    callback(err);
                }
                console.log('Created new timeline for ' + doc.screenshotName + ' of test ' + doc.testName);
                callback(null, doc);
            })
        } else {
            console.log('Updated timeline ' + timeline.testName + ' with new screenshot');
            callback(null, timeline);
        }
    })
}

module.exports = mongoose.model('Timeline', TimelineSchema);

