var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId
    Timeline = require('../models/Timeline')
    SauceJob = require('../models/SauceJob')


var ScreenshotSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    path: {
        type: String,
    },
    job: {
        type: ObjectId,
        ref: 'SauceJob'
    },
    timeline: {
        type: ObjectId,
        ref: 'Timeline'
    },
    creationTime: {
        type: Date,
    },
    downloaded: {
    	type: String,
    }
});


ScreenshotSchema.statics.storeScreenshot = function(screenshotName, job, callback) {
    this.create({
        name: screenshotName,
        job: job._id,
        creationTime: job.creationTime
    }, 
    function(err, shot) {
        if (err){
            callback(err);
        }
        console.log('Stored screenshot ' + shot.name + ' of ' + job.name);
        Timeline.upsertTimeline(shot, job, function(err, timeline){
            if (err) {
                callback(err);
            }
            shot.timeline = timeline;
            shot.save();
            callback(null, shot, timeline);
        });
    })
}

module.exports = mongoose.model('Screenshot', ScreenshotSchema);
