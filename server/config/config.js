require('dotenv').config();

module.exports = {
  development: {
    username: process.env.DB_USER || 'univesp_pi3',
    password: process.env.DB_PASSWORD || 'univesppi3',
    database: process.env.DB_NAME || 'help_desk',
    host: process.env.DB_HOST || 'database',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres'
  }
};