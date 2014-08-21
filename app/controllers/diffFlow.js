var express = require('express'),
	router = express.Router(),
	mongoose = require('mongoose');

var config = require('../../config/config'),
	utils = require('../utils');

var DiffJob = mongoose.model('DiffJob'),
	SauceJob = mongoose.model('SauceJob'),
	Timeline = mongoose.model('Timeline'),
	Screenshot = mongoose.model('Screenshot');

module.exports = function (app) {
  app.use('/', router);
};

router.get('/', function(req, res){
	DiffJob.find(function(err, data){
		var info = [],
			jobs = data.slice();

		// Send each DiffJob to the jade file to render
		function pushJobs(info, jobs) {

			if (jobs.length === 0) {
				res.render('testindex', {info: info, threshold: config.equalityThreshold*100})
				return;
			};

			var job = jobs.pop();

			Timeline.findById(job.timeline, function(err, timeline){
				if (err){
					throw err;
				}
				var visual = (parseFloat(job.visualTestEquality)*100)
				visual = visual.toFixed(3)

			    info.push({
					testName: timeline.testName,
					screenshotName: timeline.screenshotName,
					visualTest: visual,
					id: job._id
				})
				pushJobs(info, jobs);
			})
		}

		pushJobs(info, jobs);

	})
})

// Render the baseline, testImage, and baseline side-by-side
router.get('/difftool/:diffId', function(req, res, next){
	DiffJob.findById(req.params.diffId, function(err, job) {
		Screenshot.findById(job.baselineImage, function(err, base){
			Screenshot.findById(job.testImage, function(err, test){

				res.render('difftool', {
					baseline: utils.removePublicFromUrl(base.path),
					diff: utils.removePublicFromUrl(job.diffImagePath), 
					testPath: utils.removePublicFromUrl(test.path),
					testId: test._id,
					timelineId: test.timeline
				})			
			})
		})
	})
})

// If a user goes to the difftool page without a DiffJob
router.get('/difftool', function(req, res){
	var holder = config.placeholderImage;
	res.render('difftool', {baseline: holder, diff: holder, testImage: holder});
})