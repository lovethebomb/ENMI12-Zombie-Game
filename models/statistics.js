// Mongo 
var mongoose = require('mongoose')
  , Schema = mongoose.Schema;

var AnswerSchema = new Schema({
	answer      : Boolean,
	question_id  : String,
	survivor_id : String,
	answered_at : { type: Date, default: Date.now },
});


module.exports = mongoose.model('AnswerModel', AnswerSchema);