// Mongo 
var mongoose = require('mongoose')
  , Schema = mongoose.Schema;

var ZombieSchema = new Schema({
	twitter_uid     		: String,
	twitter_screen_name  	: String,
	img_url  				: String,
	token_key  				: String,
	token_secret  			: String,
	created_at 				: { type: Date, default: Date.now },
});


module.exports = mongoose.model('ZombieModel', ZombieSchema);