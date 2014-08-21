var path = require('path');
var config = require('../config/config');

exports.removePublicFromUrl = function(fullpath) {
	var pathArray = fullpath.split(path.sep);
	pathArray = pathArray.slice(pathArray.indexOf('public') + 1);
    var newPath = pathArray.join('/');
    return '/' + newPath
}

exports.checkComplete = function(job){
	return job.status === 'complete';
}

exports.sauceBaseUrl = 'https://' + config.sauceAuth.username + ':' 
	+ config.sauceAuth.password + '@saucelabs.com/rest/v1/' 
	+ config.sauceAuth.username + '/jobs/';


