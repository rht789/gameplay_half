// server/middlewares/validateQuiz.js

const { body, validationResult } = require('express-validator');

const validateQuiz = [
  body('quizName')
    .notEmpty().withMessage('Quiz name is required.')
    .isLength({ max: 255 }).withMessage('Quiz name cannot exceed 255 characters.'),
  body('description')
    .notEmpty().withMessage('Description is required.'),
  body('visibility')
    .isIn(['public', 'private']).withMessage('Visibility must be either public or private.'),
  body('maxParticipants')
    .optional()
    .isInt({ min: 1 }).withMessage('Max participants must be a positive integer.'),
  body('topicID')
    .notEmpty().withMessage('Topic ID is required.')
    .isUUID().withMessage('Topic ID must be a valid UUID.'),
  body('startAt')
    .optional()
    .isISO8601().withMessage('Start date and time must be a valid ISO 8601 date.'),
  body('questionMode')
    .optional()
    .isIn(['manual', 'ai']).withMessage('Question mode must be either manual or ai.'),
  body('status')
    .optional()
    .isIn(['draft', 'ready']).withMessage('Status must be either draft or ready.'),
  body('currentStep')
    .optional()
    .isIn(['initial', 'mode_selected', 'questions_added'])
    .withMessage('Invalid current step value.'),
  body('createdBy')
    .optional()
    .isInt().withMessage('Created by must be an integer.'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const extractedErrors = [];
      errors.array().map(err => extractedErrors.push({ msg: err.msg }));
      return res.status(400).json({ success: false, errors: extractedErrors });
    }
    next();
  },
];

module.exports = validateQuiz;
