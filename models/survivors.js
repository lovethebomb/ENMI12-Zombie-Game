// Mongo 
var mongoose = require('mongoose'), 
	Schema = mongoose.Schema,
	Answers = require('./answers.js');

var SurvivorSchema = new Schema({
	twitter_uid      		: String,
	twitter_screen_name 	: String,
	twitter_profile_img_url : String,
	twitter_name  			: String,
	twitter_url 			: String,
	twitter_profile_background_color 			: String,
	answers					: [Answers],
	answers_count			: { type: Number, default: 0},
	tweets 					: [Schema.Types.ObjectId],
	tweets_count			: { type: Number, default: 0},
	zombies 				: [{ "_id" : Schema.Types.ObjectId}],
	zombies_count			: { type: Number, default: 0},
	zombies_killed			:  { type: Number, default: 0},
	created_at : { type: Date, default: Date.now },
});


module.exports = mongoose.model('SurvivorModel', SurvivorSchema);