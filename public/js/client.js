/* client.js */
 console.log('# client.js loaded');
 var url = '/socket.io/socket.io.js';

 $.ajax({
	url: url,
	dataType: 'script',
	success: startSocket,
	error: errorSocket
});

/* Twitter - load widgets.js & follow button */
  window.twttr = (function (d,s,id) {
    var t, js, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) return; js=d.createElement(s); js.id=id;
    js.src="//platform.twitter.com/widgets.js"; fjs.parentNode.insertBefore(js, fjs);
    return window.twttr || (t = { _e: [], ready: function(f){ t._e.push(f) } });
  }(document, "script", "twitter-wjs"));


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
		socket.emit('channel', 'client');


		/* Manage twitter */
		socket.on('twitter', function(data) {
			console.log('[tweet] :', data);

			var replacePattern = /(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gim;
			var replacedText = (data.text).replace(replacePattern, '<a href="$1" target="_blank">$1</a>');
			$("<li></li>").html("<div class=\"g\"><div class=\"c1\">[" + data.user.screen_name + "]</div> <div class=\"c2\">▸</div> " + "<div class=\"c3\"><font color=\"red\">" + replacedText + "</font></div></div>")
			.prependTo("ul#tweets")
			.css({opacity:0}).slideDown("slow").animate({opacity:1},"slow");

		});
	});
	socket.on('connect_failed', function() {
		console.log('[socket] lost connectiong');
	});

	socket.on('message', function (msg) {
      console.log('[socket] WOOT GOT A MESSAGE');
    });

	socket.on('survivor', function(data) {
		console.log('[survivor]',data);
	});

	/* Zombies */
	socket.on('zombies', function(data) {
		console.log('[zombies]',data);
	});


	/* Hook twitter click event */
	twttr.ready(function (twttr) {
		twttr.events.bind('follow',   followTwitter);
		console.log('clikdo n follow button');
	}

	function followTwitter(intent_event) {
	    if (intent_event) {
	      var label = intent_event.data.user_id + " (" + intent_event.data.screen_name + ")";
	      socket.emit('follower', follower);
	    };
  	}
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