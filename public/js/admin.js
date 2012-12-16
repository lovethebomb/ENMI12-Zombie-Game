/* client.js */
 console.log('# client.js loaded');
 var url = '/socket.io/socket.io.js';

 $.ajax({
	url: url,
	dataType: 'script',
	success: startSocket,
	error: errorSocket
});

/**
 * function startSocket()
 * @desc Create and manage socket
 * @return void
 */
function startSocket() {
	/* Create socket */
	var socket = io.connect();

	/* Get some output */
	socket.on('connecting', function() {
		console.log('[socket] connecting');
	});
	socket.on('connect', function() { 
		console.log('[socket] connected'); 
		socket.emit('channel', 'admin');

		/* Manage twitter */
		socket.on('twitter', function(data) {
			// console.log('[tweet] :', data);

			var replacePattern = /(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gim;
			var replacedText = (data.text).replace(replacePattern, '<a href="$1" target="_blank">$1</a>');
			$("<li></li>").html("<span class='date'>" + data.created_at +"</span>  <span class='user'>" + data.user.screen_name + "</span> <p>" + replacedText+"</p>")
			.prependTo("ul#stream")
			.css({opacity:0}).slideDown("slow").animate({opacity:1},"slow");

		});

		/* Manage stats */
		socket.on('stats', function(data) {
			// console.log('[stats] :', data);

			$("div#stats div#tweets span").html(data.totalTweets).css({opacity:0}).slideDown("slow").animate({opacity:1},"fast");
			$("div#stats div#zombies span").html(data.totalZombies).slideDown("slow");
			$("div#stats div#questions span").html(data.totalQuestions).slideDown("slow");
			$("div#stats div#survivors span").html(data.totalSurvivors).slideDown("slow");
		});
	});
	socket.on('connect_failed', function() {
		console.log('[socket] lost connectiong');
	});

	socket.on('message', function (msg) {
      console.log('[socket] WOOT GOT A MESSAGE', msg);
    });

}

/* Unusable at this time */
/**
 * function errorSocket()
 * @desc Return error if socket(url) cannot be found
 * @return void
 */
function errorSocket() {
	console.log('[socket] Error: Could not load socket, nodejs server is down ?');
}