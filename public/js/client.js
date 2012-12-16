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
/* As we can design web intents buttons and they mess up things, currently desactivated
  window.twttr = (function (d,s,id) {
    var t, js, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) return; js=d.createElement(s); js.id=id;
    js.src="//platform.twitter.com/widgets.js"; fjs.parentNode.insertBefore(js, fjs);
    return window.twttr || (t = { _e: [], ready: function(f){ t._e.push(f) } });
  }(document, "script", "twitter-wjs"));
*/

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


/* Timer */

$(function() {
	console.log('timer loaded');
	var endDate = new Date("Dec 17 16:30:00 2012");
	var compteRebours = new CompteARebours(endDate);
});

function CompteARebours(date) {
	var self = this;
	this.date = date;
	this.setCompte(date);

	window.setInterval(function(){
		self.setCompte(self.date);
	}, 1000);
}

CompteARebours.prototype.setCompte = function(date) {

	this.endDate = date;
	// On récup la date actuelle
	var currentDate = new Date();
	// Nombre de secondes restantes (= nb millisecondes / 1000)
	var secondeRestantes = (this.endDate - currentDate) / 1000;
	// Nombre heures restantes (on tronque le result a la virgule)
	var heuresRestantesWithSeconds = secondeRestantes / (60*60);
	var heuresRestantes = Math.floor(heuresRestantesWithSeconds);
	// On récup la valeur à droite de la virgule pour avoir les minutes
	var minutesRestantesWithSeconds = (heuresRestantesWithSeconds - heuresRestantes) * 60;  
	// On tronque à la virgule 
	var minutesRestantes = Math.floor(minutesRestantesWithSeconds);
	// Récup du nombre a droite de la virgule pour le nombre de secondes restantes
	var secondesWithMilliSeconds = (minutesRestantesWithSeconds - minutesRestantes) * 60;
	var secondesRestantes = Math.floor(secondesWithMilliSeconds);
	// On ajoute un 0 devant les unités si < 10

	if (heuresRestantes < 10) {
		(heuresRestantes).toString();
		heuresRestantes = '0'+heuresRestantes;
		$("span#hours").html('');

	} else {(heuresRestantes).toString();}

	if (minutesRestantes < 10) {

		(minutesRestantes).toString();
		minutesRestantes = '0'+minutesRestantes;
		$("span#minutes").html('');

	} else {
		(minutesRestantes).toString();

	}

	if (secondesRestantes < 10) {

		(secondesRestantes).toString();
		secondesRestantes = '0'+secondesRestantes;
		$("span#seconds").html('');


	} else {
		(secondesRestantes).toString();
	}



	if ((this.endDate - currentDate) <= 0) {

		heuresRestantes = "00";
		minutesRestantes = "00";
		secondesRestantes = "00";

	}

	$("span#hours").html(heuresRestantes);
	$("span#minutes").html(minutesRestantes);
	$("span#seconds").html(secondesRestantes);

}
