var mongoose = require('mongoose'), 
	survivor = require('../../models/survivors.js'),
	Zombies = require('../../models/zombies.js'),
	Answers = require('./answers.js');

module.exports = Survivors;

function Survivors() {}

/* Model Prototype */
Survivors.prototype = {
	
	/**
	 * Used in BackOffice - renders jade templates with survivors
	 * @param  {object} req app.req
	 * @param  {object} res app.res
	 * @return {function}     Return Jade render
	 */
	showSurvivors: function(req, res) {
		// console.log('passing io : ', io);
		survivor.find().sort({_id : 'desc'}).exec(function foundSurvivors(err, items) {
			console.log("\u001b[35m[model]\u001b[0m SURVIVOR: showSurvivors() called : ");

			res.render('admin/survivor',{ title: 'Admin - Survivors', survivors: items });	
			
		});
	},

	/**
	 * add survivor to the game
	 * @param {array}   data     Survivor data from syncData
	 * @param {Function} callback generic callback
	 */
	addSurvivor: function( data, callback) {
		console.log("\u001b[35m[model]\u001b[0m SURVIVOR: addSurvivor() called : ", data.user.screen_name);
		
		/* Zombies list */
		Zombies.find({}, '_id', function foundZombies(err, items) {
			console.log("\u001b[35m[model]\u001b[0m SURVIVOR: retrieve zombies list: ");
			var zombies = items;

			add(zombies);
		});

		function add(zombies) {
			/* Add the survivor */
			survivor.count({}, function( err, count){
				/* Count Survivors */
	    		console.log( "\u001b[35m[model]\u001b[0m SURVIVOR: Survivors Total:", count );

	    		/* Add */
				var item = data;
				newSurvivor = new survivor();

				newSurvivor.twitter_uid = item.user.id;
				newSurvivor.twitter_screen_name = item.user.screen_name;
				newSurvivor.twitter_profile_img_url = item.user.profile_image_url;
				newSurvivor.twitter_name = item.user.name;
				newSurvivor.twitter_url = item.user.url;
				newSurvivor.twitter_profile_background_color = item.user.profile_background_color;
				newSurvivor.zombies = zombies;
				newSurvivor.zombies_count = zombies.length;

				newSurvivor.save(function savedSurvivor(err, doc){
					if(err) {
						throw err;
					}
					console.log("\u001b[35m[model]\u001b[0m\u001b[42m\u001b[30m[SAVED]\u001b[0m addSurvivor() saved : ", doc._id, doc.twitter_screen_name);

					// Callback
					typeof callback === 'function' && callback(doc._id);
					return this;
				});
			});
		}

		// TODO : assign zombies
	},

	
	/**
	 * check if the survivor is already in DB
	 * @param  {array}   data     survivor data
	 * @param  {Function} callback 
	 * @return {object}
	 */	
	existingSurvivor: function( data, callback ) {

		console.log("\u001b[35m[model]\u001b[0m SURVIVOR: existingSurvivor() called : ", data.user.screen_name);
		var found = false;
		survivor.findOne({ twitter_uid: data.user.id }, function (err, doc){
			if( doc != null ) {
				console.log('\u001b[35m[model]\u001b[0m SURVIVOR: Already found a survivor with that id, skipping : ', doc.twitter_screen_name);
				found = true;
				user_id = doc._id;
			} else {
				console.log('\u001b[35m[model]\u001b[0m SURVIVOR: No survivors found, adding @' + data.user.screen_name + '(#' + data.user.id + ').');
				user_id = null;
			}
			
			// Callback
			typeof callback === 'function' && callback(user_id, found);
			return this;
		});
	},

	/**
	 * add tweet to nested object_ids list tweets
	 * @param {array}   data     Tweet data
	 * @param {Function} callback 
	 */
	addNestedTweet: function( data, user_id, tweet_id, callback ) {
		console.log("\u001b[35m[model]\u001b[0m SURVIVOR: addNestedTweet() called : ", data.user.screen_name, tweet_id);

		survivor.update({ _id: user_id }, { $push: { tweets: tweet_id }, $inc: { tweets_count: 1 } }, {}, function( err, numAffected) {
			console.log("\u001b[35m[model]\u001b[0m SURVIVOR: pushing nested tweet : ", tweet_id, err, numAffected);
		});

	},


	/**
	 * kill a zombie following survivor
	 * @param  {array} data survivor_data
	 * @return {function}      callback
	 */
	killZombie: function(data, callback) {
		console.log("\u001b[35m[model]\u001b[0m SURVIVOR: killZombie() called : ", data.user.id);
		/* Check for zombie */
		// TODO count zombies before killing them
		
		survivor.findOne({ twitter_uid: data.user.id }, function foundZombies(err, items) {
			
			if( items.zombies.length > 0 ) {
				survivor.findByIdAndUpdate( items._id, { $inc: { zombies_count: -1 }, $inc: { zombies_killed: 1 }, $pull: {zombies: { _id: items.zombies[items.zombies.length-1] }} }, function( err, num) {
					console.log("\u001b[35m[model]\u001b[0m SURVIVOR: updated killed zombie list : ", err);
				});
			} else {
				console.log("\u001b[35m[model]\u001b[0m SURVIVOR: cannot add zombie, already killed 'em all: ");
			}
			
		});
	
		// Callback
		typeof callback === 'function' && callback();
		return this;
	},

	/**
	 * spawn a zombie for a survivor
	 * @param  {array} data survivor_data
	 * @return {function}      callback
	 */
	spawnZombie: function(data, callback) {
		console.log("\u001b[35m[model]\u001b[0m SURVIVOR: spawnZombie() called : ", data.user.id);
		/* Check for zombie */
		// TODO count zombies before spawn them
		
		survivor.findOne({ twitter_uid: data.user.id }, function foundZombies(err, items) {
			console.log("\u001b[35m[model]\u001b[0m SURVIVOR: actual zombies on survivor: ", items.zombies);
			
			// Find remaining zombies
			Zombies.find({_id: {$nin: items.zombies}}, '_id', function foundZombies(err, zom) {
				console.log("\u001b[35m[model]\u001b[0m SURVIVOR: retrieve remaining zombies list: ", zom);
				
				if( zom.length > 0 ) {
					survivor.findByIdAndUpdate( items._id, { $inc: { zombies_count: 1 }, $push: {zombies: zom[0] } }, function( err, num) {
						console.log("\u001b[35m[model]\u001b[0m SURVIVOR: updated spawned zombie list : ", err, num);
					});
				} else {
					console.log("\u001b[35m[model]\u001b[0m SURVIVOR: cant add zombies, already at max! : ");
				}
			});
			
		});
	
		// Callback
		typeof callback === 'function' && callback();
		return this;
	},


	/**
	 * check if survivor has zombies on him - TODO 
	 * @param  {[type]}   data     [description]
	 * @param  {Function} callback [description]
	 * @return {Boolean}           [description]
	 */
	hasZombies: function(data, callback) {
		console.log("\u001b[35m[model]\u001b[0m SURVIVOR: hasZombies() called : ", data.user.id);
		var count;
		/* Check for zombie */
		survivor.findOne({ twitter_uid: data.user.id }, function (err, doc){
			if( doc != null ) {
				console.log('\u001b[35m[model]\u001b[0m SURVIVOR: Already found a survivor with that id, skipping : ', doc.twitter_screen_name);
				found = true;
				user_id = doc._id;
			} else {
				console.log('\u001b[35m[model]\u001b[0m SURVIVOR: No survivors found, adding @' + data.user.screen_name + '(#' + data.user.id + ').');
				user_id = null;
			}
			
			// Callback
			callback(user_id, found);
			return this;
		});

		// Callback
		typeof callback === 'function' && callback();
		return this;
	},


	/**
	 * add answer to answers model and to survivor model
	 * @param {object_id}   user_id   
	 * @param {object_id}   tweet_id  
	 * @param {object_id}   answer_id 
	 * @param {object_id}   qid      
	 * @param {Function} callback 
	 */
	addAnswer: function( user_id, tweet_id, answer_id, qid, callback ) {
		console.log("\u001b[35m[model]\u001b[0m SURVIVOR: Survivor.addAnswer() called : ");
		
    		/* Add */
    		answer = new Answers();
			answer.addAnswer(tweet_id, answer_id, qid, function(doc) {

				survivor.update({ _id: user_id }, { $push: { answers: doc._id }, $inc: { answers_count: 1 } }, {}, function( err, numAffected) {
					console.log("\u001b[35m[model]\u001b[0m SURVIVOR: pushed nested answers : ", doc._id, err, numAffected);
				});

			});

			
			// Callback
			typeof callback === 'function' && callback(created_id);
			return this;
	},

	/**
	 * Used in FrontOffice - returns nice survivors json
	 * @return {function} returns nice survivors json
	 */
	getSurvivors: function(callback) {
		// console.log('passing io : ', io);
		survivor.find().sort({zombies_killed: 'desc'}).exec(function foundSurvivors(err, items) {
			console.log("\u001b[35m[model]\u001b[0m SURVIVOR: getSurvivors() called : ");

			
			var survivors = [];
			for(var i = 0; i < items.length; i++)
			{
				var survivor = new Object;
				survivor._id = items[i]._id;
				survivor.screen_name = items[i].twitter_screen_name;
				survivor.zombies = items[i].zombies_count;
				survivor.zombies_killed = items[i].zombies_killed;
				
		        //var img = items[i].twitter_profile_img_url.substring(0, items[i].twitter_profile_img_url.length-11) +'.png';
       			img = items[i].twitter_profile_img_url;
   				survivor.img = img;
				survivor.bgColor = items[i].twitter_profile_background_color;
				survivors.push(survivor);
			}
			
			// Callback
			typeof callback === 'function' && callback(survivors);
			return this;
		});
	},
}