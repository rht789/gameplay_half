// controllers/questionController.js

const { Question, Quiz, Subtopic, Option, sequelize, Quiz_Question } = require('../models');
const { v4: uuidv4 } = require('uuid');
const questionService = require('../services/questionService');

// Create a new question under a specific quiz
exports.createQuestion = async (req, res) => {
  try {
    const { quizId } = req.params;
    
    // Check if quiz is finalized
    const quiz = await Quiz.findOne({
      where: { quizID: quizId }
    });

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    if (quiz.status === 'ready') {
      return res.status(403).json({
        success: false,
        message: 'Cannot add questions to a finalized quiz'
      });
    }

    const transaction = await sequelize.transaction();
    
    try {
      const { questionType, options, questionText, difficulty, timeLimit, correctAns } = req.body;

      // Validate MCQ has at least one correct answer
      if (questionType === 'MCQ' && !options.some(opt => opt.isCorrect)) {
        return res.status(400).json({
          success: false,
          message: 'MCQ questions must have at least one correct answer'
        });
      }

      // Determine correct answer based on question type
      let finalCorrectAns = '';
      switch (questionType) {
        case 'MCQ':
          finalCorrectAns = options
            .filter(opt => opt.isCorrect)
            .map(opt => opt.text)
            .join(',');
          break;
        case 'TRUE_FALSE':
          finalCorrectAns = options.find(opt => opt.isCorrect)?.text || 'True';
          break;
        case 'FILL_IN_THE_BLANKS':
        case 'SHORT_ANSWER':
          finalCorrectAns = correctAns || ''; // Use the directly provided correct answer
          break;
        default:
          finalCorrectAns = '';
      }

      // Create the question
      const question = await Question.create({
        questionID: uuidv4(),
        questionText,
        questionType,
        correctAns: finalCorrectAns,
        source: 'manual',
        difficulty,
        timeLimit
      }, { transaction });

      // Create options only for MCQ and TRUE_FALSE
      if (['MCQ', 'TRUE_FALSE'].includes(questionType) && options?.length > 0) {
        const optionsData = options.map(opt => ({
          optionID: uuidv4(),
          questionID: question.questionID,
          optionText: opt.text,
          isCorrect: opt.isCorrect
        }));

        await Option.bulkCreate(optionsData, { transaction });
      }

      // Create Quiz_Question association
      await Quiz_Question.create({
        quizID: quizId,
        questionID: question.questionID
      }, { transaction });

      await transaction.commit();

      // Fetch the created question with its options
      const createdQuestion = await Question.findByPk(question.questionID, {
        include: [{
          model: Option,
          as: 'options'
        }]
      });

      res.status(201).json({
        success: true,
        message: 'Question created successfully',
        data: createdQuestion
      });

    } catch (error) {
      await transaction.rollback();
      console.error('Error creating question:', error);
      res.status(500).json({
        success: false,
        message: 'Error creating question',
        error: error.message
      });
    }
  } catch (error) {
    console.error('Error creating question:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating question'
    });
  }
};

// Get all questions (optional)
exports.getAllQuestions = async (req, res) => {
  try {
    const questions = await Question.findAll({
      include: [
        {
          model: Subtopic,
          as: 'subtopic',
          attributes: ['subtopicID', 'subtopicName'],
        },
        {
          model: Option,
          as: 'options',
          attributes: ['optionID', 'optionText', 'isCorrect'],
        },
        {
          model: Quiz,
          as: 'quizzes',
          attributes: ['quizID', 'quizName'],
          through: { attributes: [] }, // Exclude join table attributes
        },
      ],
    });

    res.status(200).json({ success: true, data: questions });
  } catch (error) {
    console.error('Error fetching questions:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

// Get a specific question by ID (optional)
exports.getQuestionById = async (req, res) => {
  const { questionID } = req.params;

  try {
    const question = await Question.findOne({
      where: { questionID },
      include: [
        {
          model: Subtopic,
          as: 'subtopic',
          attributes: ['subtopicID', 'subtopicName'],
        },
        {
          model: Option,
          as: 'options',
          attributes: ['optionID', 'optionText', 'isCorrect'],
        },
        {
          model: Quiz,
          as: 'quizzes',
          attributes: ['quizID', 'quizName'],
          through: { attributes: [] },
        },
      ],
    });

    if (!question) {
      return res.status(404).json({ success: false, message: 'Question not found.' });
    }

    res.status(200).json({ success: true, data: question });
  } catch (error) {
    console.error('Error fetching question:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

// Update a question (optional)
exports.updateQuestion = async (req, res) => {
  const { questionID } = req.params;
  const {
    questionText,
    questionType,
    correctAns,
    source,
    difficulty,
    subtopicID,
    options, // Array of options for MCQ
  } = req.body;
  const userID = req.userID; // Set by authMiddleware

  try {
    // Find the question
    const question = await Question.findOne({ where: { questionID }, include: [Quiz] });
    if (!question) {
      return res.status(404).json({ success: false, message: 'Question not found.' });
    }

    // Verify that the user owns the quiz associated with the question
    const quiz = await Quiz.findOne({ where: { quizID: question.quizzes[0].quizID, createdBy: userID } });
    if (!quiz) {
      return res.status(403).json({ success: false, message: 'Unauthorized to update this question.' });
    }

    // If subtopicID is provided, verify it belongs to the quiz's topic
    if (subtopicID) {
      const subtopic = await Subtopic.findOne({ where: { subtopicID, topicID: quiz.topicID } });
      if (!subtopic) {
        return res.status(400).json({ success: false, message: 'Invalid subtopic for this quiz.' });
      }
    }

    // Update the question
    await question.update({
      questionText: questionText || question.questionText,
      questionType: questionType || question.questionType,
      correctAns: questionType !== 'MCQ' ? correctAns : null,
      source: source || question.source,
      difficulty: difficulty || question.difficulty,
      subtopicID: subtopicID || question.subtopicID,
    });

    // If questionType is MCQ, handle options
    if (questionType === 'MCQ' && Array.isArray(options)) {
      // Delete existing options
      await Option.destroy({ where: { questionID: question.questionID } });

      // Create new options
      const optionData = options.map((opt) => ({
        questionID: question.questionID,
        optionText: opt.optionText,
        isCorrect: opt.isCorrect,
      }));
      await Option.bulkCreate(optionData);
    }

    res.status(200).json({ success: true, data: question });
  } catch (error) {
    console.error('Error updating question:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

// Delete a question (optional)
exports.deleteQuestion = async (req, res) => {
  const { questionID } = req.params;
  const userID = req.userID; // Set by authMiddleware

  try {
    const question = await Question.findOne({ where: { questionID }, include: [Quiz] });
    if (!question) {
      return res.status(404).json({ success: false, message: 'Question not found.' });
    }

    // Verify that the user owns the quiz associated with the question
    const quiz = await Quiz.findOne({ where: { quizID: question.quizzes[0].quizID, createdBy: userID } });
    if (!quiz) {
      return res.status(403).json({ success: false, message: 'Unauthorized to delete this question.' });
    }

    // Delete associated options
    await Option.destroy({ where: { questionID: question.questionID } });

    // Remove association with quiz
    await quiz.removeQuestion(question);

    // Delete the question
    await question.destroy();

    res.status(200).json({ success: true, message: 'Question deleted successfully.' });
  } catch (error) {
    console.error('Error deleting question:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

// Add this new method
exports.getQuizQuestions = async (req, res) => {
  try {
    const { quizId } = req.params;

    const questions = await Question.findAll({
      include: [
        {
          model: Option,
          as: 'options'
        },
        {
          model: Quiz,
          through: {
            model: Quiz_Question,
            attributes: []  // Exclude junction table attributes
          },
          where: { quizID: quizId },
          attributes: []  // Exclude Quiz attributes from result
        }
      ]
    });

    res.json({
      success: true,
      data: questions
    });
  } catch (error) {
    console.error('Error fetching questions:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching quiz questions',
      error: error.message
    });
  }
};
