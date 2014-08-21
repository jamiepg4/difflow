var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	ObjectId = Schema.ObjectId

var DiffJobSchema = Schema({
	baselineImage: {
		type: ObjectId,
		ref: 'Screenshot',
	},
	testImage: {
		type: ObjectId,
		ref: 'Screenshot',
	},
	timeline:{
		type: ObjectId,
		ref: 'Timeline',
	},
	diffImagePath: {
		type: String
	},
	visualTestEquality: {
		type: String
	}
});

DiffJobSchema.virtual('createdDate')
	.get(function(){
	  	return this._id.getTimestamp();
	});

DiffJobSchema.statics.storeJob = function(test, base, timeline, diffPath, equality, callback){
	this.create({
		baselineImage: base,
		testImage: test,
		diffImagePath: diffPath,
		visualTestEquality: equality,
		timeline: timeline
	},
	function(err, doc){
		if (err) {
			callback(err)
		}
	})
}

module.exports = mongoose.model('DiffJob', DiffJobSchema);