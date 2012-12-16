/* Admin Index */

var mongoose = require('mongoose'), 
	question = require('../../models/questions.js'),
	tweet = require('../../models/tweets.js'),
	survivor = require('../../models/survivors.js'),
	zombie = require('../../models/zombies.js');


/* Totals */
var totalZombies, totalSurvivors, totalTweets, totalQuestions;
var getStats = function(callback) {
	zombie.count({}, function(err, count) { totalZombies = count; getTweets(); });
	var getTweets = function() { tweet.count({}, function(err, count) { totalTweets = count; getSurvivors(); }); };
	var getSurvivors = function() { survivor.count({}, function(err, count) { totalSurvivors = count; getQuestions(); }); };
	var getQuestions = function() { question.count({}, function(err, count) { totalQuestions = count; done(); }); };
	var done = function() {
		callback();
	}
}




exports.index = function(req, res){
	getStats(function() {
		res.render('admin/index', { 
			title: 'Admin - Index', 
			totalZombies : totalZombies, 
			totalTweets : totalTweets, 
			totalSurvivors : totalSurvivors, 
			totalQuestions : totalQuestions 
		});
	});
};

exports.stream = function(req, res){
	getStats(function() {
		res.render('admin/stream', { 
			title: 'Admin - Stream',
		});
	});
};

exports.stats = function(callback) {
	getStats(function() {
		var data = new Object;
		data.totalZombies = totalZombies;
		data.totalTweets = totalTweets;
		data.totalSurvivors = totalSurvivors;
		data.totalQuestions = totalQuestions;

		callback(data);
		return data;
	});
}

// TODO Add followers
/*
exports.getFollowers = function(callback) {
	followers.find().sort({_id : 'desc'}).exec(function foundFollowers(err, items) {
		console.log("\u001b[35m[model]\u001b[0m FOLLOWERS: getFollowers() called : ");
			if(items) {
				callback(items);
			}
		
	});
}

exports.saveFollowers = function(callback) {
	followers.find().sort({_id : 'desc'}).exec(function foundFollowers(err, items) {
		console.log("\u001b[35m[model]\u001b[0m FOLLOWERS: getFollowers() called : ");
			if(items) {
				callback(items);
			}
		
	});
} */