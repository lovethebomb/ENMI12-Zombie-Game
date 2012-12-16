/* config.js */

/* Fill the config :) */
module.exports.settings = {
	consumer_key: '',
	consumer_secret: '',
	access_token_key: '',
	access_token_secret: '',
	master_token_key : '',
	master_token_secret : ''
}

/* OLD - API KEYS */

/* TODO - Zombies auto tweets */
/* Work in progress */
/* ntwitter.createFriendship / ntwitter.destroyFriendship */
module.exports.accounts = Accounts;

function Accounts(zombies, callback) {
	var account = new Object;
	var accounts = [];
	for(var i = 0; i < zombies.length; i++) 
	{
		var ztwit = new twitter({
			consumer_key: settings.consumer_key,
			consumer_secret: settings.consumer_secret,
			access_token_key: zombies[i].token_key,
			access_token_secret: zombies[i].token_secret,
		});	

		account.twitter = ztwit;
		account.screen_name = zombies[i].twitter_screen_name;
		accounts.push(account);
	}
	console.log('[accounts] accounts list', accounts);
	callback(accounts);
}

Accounts.prototype.sendText = function(account, text, target) {
	account.twitter.verifyCredentials(function (err, data) {
		console.log(data);
	}).updateStatus(target + ' ' + text,
		function (err, data) {
			console.log('data', data);
			console.log('err', err);
		}
	);
};
