// Mongo 
var mongoose = require('mongoose')
  , Schema = mongoose.Schema;

var QuestionSchema = new Schema({
	text      : String,
	answer  : String,
	active : { type:  Boolean, default: false },
	solved : { type:  Boolean, default: false },
	created_at : { type: Date, default: Date.now },
	solved_by : [Schema.Types.ObjectId],
	answered_by : [Schema.Types.ObjectId],
	answered: Number,
});


module.exports = mongoose.model('QuestionModel', QuestionSchema);