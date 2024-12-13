// services/questionService.js

const { Question, Option } = require('../models');
const { v4: uuidv4 } = require('uuid');

// Create a new question
exports.createQuestion = async (quizID, questionData) => {
  const { 
    questionText, 
    questionType, 
    correctAnswer,
    difficulty,
    timeLimit,
    options 
  } = questionData;

  console.log('Creating question with data:', questionData); // Debug log

  // Create the question
  const question = await Question.create({
    questionID: uuidv4(),
    questionText,
    questionType,
    correctAns: questionType === 'TRUE_FALSE' ? correctAnswer.toString() : null,
    source: 'manual',
    difficulty,
    timeLimit
  });

  // Handle different question types
  if (questionType === 'TRUE_FALSE') {
    // Create True/False options
    await Promise.all([
      Option.create({
        optionID: uuidv4(),
        questionID: question.questionID,
        optionText: 'True',
        isCorrect: correctAnswer === true
      }),
      Option.create({
        optionID: uuidv4(),
        questionID: question.questionID,
        optionText: 'False',
        isCorrect: correctAnswer === false
      })
    ]);
  } else if (questionType === 'MCQ' && Array.isArray(options)) {
    // Create MCQ options
    await Promise.all(options.map(option => 
      Option.create({
        optionID: uuidv4(),
        questionID: question.questionID,
        optionText: option.text,
        isCorrect: option.isCorrect
      })
    ));
  }

  // Return the question with its options
  return Question.findOne({
    where: { questionID: question.questionID },
    include: [{
      model: Option,
      as: 'options'
    }]
  });
};

// Get a question by ID
exports.getQuestionById = async (questionID) => {
  const question = await Question.findOne({
    where: { questionID },
    include: [
      {
        model: Option,
        as: 'options',
        attributes: ['optionID', 'optionText', 'isCorrect'],
      },
    ],
  });

  return question;
};

// Update a question
exports.updateQuestion = async (questionID, updateData) => {
  const question = await Question.findByPk(questionID);
  if (!question) return null;

  await question.update(updateData);

  if (updateData.questionType === 'MCQ' && updateData.options && updateData.options.length >= 2) {
    await Option.destroy({ where: { questionID } });
    const optionRecords = updateData.options.map(opt => ({
      optionText: opt.optionText,
      isCorrect: opt.isCorrect,
      questionID: question.questionID,
    }));
    await Option.bulkCreate(optionRecords);
  }

  return question;
};

// Delete a question
exports.deleteQuestion = async (questionID) => {
  const deleted = await Question.destroy({ where: { questionID } });
  return deleted > 0;
};

// Find a question by text
exports.findQuestionByText = async (questionText) => {
  const question = await Question.findOne({
    where: { questionText },
    include: [
      {
        model: Option,
        as: 'options',
        attributes: ['optionID', 'optionText', 'isCorrect'],
      },
    ],
  });

  return question;
};
