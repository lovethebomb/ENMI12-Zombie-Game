// Mongo 
var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	Tweets = require('./tweets.js'),
	Questions = require('./questions.js');

var AnswersSchema = new Schema({
	tweet      		: [Schema.Types.ObjectId],
	answer    		: String,
	question 		: [Schema.Types.ObjectId],
});


module.exports = mongoose.model('AnswersModel', AnswersSchema);