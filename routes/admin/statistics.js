var mongoose = require('mongoose'), 
	statistic = require('../../models/statistics.js');

module.exports = Statistics;


function Statistics(connection) {
	// mongoose.connect(connection);
}

/* Model Prototype */
Statistics.prototype = {
	/**
	* function showStatistics( req, res )
	* @return items 
	*/
	showStatistics: function(req, res) {
		statistic.find(function foundStatistics(err, items) {
			console.log("\u001b[35m[model]\u001b[0m showStatistics() called : ");
			// console.log("[items] found statistics items", items);
			// io.emit('statistics', items);
			// return items;
			res.render('admin/statistic', {title: 'Conf vs Statistics - Admin : Statistics', statistics: items} );

		});
	},


	/**
	* function addAnswer( req, res )
	* @return items 
	*/
	addAnswer: function( data, io, callback ) {
		console.log("\u001b[35m[model]\u001b[0m addAnswer() called : ");
		
		statistic.count({}, function( err, count){
			/* Count Statistics */
    		console.log( "\u001b[35m[model]\u001b[0m  Statistics Total:", count );
    		

    		/* Add */
			var item = req.body.item;
			newAnswer = new statistic();
			newAnswer.statistic = data.statistic;
			newAnswer.question_id = data.question_id;
			newAnswer.survivor_id = data.survivor_id;
			newAnswer.statisticed_at = data.statisticed_at;
			

			newAnswer.save(function savedAnswer(err, doc){
				if(err) {
					throw err;
				}

				var created_id = doc._id;
				console.log("\u001b[35m[model]\u001b[0m \u001b[42m\u001b[30mSAVED\u001b[0m addAnswer() saved : ", newAnswer);
				// Callback
				typeof callback === 'function' && callback(created_id);
				return this;
				// io.emit('statistic', newAnswer);
			});
		});

		res.redirect('/admin/statistic');
	},

	/**
	* function existingAnswer( req, res )
	* @desc check if statistic is already registered or not
	* @return items 
	*/
	existingAnswer: function( data ) {
		console.log("\u001b[35m[model]\u001b[0m existingAnswer() called : ", data);
		statistic.count({}, function( err, count){
    		console.log( "Records:", count );
  		});
	},

	/**
	* function addAnswer( req, res )
	* @return items 
	*/
	activateAnswer: function( req, res ) {
		console.log("\u001b[35m[model]\u001b[0m activateAnswer() called : ");
		
		var statistic_id = req.params.qid;
		console.log(req.params);

		// Lookup for the older statistic
		statistic.findOne({ active: 1}, function (err, doc){
			// doc is a Document
			if(doc != null) {
				console.log("\u001b[35m[model]\u001b[0m A statistic is already activated, switching up: ");
		
				// Deactivate current statistic
				doc.active = 0;
					doc.save();
			} 

			// Activate new questi
			statistic.findOne({ _id: statistic_id }, function (err, doc){
				doc.active = true;
				doc.save();
				console.log("\u001b[35m[statistic]\u001b[0m New statistic activated!", doc);
				
				res.redirect('/admin/statistic');
			});
		});


		// io.emit('statistic', newAnswer);

	},
}