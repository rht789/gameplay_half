// middlewares/validationMiddleware.js
const Joi = require('joi');

// middlewares/validationMiddleware.js

exports.validateSearchQuery = (req, res, next) => {
  const schema = Joi.object({
    questionText: Joi.string().required(),
  });

  const { error } = schema.validate(req.query);
  if (error) {
    return res.status(400).json({ success: false, message: error.details[0].message });
  }
  next();
};

exports.validateQuestions = (req, res, next) => {
    const questionSchema = Joi.object({
      questionText: Joi.string().required(),
      questionType: Joi.string().valid('MCQ', 'FILL_IN_THE_BLANKS', 'SHORT_ANSWER').required(),
      correctAnswer: Joi.string().optional(),
      options: Joi.when('questionType', {
        is: 'MCQ',
        then: Joi.array().items(
          Joi.object({
            optionText: Joi.string().required(),
            isCorrect: Joi.boolean().required(),
          })
        ).min(1).required(),
        otherwise: Joi.forbidden(),
      }),
    });
  
    const schema = Joi.object({
      questions: Joi.array().items(questionSchema).min(1).required(),
    });
  
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ success: false, message: error.details[0].message });
    }
    next();
  };
  
