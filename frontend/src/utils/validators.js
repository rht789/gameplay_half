export const validateQuestionData = (data) => {
  const errors = [];
  
  if (!data.questionText?.trim()) {
    errors.push('Question text is required');
  }
  
  if (data.questionType === 'MCQ') {
    if (!data.options?.length || data.options.length < 2) {
      errors.push('MCQ questions require at least 2 options');
    }
    if (!data.options?.some(opt => opt.isCorrect)) {
      errors.push('At least one correct answer must be selected');
    }
  }
  
  if (!['easy', 'medium', 'hard'].includes(data.difficulty)) {
    errors.push('Invalid difficulty level');
  }
  
  if (data.timeLimit < 5 || data.timeLimit > 300) {
    errors.push('Time limit must be between 5 and 300 seconds');
  }
  
  return errors;
}; 