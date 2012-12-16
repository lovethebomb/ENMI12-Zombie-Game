var mongoose = require('mongoose'), 
	question = require('../../models/questions.js');

module.exports = Questions;

function Questions() {}

/* Model Prototype */
Questions.prototype = {
	/**
	 * Used in BackOffice - renders jade templates with questions
	 * @param  {object} req app.req
	 * @param  {object} res app.res
	 * @return {function}     Return Jade render
	 */
	showQuestions: function(req, res) {
		question.find().sort({_id : 'desc'}).exec(function foundQuestions(err, items){
			console.log("\u001b[35m[model]\u001b[0m QUESTION: showQuestions() called : ");
			
			res.render('admin/question', {title: 'Admin - Questions', questions: items} );
		});
	},


	/**
	 * Used in BackOffice - add question and redirect to jade template
	 * @param  {object} req app.req
	 * @param  {object} res app.ees
	 * @return {function}     Return Jade render
	 */
	addQuestion: function( req, res ) {
		console.log("\u001b[35m[model]\u001b[0m QUESTION: addQuestion() called : ");
		
		question.count({}, function( err, count){
			/* Count Questions */
    		console.log( "\u001b[35m[model]\u001b[0m  QUESTION: Questions Total:", count );
    		

    		/* Add */
			var item = req.body.item;
			newQuestion = new question();
			newQuestion.text = item.text;
			newQuestion.answer = item.answer;
			

			newQuestion.save(function savedQuestion(err){
				if(err) {
					throw err;
				}
				console.log("\u001b[35m[model]\u001b[0m \u001b[42m\u001b[30mSAVED\u001b[0m QUESTION: addQuestion() saved : ");
			});
		});

		res.redirect('/admin/question');
	},

	/**
	* function existingQuestion( req, res )
	* @desc check if question is already registered or not
	* @return items 
	*/
	existingQuestion: function( data ) {
		console.log("\u001b[35m[model]\u001b[0m QUESTION: existingQuestion() called : ", data);
		question.count({}, function( err, count){
    		console.log( "Records:", count );
  		});
	},

	/**
	 * Used in BackOffice - renders jade templates with question - activate a question
	 * @param  {object} req app.req
	 * @param  {object} res app.ees
	 * @return {function}     Return Jade render
	 */
	activateQuestion: function( req, res ) {
		console.log("\u001b[35m[model]\u001b[0m QUESTION: activateQuestion() called : ");
		
		var question_id = req.params.qid;
		console.log(req.params);

		// Lookup for the older question
		question.findOne({ active: 1}, function (err, doc){
			// doc is a Document
			if(doc != null) {
				console.log("\u001b[35m[model]\u001b[0m QUESTION: A question is already activated, switching up: ");
		
				// Deactivate current question
				doc.active = 0;
				doc.save();
			} 

			// Activate new question
			question.findOne({ _id: question_id }, function (err, doc){
				doc.active = true;
				doc.save();
				console.log("\u001b[35m[question]\u001b[0m QUESTION: New question activated!", doc);

				res.redirect('/admin/question');
			});
		});

	},

	/**
	 * Called from app.js to get current question activated
	 * @param  {Function} callback 
	 * @return {question} question
	 */
	getCurrentQuestion: function( callback ) {
		console.log("\u001b[35m[model]\u001b[0m QUESTION: getCurrentQuestion() called : ");
		var solved = false;
		// Lookup for the older question
		question.findOne({ active: 1}, function (err, doc){
			// doc is a Document
			if(doc != null) {
				if( doc.solved == true || ( doc.answered >= 5 && doc.answered != undefined ) ) {
					solved = true;
				}
				console.log("\u001b[35m[question]\u001b[0m QUESTION: Current question is : ", doc._id, doc.solved, doc.answered, solved);
			} 
			else {
				console.log("\u001b[35m[question]\u001b[0m QUESTION: ERROR, NO QUESTION FOR THE CURRENT GAME !!! ");	
			}


			// Callback
			callback(doc, solved);
			return doc;
		});
	},

	/**
	 * check the validity of an answer
	 * @param  {boolean}   answer   
	 * @param  {ObjectID}   qid      
	 * @param  {Function} callback 
	 * @return {Boolean} return true or false if question is correct
	 */
	checkAnswer: function( user_id, answer, qid, callback ) {
		var correct = hasAlreadyAnswered = isSolved = false;
		console.log("\u001b[35m[model]\u001b[0m QUESTION: checkAnswer() called. Params: ", user_id, answer, qid._id);
		answer = (answer == 'oui' ? '1' : '0');
		
		// Lookup for the last question
		question.findOne({ _id: qid, answered_by: {$nin : [user_id]}}, function (err, doc){
			// doc is a Document
			if(doc != null) {

				if( doc.answer == answer ) {
					correct = true;
				
					if( doc.answered == 4 )
						isSolved = true;

					// Push in solved_by all correct answers
					question.update({ _id: qid }, { $push: { solved_by: user_id }, $inc: { answered: 1 } , solved: isSolved}, {}, function( err, numAffected) {
						console.log("\u001b[35m[model]\u001b[0m QUESTION: pushed solvers and incremented answered : ", doc._id, err, numAffected);
					});
				}
				// Push in answered_by everyone who answered even if they failed
				question.update({ _id: qid }, { $push: { answered_by: user_id } }, {}, function( err, numAffected) {
					console.log("\u001b[35m[model]\u001b[0m QUESTION: pushed answered_by: ", doc._id, err, numAffected);
				});
			} 
			else {
				hasAlreadyAnswered = true;
				console.log("\u001b[35m[question]\u001b[0m QUESTION: ERROR, no question found for this qid OR player already answered! ");	
			}

			// Callback
			callback(hasAlreadyAnswered, correct);
			return correct;
		});
	},

	/**
	 * Used in BackOffice - end game state - deactivate all questions
	 * @param  {object} req app.req
	 * @param  {object} res app.ees
	 * @return {function}     Return Jade render
	 */
	endGame: function( req, res ) {
		console.log("\u001b[35m[model]\u001b[0m QUESTION: endGame() called : ");
		
		// Lookup for the older question
		question.update({}, { active: false }, {multi: true}, function( err, numAffected) {
			console.log("\u001b[35m[model]\u001b[0m QUESTION: desactivated all questions : ", err, numAffected);
		});

		res.redirect('/admin/question');
	},
}