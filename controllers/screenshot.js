var mongoose = require('mongoose');
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

var fs = require('fs');

screenshotTimeline = require('./screenshotTimeline');

exports.uploadScreenshot = function(req, res, next){

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
                    res.json(err);
                }
                console.log('saved screenshot');
            });

            screenshotTimeline.saveTimeline(newScreenshot);

            res.json(newScreenshot);
        } else {
        	screenshotTimeline.saveTimeline(shot);
            console.log('screenshot ' + shot.screenshotName + ' in system.')
            res.json('screenshot ' + shot.screenshotName + ' in system.')
        };
    });
}

module.exports = exports;

