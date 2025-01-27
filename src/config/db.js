const { Sequelize } = require('sequelize');

const sequelize = new Sequelize({
  dialect: 'mysql',
  host: process.env.DB_HOST,
  logging: false,  
  username: process.env.DB_USER,   
  password: process.env.DB_PASSWORD, 
  database: process.env.DB_NAME,   
});

// Testing credentials, authenticating
async function authenticateDatabase() {
  try {
    await sequelize.authenticate();  
    console.log('Connection to the database has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
}

authenticateDatabase();

module.exports = sequelize;
