// server/sync.js

const db = require('./models'); // Load all models

(async () => {
  try {
    // Sync all models with the database
    await db.sequelize.sync({ force: true }); // Drops existing tables and recreates them
    console.log('Database synced: All tables created successfully!');
    process.exit();
  } catch (error) {
    console.error('Error syncing database:', error);
    process.exit(1);
  }
})();
