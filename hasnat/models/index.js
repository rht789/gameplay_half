const { sequelize } = require('../config/config');

// Import models
const Session = require('./Session');
const Participant = require('./Participant');
const User = require('./User');
const Quiz = require('./Quiz');
const Question = require('./Question');
const Topic = require('./Topic');
const Subtopic = require('./Subtopic');
const Option = require('./Option');
const Quiz_Question = require('./Quiz_Question');

// User Associations
User.hasMany(Session, { 
    foreignKey: 'hostID',
    onDelete: 'CASCADE' 
});
User.hasMany(Participant, { 
    foreignKey: 'userID',
    onDelete: 'CASCADE' 
});
User.hasMany(Quiz, { 
    foreignKey: 'createdBy',
    as: 'createdQuizzes' 
});

// Session Associations
Session.belongsTo(User, { 
    foreignKey: 'hostID',
    references: {
        model: 'Users',
        key: 'userID'
    }
});
Session.hasMany(Participant, { 
    foreignKey: 'sessionID',
    onDelete: 'CASCADE' 
});
Session.belongsTo(Quiz, { 
    foreignKey: 'quizID',
    references: {
        model: 'Quizzes',
        key: 'quizID'
    }
});

// Participant Associations
Participant.belongsTo(User, { 
    foreignKey: 'userID',
    references: {
        model: 'Users',
        key: 'userID'
    }
});
Participant.belongsTo(Session, { 
    foreignKey: 'sessionID',
    references: {
        model: 'Sessions',
        key: 'sessionID'
    }
});

// Quiz Associations
Quiz.hasMany(Session, { 
    foreignKey: 'quizID',
    onDelete: 'CASCADE' 
});
Quiz.belongsTo(Topic, { 
    foreignKey: 'topicID',
    as: 'topic',
    references: {
        model: 'Topics',
        key: 'topicID'
    }
});
Quiz.belongsToMany(Question, { 
    through: 'Quiz_Questions',
    foreignKey: 'quizID',
    otherKey: 'questionID' 
});
Quiz.belongsTo(User, { 
    foreignKey: 'createdBy',
    as: 'creator',
    references: {
        model: 'Users',
        key: 'userID'
    }
});

// Topic Associations
Topic.hasMany(Quiz, { 
    foreignKey: 'topicID',
    onDelete: 'CASCADE' 
});
Topic.hasMany(Subtopic, { 
    foreignKey: 'topicID',
    onDelete: 'CASCADE' 
});

// Subtopic Associations
Subtopic.belongsTo(Topic, { 
    foreignKey: 'topicID',
    references: {
        model: 'Topics',
        key: 'topicID'
    }
});
Subtopic.hasMany(Question, { 
    foreignKey: 'subtopicID',
    onDelete: 'CASCADE' 
});

// Question Associations
Question.belongsToMany(Quiz, { 
    through: 'Quiz_Questions',
    foreignKey: 'questionID',
    otherKey: 'quizID' 
});
Question.belongsTo(Subtopic, { 
    foreignKey: 'subtopicID',
    references: {
        model: 'Subtopics',
        key: 'subtopicID'
    }
});
Question.hasMany(Option, { 
    foreignKey: 'questionID',
    onDelete: 'CASCADE',
    as: 'options' 
});

// Option Associations
Option.belongsTo(Question, { 
    foreignKey: 'questionID',
    references: {
        model: 'Questions',
        key: 'questionID'
    }
});

// Add sync function
// const syncModels = async () => {
//     try {
//       await sequelize.authenticate();
//       console.log('Database connection established successfully.');
      
//       await sequelize.sync({ alter: false });
//       console.log('All models were synchronized successfully.');
//     } catch (error) {
//       console.error('Unable to connect to the database:', error);
//       throw error;
//     }
//   };
  
  module.exports = {
    sequelize,
    Session,
    Participant,
    User,
    Quiz,
    Topic,
    Subtopic,
    Question,
    Option,
    Quiz_Question,
    // syncModels
};