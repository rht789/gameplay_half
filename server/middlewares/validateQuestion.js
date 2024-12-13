// middlewares/validateQuestion.js

const Joi = require('joi');

const validateQuestion = (req, res, next) => {
  const schema = Joi.object({
    questionText: Joi.string().required(),
    questionType: Joi.string()
      .valid('MCQ', 'TRUE_FALSE', 'SHORT_ANSWER', 'FILL_IN_THE_BLANKS')
      .required(),
    difficulty: Joi.string()
      .valid('easy', 'medium', 'hard')
      .required(),
    timeLimit: Joi.number()
      .min(5)
      .max(300)
      .required(),
    correctAns: Joi.string().allow(''),
    options: Joi.when('questionType', {
      is: Joi.string().valid('MCQ', 'TRUE_FALSE'),
      then: Joi.array().items(
        Joi.object({
          text: Joi.string().required(),
          isCorrect: Joi.boolean().required(),
          id: Joi.any()
        })
      ).min(2).required(),
      otherwise: Joi.array().optional()
    })
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message
    });
  }
  next();
};

module.exports = validateQuestion;
