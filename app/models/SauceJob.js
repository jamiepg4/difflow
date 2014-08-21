var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	ObjectId = Schema.ObjectId

var utils = require('../utils');

var SauceJobSchema = Schema({
	name: {
		type: String,
	},
	screenshots: [{
		type: ObjectId,
		ref: 'Screenshot'
	}],
	sauceId: {
		type: String,
	},
	owner: {
		type: String,
	},
	browser: {
		type: String,
	},
	browserVersion: {
		type: String,
	},
	os: {
		type: String,
	},
	status: {
		type: String,
	},
	creationTime: {
		type: Date,
	},
	startTime: {
		type: Date,
	},
	visibility: { 
		type: String,
	 	default: 'private'
	},
	videoUrl: {
		type: String,
	},
	passed: {
		type: Boolean,
	}
});

SauceJobSchema.virtual('assetsUrl')
  	.get(function(){
		return utils.sauceBaseUrl + this.sauceId + '/assets/';
  	});

SauceJobSchema.statics.storeJob = function(job, callback) {
	this.create({
		name: job.name,
		sauceId: job.id,
		owner: job.owner,
		browser: job.browser,
		browserVersion: job.browser_short_version,
		os: job.os,
		status: job.status,
		passed: job.passed,
		creationTime: job.creation_time,
		startTime: job.start_time,
		visibility: job.public,
		videoUrl: job.video_url
	},
	function(err, doc){
		console.log('Stored job ' + doc.name)
		if (err){
			callback(err);
		}
		callback(null, doc);
	})
}

module.exports = mongoose.model('SauceJob', SauceJobSchema);

