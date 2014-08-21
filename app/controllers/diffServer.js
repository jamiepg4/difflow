var express = require('express'),
	router = express.Router(),
	mongoose = require('mongoose'),
	saucelabs = require('saucelabs'),
	request = require('request'),
	fs = require('graceful-fs')
    path = require('path'),
    gm = require('gm')

var	config = require('../../config/config'),
    utils = require('../utils'),
	SauceJob = mongoose.model('SauceJob'),
	Screenshot = mongoose.model('Screenshot'),
    DiffJob = mongoose.model('DiffJob')

// Used to connect to Sauce Labs
var myAccount = new saucelabs(config.sauceAuth);

module.exports = function (app) {
  app.use('/server', router);
};

// Used to start server
router.get('/start', function(req, res){
	getJobs();
	setInterval(getJobs, config.waitTime)
	res.send('Server started');
})

// Ad Hoc upload own photos to diff
router.post('/upload', function(req, res){
	uploadPhotos(req, function(isEqual, equality, raw, diffPath){
		var str = 'The images are equal: ' + isEqual
        	+ '\nActual equality: ' + equality
        	+ '\nRaw output was:\n' + raw;
        console.log(diffPath);
		res.render('difftool', {
			baseline: utils.removePublicFromUrl(req.files.base.path),
			diff: utils.removePublicFromUrl(diffPath),
			testPath: utils.removePublicFromUrl(req.files.test.path)
		})
	});
})

// Change baseline image for specific timeline
router.post('/baseline', function(req, res){
	var timelineId = req.body.timelineId.replace(/"/g, "")
	var testId = req.body.testId.replace(/"/g, "")
	var query = { _id: timelineId }
	var update = { baselineScreenshot: testId}
	Timeline.findOneAndUpdate(query, update, function(err, timeline){
		if (err) throw err;
		// ensure that update was made
		if (timeline.baselineScreenshot == testId){
			res.json({
				response: 'success'
			});
		} else {
			throw new Error();
		}
	});
})

// Uploading photos through ad hoc process
function uploadPhotos(req, callback) {
	console.log('This is the test ' + req.files.test.path);
	console.log('This is the base ' + req.files.base.path);

	diffImage(req.files.test.path, req.files.base.path, req.body.diffName, function(err, isEqual, equality, raw, diffPath){
		if (err) throw err;
		callback(isEqual, equality, raw, diffPath);
	});
}

// Get list of jobs from Sauce 
function getJobs(){
	ping(function(err){
		if (err) throw err;

		console.log('Getting Jobs');

		collectIncompleteJobs(function(err){
			if (err) throw err;

			myAccount.getJobs(function(err, jobslist){
				if (err) throw err;

				for (var k = 0; k < Math.min(100, jobslist.length); k++){
					inSystem(jobslist[k], function(err){
						if (err) throw err;
					});
				}
			});
		});
	});
}

// Ping Sauce to ensure system is online
function ping(callback){
	myAccount.getServiceStatus(function(err, res) {
		if (err){
			callback(err)
		}
		if (!res.service_operational) {
			callback(new Error('Sauce Labs is down'));
		}
		console.log('Sauce Labs up and operational');
		callback();
	})
}

// Collect any Jobs that were not completed previously
function collectIncompleteJobs(callback){

	SauceJob.find({status: {$ne: 'complete'}}, function(err, jobs){
		console.log('Jobs now completed from previous run: ' + jobs.length)

		for (var k = 0; k < jobs.length; k++) {

			if (jobs[k].status === 'complete') {
				console.log('This instance of ' + jobs[k].name + ' has not been downloaded yet');
				getAssets(jobs[k], function(err){
					callback(err);
				});
			}
		}
	})
	callback();
}

// Check if the job is in the system already
function inSystem(job, callback){

	SauceJob.findOne({sauceId: job.id}, function(err, doc){
		if (err) {
			callback(err);
		}
		if (!doc)
		{
			console.log('This instance of ' + job.name + ' is not in system')

			SauceJob.storeJob(job, function(err, doc) {

				if (err) {
					callback(err);
				}

				if (utils.checkComplete(doc)) {
					getAssets(doc, function(err){
						callback(err);
					});
				}
			});
		} 
		else
		{
			console.log('This instance of ' + doc.name + ' is ' + doc.status + '.');
		}
	});
}

// Get a list of the screenshots for a specific job
function getAssets(job, callback) {
	console.log('Getting ' + job.name + ' assets')

	request(job.assetsUrl, function(err, response, assets) {
		assets = JSON.parse(assets);

		if (!err && response.statusCode == 200) {

			if (assets === null || assets.screenshots === null){
				throw new Error(job.name + ' has no screenshots');
			}

			for (var k = 0; k < assets.screenshots.length; k++) {
				getScreenshot(job, assets.screenshots[k], function(){
					if (err){
						callback(err);
					}
				})

			}
		} else {
			console.log('Response Code: ' + response.message + '\n\nError: ' + err)
			callback(err)
		}
	});
}

// Get screenshot from system
function getScreenshot(job, screenshotName, callback) {
	Screenshot.storeScreenshot(screenshotName, job, function(err, screenshot, timeline){
		if (err) {
			callback(err);
		}

		downloadScreenshot(job, screenshot, function(err, testImage){
			if (err) {
				callback(err);
			}
			if (testImage._id !== timeline.baselineScreenshot){
				setupForDiff(testImage, timeline, function(err){
					if (err) {
						callback(err);
					}
				})
			} else {
				console.log('Test image ' + testImage.path + ' is baseline.')
			}
		});
	})
}

// Download screenshot from Sauce
function downloadScreenshot(job, screenshot, callback){

    var path = config.imagesPath + 'sauce/' + screenshot.creationTime.getTime() + screenshot.name;

    var file = fs.createWriteStream(path);

    file.on('pipe', function(){
    	screenshot.downloaded = 'piping';
    	screenshot.save();
    })

    .on('finish', function() {
        //Save screenshot path to MongoDB
        screenshot.path = path;
        screenshot.downloaded = 'downloaded';
        screenshot.save(function(err, product, numberAffected){
        	if (err) {
        		callback(err);
        	}
        	console.log(job.name + ' downloaded to ' + path);
        	callback(null, screenshot);
        });
    })

    .on('error', function(err) {
    	console.log('Problem downloading ' + screenshot.name + ' of job ' + job + ' because ' + err);
    });

    // Request to download screenshot and pipe into temp file
    var downloadUrl = job.assetsUrl + screenshot.name;
    screenshot.downloaded = 'ready';
    screenshot.save();
    request.get(downloadUrl).pipe(file);    
}

// Ensure baseline image is downloaded before diffing test image
function setupForDiff(testImage, timeline, callback) {
	Screenshot.findById(timeline.baselineScreenshot, function(err, baseShot){
		var testImagePath = testImage.path.slice(2);
		var diffImageName = timeline.testLastRun.getTime() + timeline.screenshotName;
		if (baseShot.downloaded === 'downloaded'){
			var baselineImagePath = baseShot.path.slice(2);
			diffImage(testImagePath, baselineImagePath, diffImageName, function(err, isEqual, equality, raw, diffPath){
				if (err) {
					callback(err);
				}
				DiffJob.storeJob(testImage, timeline.baselineScreenshot, timeline, diffPath, equality, function(err){
					if (err) {
						callback(err)
					}
				})
			})
		} else if (baseShot.downloaded === 'piping' || baseShot.downloaded === 'ready') {
			//keep checking until baseShot is piped
			setTimeout(setupForDiff(testImage, timeline), 3000)
		} else {
			SauceJob.findById(baseShot.job, function(err, job){
				downloadScreenshot(job, baseShot, function(err, screenshot){
					setupForDiff(testImage, timeline);
				})
			})
		}
	})
}

// Create a visual diff of the image
function diffImage(testImagePath, baselineImagePath, diffImageName, callback){
    /**
    * See for more options http://www.graphicsmagick.org/compare.html#comp-opti
    **/

    if (!diffImageName) {
    	diffImageName = path.basename(testImagePath);
    }

    if (baselineImagePath !== testImagePath) {
    	console.log('Diffing Image to ' + diffImageName);

    	var options = {
	        highlightColor: 'pink',
	        highlightStyle: 'Assign',
	        file: config.imagesPath + 'diffs/' + diffImageName,
	        tolerance: config.threshold
	    };
	    gm.compare(baselineImagePath, testImagePath, options, function (err, isEqual, equality, raw) {
	        if (err){
	        	callback(err);
	        }  
	        console.log('The images are equal: %s', isEqual);
	        console.log('Actual equality: %d', equality)
	        console.log('Raw output was: %j', raw);

	        callback(null, isEqual, equality, raw, options.file);
	    });
    }
}













