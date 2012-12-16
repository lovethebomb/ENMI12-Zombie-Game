/**
 * app.js
 * NodeJS + Twitter API + MongoDB
 * #ENMI12 - Zombie Game
 * zombie.cdnl.me
**/

/* Modules */
var express = require('express'),
	sys = require('sys'),
	routes = require('./routes'),
	http = require('http'),
	path = require('path'),
	jade = require('jade'),
	twitter = require('ntwitter'),
	fs = require('fs'),
	clc = require('cli-color'),
	settings = require('./config.js').settings;

/* CLI Colors  - Because its quite easier to colorize output :) */
var c_kill = c_error = clc.black.bgRed.bold;
var c_warn = clc.black.bgYellow;
var c_spawn = c_status = c_notice = clc.white.bgBlue;
var c_save = clc.black.bgGreen;
var c_model = clc.magenta;
var c_stream = c_server = clc.red;
var c_socket = c_rest = clc.cyan;
var c_main = clc.black.bgWhite;

/* HTTP Logfile */
var logFile = fs.createWriteStream('./server.log', {flags: 'a'}); //use {flags: 'w'} to open in write mode

/* Twitter - Configuration (API Keys) */
var twit = new twitter({
	consumer_key: settings.consumer_key,
	consumer_secret: settings.consumer_secret,
	access_token_key: settings.access_token_key,
	access_token_secret: settings.access_token_secret
});

/* Twitter - Master Zombie */
var mctwit = new twitter({
	consumer_key: settings.consumer_key,
	consumer_secret: settings.consumer_secret,
	access_token_key: settings.master_token_key,
	access_token_secret: settings.master_token_secret
});	

/* Express - Useful Methods */
function errorHandler(err, req, res, next) {
	res.status(500);
	res.render('error', { error: err });
}

function auth(user, pass) {
	console.log(c_server('[admin]') + ' ASKED ');
	return 'admin' === user && 'admin' === pass;
}

function authorized(req, res) {
	console.log(c_server('[admin]') +' ALLOWED ' + req.connection.remoteAddress);
	// res.end('authorized!');
}

/* Express - Configuration */
var app = express();

app.configure(function(){
	app.set('port', process.env.PORT || 3000);
	app.set('views', __dirname + '/views');
	app.set('view engine', 'jade');
	app.set('view options', { layout: false });
	app.use(express.favicon());
	app.use(express.bodyParser());
	app.use(express.methodOverride());
	app.use(express.logger({stream: logFile}))
	app.use(express.errorHandler());
	app.use(app.router);
	app.use(express.static(path.join(__dirname, 'public')));
});


/* Database */

var adminRoute = require('./routes/admin/index');


var server = http.createServer(app).listen(app.get('port'), function() {
	console.log(c_server('[server]') + " Express server listening on port " + app.get('port'));
});




/* Socket - DEBUG MODE ACTIVATED */
var io  = require('socket.io').listen(server, { log: true});
io.set('log level', 3);


/* Database & Models - MongoDB + Mangoose \o/ - even if I prefer otters. Or meerkats. Meerkats are awesome dude! */
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/zombiegame');

var Survivors = require('./routes/admin/survivor');
var survivors = new Survivors();
var Zombies = require('./routes/admin/zombies');
var zombies = new Zombies();
var Questions = require('./routes/admin/questions');
var questions = new Questions();
var Answers = require('./routes/admin/answers');
var answers = new Answers();
var Statistics = require('./routes/admin/statistics');
var statistics = new Statistics();
var Tweets = require('./routes/admin/tweets');
var tweets = new Tweets();

/* Routes */

/* Routes - Admin Main */
// app.get('/admin*', express.basicAuth(auth));
// app.get('/admin*', authorized);
// app.post('/admin*', express.basicAuth(auth));
// app.post('/admin*', authorized);

/* Routes - Zombies */
app.get('/admin', adminRoute.index.bind(adminRoute));
app.get('/admin/', adminRoute.index.bind(adminRoute));

app.get('/admin/question', questions.showQuestions);
app.get('/admin/question/activate/:qid', questions.activateQuestion);
app.post('/admin/question/add', questions.addQuestion);
app.get('/admin/question/end', questions.endGame);

/* Routes - Zombies */
app.get('/admin/zombie', zombies.showZombies);
app.post('/admin/zombie/add', zombies.addZombie);

/* Routes - Survivors */
app.get('/admin/survivor', survivors.showSurvivors);
app.post('/admin/survivor/add', survivors.addSurvivor);

/* Routes - Answers */
app.get('/admin/answer', answers.showAnswers);

/* Routes - Tweets */
app.get('/admin/tweet', tweets.showTweets);
app.get('/admin/stream', adminRoute.stream.bind(adminRoute));

/* Routes - Main */
app.get('/', function(req, res){ showMainPage(req, res); });

/* 404 */
app.use(function(req,res){
	console.log(c_server('[web]') +' Catched 404. ' + req.connection.remoteAddress);
    res.render('404.jade', {title: 'Conf. VS Zombies - 404 Error page!'});
});
/* SHOWTIME! */
/* Hook to twitter stream */
// enmi_mczombie vs justinbieber

console.log(c_main('[main]') + ' -- Application started');

/* Twitter - Get followers ids */
var followers;
twit.getFollowersIds('enmi_mczombie', function(nullvar, json) {
	if(json != null) {
		followers = json;
		console.log(c_rest('[rest]') +  ' REST Followers IDs ('+json.length+')', json);
		followersDone();
	}
	else {
		// Todo save followers in db
		/*
		admin.getFollowers(function(data_followers) {
			followers = data_followers;
			followersDone();
		}); */
		// followersDone();
	} 

	function followersDone(){
		initTwitter(io);
	}
}); 

/* Are we limited ? */
twit.rateLimitStatus(function(nullvar, json) {
	if(json) {
		console.log(c_status('[status]') + ' Application : ', json.resources.application);
		var t = new Date(json.resources.followers['/followers/ids'].reset * 1000);
		console.log(c_status('[status]') + ' Followers IDs : ', json.resources.followers,'[ Reset @ '+t.toLocaleString() + ' ]');
	} else {
		console.log(c_error('[error]') + ' Cannot get status from Twitter API', nullvar, json);
	}
});

function getFollowers() {
	twit.getFollowersIds('enmi_mczombie', function(nullvar, json) {
		if( json != null && json != undefined ) {
			followers = json;
			// TODO save in db
		} else {
			json = followers;
		}
		console.log(c_rest('[rest]') +  ' REST Followers IDs ('+json.length+')', json);

	}); 

	twit.rateLimitStatus(function(nullvar, json) {
		if(json) {
			console.log(c_status('[status]') + ' Application : ', json.resources.application);
			var t = new Date(json.resources.followers['/followers/ids'].reset * 1000);
			console.log(c_status('[status]') + ' Followers IDs : ', json.resources.followers, '[ Reset @ '+t.toLocaleString() + ' ]' );
		}
	});
}

setInterval(function() {
	getFollowers();
}, 60 * 1000);


function initTwitter(socket) {
	twit.stream('statuses/filter', {'track':'@enmi_mczombie'}, function( stream ) {

		/* SOCKETS */
		io.sockets.on('connection', function( socket ) {
			console.log( c_socket('[socket]') + ' connection ');
			socket.emit('You are connected ! ');
			
			/* Detect room */
			socket.on('channel', function( room ) {
				console.log( c_socket('[socket]') + ' room request ' + room);
				socket.emit('You are in room : ', room);
				socket.join(room);
			});
		});


		/* TWITTER STREAM - DATA */
		stream.on('data',function( data ){
			console.log(c_stream('[stream]') +' ['+data.created_at+']' + c_socket(' @'+data.user.screen_name)+'  '+data.text+ ' [#'+data.id_str+']');
			var found = false;
			
			// io.sockets.in('client').emit('twitter', data);
			io.sockets.in('admin').emit('twitter', data);
			// check if user is following us
			console.log(c_rest('[game]') + ' Check if ' + c_socket('@'+data.user.screen_name) + ' follow us');
			for(var i = 0; i < followers.length; i++) {
				if(!found) {
					if( data.user.id_str == followers[i] ) {
						// sync tweets to db
						syncData( data );
						found = true;
					}
				}
			}
			
			if(!found) {
				console.log(c_rest('[game]') + c_socket(' ' + data.user.screen_name)+ ' wont play with us : not following account');
				// TODO : send tweet to user to tell them to follow us if they want to play
				sendFollowUs(data);
			}
		});

		/* on end */
		stream.on('end', function (response) {
			console.log(c_stream('[stream]') +' Twitter stream end');
		});

		/* on destroy */
		stream.on('destroy', function (response) {
			console.log(c_stream('[stream]') +' Twitter stream disconnect');
		});
	});
}


/**
 * function syncData(data)
 * @param data Object
 * @desc THE BIG FUNCTION OF DEATH
 * @return void
 */
function syncData(data) {
	var answer = null;
	var user_id = null;
	questions.getCurrentQuestion( function( current_qid, solved ) {
		// console.log(c_main('[main]') +' syncData called() ['+data.created_at+'] @'+data.user.screen_name+'  '+data.text+ ' [#'+data.id_str+']');
		
		/* 1. Questions - Check if question_answers is over */
		if( current_qid !== null ) {
			if( solved == false ) {
				console.log(c_rest('[game]') + ' Game is open; lets play #' + current_qid._id + ' "'+current_qid.text+'"');
				
				/* Check if its a reply to MC account */
				if( data.in_reply_to_screen_name == 'enmi_mczombie' ) {
				
					/* Check if there is an answer */
					for ( var i = 0; i < data.entities.hashtags.length; i++ ) {
						var hash = data.entities.hashtags[i];
						if( hash.text == 'oui' ) { answer = 'oui'; }
						else if( hash.text == 'non' ) { answer = 'non'; }
						else {
							answer = null;
						}
					}
					console.log(c_rest('[game]') + ' Checking answer :', answer);
					
					if( answer != null ) {
					
						/* 2. Survivor - Check if user exists */
						
						survivors.existingSurvivor( data, function(user_id, exists ) {
							// If survivor doesn't exists, we add him
							if( user_id === null ) {
								survivors.addSurvivor( data, function(id) {
									user_id = id;
									checkAnswer();
								});
							} else {
								checkAnswer();
							}

							
							/* 3. Check user answer */
							function checkAnswer(){
								questions.checkAnswer( user_id, answer, current_qid, function( hasAlreadyAnswered, correct ) {
									if( hasAlreadyAnswered == true) {
										console.log(c_rest('[game] ') + c_socket('@'+data.user.screen_name) +' already answered that question !');
									} else {
										/* 3.1 answer is valid : Kill Zombie */
										if( correct ) {
											console.log(c_rest('[game]') + c_kill('[KILL]') +' Great! '+ c_socket('@'+data.user.screen_name) +' killed a zombie !');
											survivors.killZombie(data);
										} 
										/* 3.2 answer is invalid : Spawn Zombie */
										else {
											console.log(c_rest('[game]') + c_spawn('[SPAWN]') +' Oh noes '+ c_socket('@'+data.user.screen_name) +'! here they are !');
											survivors.spawnZombie(data);
										}
									}
									checkAnswerDone();
								} );
							}

							function checkAnswerDone() {
								checkSurvivorDone(user_id);
								return true;
							}

						}); 
					}
					else{
						checkSurvivorDone();
					}

					function checkSurvivorDone(user_id) {
						/* Add to Tweets */
						tweets.addTweet( data, answer, function( tweet_id ) {
							if( user_id !== null ) {
								/* Let's add that to survivor.answers array */
								console.log(c_rest('[game]') + ' Adding tweet to nested tweets of user ', user_id);
								survivors.addNestedTweet( data, user_id, tweet_id );
								if( answer != null )
									if( hasAlreadyAnswered == false) 
										survivors.addAnswer( user_id, tweet_id, answer, current_qid );
							}

							/* 4. Process statistics */
							adminRoute.stats( function(dataStats) {
								io.sockets.in('admin').emit('stats', dataStats);
							});
						});
					}
				}
			} else {
				console.log(c_rest('[game]') + ' Game is solved for current question; Wait for the next question (current : #' + current_qid._id + ' "'+current_qid.text+'")');
			}

		}
	

	});
}

function showMainPage(req, res) {
	console.log('showMainPage called()');
	survivors.getSurvivors( function(data) {
		res.render('index',{title: 'Conf. VS Zombies - #ENMI12 ', survivors: data});	
	});
}

function sendFollowUs(data) {
	console.log('sendFollowUs() called');
	twit.verifyCredentials(function (err, res) {
		if(err)
			console.log(c_rest('[game]') + ' WM : Auth failed', err);
		else {
			console.log(c_rest('[game]') + ' WM : Auth success ');
			sendTweet();
		}
	});

	function sendTweet() {
		twit.updateStatus('@'+ data.user.screen_name + ' Suivez ce compte pour jouer (patientez 2 minutes, Twitter synchronise)',{'in_reply_to_status_id': data.id}, function (err, res) {
			if(err)
				console.log(c_rest('[game]') + ' WM : status error', err);
			else 
				console.log(c_rest('[game]') + ' WM : followUs message sent', err);
		});
	}
	
}
