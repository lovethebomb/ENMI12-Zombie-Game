var mongoose = require('mongoose'), 
	zombie = require('../../models/zombies.js');

module.exports = ZombiesList;


function ZombiesList() {}

/* Model Prototype */
ZombiesList.prototype = {
	/**
	 * Used in BackOffice - renders jade templates with zombies
	 * @param  {object} req app.req
	 * @param  {object} res app.res
	 * @return {function}     Return Jade render
	 */
	showZombies: function(req, res) {
		zombie.find().sort({_id : 'desc'}).exec(function foundZombies(err, items) {
			console.log("\u001b[35m[model]\u001b[0m ZOMBIE: showZombies() called : ");

			res.render('admin/zombie', {title: 'Admin - Zombies', zombies: items} );
		});
	},

	/**
	 * Used in BackOffice - renders jade templates with zombie - add zombie data
	 * @param  {object} req app.req
	 * @param  {object} res app.res
	 * @return {function}     Return Jade render
	 */
	addZombie: function( req, res ) {
		console.log("\u001b[35m[model]\u001b[0m ZOMBIE: addZombie() called : ");
		
		zombie.count({}, function( err, count){
			/* Count Zombies */
    		console.log( "\u001b[35m[model]\u001b[0m  ZOMBIE: Zombies Total:", count );
    		

    		/* Add */
			var item = req.body.item;
			newZombie = new zombie();
			newZombie.twitter_uid = item.twitter_uid;
			newZombie.twitter_screen_name = item.twitter_screen_name;
			newZombie.img_url = item.img_url;
			newZombie.token_key = item.token_key;
			newZombie.token_secret = item.token_secret;
			

			newZombie.save(function savedZombie(err){
				if(err) {
					throw err;
				}
				console.log("\u001b[35m[model]\u001b[0m \u001b[42m\u001b[30mSAVED\u001b[0m addZombie() saved : ", newZombie);

				res.redirect('/admin/zombie');
			});
		});

	},
}