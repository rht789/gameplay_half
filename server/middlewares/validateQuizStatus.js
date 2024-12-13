const { Quiz } = require('../models');

const validateQuizStatus = async (req, res, next) => {
  const { quizID } = req.params;
  
  try {
    const quiz = await Quiz.findByPk(quizID);
    if (!quiz) {
      return res.status(404).json({ 
        success: false, 
        message: 'Quiz not found.' 
      });
    }

    if (quiz.status === 'ready') {
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot modify a finalized quiz.' 
      });
    }

    next();
  } catch (error) {
    console.error('Error validating quiz status:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error.' 
    });
  }
};

module.exports = validateQuizStatus; 