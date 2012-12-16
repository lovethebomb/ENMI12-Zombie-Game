var mongoose = require('mongoose'), 
	answer = require('../../models/answers.js');

module.exports = AnswersList;


function AnswersList() {}

/* Model Prototype */
AnswersList.prototype = {
	/**
	 * Used in BackOffice - renders jade templates with answers
	 * @param  {object} req app.req
	 * @param  {object} res app.res
	 * @return {function}     Return Jade render
	 */
	showAnswers: function(req, res) {
		answer.find().sort({_id : 'desc'}).exec(function foundAnswers(err, items) {
			console.log("\u001b[35m[model]\u001b[0m ANSWER: showAnswers() called : ");
			
			res.render('admin/answer', {title: 'Admin - Answers', answers: items} );
		});
	},


	/**
	 * called from survivor.addAnswer
	 * @param {ObjectID}   tweet_id  
	 * @param {ObjectID}   answer_id 
	 * @param {ObjectID}   qid       
	 * @param {Function} callback  
	 */
	addAnswer: function( tweet_id, answer_id, qid, callback ) {
		console.log("\u001b[35m[model]\u001b[0m ANSWER: addAnswer() called : ");
		
    		/* Add */
			newAnswer = new answer();
			newAnswer.tweet = tweet_id;
			newAnswer.answer = answer_id;
			newAnswer.question = qid;
			

			newAnswer.save(function savedAnswer(err, doc){
				if(err) {
					throw err;
				}

				console.log("\u001b[35m[model]\u001b[0m \u001b[42m\u001b[30mSAVED\u001b[0m addAnswer() saved : ");
				// Callback
				typeof callback === 'function' && callback(doc);
				return this;
			});
	},

	/**
	* function existingAnswer( req, res )
	* @desc check if answer is already registered or not
	* @return items 
	*/
	// TODO
	existingAnswer: function( data ) {
		console.log("\u001b[35m[model]\u001b[0m ANSWER: existingAnswer() called : ", data);
		answer.count({}, function( err, count){
    		console.log( "Records:", count );
  		});
	},

}